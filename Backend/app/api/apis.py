from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase_client import supabase
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/apis", tags=["APIs"])

class APICreate(BaseModel):
    name: str
    url: Optional[str] = None
    base_url: Optional[str] = None
    description: Optional[str] = None

@router.post("/")
def create_api(api: APICreate):
    try:
        data = {
            "name": api.name,
            "base_url": api.url or api.base_url,
            "description": api.description
        }
        
        result = supabase.table("apis").insert(data).execute()
        
        return {
            "message": "API created successfully",
            "data": result.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/")
def get_all_apis():
    try:
        result = supabase.table("apis").select("*").execute()
        return {
            "message": "APIs fetched successfully",
            "data": result.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))