from app.database import supabase


def get_registered_apis():
    result = (
        supabase
        .table("apis")
        .select("*")
        .execute()
    )

    return result.data


def get_api_by_id(api_id):
    result = (
        supabase
        .table("apis")
        .select("*")
        .eq("id", api_id)
        .single()
        .execute()
    )

    return result.data