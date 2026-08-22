"""
GitHub Repo Monitoring — Register repos, clone code, scan for API endpoints, detect changes.
"""

import os
import tempfile
import subprocess
import json
from datetime import datetime

from fastapi import APIRouter, HTTPException
from supabase_client import supabase
from app.route_scanner import build_manifest

router = APIRouter(prefix="/github-repos", tags=["GitHub Repos"])


def clone_repo(repo_url: str, dest: str) -> bool:
    """Clone a GitHub repo to a destination directory."""
    try:
        result = subprocess.run(
            ["git", "clone", "--depth", "1", repo_url, dest],
            capture_output=True, text=True, timeout=60
        )
        return result.returncode == 0
    except Exception:
        return False


def scan_repo_code(repo_path: str) -> dict:
    """Scan all Python files in a repo for FastAPI endpoints."""
    manifest = build_manifest(repo_path)
    return manifest


@router.post("/register")
def register_repo(payload: dict):
    """Register a GitHub repository for monitoring."""
    name = payload.get("name", "").strip()
    repo_url = payload.get("repo_url", "").strip()
    branch = payload.get("branch", "main").strip()

    if not name or not repo_url:
        raise HTTPException(status_code=400, detail="Name and repo_url required")

    # Clone the repo
    tmp_dir = tempfile.mkdtemp(prefix="novagrid_")
    repo_path = os.path.join(tmp_dir, "repo")

    if not clone_repo(repo_url, repo_path):
        raise HTTPException(status_code=400, detail="Failed to clone repository. Check the URL and ensure it is public.")

    # Scan the code
    try:
        manifest = scan_repo_code(repo_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scan failed: {e}")

    # Store in Supabase
    repo_data = {
        "name": name,
        "repo_url": repo_url,
        "branch": branch,
        "manifest": manifest,
        "total_endpoints": manifest.get("total_endpoints", 0),
        "methods_summary": manifest.get("methods_summary", {}),
        "status": "active",
        "last_checked": datetime.utcnow().isoformat(),
        "created_at": datetime.utcnow().isoformat(),
    }

    try:
        result = supabase.table("github_repos").insert(repo_data).execute()
        repo_id = result.data[0]["id"] if result.data else None
    except Exception as e:
        error_msg = str(e)
        if "Could not find the table" in error_msg:
            raise HTTPException(status_code=500, detail="Table 'github_repos' does not exist. Create it in Supabase SQL Editor.")
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

    # Cleanup
    try:
        import shutil
        shutil.rmtree(tmp_dir, ignore_errors=True)
    except Exception:
        pass

    # Notify via viaSocket
    try:
        from app.viasocket import send_webhook
        send_webhook("github_repo_registered", {
            "repo_name": name,
            "repo_url": repo_url,
            "total_endpoints": manifest.get("total_endpoints", 0),
            "message": f"GitHub repo registered: {name} ({manifest.get('total_endpoints', 0)} endpoints found)",
        })
    except Exception:
        pass

    return {
        "status": "registered",
        "repo_id": repo_id,
        "name": name,
        "total_endpoints": manifest.get("total_endpoints", 0),
        "methods_summary": manifest.get("methods_summary", {}),
    }


@router.get("/")
def list_repos():
    """List all monitored GitHub repos."""
    try:
        result = (
            supabase.table("github_repos")
            .select("id, name, repo_url, branch, status, total_endpoints, last_checked, created_at")
            .order("created_at", desc=True)
            .execute()
        )
        return {"status": "success", "repos": result.data or []}
    except Exception as e:
        error_msg = str(e)
        if "Could not find the table" in error_msg:
            return {"status": "success", "repos": []}
        return {"status": "error", "message": str(e), "repos": []}


@router.get("/{repo_id}/tree")
def get_repo_tree(repo_id: str):
    """Get the tree structure for a monitored repo."""
    try:
        result = supabase.table("github_repos").select("manifest, name").eq("id", repo_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Repository not found")

        manifest = result.data[0].get("manifest", {})
        repo_name = result.data[0].get("name", "Repo")
        tree = manifest.get("tree", {})

        return {"status": "success", "tree": tree}
    except HTTPException:
        raise
    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.post("/{repo_id}/check")
def check_repo(repo_id: str):
    """Re-scan the repo and compare with stored version."""
    try:
        result = supabase.table("github_repos").select("*").eq("id", repo_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Repository not found")

        repo = result.data[0]
        repo_url = repo.get("repo_url")

        # Clone again
        tmp_dir = tempfile.mkdtemp(prefix="novagrid_check_")
        repo_path = os.path.join(tmp_dir, "repo")

        if not clone_repo(repo_url, repo_path):
            return {"status": "error", "message": "Failed to clone repository"}

        # Scan
        new_manifest = scan_repo_code(repo_path)

        # Cleanup
        try:
            import shutil
            shutil.rmtree(tmp_dir, ignore_errors=True)
        except Exception:
            pass

        # Compare
        old_endpoints = repo.get("manifest", {}).get("endpoints", [])
        new_endpoints = new_manifest.get("endpoints", [])

        old_map = {(e.get("method", ""), e.get("path", "")) for e in old_endpoints}
        new_map = {(e.get("method", ""), e.get("path", "")) for e in new_endpoints}

        added = new_map - old_map
        removed = old_map - new_map

        changes = []
        for method, path in added:
            changes.append({"type": "endpoint_added", "method": method, "path": path, "detail": f"New endpoint {method} {path} added"})
        for method, path in removed:
            changes.append({"type": "endpoint_removed", "method": method, "path": path, "detail": f"Endpoint {method} {path} removed"})

        has_changes = len(changes) > 0

        # Update stored manifest
        supabase.table("github_repos").update({
            "manifest": new_manifest,
            "total_endpoints": new_manifest.get("total_endpoints", 0),
            "methods_summary": new_manifest.get("methods_summary", {}),
            "last_checked": datetime.utcnow().isoformat(),
        }).eq("id", repo_id).execute()

        # Store change reports
        if has_changes:
            for change in changes:
                try:
                    supabase.table("public_api_changes").insert({
                        "api_id": repo_id,
                        "api_name": repo.get("name", ""),
                        "change_type": change["type"],
                        "method": change["method"],
                        "path": change["path"],
                        "detail": change["detail"],
                        "severity": "high" if change["type"] == "endpoint_removed" else "low",
                        "status": "detected",
                        "created_at": datetime.utcnow().isoformat(),
                    }).execute()
                except Exception:
                    pass

            # Notify
            try:
                from app.viasocket import send_webhook
                send_webhook("github_repo_changed", {
                    "repo_name": repo.get("name", ""),
                    "total_changes": len(changes),
                    "message": f"Changes in {repo.get('name', '')}: {len(added)} added, {len(removed)} removed",
                })
            except Exception:
                pass

        return {
            "status": "checked",
            "repo_name": repo.get("name", ""),
            "has_changes": has_changes,
            "total_changes": len(changes),
            "added": len(added),
            "removed": len(removed),
            "changes": changes,
        }

    except HTTPException:
        raise
    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.delete("/{repo_id}")
def delete_repo(repo_id: str):
    """Remove a monitored repository."""
    try:
        supabase.table("github_repos").delete().eq("id", repo_id).execute()
        return {"status": "deleted", "repo_id": repo_id}
    except Exception as e:
        return {"status": "error", "message": str(e)}
