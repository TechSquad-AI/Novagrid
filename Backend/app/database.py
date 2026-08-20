from supabase import create_client, Client
from dotenv import load_dotenv
import os

load_dotenv()  # This must be at the top

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SECRET_KEY") or os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase environment variables are missing")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

print("Supabase connected successfully!")