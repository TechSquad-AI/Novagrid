from supabase_client import supabase




def save_scan_history(result):

    supabase.table("scan_history").insert({

        "status": result["status"],

        "changes": result.get("changes"),

        "affected_code": result.get("affected_code")

    }).execute()



def get_scan_history():

    response = (

        supabase
        .table("scan_history")
        .select("*")
        .order(
            "created_at",
            desc=True
        )
        .execute()

    )

    return response.data