import threading
import time
import json

from supabase_client import supabase
from monitor import monitor_api
from detector import detect_changes
from impact import find_api_field_usage


MONITOR_INTERVAL = 60

_scheduler_started = False


def normalize_change(value):
    """
    Convert change data into a consistent JSON-compatible form.
    """

    if value is None:
        return []

    if isinstance(value, list):
        return value

    if isinstance(value, tuple):
        return list(value)

    return [str(value)]


def change_already_logged(
    api_id,
    removed,
    added
):
    """
    Check whether the exact API change has already
    been recorded.

    We compare JSON in Python instead of using a
    JSONB equality filter, avoiding PostgreSQL JSON
    parsing issues.
    """

    try:

        result = (
            supabase
            .table("api_change_logs")
            .select(
                "id, removed, added"
            )
            .eq(
                "api_id",
                api_id
            )
            .execute()
        )

        for row in result.data or []:

            old_removed = normalize_change(
                row.get("removed")
            )

            old_added = normalize_change(
                row.get("added")
            )

            if (
                old_removed == removed
                and
                old_added == added
            ):

                return True

        return False

    except Exception as e:

        print(
            f"Duplicate change check failed: {e}"
        )

        return False


def monitor_all_apis():
    """
    Monitor all registered APIs for:

    - API health
    - Response time
    - API changes
    - Affected source code
    - Duplicate change prevention
    """

    while True:

        try:

            # ====================================================
            # GET REGISTERED APIS
            # ====================================================

            result = (
                supabase
                .table("apis")
                .select(
                    "id, name, base_url"
                )
                .execute()
            )

            apis = result.data or []

            for api in apis:

                api_id = api["id"]

                api_name = api["name"]

                base_url = api["base_url"]

                # ====================================================
                # HEALTH MONITORING
                # ====================================================

                try:

                    monitor_api(
                        api_id,
                        base_url
                    )

                    print(
                        f"NovaGrid monitor: "
                        f"{api_name} checked successfully."
                    )

                except Exception as e:

                    print(
                        f"NovaGrid health monitoring failed "
                        f"for {api_name}: {e}"
                    )

                # ====================================================
                # API CHANGE DETECTION
                # ====================================================

                try:

                    changes = detect_changes(
                        base_url
                    )

                    removed = normalize_change(
                        changes.get(
                            "removed",
                            []
                        )
                    )

                    added = normalize_change(
                        changes.get(
                            "added",
                            []
                        )
                    )

                    # ====================================================
                    # NO CHANGE
                    # ====================================================

                    if not removed and not added:

                        continue

                    # ====================================================
                    # FIND AFFECTED CODE
                    # ====================================================

                    affected = []

                    for field in removed:

                        try:

                            matches = (
                                find_api_field_usage(
                                    field
                                )
                            )

                            if matches:

                                affected.extend(
                                    matches
                                )

                        except Exception as e:

                            print(
                                f"Impact analysis failed "
                                f"for '{field}': {e}"
                            )

                    # ====================================================
                    # CHECK DUPLICATE
                    # ====================================================

                    already_logged = (
                        change_already_logged(
                            api_id,
                            removed,
                            added
                        )
                    )

                    if already_logged:

                        print(
                            f"NovaGrid change already recorded: "
                            f"{api_name}"
                        )

                        continue

                    # ====================================================
                    # SAVE NEW CHANGE
                    # ====================================================

                    supabase.table(
                        "api_change_logs"
                    ).insert({

                        "api_id": api_id,

                        "removed": removed,

                        "added": added,

                        "affected_code": affected

                    }).execute()

                    print(
                        f"NovaGrid new change detected: "
                        f"{api_name}"
                    )

                except Exception as e:

                    print(
                        f"NovaGrid change detection failed "
                        f"for {api_name}: {e}"
                    )

        except Exception as e:

            print(
                f"NovaGrid scheduler error: {e}"
            )

        # ========================================================
        # WAIT
        # ========================================================

        time.sleep(
            MONITOR_INTERVAL
        )


def start_scheduler():
    """
    Start the monitoring scheduler only once.
    """

    global _scheduler_started

    if _scheduler_started:

        return

    _scheduler_started = True

    thread = threading.Thread(
        target=monitor_all_apis,
        daemon=True
    )

    thread.start()

    print(
        "NovaGrid automatic monitoring started."
    )