from supabase_client import supabase
from health import check_api_health


def monitor_api(api_id, base_url):

    health = check_api_health(base_url)

    try:
        saved = (
            supabase
            .table("api_health_logs")
            .insert({
                "api_id": api_id,
                "status": health.get("status"),
                "http_status": health.get("http_status"),
                "response_time_ms": health.get("response_time_ms"),
                "error": health.get("error")
            })
            .execute()
        )

        return {
            "success": True,
            "health": health,
            "data": saved.data
        }

    except Exception as e:

        return {
            "success": False,
            "health": health,
            "error": str(e)
        }