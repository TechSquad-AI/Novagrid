from fastapi import APIRouter
from supabase_client import supabase

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("")
def get_settings():
    try:
        result = supabase.table("settings").select("*").limit(1).execute()
        if result.data:
            return result.data[0]
        return {
            "project_name": "NovaGrid",
            "repo_url": "",
            "branch": "main",
            "scan_path": "/",
            "detect_removed": True,
            "detect_added": True,
            "detect_type_changed": True,
            "scan_frequency": "daily",
            "health_check_interval": 300,
            "ai_fix_mode": "suggest",
            "risk_threshold": 70,
            "require_approval_above": 80,
            "alert_on_change": True,
            "alert_on_failure": True,
            "alert_email": "",
        }
    except Exception as e:
        return {"error": str(e)}


@router.put("")
def update_settings(data: dict):
    try:
        existing = supabase.table("settings").select("id").limit(1).execute()
        if existing.data:
            supabase.table("settings").update(data).eq("id", existing.data[0]["id"]).execute()
        else:
            supabase.table("settings").insert(data).execute()
        return {"status": "saved", "settings": data}
    except Exception as e:
        return {"status": "error", "message": str(e)}
