# ============================================================
# NOVAGRID HEALTH SERVICE
# ============================================================

import requests
import time
from datetime import datetime



# ============================================================
# CHECK API HEALTH
# ============================================================

def check_api_health(api_url):

    start_time = time.time()

    try:

        response = requests.get(
            api_url,
            timeout=5
        )


        end_time = time.time()


        response_time = round(
            (end_time - start_time) * 1000,
            2
        )


        if 200 <= response.status_code < 300:

            status = "healthy"


        elif 400 <= response.status_code < 500:

            status = "client_error"


        elif response.status_code >= 500:

            status = "server_error"


        else:

            status = "unknown"



        return {


            "status":
                status,


            "http_status":
                response.status_code,


            "response_time_ms":
                response_time,


            "response_size_bytes":
                len(response.content),


            "checked_at":
                datetime.utcnow().isoformat(),


            "message":
                "API is reachable"

        }



    except requests.exceptions.Timeout:


        return {


            "status":
                "timeout",


            "error":
                "API request timed out after 5 seconds",


            "checked_at":
                datetime.utcnow().isoformat()

        }



    except requests.exceptions.ConnectionError:


        return {


            "status":
                "connection_failed",


            "error":
                "Unable to connect to API",


            "checked_at":
                datetime.utcnow().isoformat()

        }



    except Exception as error:


        return {


            "status":
                "unhealthy",


            "error":
                str(error),


            "checked_at":
                datetime.utcnow().isoformat()

        }