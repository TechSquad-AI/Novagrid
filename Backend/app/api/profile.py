from fastapi import APIRouter
from supabase_client import supabase

router = APIRouter(prefix="/profile", tags=["Profile"])


@router.get("")
def get_profile():
    """Get user profile info."""
    return {
        "name": "Mark Johnson",
        "email": "mark@novagrid.io",
        "role": "Admin",
        "company": "NovaGrid Inc.",
        "avatar_url": "",
        "joined": "2024-01-15",
        "last_active": "Just now",
        "total_scans": 0,
        "total_repairs": 0,
        "apis_monitored": 0,
    }


@router.get("/activity")
def get_activity():
    """Get recent user activity."""
    timeline = []

    try:
        scans = supabase.table("scan_history").select("*").order("created_at", desc=True).limit(10).execute()
        for s in (scans.data or []):
            timeline.append({
                "type": "scan",
                "title": "API Scan",
                "detail": f"Scanned {s.get('api_name', 'API')} — {s.get('status', '')}",
                "created_at": s.get("created_at", ""),
            })
    except Exception:
        pass

    try:
        repairs = supabase.table("repairs").select("*").order("created_at", desc=True).limit(10).execute()
        for r in (repairs.data or []):
            timeline.append({
                "type": "repair",
                "title": "AI Repair",
                "detail": f"Repaired {r.get('affected_file', 'file')}",
                "created_at": r.get("created_at", ""),
            })
    except Exception:
        pass

    timeline.sort(key=lambda x: x.get("created_at", ""), reverse=True)

    return {"activity": timeline[:20]}
