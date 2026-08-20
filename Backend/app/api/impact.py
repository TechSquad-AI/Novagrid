from fastapi import APIRouter
from supabase_client import supabase

router = APIRouter(prefix="/impact", tags=["Impact Analysis"])


@router.get("/{api_id}")
def get_impact_analysis(api_id: str):
    try:
        api_result = supabase.table("apis").select("*").eq("id", api_id).execute()
        if not api_result.data:
            return {"status": "error", "message": "API not found"}
        api = api_result.data[0]
    except Exception as e:
        return {"status": "error", "message": str(e)}

    changes = []
    try:
        r = supabase.table("api_changes").select("*").eq("api_id", api_id).order("created_at", desc=True).execute()
        changes = r.data or []
    except Exception:
        pass

    affected_files = []
    affected_functions = []
    affected_tests = []
    removed = []
    added = []
    for c in changes:
        removed.extend(c.get("removed_fields", []) or [])
        added.extend(c.get("added_fields", []) or [])
        affected_files.extend(c.get("affected_files", []) or [])
        affected_functions.extend(c.get("affected_functions", []) or [])

    risk_score = min(100, (len(removed) * 20) + (len(added) * 10) + (len(affected_files) * 15))
    severity = "low"
    if risk_score > 60:
        severity = "high"
    elif risk_score > 30:
        severity = "medium"

    return {
        "api": {"id": api["id"], "name": api.get("name", ""), "url": api.get("base_url", "")},
        "risk_score": risk_score,
        "severity": severity,
        "removed_fields": removed,
        "added_fields": added,
        "affected_files": list(set(affected_files)),
        "affected_functions": list(set(affected_functions)),
        "affected_tests": list(set(affected_tests)),
        "changes_count": len(changes),
        "changes": changes,
    }


@router.get("/{api_id}/dependencies")
def get_dependencies(api_id: str):
    try:
        r = supabase.table("api_changes").select("*").eq("api_id", api_id).execute()
        changes = r.data or []
    except Exception:
        changes = []

    nodes = []
    edges = []

    nodes.append({"id": api_id, "label": "API Endpoint", "type": "api"})
    for c in changes:
        for f in (c.get("affected_files", []) or []):
            node_id = f"file_{f}"
            if not any(n["id"] == node_id for n in nodes):
                nodes.append({"id": node_id, "label": f, "type": "file"})
            edges.append({"from": api_id, "to": node_id})

    return {"nodes": nodes, "edges": edges}
