from fastapi import APIRouter
from supabase_client import supabase

router = APIRouter(prefix="/history", tags=["History"])


@router.get("")
def get_all_history():
    result = {"timeline": [], "versions": [], "fixes": [], "reviews": [], "tests": []}

    try:
        r = supabase.table("scan_history").select("*").order("created_at", desc=True).limit(50).execute()
        result["timeline"] = r.data or []
    except Exception:
        pass

    try:
        r = supabase.table("repairs").select("*").order("created_at", desc=True).limit(50).execute()
        result["fixes"] = r.data or []
    except Exception:
        pass

    try:
        r = supabase.table("repair_approvals").select("*").order("created_at", desc=True).limit(50).execute()
        result["reviews"] = r.data or []
    except Exception:
        pass

    try:
        r = supabase.table("api_versions").select("*").order("created_at", desc=True).limit(50).execute()
        result["versions"] = r.data or []
    except Exception:
        pass

    timeline = []
    for item in result["timeline"]:
        timeline.append({"type": "scan", "title": "API Scan", "detail": item.get("status", ""), "created_at": item.get("created_at", ""), "data": item})
    for item in result["fixes"]:
        timeline.append({"type": "fix", "title": "AI Repair", "detail": item.get("affected_file", ""), "created_at": item.get("created_at", ""), "data": item})
    for item in result["reviews"]:
        timeline.append({"type": "review", "title": "Human Review", "detail": item.get("status", ""), "created_at": item.get("created_at", ""), "data": item})

    timeline.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    result["timeline"] = timeline[:50]

    return result


@router.get("/versions")
def get_versions():
    try:
        r = supabase.table("api_versions").select("*").order("created_at", desc=True).limit(50).execute()
        return {"versions": r.data or []}
    except Exception:
        return {"versions": []}


@router.get("/fixes")
def get_fixes():
    try:
        r = supabase.table("repairs").select("*").order("created_at", desc=True).limit(50).execute()
        return {"fixes": r.data or []}
    except Exception:
        return {"fixes": []}


@router.get("/reviews")
def get_reviews():
    try:
        r = supabase.table("repair_approvals").select("*").order("created_at", desc=True).limit(50).execute()
        return {"reviews": r.data or []}
    except Exception:
        return {"reviews": []}
