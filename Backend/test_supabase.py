from supabase_client import supabase


data = {
    "api_change": "Breaking API change detected",
    "affected_file": "example.py",
    "affected_line": 25,
    "old_code": "old_function()",
    "new_code": "new_function()",
    "test_passed": True
}


try:
    result = (
        supabase
        .table("repairs")
        .insert(data)
        .execute()
    )

    print("Insert successful!")
    print(result.data)


except Exception as e:
    print("Insert failed:")
    print(e)