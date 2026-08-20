from supabase_client import supabase
from difflib import SequenceMatcher
import re



def extract_field(code):

    match = re.search(
        r'\["(.+?)"\]',
        code
    )

    if match:
        return match.group(1)

    return None




def replace_field(
    code,
    old_field,
    new_field
):

    return code.replace(
        f'"{old_field}"',
        f'"{new_field}"'
    )





def find_previous_fix(
    old_code
):

    try:

        old_field = extract_field(
            old_code
        )


        if not old_field:

            return None



        result = (

            supabase

            .table("repairs")

            .select(
                "old_code,new_code"
            )

            .execute()

        )


        for repair in result.data:


            stored_old = repair["old_code"]


            stored_field = extract_field(
                stored_old
            )


            if stored_field == old_field:


                stored_new = repair["new_code"]


                new_field = extract_field(
                    stored_new
                )


                if new_field:


                    fixed_code = replace_field(

                        old_code,

                        old_field,

                        new_field

                    )


                    print(
                        "[NovaGrid Memory] Field pattern matched."
                    )


                    return fixed_code



        return None



    except Exception as error:


        print(
            f"[NovaGrid Memory] Error: {error}"
        )


        return None