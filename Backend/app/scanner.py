import time
import requests


def check_api(api_url, expected_status=200):

    start_time = time.time()

    try:

        response = requests.get(
            api_url,
            timeout=10
        )

        end_time = time.time()


        response_time = round(
            (end_time - start_time) * 1000,
            2
        )


        healthy = (
            response.status_code == expected_status
        )


        return {

            "status": "Healthy" if healthy else "Unhealthy",

            "status_code": response.status_code,

            "response_time": response_time,

            "failed_requests": 0,

            "last_checked": time.strftime(
                "%Y-%m-%d %H:%M:%S"
            )

        }


    except Exception as e:


        return {

            "status": "Down",

            "status_code": None,

            "response_time": None,

            "failed_requests": 1,

            "error": str(e),

            "last_checked": time.strftime(
                "%Y-%m-%d %H:%M:%S"
            )

        }