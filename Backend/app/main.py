from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from history_service import save_scan_history, get_scan_history
from version_compare import compare_versions





import os
import sys
import subprocess
import threading
import time

# from app.api.apis import router as api_router  # Removed: routes now in main.py
from app.api.dashboard import router as dashboard_router
from app.api.settings import router as settings_router
from app.api.history import router as history_router
from app.api.impact import router as impact_router
from app.api.profile import router as profile_router
from app.api.dashboard_charts import router as dashboard_charts_router

from detector import detect_changes
from impact import find_api_field_usage
from ai_fixer import generate_fix
from patcher import apply_fix, rollback_fix, confirm_fix
from supabase_client import supabase
from health import check_api_health
from version_tracker import save_api_version
from monitor import monitor_api
from scheduler import start_scheduler


# ============================================================
# APPLICATION
# ============================================================

app = FastAPI(
    title="NovaGrid API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)





# ============================================================
# BACKGROUND SCHEDULER
# ============================================================

_scheduler_started = False
_scheduler_lock = threading.Lock()


def start_scheduler_background():
    """
    Start NovaGrid's scheduler outside the FastAPI import path.

    This prevents the scheduler from blocking the application
    while FastAPI is starting or while pytest imports the app.
    """

    global _scheduler_started

    with _scheduler_lock:

        if _scheduler_started:
            return

        _scheduler_started = True

    try:

        print("[NovaGrid] Starting background scheduler...")

        start_scheduler()

        print("[NovaGrid] Background scheduler started.")

    except Exception as e:

        print(
            f"[NovaGrid] Scheduler failed to start: {e}"
        )


@app.on_event("startup")
async def startup_event():

    scheduler_thread = threading.Thread(
        target=start_scheduler_background,
        daemon=True,
        name="novagrid-scheduler"
    )

    scheduler_thread.start()




# ============================================================
# ROOT API
# ============================================================

@app.get("/")
def root():

    return {
        "result": "NovaGrid API is running",
        "version": "2.0",
        "message": "updated"
    }

@app.get("/status")
def api_status():

    return {
        "name": "NovaGrid API",
        "url": "http://127.0.0.1:8000",
        "status": "Healthy",
        "last_scan": "Just now",
        "changes": 3
    }


# ============================================================
# API ROUTER
# ============================================================

# app.include_router(api_router)  # Removed: routes now in main.py
app.include_router(dashboard_router)
app.include_router(settings_router)
app.include_router(history_router)
app.include_router(impact_router)
app.include_router(profile_router)
app.include_router(dashboard_charts_router)


# ============================================================
# SCAN API
# ============================================================

@app.post("/scan")
def scan_api():

    api_url = "http://127.0.0.1:8000"

    try:

        changes = detect_changes(
            api_url
        )

    except Exception as e:

        return {
            "status": "scan_failed",
            "error": str(e)
        }

    affected_code = []

    for field in changes.get(
        "removed",
        []
    ):

        try:

            affected_code.extend(
                find_api_field_usage(
                    field
                )
            )

        except Exception as e:

            print(
                f"Impact analysis failed for "
                f"{field}: {e}"
            )

    return {
        "status": "scan_completed",
        "changes": changes,
        "affected_code": affected_code
    }

    save_scan_history(result)


    return result


@app.get("/history")
def history():

    return get_scan_history()



# ============================================================
# REGISTER API
# ============================================================

@app.post("/apis")
def create_api(data: dict):

    try:

        result = (
            supabase
            .table("apis")
            .insert({

                "name": data["name"],

                "base_url": data["url"]

            })
            .execute()
        )


        return {
            "status":"success",
            "api": result.data[0]
        }


    except Exception as e:

        return {
            "status":"error",
            "message":str(e)
        }


@app.get("/apis")
def list_apis():
    try:
        result = supabase.table("apis").select("*").execute()
        return {
            "status": "success",
            "data": result.data or []
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "data": []
        }

# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health/{api_id}")
def api_health(api_id: str):

    try:

        result = (
            supabase
            .table("apis")
            .select("*")
            .eq("id", api_id)
            .execute()
        )

    except Exception as e:

        return {
            "status": "error",
            "message": "Database request failed",
            "error": str(e)
        }

    if not result.data:

        return {
            "status": "error",
            "message": "API not found"
        }

    api = result.data[0]

    try:

        health = check_api_health(
            api["base_url"]
        )

    except Exception as e:

        health = {
            "status": "unhealthy",
            "error": str(e)
        }

    # Save health result — try scan_history first, then api_health
    from datetime import datetime
    saved = False
    try:
        supabase.table("scan_history").insert({
            "api_id": api_id,
            "status": health.get("status", "unknown"),
            "response_time_ms": health.get("response_time_ms", 0),
        }).execute()
        saved = True
    except Exception as e:
        print(f"scan_history insert failed: {e}")
    
    if not saved:
        try:
            supabase.table("api_health").insert({
                "api_id": api_id,
                "status": health.get("status", "unknown"),
                "response_time_ms": health.get("response_time_ms", 0),
            }).execute()
        except Exception as e2:
            print(f"api_health insert also failed: {e2}")

    return {
        "status": "success",

        "api": {
            "id": api["id"],
            "name": api["name"],
            "base_url": api["base_url"]
        },

        "health": health
    }


# ============================================================
# CREATE API VERSION
# ============================================================

@app.post("/apis/{api_id}/version")

def create_api_version(api_id: str):

    try:

        result = (
            supabase
            .table("apis")
            .select("*")
            .eq("id", api_id)
            .execute()
        )

    except Exception as e:

        return {
            "status": "error",
            "message": "Database request failed",
            "error": str(e)
        }

    if not result.data:

        return {
            "status": "error",
            "message": "API not found"
        }

    api = result.data[0]

    try:

        changes = detect_changes(
            api["base_url"]
        )

    except Exception as e:

        return {
            "status": "version_detection_failed",
            "error": str(e)
        }

    schema = changes.get(
    "new_schema",
    {}
)

    try:

        version_result = save_api_version(
            api_id=api_id,
            schema=schema,
            changes=changes
        )

    except Exception as e:

        return {
            "status": "version_save_failed",
            "error": str(e),
            "changes": changes
        }

    return {
        "status": "version_created",

        "api": {
            "id": api["id"],
            "name": api["name"],
            "base_url": api["base_url"]
        },

        "changes": changes,

        "version": version_result
    }
    


# ============================================================
# MONITOR API
# ============================================================

@app.post("/apis/{api_id}/monitor")
def monitor_registered_api(api_id: str):

    try:

        result = (
            supabase
            .table("apis")
            .select("*")
            .eq("id", api_id)
            .execute()
        )

    except Exception as e:

        return {
            "status": "error",
            "message": "Database request failed",
            "error": str(e)
        }

    if not result.data:

        return {
            "status": "error",
            "message": "API not found"
        }

    api = result.data[0]

    try:

        monitor_result = monitor_api(
            api["id"],
            api["base_url"]
        )

    except Exception as e:

        return {
            "status": "monitor_failed",
            "error": str(e)
        }

    return {
        "status": "monitor_completed",

        "api": {
            "id": api["id"],
            "name": api["name"],
            "base_url": api["base_url"]
        },

        "monitor": monitor_result
    }


# ============================================================
# RISK ANALYSIS
# ============================================================

def is_high_risk_change(
    changes,
    affected
):

    removed = changes.get(
        "removed",
        []
    )

    added = changes.get(
        "added",
        []
    )

    if len(removed) > 1:
        return True

    if len(added) > 1:
        return True

    if len(affected) > 1:
        return True

    if not affected:
        return True

    return False


# ============================================================
# RUN TESTS
# ============================================================

def run_tests():

    project_root = os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )

    test_file = os.path.join(
        project_root,
        "test_consumer.py"
    )

    if not os.path.exists(test_file):

        return {
            "passed": False,
            "return_code": 1,
            "output": "",
            "error": f"Test file not found: {test_file}"
        }

    command = [
        sys.executable,
        "-m",
        "pytest",
        test_file,
        "-q",
        "--tb=no",
        "-p",
        "no:cacheprovider",
        "-p",
    "no:anyio"
    ]

    try:

        result = subprocess.run(
            command,
            cwd=project_root,
            capture_output=True,
            text=True,
            timeout=20
        )

        return {
            "passed": result.returncode == 0,
            "return_code": result.returncode,
            "output": result.stdout,
            "error": result.stderr
        }

    except subprocess.TimeoutExpired:

        return {
            "passed": False,
            "return_code": 124,
            "output": "",
            "error": "Tests timed out"
        }

    except Exception as e:

        return {
            "passed": False,
            "return_code": 1,
            "output": "",
            "error": str(e)
        }


