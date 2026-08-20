def request_human_validation(
    file,
    line,
    old_code,
    new_code
):

    print("\n================================")
    print("       HUMAN VALIDATION")
    print("================================")

    print(
        f"""
File:
{file}

Line:
{line}

Old Code:
{old_code}

New Code:
{new_code}
"""
    )


    while True:

        choice = input(
            "Approve patch? (y/n): "
        ).lower()


        if choice == "y":

            print(
                "[NovaGrid] Human approved."
            )

            return True


        elif choice == "n":

            print(
                "[NovaGrid] Human rejected."
            )

            return False