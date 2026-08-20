import git
import os



def get_repo():

    path = os.getcwd()

    try:

        repo = git.Repo(
            path,
            search_parent_directories=True
        )

        return repo


    except Exception:

        return None





def create_checkpoint():

    repo = get_repo()


    if not repo:

        print(
            "[Git] Repository not found."
        )

        return False



    try:

        repo.git.add(
            "."
        )


        repo.index.commit(
            "NovaGrid checkpoint before repair"
        )


        print(
            "[Git] Checkpoint created."
        )


        return True



    except Exception as error:


        print(
            f"[Git] Checkpoint failed: {error}"
        )


        return False





def commit_repair(
    message
):

    repo = get_repo()


    if not repo:

        return False



    try:

        repo.git.add(
            "."
        )


        repo.index.commit(
            message
        )


        print(
            "[Git] Repair committed."
        )


        return True



    except Exception as error:


        print(
            f"[Git] Commit failed: {error}"
        )

        return False





def rollback():

    repo = get_repo()


    if not repo:

        return False



    try:

        repo.git.reset(
            "--hard",
            "HEAD~1"
        )


        print(
            "[Git] Rollback completed."
        )


        return True



    except Exception as error:


        print(
            f"[Git] Rollback failed: {error}"
        )


        return False