# ============================================================
# NOVAGRID AUTONOMOUS API REPAIR ENGINE
# FINAL SAFE VERSION
# ============================================================


import os
import subprocess



from detector import detect_changes

from ai_fixer import generate_fix

from repair_memory import find_previous_fix

from patcher import (
    apply_fix,
    confirm_fix
)

from supabase_client import supabase





# ============================================================
# CONFIDENCE SCORE
# ============================================================

def calculate_confidence(
        old_code,
        new_code,
        test_passed,
        approved
):

    score = 0


    if old_code != new_code:
        score += 30


    if test_passed:
        score += 40


    if approved:
        score += 30


    return score






# ============================================================
# SAVE REPAIR TO SUPABASE
# ============================================================

def save_repair(
        api_change,
        affected_file,
        affected_line,
        old_code,
        new_code,
        test_passed,
        confidence
):


    data = {

        "api_change":
            api_change,

        "affected_file":
            affected_file,

        "affected_line":
            affected_line,

        "old_code":
            old_code,

        "new_code":
            new_code,

        "test_passed":
            test_passed,

        "confidence":
            confidence

    }



    try:


        result = (

            supabase

            .table("repairs")

            .insert(data)

            .execute()

        )


        print(
            "\n[Supabase] Repair saved"
        )


        print(
            result.data
        )



    except Exception as error:


        print(

            f"[Supabase] Save failed: {error}"

        )







# ============================================================
# TEST RUNNER
# ============================================================

def run_tests():


    print(

        "\n[NovaGrid] Running tests..."

    )



    try:


        result = subprocess.run(

            [
                "python",
                "-m",
                "pytest",
                "-q"
            ],

            capture_output=True,

            text=True,

            timeout=120

        )



        print(

            result.stdout

        )



        return (

            result.returncode == 0

        )



    except Exception as error:


        print(

            f"[NovaGrid] Test error: {error}"

        )


        return False







# ============================================================
# SAFE IMPACT SCANNER
# ============================================================

def scan_project(
        removed_fields
):


    print(

        "[NovaGrid] Scanning source files..."

    )



    affected = []




    ignored_dirs = {


        "venv",

        ".venv",

        "__pycache__",

        ".git",

        ".pytest_cache",

        "patch_backups"

    }




    # Never allow NovaGrid to repair itself

    ignored_files = {


        "novagrid.py",

        "ai_fixer.py",

        "detector.py",

        "patcher.py",

        "dependency_graph.py",

        "repair_memory.py",

        "supabase_client.py",

        "health.py",

        "git_manager.py",

        "validation.py"

    }




    for root, dirs, files in os.walk("."):



        dirs[:] = [

            d for d in dirs

            if d not in ignored_dirs

        ]



        for file in files:



            if not file.endswith(".py"):

                continue



            if file in ignored_files:

                continue



            path = os.path.join(

                root,

                file

            )



            try:


                with open(

                    path,

                    "r",

                    encoding="utf-8"

                ) as source:


                    lines = source.readlines()



                for number, line in enumerate(

                    lines,

                    start=1

                ):


                    code = line.strip()



                    # Ignore comments

                    if code.startswith("#"):

                        continue



                    for field in removed_fields:



                        patterns = [

                            f'data["{field}"]',

                            f"data['{field}']",


                            f'response["{field}"]',

                            f"response['{field}']",


                            f'json["{field}"]',

                            f"json['{field}']"

                        ]



                        if any(

                            pattern in code

                            for pattern in patterns

                        ):


                            affected.append(

                                {

                                    "file":
                                        path,


                                    "line":
                                        number,


                                    "code":
                                        code,


                                    "field":
                                        field

                                }

                            )



            except Exception:


                pass




    return affected# ============================================================
# NOVAGRID AUTONOMOUS API REPAIR ENGINE
# FINAL SAFE VERSION
# ============================================================


import os
import subprocess



from detector import detect_changes

from ai_fixer import generate_fix

from repair_memory import find_previous_fix

from patcher import (
    apply_fix,
    confirm_fix
)

from supabase_client import supabase





# ============================================================
# CONFIDENCE SCORE
# ============================================================

def calculate_confidence(
        old_code,
        new_code,
        test_passed,
        approved
):

    score = 0


    if old_code != new_code:
        score += 30


    if test_passed:
        score += 40


    if approved:
        score += 30


    return score






# ============================================================
# SAVE REPAIR TO SUPABASE
# ============================================================

def save_repair(
        api_change,
        affected_file,
        affected_line,
        old_code,
        new_code,
        test_passed,
        confidence
):


    data = {

        "api_change":
            api_change,

        "affected_file":
            affected_file,

        "affected_line":
            affected_line,

        "old_code":
            old_code,

        "new_code":
            new_code,

        "test_passed":
            test_passed,

        "confidence":
            confidence

    }



    try:


        result = (

            supabase

            .table("repairs")

            .insert(data)

            .execute()

        )


        print(
            "\n[Supabase] Repair saved"
        )


        print(
            result.data
        )



    except Exception as error:


        print(

            f"[Supabase] Save failed: {error}"

        )







# ============================================================
# TEST RUNNER
# ============================================================

def run_tests():


    print(

        "\n[NovaGrid] Running tests..."

    )



    try:


        result = subprocess.run(

            [
                "python",
                "-m",
                "pytest",
                "-q"
            ],

            capture_output=True,

            text=True,

            timeout=120

        )



        print(

            result.stdout

        )



        return (

            result.returncode == 0

        )



    except Exception as error:


        print(

            f"[NovaGrid] Test error: {error}"

        )


        return False







# ============================================================
# SAFE IMPACT SCANNER
# ============================================================