# ============================================================
# SAVE REPAIR HISTORY
# ============================================================

def save_repair(
    changes,
    file_path,
    affected_line,
    old_code,
    new_code,
    test_passed
):

    try:

        result = (
            supabase
            .table("repairs")
            .insert({

                "api_change":
                    f'{changes.get("removed", [])} → '
                    f'{changes.get("added", [])}',

                "affected_file":
                    file_path,

                "affected_line":
                    affected_line,

                "old_code":
                    old_code,

                "new_code":
                    new_code,

                "test_passed":
                    test_passed
            })
            .execute()
        )

        return {
            "saved": True,
            "data": result.data
        }

    except Exception as e:

        print(
            f"Repair history save failed: {e}"
        )

        return {
            "saved": False,
            "error": str(e)
        }


# ============================================================
# REPAIR API
# ============================================================

@app.post("/repair/{api_id}")
def repair_api(api_id: str):

    # --------------------------------------------------------
    # GET API
    # --------------------------------------------------------

    try:

        result = (
            supabase
            .table("apis")
            .select("*")
            .eq("id", api_id)
            .execute()
        )

    except Exception as e:

        return {
            "status":
                "database_error",

            "error":
                str(e)
        }

    if not result.data:

        return {
            "status": "error",
            "message": "API not found"
        }

    api = result.data[0]

    # --------------------------------------------------------
    # DETECT CHANGE
    # --------------------------------------------------------

    try:

        changes = detect_changes(
            api["base_url"]
        )

    except Exception as e:

        return {
            "status":
                "detection_failed",

            "error":
                str(e),

            "api": {
                "id":
                    api["id"],

                "name":
                    api["name"]
            }
        }

    removed = changes.get(
        "removed",
        []
    )

    added = changes.get(
        "added",
        []
    )

    # --------------------------------------------------------
    # NO CHANGES
    # --------------------------------------------------------

    if not removed and not added:

        return {
            "status":
                "no_changes",

            "api": {
                "id":
                    api["id"],

                "name":
                    api["name"]
            },

            "changes":
                changes
        }

    # --------------------------------------------------------
    # FIND AFFECTED CODE
    # --------------------------------------------------------

    affected = []

    for field in removed:

        try:

            matches = find_api_field_usage(
                field
            )

            if matches:

                affected.extend(
                    matches
                )

        except Exception as e:

            print(
                f"Impact analysis failed "
                f"for {field}: {e}"
            )

    # --------------------------------------------------------
    # NO AFFECTED CODE
    # --------------------------------------------------------

    if not affected:

        return {
            "status":
                "no_affected_code",

            "api": {
                "id":
                    api["id"],

                "name":
                    api["name"]
            },

            "changes":
                changes,

            "affected_code":
                []
        }

    # --------------------------------------------------------
    # FIRST AFFECTED LOCATION
    # --------------------------------------------------------

    first = affected[0]

    file_path = first.get(
        "file"
    )

    old_code = first.get(
        "code"
    )

    affected_line = first.get(
        "line"
    )

    if not file_path or not old_code:

        return {
            "status":
                "invalid_affected_code",

            "affected_code":
                affected
        }

    # --------------------------------------------------------
    # REPLACEMENT FIELD
    # --------------------------------------------------------

    if not added:

        return {
            "status":
                "human_approval_required",

            "reason":
                "A field was removed but "
                "no replacement field was detected.",

            "api": {
                "id":
                    api["id"],

                "name":
                    api["name"]
            },

            "changes":
                changes,

            "affected_code":
                affected
        }

    old_field = removed[0]

    new_field = added[0]

    # --------------------------------------------------------
    # GENERATE AI FIX
    # --------------------------------------------------------

    try:

        ai_fix = generate_fix(
            old_field,
            new_field,
            old_code
        )

    except Exception as e:

        return {
            "status":
                "ai_fix_failed",

            "error":
                str(e),

            "changes":
                changes,

            "affected_code":
                affected
        }

    if not ai_fix:

        return {
            "status":
                "ai_fix_failed",

            "error":
                "AI fixer returned an empty fix.",

            "changes":
                changes,

            "affected_code":
                affected
        }

    # --------------------------------------------------------
    # RISK ANALYSIS
    # --------------------------------------------------------

    high_risk = is_high_risk_change(
        changes,
        affected
    )

    # --------------------------------------------------------
    # HUMAN APPROVAL
    # --------------------------------------------------------

    if high_risk:

        try:

            approval = (
                supabase
                .table(
                    "repair_approvals"
                )
                .insert({

                    "api_id":
                        api_id,

                    "affected_file":
                        file_path,

                    "affected_line":
                        affected_line,

                    "old_code":
                        old_code,

                    "proposed_code":
                        ai_fix,

                    "reason":
                        "NovaGrid classified this "
                        "API change as high risk "
                        "and requires human approval.",

                    "status":
                        "pending"
                })
                .execute()
            )

            return {
                "status":
                    "human_approval_required",

                "api": {
                    "id":
                        api["id"],

                    "name":
                        api["name"]
                },

                "changes":
                    changes,

                "affected_code":
                    affected,

                "ai_fix":
                    ai_fix,

                "approval":
                    approval.data
            }

        except Exception as e:

            return {
                "status":
                    "approval_save_failed",

                "error":
                    str(e)
            }

    # --------------------------------------------------------
    # APPLY PATCH
    # --------------------------------------------------------

    try:

        patch_applied = apply_fix(
    file_path,
    old_code,
    ai_fix
)
    except Exception as e:

        return {
            "status":
                "patch_failed",

            "error":
                str(e),

            "changes":
                changes,

            "affected_code":
                affected,

            "ai_fix":
                ai_fix
        }

    if not patch_applied:

        return {
            "status":
                "patch_failed",

            "changes":
                changes,

            "affected_code":
                affected,

            "ai_fix":
                ai_fix
        }

    # --------------------------------------------------------
    # RUN TESTS
    # --------------------------------------------------------

    test_result = run_tests()

    tests_passed = test_result[
        "passed"
    ]

    # --------------------------------------------------------
    # CONFIRM / ROLLBACK
    # --------------------------------------------------------

    rolled_back = False

    if tests_passed:

        try:

            confirm_fix(
                file_path
            )

        except Exception as e:

            return {
                "status":
                    "confirm_failed",

                "error":
                    str(e),

                "tests":
                    test_result
            }

    else:

        try:

            rolled_back = rollback_fix(
                file_path
            )

        except Exception as e:

            rolled_back = False

            print(
                f"Rollback failed: {e}"
            )

    # --------------------------------------------------------
    # SAVE HISTORY
    # --------------------------------------------------------

    history = save_repair(
        changes,
        file_path,
        affected_line,
        old_code,
        ai_fix,
        tests_passed
    )

    # --------------------------------------------------------
    # VERIFIED
    # --------------------------------------------------------

    if tests_passed:

        return {
            "status":
                "repair_verified",

            "api": {
                "id":
                    api["id"],

                "name":
                    api["name"]
            },

            "changes":
                changes,

            "affected_code":
                affected,

            "ai_fix":
                ai_fix,

            "patch_applied":
                True,

            "rollback":
                False,

            "tests": {
                "passed":
                    True,

                "return_code":
                    test_result[
                        "return_code"
                    ],

                "output":
                    test_result[
                        "output"
                    ],

                "error":
                    test_result[
                        "error"
                    ]
            },

            "supabase":
                history
        }

    # --------------------------------------------------------
    # ROLLED BACK
    # --------------------------------------------------------

    return {
        "status":
            "repair_rolled_back",

        "api": {
            "id":
                api["id"],

            "name":
                api["name"]
        },

        "changes":
            changes,

        "affected_code":
            affected,

        "ai_fix":
            ai_fix,

        "patch_applied":
            True,

        "rollback":
            rolled_back,

        "tests": {
            "passed":
                False,

            "return_code":
                test_result[
                    "return_code"
                ],

            "output":
                test_result[
                    "output"
                ],

            "error":
                test_result[
                    "error"
                ]
        },

        "supabase":
            history
    }


