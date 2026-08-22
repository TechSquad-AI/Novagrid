"""
NovaGrid API Guardian — FastAPI Application (Clean Rebuild)
Minimal: Auth + Endpoint Tree Graph
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os

from app.api.endpoint_tree import router as tree_router
from app.api.public_apis import router as public_apis_router
from app.api.github_repos import router as github_repos_router


# ============================================================
# APPLICATION
# ============================================================

app = FastAPI(title="NovaGrid API", version="2.0")

# CORS
FRONTEND_URL = os.getenv("FRONTEND_URL", "")
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://localhost:5177",
    "http://127.0.0.1:5176",
    "https://localhost:5173",
]
if FRONTEND_URL:
    ALLOWED_ORIGINS.insert(0, FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ROUTERS
# ============================================================

app.include_router(tree_router)
app.include_router(public_apis_router)
app.include_router(github_repos_router)


# ============================================================
# AUTH (Supabase)
# ============================================================

@app.post("/auth/signup")
def signup(payload: dict):
    """Create a new user via Supabase Auth."""
    email = payload.get("email", "")
    password = payload.get("password", "")

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required")

    try:
        from supabase_client import supabase
        result = supabase.auth.sign_up({"email": email, "password": password})
        return {
            "status": "success",
            "user": {
                "id": result.user.id if result.user else None,
                "email": result.user.email if result.user else email,
            },
        }
    except Exception as e:
        error_msg = str(e)
        if "already registered" in error_msg.lower() or "already exists" in error_msg.lower():
            raise HTTPException(status_code=409, detail="User already registered")
        raise HTTPException(status_code=400, detail=error_msg)


@app.post("/auth/login")
def login(payload: dict):
    """Login via Supabase Auth."""
    email = payload.get("email", "")
    password = payload.get("password", "")

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required")

    try:
        from supabase_client import supabase
        result = supabase.auth.sign_in_with_password({"email": email, "password": password})
        return {
            "status": "success",
            "user": {
                "id": result.user.id if result.user else None,
                "email": result.user.email if result.user else email,
            },
            "session": {
                "access_token": result.session.access_token if result.session else None,
                "refresh_token": result.session.refresh_token if result.session else None,
            },
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")


@app.post("/auth/logout")
def logout():
    """Logout via Supabase Auth."""
    try:
        from supabase_client import supabase
        supabase.auth.sign_out()
        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "name": "NovaGrid API Guardian",
        "version": "2.0",
        "status": "running",
    }


@app.get("/status")
def status():
    return {"status": "healthy"}


# ============================================================
# DIRECT LOCAL TEST
# ============================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=False)
