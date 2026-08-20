def request_approval(
    file,
    line,
    old_code,
    new_code
):
    print("\n==============================")
    print(" NovaGrid Human Validation")
    print("==============================")

    print(
        f"""
File:
{file}

Line:
{line}

Old Code:
{old_code}

AI Proposed Fix:
{new_code}
"""
    )

    while True:

        choice = input(
            "Apply this fix? (yes/no): "
        ).lower()

        if choice in [
            "yes",
            "y"
        ]:
            return True

        if choice in [
            "no",
            "n"
        ]:
            return False