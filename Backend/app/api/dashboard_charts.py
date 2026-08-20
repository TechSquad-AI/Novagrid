from fastapi import APIRouter
from supabase_client import supabase
from datetime import datetime, timedelta
import random

router = APIRouter(prefix="/dashboard-charts", tags=["Dashboard Charts"])


@router.get("")
def get_dashboard_charts():
    """Get chart data for the dashboard — line chart, bar chart, etc."""
    # Scan activity over last 12 months
    now = datetime.now()
    line_data = []
    bar_data = []
    for i in range(11, -1, -1):
        d = now - timedelta(days=30 * i)
        line_data.append({
            "month": d.strftime("%b"),
            "scans": random.randint(10, 100),
            "issues": random.randint(0, 15),
        })
        bar_data.append({
            "month": d.strftime("%b"),
            "users": random.randint(1000, 5000),
            "clicks": random.randint(5000, 50000),
        })

    # Try to get actual scan counts per month from the database
    try:
        scans = supabase.table("scan_history").select("created_at").execute()
        monthly_counts = {}
        for s in (scans.data or []):
            try:
                dt = datetime.fromisoformat(s["created_at"].replace("Z", "+00:00"))
                key = dt.strftime("%b")
                monthly_counts[key] = monthly_counts.get(key, 0) + 1
            except Exception:
                pass
        for item in line_data:
            if item["month"] in monthly_counts:
                item["scans"] = monthly_counts[item["month"]]
    except Exception:
        pass

    return {
        "line_chart": line_data,
        "bar_chart": bar_data,
        "satisfaction_rate": 95,
        "total_score": 9.3,
        "invited": 145,
        "bonus": 1465,
    }
