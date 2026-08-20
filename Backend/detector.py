import json
import requests
from pathlib import Path


BASELINE_FILE = Path("contracts/baseline.json")


# ============================================================
# GET CURRENT API CONTRACT
# ============================================================

def get_current_contract(api_url):

    response = requests.get(
        api_url,
        timeout=5
    )

    response.raise_for_status()

    data = response.json()


    # Handle list responses
    # Example:
    # [
    #   {
    #     "id":1,
    #     "title":"hello"
    #   }
    # ]

    if isinstance(data, list):

        if len(data) > 0:

            data = data[0]

        else:

            data = {}



    return {

        "GET /": {

            "response": {

                key: "string"

                for key in data.keys()

            }

        }

    }



# ============================================================
# LOAD BASELINE
# ============================================================

def load_baseline():

    if not BASELINE_FILE.exists():

        return {

            "GET /": {

                "response": {}

            }

        }


    with open(
        BASELINE_FILE,
        "r",
        encoding="utf-8"
    ) as file:

        return json.load(file)



# ============================================================
# SAVE BASELINE
# ============================================================

def save_baseline(contract):

    BASELINE_FILE.parent.mkdir(
        parents=True,
        exist_ok=True
    )


    temporary_file = BASELINE_FILE.with_suffix(
        ".tmp"
    )


    with open(
        temporary_file,
        "w",
        encoding="utf-8"
    ) as file:


        json.dump(
            contract,
            file,
            indent=4
        )


    temporary_file.replace(
        BASELINE_FILE
    )



# ============================================================
# DETECT API DRIFT
# ============================================================

def detect_changes(
    api_url,
    update_baseline=False
):


    baseline = load_baseline()


    current = get_current_contract(
        api_url
    )



    old_schema = (

        baseline
        .get(
            "GET /",
            {}
        )
        .get(
            "response",
            {}
        )

    )


    new_schema = (

        current
        .get(
            "GET /",
            {}
        )
        .get(
            "response",
            {}
        )

    )



    old_fields = set(
        old_schema.keys()
    )


    new_fields = set(
        new_schema.keys()
    )



    removed = sorted(
        old_fields - new_fields
    )


    added = sorted(
        new_fields - old_fields
    )



    changes = {


        "removed":
            removed,


        "added":
            added,


        "old_schema":
            old_schema,


        "new_schema":
            new_schema

    }



    if update_baseline:


        save_baseline(
            current
        )



    return changes



# ============================================================
# LOCAL TEST
# ============================================================

if __name__ == "__main__":


    API_URL = (
        "https://jsonplaceholder.typicode.com/posts"
    )


    changes = detect_changes(
        API_URL
    )


    print(
        json.dumps(
            changes,
            indent=4
        )
    )