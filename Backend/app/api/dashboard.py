from fastapi import APIRouter
from supabase_client import supabase

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def safe_query(table, select="*", order_by=None, desc=True, limit=None):
    """Safely query a Supabase table, return empty list on any error."""
    try:
        q = supabase.table(table).select(select)
        if order_by:
            q = q.order(order_by, desc=desc)
        if limit:
            q = q.limit(limit)
        result = q.execute()
        return result.data or []
    except Exception:
        return []


@router.get("/stats")
def get_dashboard_stats():
    """KPI Summary: Total APIs, Healthy, Changed, Critical"""
    apis = safe_query("apis")
    approvals = safe_query("repair_approvals")
    changes = safe_query("api_changes", order_by="created_at")

    changed_count = len([c for c in changes if c.get("severity") in ("high", "critical")])
    critical_count = len([a for a in approvals if a.get("status") == "pending"])

    # Count healthy from scan_history or api_health
    scans = safe_query("scan_history", order_by="created_at")
    if not scans:
        scans = safe_query("api_health", order_by="created_at")

    latest_scan = {}
    for s in scans:
        aid = s.get("api_id")
        if aid:
            latest_scan[aid] = s  # last one wins (ordered by created_at desc)

    healthy = sum(1 for aid, s in latest_scan.items() if s.get("status") in ("healthy", "success", "healthy_ok"))

    return {
        "total_apis": len(apis),
        "healthy_apis": healthy,
        "changed_apis": changed_count,
        "critical_apis": critical_count,
    }


@router.get("/changes")
def get_recent_changes():
    """Recent Changes Feed"""
    changes = safe_query("api_changes", order_by="created_at", limit=20)
    return {"changes": changes}


@router.get("/monitoring")
def get_monitoring_data():
    """Live Monitoring - returns ALL registered APIs with health status."""
    apis = safe_query("apis")

    # Try to get scan data from either table
    scans = safe_query("scan_history", order_by="created_at")
    if not scans:
        scans = safe_query("api_health", order_by="created_at")

    # Build lookup of latest scan per API
    latest_scan = {}
    for s in scans:
        aid = s.get("api_id")
        if aid:
            latest_scan[aid] = s

    monitoring = []
    for api_item in apis:
        api_id = api_item.get("id")
        scan = latest_scan.get(api_id)

        if scan:
            raw_status = scan.get("status", "unknown")
            if raw_status in ("healthy", "success", "healthy_ok"):
                status = "healthy"
            elif raw_status in ("unhealthy", "error", "failed"):
                status = "unhealthy"
            else:
                status = raw_status
            response_time = scan.get("response_time_ms", 0) or 0
            http_status = scan.get("http_status", 0) or 0
        else:
            status = "unchecked"
            response_time = 0
            http_status = 0

        monitoring.append({
            "id": api_id,
            "name": api_item.get("name", "Unknown"),
            "url": api_item.get("base_url", ""),
            "status": status,
            "response_time_ms": response_time,
            "http_status": http_status,
            "last_checked": scan.get("created_at", scan.get("checked_at", "")) if scan else "Never",
        })

    return {"monitoring": monitoring}


@router.get("/insights")
def get_ai_insights():
    """AI Insight Panel data"""
    repairs = safe_query("repairs", order_by="created_at", limit=5)
    changes = safe_query("api_changes", order_by="created_at", limit=5)

    risk_summary = {"high": 0, "medium": 0, "low": 0}
    for c in changes:
        sev = c.get("severity", "low")
        if sev in risk_summary:
            risk_summary[sev] += 1

    narrative = (
        f"NovaGrid has detected {len(changes)} recent "
        f"API changes. {risk_summary['high']} high-risk "
        f"changes require attention."
    )

    return {
        "recent_repairs": repairs,
        "recent_changes": changes,
        "risk_summary": risk_summary,
        "narrative": narrative,
    }
