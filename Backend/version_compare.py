from supabase_client import supabase


def compare_versions(api_id, old_version, new_version):

    try:

        old = (
            supabase
            .table("api_versions")
            .select("*")
            .eq("api_id", api_id)
            .eq("version", old_version)
            .execute()
        )


        new = (
            supabase
            .table("api_versions")
            .select("*")
            .eq("api_id", api_id)
            .eq("version", new_version)
            .execute()
        )


        if not old.data or not new.data:

            return {
                "status":"error",
                "message":"Version not found"
            }


        old_schema = old.data[0]["spec"]

        new_schema = new.data[0]["spec"]



        old_fields = set(
            old_schema.keys()
        )

        new_fields = set(
            new_schema.keys()
        )


        removed = list(
            old_fields - new_fields
        )

        added = list(
            new_fields - old_fields
        )


        unchanged = list(
            old_fields & new_fields
        )


        return {

            "status":"comparison_completed",

            "from_version":old_version,

            "to_version":new_version,


            "changes":{

                "removed_fields":
                    removed,


                "added_fields":
                    added,


                "unchanged_fields":
                    unchanged
            }

        }


    except Exception as e:


        return {

            "status":"error",

            "message":str(e)

        }