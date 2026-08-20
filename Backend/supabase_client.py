import os
from dotenv import load_dotenv
from supabase import create_client, Client


# ============================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================

# Load .env file from current directory
load_dotenv()


# ============================================================
# SUPABASE CONFIGURATION
# ============================================================

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")


# ============================================================
# DEBUG CHECK
# ============================================================

print("SUPABASE URL:", SUPABASE_URL)

if SUPABASE_KEY:
    print("SUPABASE KEY: Loaded")
else:
    print("SUPABASE KEY: Missing")


# ============================================================
# VALIDATION
# ============================================================

if not SUPABASE_URL:
    raise Exception(
        "SUPABASE_URL missing! Check your .env file"
    )

if not SUPABASE_KEY:
    raise Exception(
        "SUPABASE_KEY missing! Check your .env file"
    )


# ============================================================
# CREATE SUPABASE CLIENT
# ============================================================

supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)


print("Supabase connected successfully!")