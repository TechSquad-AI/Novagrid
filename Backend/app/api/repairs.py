from fastapi import APIRouter, HTTPException

from supabase_client import supabase


router = APIRouter(
    prefix="/repairs",
    tags=["Repairs"]
)


@router.get("/")
def get_repairs():

    try:

        result = (
            supabase
            .table("repairs")
            .select("*")
            .order(
                "created_at",
                desc=True
            )
            .execute()
        )

        return {
            "total_repairs": len(result.data),
            "repairs": result.data
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@router.get("/{repair_id}")
def get_repair(repair_id: str):

    try:

        result = (
            supabase
            .table("repairs")
            .select("*")
            .eq("id", repair_id)
            .single()
            .execute()
        )

        return result.data

    except Exception as e:

        raise HTTPException(
            status_code=404,
            detail="Repair not found"
        )