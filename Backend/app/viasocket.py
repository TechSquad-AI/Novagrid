"""viaSocket webhook integration for NovaGrid notifications."""
import os
import requests
from dotenv import load_dotenv

load_dotenv()
VIASOCKET_WEBHOOK_URL = os.getenv("VIASOCKET_WEBHOOK_URL", "")


def send_webhook(event_type: str, data: dict):
    """Send a webhook to viaSocket."""
    if not VIASOCKET_WEBHOOK_URL:
        return False

    payload = {
        "event": event_type,
        "source": "novagrid",
        "api_name": data.get("api_name", ""),
        "message": data.get("message", ""),
        "status": data.get("status", ""),
        "change_type": data.get("change_type", ""),
        "detail": data.get("detail", ""),
    }

    try:
        response = requests.post(
            VIASOCKET_WEBHOOK_URL,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=10,
        )
        if response.status_code < 300:
            print(f"[viaSocket] Webhook sent: {event_type}")
            return True
        else:
            print(f"[viaSocket] Webhook failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"[viaSocket] Webhook error: {e}")
        return False
