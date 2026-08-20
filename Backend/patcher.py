# ============================================================
# NOVAGRID PATCHER
# ============================================================

import os
import shutil
from datetime import datetime



# ============================================================
# CREATE BACKUP
# ============================================================

def create_checkpoint(file_path):

    backup_dir = "patch_backups"

    os.makedirs(
        backup_dir,
        exist_ok=True
    )


    filename = os.path.basename(
        file_path
    )


    timestamp = datetime.now().strftime(
        "%Y%m%d_%H%M%S"
    )


    backup_path = os.path.join(
        backup_dir,
        f"{filename}.{timestamp}.bak"
    )


    shutil.copy2(
        file_path,
        backup_path
    )


    print(
        f"[Patcher] Backup created: {backup_path}"
    )


    return backup_path




# ============================================================
# APPLY FIX
# ============================================================

def apply_fix(
    file_path,
    line_number,
    old_code,
    new_code
):


    print(
        "[Patcher] Applying patch..."
    )


    create_checkpoint(
        file_path
    )


    with open(
        file_path,
        "r",
        encoding="utf-8"
    ) as file:

        lines = file.readlines()



    index = line_number - 1



    if index < 0 or index >= len(lines):

        raise Exception(
            "Invalid line number"
        )



    original_line = lines[index]



    if old_code in original_line:


        lines[index] = original_line.replace(
            old_code,
            new_code
        )


    else:


        raise Exception(
            f"Code not found at line {line_number}"
        )



    with open(
        file_path,
        "w",
        encoding="utf-8"
    ) as file:

        file.writelines(
            lines
        )



    print(
        "[Patcher] Patch applied successfully."
    )





# ============================================================
# CONFIRM FIX
# ============================================================

def confirm_fix(
    file_path
):

    print(
        f"[Patcher] Repair confirmed: {file_path}"
    )





# ============================================================
# ROLLBACK FIX
# ============================================================

def rollback_fix(
    backup_path,
    original_file
):


    if not os.path.exists(
        backup_path
    ):

        raise Exception(
            "Backup file does not exist"
        )



    shutil.copy2(
        backup_path,
        original_file
    )


    print(
        "[Patcher] Rollback completed."
    )





# ============================================================
# ALIAS FOR OLD CODE COMPATIBILITY
# ============================================================

def rollback(
    backup_path,
    original_file
):

    rollback_fix(
        backup_path,
        original_file
    )