# ============================================================
# NOVAGRID API VERSION TRACKER
# ============================================================

from supabase_client import supabase
from datetime import datetime



# ============================================================
# GET NEXT VERSION NUMBER
# ============================================================

def get_next_version(api_id):

    result = (
        supabase
        .table("api_versions")
        .select("version")
        .eq(
            "api_id",
            api_id
        )
        .order(
            "version",
            desc=True
        )
        .limit(1)
        .execute()
    )


    if result.data:

        return result.data[0]["version"] + 1


    return 1




# ============================================================
# SAVE API VERSION
# ============================================================

def save_api_version(
    api_id,
    schema,
    changes
):


    version_number = get_next_version(
        api_id
    )


    try:


        response = (

            supabase

            .table(
                "api_versions"
            )

            .insert({

                "api_id":
                    api_id,


                "version":
                    version_number,


                # IMPORTANT
                # Your table requires "spec"
                "spec":
                    schema,


                "changes":
                    changes,


                "created_at":
                    datetime.utcnow().isoformat()

            })

            .execute()

        )


        return {

            "saved":
                True,

            "version":
                version_number,

            "data":
                response.data

        }



    except Exception as e:


        print(
            "Version save error:",
            e
        )

        raise e