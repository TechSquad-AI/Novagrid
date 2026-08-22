"""
Endpoint Tree API — Scan, diff, validate, and approve API endpoints.

This module provides the complete endpoint tree graph workflow:
1. Scan backend files using AST parser
2. Store endpoint manifests with versioning
3. Compare manifest versions (breaking/safe/warning)
4. Validate POST/PATCH endpoints have Pydantic body models
5. Store change reports for human approval
6. Approve or reject changes
"""

import os
import time
import json
from datetime import datetime

from fastapi import APIRouter
from supabase_client import supabase
from app.route_scanner import build_manifest, diff_manifests

router = APIRouter(prefix="/tree", tags=["Endpoint Tree"])


# ============================================================
# SCAN ENDPOINTS
# ============================================================


@router.get("/scan")
def scan_endpoints():
    """
    Scan all backend Python files for FastAPI routes.
    Returns a fresh manifest with all endpoints found.
    """
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    manifest = build_manifest(backend_dir)

    return {
        "status": "scanned",
        "manifest": manifest,
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.post("/scan-and-store")
def scan_and_store():
    """
    Scan endpoints AND store the manifest in Supabase.
    Compares with previous version if it exists.
    """
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    new_manifest = build_manifest(backend_dir)

    # Get previous manifest
    previous_manifest = None
    diff_result = None

    try:
        result = (
            supabase.table("endpoint_manifests")
            .select("*")
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )

        if result.data:
            previous_manifest = result.data[0].get("manifest")
            if previous_manifest:
                diff_result = diff_manifests(previous_manifest, new_manifest)
    except Exception as e:
        print(f"[EndpointTree] Could not fetch previous manifest: {e}")

    # Store new manifest
    try:
        supabase.table("endpoint_manifests").insert({
            "manifest": new_manifest,
            "version": new_manifest["version"],
            "total_endpoints": new_manifest["total_endpoints"],
            "warnings": new_manifest.get("warnings", []),
            "created_at": datetime.utcnow().isoformat(),
        }).execute()
    except Exception as e:
        print(f"[EndpointTree] Failed to store manifest: {e}")

    # If there are changes, store them as change reports
    if diff_result and diff_result["summary"]["total_changes"] > 0:
        _store_change_reports(diff_result, new_manifest)

    return {
        "status": "scanned_and_stored",
        "manifest": new_manifest,
        "diff": diff_result,
        "has_previous": previous_manifest is not None,
        "timestamp": datetime.utcnow().isoformat(),
    }


# ============================================================
# MANIFEST ENDPOINTS
# ============================================================


@router.get("/manifest")
def get_latest_manifest():
    """Get the most recent endpoint manifest."""
    try:
        result = (
            supabase.table("endpoint_manifests")
            .select("*")
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )

        if result.data:
            return {
                "status": "success",
                "manifest": result.data[0],
            }

        return {"status": "empty", "manifest": None}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.get("/manifests")
def list_manifests():
    """List all stored manifest versions."""
    try:
        result = (
            supabase.table("endpoint_manifests")
            .select("id, version, total_endpoints, created_at")
            .order("created_at", desc=True)
            .limit(20)
            .execute()
        )

        return {"status": "success", "manifests": result.data or []}
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============================================================
# DIFF ENDPOINTS
# ============================================================


@router.post("/diff")
def diff_with_previous():
    """
    Scan current endpoints and compare with the last stored manifest.
    Returns breaking/safe/warning changes.
    """
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    new_manifest = build_manifest(backend_dir)

    try:
        result = (
            supabase.table("endpoint_manifests")
            .select("*")
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )

        if not result.data:
            return {
                "status": "no_previous",
                "message": "No previous manifest found. Run scan-and-store first.",
                "current": new_manifest,
            }

        previous_manifest = result.data[0].get("manifest")
        diff_result = diff_manifests(previous_manifest, new_manifest)

        return {
            "status": "diff_computed",
            "current": new_manifest,
            "previous_version": result.data[0].get("version"),
            "diff": diff_result,
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.post("/diff-manifests")
def diff_two_manifests(payload: dict):
    """
    Compare two specific manifest versions.
    Body: { "manifest_id_1": "...", "manifest_id_2": "..." }
    """
    id1 = payload.get("manifest_id_1")
    id2 = payload.get("manifest_id_2")

    if not id1 or not id2:
        return {"status": "error", "message": "Both manifest IDs required"}

    try:
        r1 = supabase.table("endpoint_manifests").select("*").eq("id", id1).execute()
        r2 = supabase.table("endpoint_manifests").select("*").eq("id", id2).execute()

        if not r1.data or not r2.data:
            return {"status": "error", "message": "One or both manifests not found"}

        m1 = r1.data[0].get("manifest", {})
        m2 = r2.data[0].get("manifest", {})

        diff_result = diff_manifests(m1, m2)

        return {
            "status": "diff_computed",
            "manifest_1": r1.data[0],
            "manifest_2": r2.data[0],
            "diff": diff_result,
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============================================================
# VALIDATION ENDPOINTS
# ============================================================


@router.get("/validate")
def validate_current_endpoints():
    """
    Scan and validate all endpoints.
    Checks for missing payload validation and response models.
    """
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    manifest = build_manifest(backend_dir)

    issues = []

    for ep in manifest.get("endpoints", []):
        method = ep.get("method", "")
        path = ep.get("path", "")
        source_file = ep.get("source_file", "")

        # Check: POST/PATCH/PUT without body model
        if method in ("POST", "PUT", "PATCH") and not ep.get("has_body_model"):
            issues.append({
                "severity": "warning",
                "type": "no_body_model",
                "method": method,
                "path": path,
                "file": source_file,
                "line": ep.get("line_number", 0),
                "message": f"{method} {path} has no Pydantic body model — no payload validation",
                "fix": "Add a Pydantic BaseModel parameter to validate request body",
            })

        # Check: No response_model
        if not ep.get("response_model"):
            issues.append({
                "severity": "info",
                "type": "no_response_model",
                "method": method,
                "path": path,
                "file": source_file,
                "line": ep.get("line_number", 0),
                "message": f"{method} {path} has no response_model",
                "fix": "Add response_model to the decorator for OpenAPI docs",
            })

        # Check: No type hints at all
        if not ep.get("has_validation") and method in ("POST", "PUT", "PATCH"):
            issues.append({
                "severity": "warning",
                "type": "no_validation",
                "method": method,
                "path": path,
                "file": source_file,
                "line": ep.get("line_number", 0),
                "message": f"{method} {path} has no parameter validation at all",
                "fix": "Add type hints and use Query/Path/Body dependencies",
            })

    return {
        "status": "validated",
        "total_endpoints": manifest["total_endpoints"],
        "total_issues": len(issues),
        "issues": issues,
        "summary": {
            "no_body_model": len([i for i in issues if i["type"] == "no_body_model"]),
            "no_response_model": len([i for i in issues if i["type"] == "no_response_model"]),
            "no_validation": len([i for i in issues if i["type"] == "no_validation"]),
        },
    }


# ============================================================
# CHANGE REPORTS (SELF-REPORTING)
# ============================================================


@router.get("/reports")
def get_change_reports():
    """
    Get all change reports (self-reported changes that need review).
    Only returns reports with status 'pending'.
    """
    try:
        result = (
            supabase.table("endpoint_change_reports")
            .select("*")
            .order("created_at", desc=True)
            .limit(50)
            .execute()
        )

        reports = result.data or []
        pending = [r for r in reports if r.get("status") == "pending"]

        return {
            "status": "success",
            "total_reports": len(reports),
            "pending": len(pending),
            "reports": pending,
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.get("/reports/all")
def get_all_reports():
    """Get all change reports including approved/rejected."""
    try:
        result = (
            supabase.table("endpoint_change_reports")
            .select("*")
            .order("created_at", desc=True)
            .limit(100)
            .execute()
        )

        return {"status": "success", "reports": result.data or []}
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============================================================
# HUMAN VALIDATION (APPROVE / REJECT)
# ============================================================


@router.post("/approve/{report_id}")
def approve_change(report_id: str):
    """
    Approve a change report.
    This is the human validation gate — nothing auto-applies without this.
    """
    try:
        result = (
            supabase.table("endpoint_change_reports")
            .select("*")
            .eq("id", report_id)
            .eq("status", "pending")
            .execute()
        )

        if not result.data:
            return {
                "status": "error",
                "message": "Report not found or already resolved",
            }

        # Mark as approved
        supabase.table("endpoint_change_reports").update({
            "status": "approved",
            "resolved_at": datetime.utcnow().isoformat(),
        }).eq("id", report_id).execute()

        # Send notification via viaSocket
        try:
            from app.viasocket import send_webhook
            report = result.data[0]
            send_webhook("change_approved", {
                "api_name": "Endpoint Tree",
                "change_type": report.get("change_type", ""),
                "detail": report.get("detail", ""),
                "message": f"Change approved: {report.get('detail', 'N/A')}",
            })
        except Exception:
            pass

        return {"status": "approved", "report_id": report_id}

    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.post("/reject/{report_id}")
def reject_change(report_id: str):
    """
    Reject a change report.
    The change will NOT be applied.
    """
    try:
        result = (
            supabase.table("endpoint_change_reports")
            .select("*")
            .eq("id", report_id)
            .eq("status", "pending")
            .execute()
        )

        if not result.data:
            return {
                "status": "error",
                "message": "Report not found or already resolved",
            }

        # Mark as rejected
        supabase.table("endpoint_change_reports").update({
            "status": "rejected",
            "resolved_at": datetime.utcnow().isoformat(),
        }).eq("id", report_id).execute()

        return {"status": "rejected", "report_id": report_id}

    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============================================================
# TREE DATA (for frontend visualization)
# ============================================================


@router.get("/tree-data")
def get_tree_data():
    """
    Get the full tree structure for frontend visualization.
    Returns hierarchical data: API → Router → Endpoint → Details.
    """
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    manifest = build_manifest(backend_dir)

    return {
        "status": "success",
        "tree": manifest.get("tree", {}),
        "total_endpoints": manifest.get("total_endpoints", 0),
        "methods_summary": manifest.get("methods_summary", {}),
        "warnings": manifest.get("warnings", []),
    }


# ============================================================
# HELPER FUNCTIONS
# ============================================================


def _store_change_reports(diff_result: dict, manifest: dict):
    """Store change reports for human review."""
    all_changes = (
        diff_result.get("breaking", [])
        + diff_result.get("safe", [])
        + diff_result.get("warnings", [])
    )

    for change in all_changes:
        try:
            # Determine severity
            change_type = change.get("type", "")
            if change_type in ("endpoint_removed", "method_changed", "params_removed", "response_changed"):
                severity = "high"
            elif change_type in ("validation_removed",):
                severity = "medium"
            else:
                severity = "low"

            supabase.table("endpoint_change_reports").insert({
                "change_type": change_type,
                "severity": severity,
                "method": change.get("method", ""),
                "path": change.get("path", ""),
                "file": change.get("file", ""),
                "detail": change.get("detail", ""),
                "change_data": change,
                "status": "pending",
                "created_at": datetime.utcnow().isoformat(),
            }).execute()
        except Exception as e:
            print(f"[EndpointTree] Failed to store change report: {e}")
