"""
Public API Registration — Register external APIs, auto-fetch OpenAPI specs,
discover all endpoints, detect changes automatically.
"""

import os
import time
import json
from datetime import datetime

from fastapi import APIRouter, HTTPException
from supabase_client import supabase
from app.openapi_parser import fetch_spec, parse_spec, compare_specs

router = APIRouter(prefix="/public-apis", tags=["Public APIs"])


# ============================================================
# REGISTER A PUBLIC API
# ============================================================

@router.post("/register")
def register_public_api(payload: dict):
    """
    Register a public API with its OpenAPI URL.
    NovaGrid auto-fetches the spec, discovers all endpoints, and stores them.

    Body:
    {
        "name": "Stripe",
        "url": "https://api.stripe.com",
        "openapi_url": "https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.json"
    }
    """
    name = payload.get("name", "").strip()
    url = payload.get("url", "").strip()
    openapi_url = payload.get("openapi_url", "").strip()

    if not name or not openapi_url:
        raise HTTPException(status_code=400, detail="Name and openapi_url are required")

    # Fetch and parse the OpenAPI spec
    try:
        spec = fetch_spec(openapi_url)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch OpenAPI spec: {e}")

    parsed = parse_spec(spec)

    # Store in Supabase
    api_data = {
        "name": name,
        "base_url": url or parsed.get("base_url", ""),
        "openapi_url": openapi_url,
        "spec": spec,
        "parsed": {
            "title": parsed["title"],
            "version": parsed["version"],
            "total_endpoints": parsed["total_endpoints"],
            "methods_summary": parsed["methods_summary"],
            "endpoints": parsed["endpoints"],
        },
        "status": "active",
        "last_checked": datetime.utcnow().isoformat(),
        "created_at": datetime.utcnow().isoformat(),
    }

    try:
        result = supabase.table("tracked_apis").insert(api_data).execute()
        api_id = result.data[0]["id"] if result.data else None
    except Exception as e:
        error_msg = str(e)
        if "Could not find the table" in error_msg:
            raise HTTPException(
                status_code=500,
                detail="Table 'tracked_apis' does not exist. Create it in Supabase SQL Editor."
            )
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

    # Send viaSocket notification
    try:
        from app.viasocket import send_webhook
        send_webhook("public_api_registered", {
            "api_name": name,
            "api_url": url,
            "total_endpoints": parsed["total_endpoints"],
            "message": f"Public API registered: {name} ({parsed['total_endpoints']} endpoints discovered)",
        })
    except Exception:
        pass

    return {
        "status": "registered",
        "api_id": api_id,
        "name": name,
        "title": parsed["title"],
        "version": parsed["version"],
        "total_endpoints": parsed["total_endpoints"],
        "methods_summary": parsed["methods_summary"],
        "endpoints": parsed["endpoints"],
        "paths_count": parsed["paths_count"],
    }


# ============================================================
# LIST ALL TRACKED PUBLIC APIs
# ============================================================

@router.get("/")
def list_public_apis():
    """List all tracked public APIs with their endpoint counts."""
    try:
        result = (
            supabase.table("tracked_apis")
            .select("id, name, base_url, openapi_url, status, last_checked, created_at")
            .order("created_at", desc=True)
            .execute()
        )
        return {"status": "success", "apis": result.data or []}
    except Exception as e:
        error_msg = str(e)
        if "Could not find the table" in error_msg:
            return {"status": "error", "message": "Table 'tracked_apis' does not exist", "apis": []}
        return {"status": "error", "message": str(e), "apis": []}


# ============================================================
# GET API DETAILS (ENDPOINTS, PAYLOADS, RESPONSES)
# ============================================================

@router.get("/{api_id}")
def get_public_api(api_id: str):
    """Get full details of a tracked public API including all endpoints."""
    try:
        result = supabase.table("tracked_apis").select("*").eq("id", api_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="API not found")
        api = result.data[0]
        return {
            "status": "success",
            "api": api,
            "parsed": api.get("parsed", {}),
        }
    except HTTPException:
        raise
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============================================================
# GET TREE DATA FOR A PUBLIC API
# ============================================================

@router.get("/{api_id}/tree")
def get_public_api_tree(api_id: str):
    """
    Get the tree structure for a tracked public API.
    Returns hierarchical data: API → Tags → Endpoints → Parameters/Body.
    """
    try:
        result = supabase.table("tracked_apis").select("parsed, name").eq("id", api_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="API not found")

        parsed = result.data[0].get("parsed", {})
        api_name = result.data[0].get("name", "API")
        endpoints = parsed.get("endpoints", [])

        # Build tree grouped by tags
        tree = {"name": api_name, "children": []}
        tag_groups = {}

        for ep in endpoints:
            tags = ep.get("tags", [])
            tag = tags[0] if tags else ep["path"].split("/")[1] if len(ep["path"].split("/")) > 1 else "root"

            if tag not in tag_groups:
                tag_groups[tag] = {"name": f"/{tag}", "children": []}

            tag_groups[tag]["children"].append({
                "method": ep["method"],
                "path": ep["path"],
                "summary": ep.get("summary", ""),
                "description": ep.get("description", ""),
                "parameters": ep.get("parameters", []),
                "request_body": ep.get("request_body"),
                "responses": ep.get("responses", {}),
                "deprecated": ep.get("deprecated", False),
                "tags": ep.get("tags", []),
            })

        tree["children"] = list(tag_groups.values())
        tree["total_endpoints"] = len(endpoints)
        tree["methods_summary"] = parsed.get("methods_summary", {})

        return {"status": "success", "tree": tree}
    except HTTPException:
        raise
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============================================================
# CHECK FOR CHANGES (MANUAL TRIGGER)
# ============================================================

