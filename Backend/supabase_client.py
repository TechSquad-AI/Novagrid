"""Supabase client initialization."""
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "") or os.getenv("SUPABASE_SECRET_KEY", "")

if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    print(f"SUPABASE URL: {SUPABASE_URL}")
    print("SUPABASE KEY: Loaded")
else:
    print("WARNING: Supabase credentials not found in .env")
    supabase = None
