import requests


API_URL = "http://127.0.0.1:8000/"


def get_api_message():
    response = requests.get(
        API_URL,
        timeout=10
    )

    response.raise_for_status()

    data = response.json()

    data["result"]


if __name__ == "__main__":
    print(get_api_message())