def scan_project(
        removed_fields
):


    print(

        "[NovaGrid] Scanning source files..."

    )



    affected = []




    ignored_dirs = {


        "venv",

        ".venv",

        "__pycache__",

        ".git",

        ".pytest_cache",

        "patch_backups"

    }




    # Never allow NovaGrid to repair itself

    ignored_files = {


        "novagrid.py",

        "ai_fixer.py",

        "detector.py",

        "patcher.py",

        "dependency_graph.py",

        "repair_memory.py",

        "supabase_client.py",

        "health.py",

        "git_manager.py",

        "validation.py"

    }




    for root, dirs, files in os.walk("."):



        dirs[:] = [

            d for d in dirs

            if d not in ignored_dirs

        ]



        for file in files:



            if not file.endswith(".py"):

                continue



            if file in ignored_files:

                continue



            path = os.path.join(

                root,

                file

            )



            try:


                with open(

                    path,

                    "r",

                    encoding="utf-8"

                ) as source:


                    lines = source.readlines()



                for number, line in enumerate(

                    lines,

                    start=1

                ):


                    code = line.strip()



                    # Ignore comments

                    if code.startswith("#"):

                        continue



                    for field in removed_fields:



                        patterns = [

                            f'data["{field}"]',

                            f"data['{field}']",


                            f'response["{field}"]',

                            f"response['{field}']",


                            f'json["{field}"]',

                            f"json['{field}']"

                        ]



                        if any(

                            pattern in code

                            for pattern in patterns

                        ):


                            affected.append(

                                {

                                    "file":
                                        path,


                                    "line":
                                        number,


                                    "code":
                                        code,


                                    "field":
                                        field

                                }

                            )



            except Exception:


                pass




    return affected
# ============================================================
# NOVAGRID MAIN ENGINE
# ============================================================

def run_novagrid(
        api_url
):


    print(
"""
====================================
       NovaGrid Auto Repair
====================================
"""
    )



    # --------------------------------------------------------
    # DETECT API CHANGES
    # --------------------------------------------------------

    print(

        "[NovaGrid] Detecting API changes..."

    )


    try:


        changes = detect_changes(

            api_url

        )


    except Exception as error:


        print(

            f"[NovaGrid] Detection failed: {error}"

        )

        return





    if not changes:


        print(

            "[NovaGrid] No changes detected."

        )

        return




    print(

        f"[NovaGrid] Changes detected: {changes}"

    )




    removed_fields = changes.get(

        "removed",

        []

    )



    added_fields = changes.get(

        "added",

        []

    )




    if not removed_fields:


        print(

            "[NovaGrid] No removed fields."

        )

        return




    if not added_fields:


        print(

            "[NovaGrid] No replacement fields."

        )

        return






    # --------------------------------------------------------
    # IMPACT ANALYSIS
    # --------------------------------------------------------

    print(

        "\n[NovaGrid] Analyzing impact..."

    )



    affected = scan_project(

        removed_fields

    )





    if not affected:


        print(

            "[NovaGrid] No affected modules found."

        )

        return





    print(

        f"[NovaGrid] Found {len(affected)} issue(s)."

    )







    # --------------------------------------------------------
    # REPAIR LOOP
    # --------------------------------------------------------

    for item in affected:



        print(
f"""
------------------------------------

File:
{item["file"]}

Line:
{item["line"]}

Code:
{item["code"]}

------------------------------------
"""
        )



        old_code = item["code"]

        old_field = item["field"]

        new_field = added_fields[0]





        # ----------------------------------------------------
        # CHECK MEMORY
        # ----------------------------------------------------

        print(

            "[NovaGrid] Checking repair memory..."

        )



        new_code = find_previous_fix(

            old_code

        )



        if new_code:


            print(

                "[NovaGrid Memory] Previous fix found."

            )



        else:


            print(

                "[NovaGrid] Generating AI fix..."

            )



            new_code = generate_fix(

                old_field,

                new_field,

                old_code

            )





        print(

            "\nGenerated Fix:"

        )


        print(

            new_code

        )






        # ----------------------------------------------------
        # HUMAN APPROVAL
        # ----------------------------------------------------

        approval = input(

            "\nApprove patch? (y/n): "

        )



        if approval.lower() != "y":


            print(

                "[NovaGrid] Patch rejected."

            )


            continue






        # ----------------------------------------------------
        # APPLY PATCH
        # ----------------------------------------------------

        try:


            apply_fix(

                item["file"],

                item["line"],

                old_code,

                new_code

            )


        except Exception as error:


            print(

                f"[NovaGrid] Patch failed: {error}"

            )


            continue





        # ----------------------------------------------------
        # RUN TESTS
        # ----------------------------------------------------

        test_passed = run_tests()





        if not test_passed:


            print(

                "[NovaGrid] Tests failed. Repair stopped."

            )


            continue






        # ----------------------------------------------------
        # CONFIRM PATCH
        # ----------------------------------------------------

        confirm_fix(

            item["file"]

        )



        print(

            "[NovaGrid] Repair confirmed."

        )






        confidence = calculate_confidence(

            old_code,

            new_code,

            test_passed,

            True

        )



        print(

            f"[NovaGrid] Confidence: {confidence}%"

        )






        # ----------------------------------------------------
        # SAVE MEMORY
        # ----------------------------------------------------

        save_repair(

            api_change=

                f"{removed_fields} -> {added_fields}",


            affected_file=

                item["file"],


            affected_line=

                item["line"],


            old_code=

                old_code,


            new_code=

                new_code,


            test_passed=

                test_passed,


            confidence=

                confidence

        )



        print(

            "\n[NovaGrid] Repair completed."

        )









# ============================================================
# PROGRAM ENTRY
# ============================================================

if __name__ == "__main__":


    API_URL = (

        "http://127.0.0.1:8000/"

    )


    run_novagrid(

        API_URL

    )