@router.post("/{api_id}/check")
def check_for_changes(api_id: str):
    """
    Manually check a tracked API for changes.
    Fetches the current spec and compares with stored version.
    """
    try:
        result = supabase.table("tracked_apis").select("*").eq("id", api_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="API not found")

        api = result.data[0]
        openapi_url = api.get("openapi_url")
        if not openapi_url:
            raise HTTPException(status_code=400, detail="No OpenAPI URL configured")

        # Fetch current spec
        try:
            current_spec = fetch_spec(openapi_url)
        except Exception as e:
            return {"status": "error", "message": f"Failed to fetch spec: {e}"}

        current_parsed = parse_spec(current_spec)
        old_parsed = api.get("parsed", {})
        old_endpoints = old_parsed.get("endpoints", [])

        # Compare
        diff = compare_specs(old_endpoints, current_parsed["endpoints"])

        # Update stored spec
        supabase.table("tracked_apis").update({
            "spec": current_spec,
            "parsed": {
                "title": current_parsed["title"],
                "version": current_parsed["version"],
                "total_endpoints": current_parsed["total_endpoints"],
                "methods_summary": current_parsed["methods_summary"],
                "endpoints": current_parsed["endpoints"],
            },
            "last_checked": datetime.utcnow().isoformat(),
        }).eq("id", api_id).execute()

        # Store change report if changes found
        if diff["summary"]["total"] > 0:
            _store_change_report(api_id, api.get("name", ""), diff)

            # Send viaSocket notification
            try:
                from app.viasocket import send_webhook
                send_webhook("public_api_changed", {
                    "api_name": api.get("name", ""),
                    "breaking": diff["summary"]["breaking"],
                    "safe": diff["summary"]["safe"],
                    "message": f"Changes in {api.get('name', '')}: {diff['summary']['breaking']} breaking, {diff['summary']['safe']} safe",
                })
            except Exception:
                pass

        return {
            "status": "checked",
            "api_name": api.get("name", ""),
            "has_changes": diff["summary"]["total"] > 0,
            "diff": diff,
            "current_version": current_parsed["version"],
            "current_endpoints": current_parsed["total_endpoints"],
        }

    except HTTPException:
        raise
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============================================================
# CHECK ALL PUBLIC APIs (FOR SCHEDULER)
# ============================================================

@router.post("/check-all")
def check_all_public_apis():
    """Check all tracked public APIs for changes. Called by the scheduler."""
    try:
        result = supabase.table("tracked_apis").select("id, name, openapi_url, status").execute()
        apis = [a for a in (result.data or []) if a.get("status") == "active" and a.get("openapi_url")]

        results = []
        for api in apis:
            try:
                check_result = check_for_changes(api["id"])
                results.append({
                    "api_id": api["id"],
                    "name": api["name"],
                    "has_changes": check_result.get("has_changes", False),
                })
            except Exception as e:
                results.append({
                    "api_id": api["id"],
                    "name": api["name"],
                    "error": str(e),
                })

        return {
            "status": "checked",
            "total_checked": len(results),
            "with_changes": len([r for r in results if r.get("has_changes")]),
            "results": results,
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============================================================
# GET CHANGE HISTORY FOR AN API
# ============================================================

@router.get("/{api_id}/changes")
def get_api_changes(api_id: str):
    """Get all change reports for a tracked public API."""
    try:
        result = (
            supabase.table("public_api_changes")
            .select("*")
            .eq("api_id", api_id)
            .order("created_at", desc=True)
            .limit(50)
            .execute()
        )
        return {"status": "success", "changes": result.data or []}
    except Exception as e:
        error_msg = str(e)
        if "Could not find the table" in error_msg:
            return {"status": "success", "changes": []}
        return {"status": "error", "message": str(e)}


# ============================================================
# DELETE A TRACKED API
# ============================================================

@router.delete("/{api_id}")
def delete_public_api(api_id: str):
    """Remove a tracked public API."""
    try:
        supabase.table("tracked_apis").delete().eq("id", api_id).execute()
        return {"status": "deleted", "api_id": api_id}
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============================================================
# HELPERS
# ============================================================

def _store_change_report(api_id: str, api_name: str, diff: dict):
    """Store a change report in Supabase."""
    all_changes = diff.get("breaking", []) + diff.get("safe", [])

    for change in all_changes:
        try:
            supabase.table("public_api_changes").insert({
                "api_id": api_id,
                "api_name": api_name,
                "change_type": change.get("type", ""),
                "method": change.get("method", ""),
                "path": change.get("path", ""),
                "detail": change.get("detail", ""),
                "severity": "high" if change.get("type", "") in ("endpoint_removed", "field_removed", "type_changed", "params_removed") else "low",
                "status": "detected",
                "created_at": datetime.utcnow().isoformat(),
            }).execute()
        except Exception as e:
            print(f"[PublicAPIs] Failed to store change: {e}")