# ============================================================
# GET PENDING APPROVALS
# ============================================================

@app.get("/approvals")
def get_pending_approvals():

    try:

        result = (
            supabase
            .table(
                "repair_approvals"
            )
            .select("*")
            .eq(
                "status",
                "pending"
            )
            .order(
                "created_at",
                desc=True
            )
            .execute()
        )

    except Exception as e:

        return {
            "status":
                "database_error",

            "error":
                str(e)
        }

    approvals = (
        result.data or []
    )

    return {
        "total":
            len(approvals),

        "approvals":
            approvals
    }


# ============================================================
# APPROVE REPAIR
# ============================================================

@app.post(
    "/approvals/{approval_id}/approve"
)
def approve_repair(
    approval_id: str
):

    try:

        result = (
            supabase
            .table(
                "repair_approvals"
            )
            .select("*")
            .eq(
                "id",
                approval_id
            )
            .eq(
                "status",
                "pending"
            )
            .execute()
        )

    except Exception as e:

        return {
            "status":
                "database_error",

            "error":
                str(e)
        }

    if not result.data:

        return {
            "status":
                "error",

            "message":
                "Approval request not found "
                "or already resolved."
        }

    approval = result.data[0]

    file_path = approval.get("affected_file", "unknown")

    # --------------------------------------------------------
    # APPLY APPROVED PATCH (skip if file doesn't exist)
    # --------------------------------------------------------

    # Skip patch application — just mark as approved
    patch_applied = False

    # --------------------------------------------------------
    # Mark as approved
    # --------------------------------------------------------

    final_status = "approved"

    # --------------------------------------------------------
    # UPDATE APPROVAL
    # --------------------------------------------------------

    try:

        (
            supabase
            .table(
                "repair_approvals"
            )
            .update({

                "status":
                    final_status,

                "resolved_at":
                    "now()"
            })
            .eq(
                "id",
                approval_id
            )
            .execute()
        )

    except Exception as e:

        return {
            "status":
                "repair_completed_but_update_failed",

            "error":
                str(e),

            "approval_id":
                approval_id
        }

    return {
        "status":
            final_status,

        "approval_id":
            approval_id,

        "patch_applied":
            patch_applied
    }


# ============================================================
# REJECT REPAIR
# ============================================================

@app.post(
    "/approvals/{approval_id}/reject"
)
def reject_repair(
    approval_id: str
):

    try:

        result = (
            supabase
            .table(
                "repair_approvals"
            )
            .select("id")
            .eq(
                "id",
                approval_id
            )
            .eq(
                "status",
                "pending"
            )
            .execute()
        )

    except Exception as e:

        return {
            "status":
                "database_error",

            "error":
                str(e)
        }

    if not result.data:

        return {
            "status":
                "error",

            "message":
                "Approval request not found "
                "or already resolved."
        }

    try:

        (
            supabase
            .table(
                "repair_approvals"
            )
            .update({

                "status":
                    "rejected",

                "resolved_at":
                    "now()"
            })
            .eq(
                "id",
                approval_id
            )
            .execute()
        )

    except Exception as e:

        return {
            "status":
                "database_error",

            "error":
                str(e),

            "approval_id":
                approval_id
        }

    return {
        "status":
            "rejected",

        "approval_id":
            approval_id
    }


# ============================================================
# DIRECT LOCAL TEST
# ============================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000,
        reload=False
    )
