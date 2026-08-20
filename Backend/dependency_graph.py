# ============================================================
# NOVAGRID DEPENDENCY GRAPH BUILDER
# ============================================================

import os
import ast
from collections import defaultdict


# ============================================================
# IGNORE CONFIGURATION
# ============================================================

IGNORED_DIRS = {
    "venv",
    ".venv",
    "__pycache__",
    ".git",
    ".pytest_cache",
    "site-packages",
    "node_modules",
    "dist",
    "build",
    ".idea",
    ".vscode"
}


IGNORED_FILES = {
    "test_supabase.py",
    "test_consumer.py",
    "run_tests.py"
}



# ============================================================
# SCAN PROJECT
# ============================================================

def scan_project(project_roots):

    """
    Creates dependency graph of Python files.

    Accepts:
        - single path
        - list of paths
    """

    graph = defaultdict(set)



    # Multiple folders support
    if isinstance(project_roots, list):

        for path in project_roots:

            result = scan_project(path)

            for module, deps in result.items():

                graph[module].update(deps)


        return {
            key: list(value)
            for key, value in graph.items()
        }



    project_root = os.path.abspath(
        project_roots
    )



    if not os.path.exists(project_root):

        raise FileNotFoundError(
            f"Path does not exist: {project_root}"
        )



    # Walk project
    for root, dirs, files in os.walk(project_root):


        # remove ignored folders
        dirs[:] = [
            d for d in dirs
            if d not in IGNORED_DIRS
        ]



        for file in files:


            if file in IGNORED_FILES:
                continue



            if not file.endswith(".py"):
                continue



            file_path = os.path.join(
                root,
                file
            )



            module_name = os.path.relpath(
                file_path,
                project_root
            )



            module_name = (
                module_name
                .replace("\\", ".")
                .replace("/", ".")
                .replace(".py", "")
            )



            imports = extract_imports(
                file_path
            )



            # keep only imports
            # useful for project graph
            imports = filter_internal_imports(
                imports
            )



            graph[module_name].update(
                imports
            )



    return {
        key: list(value)
        for key, value in graph.items()
    }



# ============================================================
# EXTRACT IMPORTS
# ============================================================

def extract_imports(file_path):

    imports = []


    try:

        with open(
            file_path,
            "r",
            encoding="utf-8"
        ) as file:

            source = file.read()



        tree = ast.parse(
            source
        )



        for node in ast.walk(tree):


            if isinstance(
                node,
                ast.Import
            ):

                for alias in node.names:

                    imports.append(
                        alias.name
                    )



            elif isinstance(
                node,
                ast.ImportFrom
            ):

                if node.module:

                    imports.append(
                        node.module
                    )



    except Exception:

        pass



    return imports



# ============================================================
# FILTER THIRD PARTY PACKAGES
# ============================================================

def filter_internal_imports(imports):


    ignored = {

        # Python built-ins
        "os",
        "sys",
        "json",
        "time",
        "datetime",
        "threading",
        "subprocess",
        "typing",
        "re",
        "ast",
        "uuid",
        "shutil",
        "pathlib",
        "collections",

        # External libraries
        "fastapi",
        "uvicorn",
        "dotenv",
        "supabase",
        "pytest",
        "pydantic",
        "requests"

    }


    return [
        imp
        for imp in imports
        if imp.split(".")[0] not in ignored
    ]



# ============================================================
# PRINT GRAPH
# ============================================================

def print_dependency_graph(graph):


    print(
        "\n========== NOVAGRID DEPENDENCY GRAPH ==========\n"
    )


    for module, dependencies in sorted(graph.items()):


        print(module)



        for dependency in sorted(dependencies):

            print(
                f"   └── {dependency}"
            )


        print()



    print(
        "================================================"
    )



# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":


    project = [
        "."
    ]



    dependency_graph = scan_project(
        project
    )



    print_dependency_graph(
        dependency_graph
    )