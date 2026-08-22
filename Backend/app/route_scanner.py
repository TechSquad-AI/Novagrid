"""
Route Scanner — AST-based parser for FastAPI route files.

Scans Python source files, finds all FastAPI route decorators,
and extracts endpoint metadata: method, path, function name,
parameters, response model, validation status, and middleware.
"""

import ast
import os
import re
from typing import Optional


def scan_file(file_path: str) -> dict:
    """
    Parse a single Python file and extract all FastAPI endpoints.

    Returns:
        {
            "file": "app/main.py",
            "endpoints": [
                {
                    "method": "GET",
                    "path": "/apis",
                    "function": "list_apis",
                    "params": [...],
                    "response_model": "str | None",
                    "has_validation": True,
                    "has_body_model": False,
                    "middleware": [...],
                    "dependencies": [...],
                    "decorators": ["@app.get('/apis')"],
                    "line_number": 42
                }
            ]
        }
    """
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            source = f.read()
    except Exception as e:
        return {"file": file_path, "endpoints": [], "error": str(e)}

    try:
        tree = ast.parse(source)
    except SyntaxError as e:
        return {"file": file_path, "endpoints": [], "error": f"Syntax error: {e}"}

    lines = source.splitlines()
    endpoints = []

    for node in ast.walk(tree):
        if not isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            continue

        func_name = node.name

        for decorator in node.decorator_list:
            endpoint = _extract_endpoint_from_decorator(
                decorator, func_name, node, lines, source
            )
            if endpoint:
                endpoints.append(endpoint)

    return {"file": file_path, "endpoints": endpoints}


def scan_directory(dir_path: str, exclude_dirs: Optional[list] = None) -> list:
    """
    Recursively scan a directory for Python files with FastAPI routes.

    Returns list of scan_file results.
    """
    if exclude_dirs is None:
        exclude_dirs = ["__pycache__", "venv", ".venv", "node_modules", ".git"]

    results = []

    for root, dirs, files in os.walk(dir_path):
        # Skip excluded directories
        dirs[:] = [d for d in dirs if d not in exclude_dirs]

        for fname in files:
            if not fname.endswith(".py"):
                continue

            file_path = os.path.join(root, fname)
            result = scan_file(file_path)

            if result["endpoints"]:
                results.append(result)

    return results


def build_manifest(dir_path: str) -> dict:
    """
    Scan all route files and build a complete endpoint manifest.

    Returns:
        {
            "version": 1,
            "endpoints": [...],
            "total_endpoints": 12,
            "methods_summary": {"GET": 5, "POST": 4, ...},
            "files_scanned": 3,
            "warnings": [...]
        }
    """
    scan_results = scan_directory(dir_path)

    all_endpoints = []
    warnings = []
    methods_count = {}
    files_with_routes = 0

    for result in scan_results:
        if result.get("error"):
            warnings.append(f"Error scanning {result['file']}: {result['error']}")
            continue

        if result["endpoints"]:
            files_with_routes += 1

        for ep in result["endpoints"]:
            ep["source_file"] = result["file"]
            all_endpoints.append(ep)

            method = ep["method"]
            methods_count[method] = methods_count.get(method, 0) + 1

            # Validation warnings
            if method in ("POST", "PUT", "PATCH") and not ep.get("has_body_model"):
                warnings.append(
                    f"⚠️ {method} {ep['path']} in {result['file']} — no Pydantic body model"
                )

            if not ep.get("response_model"):
                warnings.append(
                    f"⚠️ {method} {ep['path']} in {result['file']} — no response_model"
                )

    # Sort endpoints by path for consistent ordering
    all_endpoints.sort(key=lambda e: (e["path"], e["method"]))

    return {
        "version": 1,
        "endpoints": all_endpoints,
        "total_endpoints": len(all_endpoints),
        "methods_summary": methods_count,
        "files_scanned": files_with_routes,
        "warnings": warnings,
        "tree": _build_tree(all_endpoints),
    }


def diff_manifests(old_manifest: dict, new_manifest: dict) -> dict:
    """
    Compare two manifest versions and categorize changes.

    Returns:
        {
            "breaking": [...],
            "safe": [...],
            "warnings": [...],
            "summary": {"total_changes": 5, "breaking": 1, "safe": 3, "warnings": 1}
        }
    """
    old_endpoints = {(e["method"], e["path"]): e for e in old_manifest.get("endpoints", [])}
    new_endpoints = {(e["method"], e["path"]): e for e in new_manifest.get("endpoints", [])}

    breaking = []
    safe = []
    warnings = []

    old_keys = set(old_endpoints.keys())
    new_keys = set(new_endpoints.keys())

    # Endpoints removed (BREAKING)
    for key in old_keys - new_keys:
        ep = old_endpoints[key]
        breaking.append({
            "type": "endpoint_removed",
            "method": ep["method"],
            "path": ep["path"],
            "function": ep.get("function", ""),
            "file": ep.get("source_file", ""),
            "detail": f"Endpoint {ep['method']} {ep['path']} was removed",
        })

    # Endpoints added (SAFE)
    for key in new_keys - old_keys:
        ep = new_endpoints[key]
        safe.append({
            "type": "endpoint_added",
            "method": ep["method"],
            "path": ep["path"],
            "function": ep.get("function", ""),
            "file": ep.get("source_file", ""),
            "detail": f"New endpoint {ep['method']} {ep['path']}",
        })

    # Endpoints that exist in both — check for changes
    for key in old_keys & new_keys:
        old_ep = old_endpoints[key]
        new_ep = new_endpoints[key]

        # Method changed (BREAKING)
        if old_ep.get("method") != new_ep.get("method"):
            breaking.append({
                "type": "method_changed",
                "path": key[1],
                "old_method": old_ep.get("method"),
                "new_method": new_ep.get("method"),
                "file": new_ep.get("source_file", ""),
                "detail": f"Method changed from {old_ep.get('method')} to {new_ep.get('method')} at {key[1]}",
            })
            continue

        # Parameters changed (BREAKING if required param removed)
        old_params = set(str(p) for p in old_ep.get("params", []))
        new_params = set(str(p) for p in new_ep.get("params", []))
        if old_params != new_params:
            removed_params = old_params - new_params
            added_params = new_params - old_params
            if removed_params:
                breaking.append({
                    "type": "params_removed",
                    "path": key[1],
                    "method": key[0],
                    "removed": list(removed_params),
                    "file": new_ep.get("source_file", ""),
                    "detail": f"Parameters removed from {key[0]} {key[1]}: {removed_params}",
                })
            if added_params:
                safe.append({
                    "type": "params_added",
                    "path": key[1],
                    "method": key[0],
                    "added": list(added_params),
                    "file": new_ep.get("source_file", ""),
                    "detail": f"New parameters added to {key[0]} {key[1]}: {added_params}",
                })

        # Response model changed (BREAKING)
        if old_ep.get("response_model") != new_ep.get("response_model"):
            if old_ep.get("response_model") and new_ep.get("response_model"):
                breaking.append({
                    "type": "response_changed",
                    "path": key[1],
                    "method": key[0],
                    "old_response": old_ep.get("response_model"),
                    "new_response": new_ep.get("response_model"),
                    "file": new_ep.get("source_file", ""),
                    "detail": f"Response model changed at {key[0]} {key[1]}",
                })

        # Validation removed (WARNING)
        if old_ep.get("has_body_model") and not new_ep.get("has_body_model"):
            warnings.append({
                "type": "validation_removed",
                "path": key[1],
                "method": key[0],
                "file": new_ep.get("source_file", ""),
                "detail": f"Payload validation removed from {key[0]} {key[1]}",
            })

    return {
        "breaking": breaking,
        "safe": safe,
        "warnings": warnings,
        "summary": {
            "total_changes": len(breaking) + len(safe) + len(warnings),
            "breaking": len(breaking),
            "safe": len(safe),
            "warnings": len(warnings),
        },
    }


def _extract_endpoint_from_decorator(
    decorator, func_name, func_node, lines, source
) -> Optional[dict]:
    """Extract endpoint info from a FastAPI decorator."""

    # Handle @app.get("/path"), @router.post("/path"), etc.
    decorator_str = ast.dump(decorator)

    # Match pattern: func decorator with string first arg
    method = None
    path = None

    if isinstance(decorator, ast.Call):
        func = decorator.func

        # Extract method from decorator name
        if isinstance(func, ast.Attribute):
            attr_name = func.attr.lower()
            if attr_name in ("get", "post", "put", "patch", "delete", "head", "options"):
                method = attr_name.upper()

        # Extract path from first argument
        if decorator.args:
            first_arg = decorator.args[0]
            if isinstance(first_arg, ast.Constant) and isinstance(first_arg.value, str):
                path = first_arg.value

        # Extract keyword arguments
        response_model = None
        dependencies = []
        middleware = []

        for kw in decorator.keywords:
            if kw.arg == "response_model":
                if isinstance(kw.value, ast.Name):
                    response_model = kw.value.id
                elif isinstance(kw.value, ast.Attribute):
                    response_model = ast.dump(kw.value)
            elif kw.arg == "dependencies":
                if isinstance(kw.value, ast.List):
                    for item in kw.value.elts:
                        if isinstance(item, ast.Name):
                            dependencies.append(item.id)

    elif isinstance(decorator, ast.Attribute):
        # Handle @app.get without call (just @app.get)
        attr_name = decorator.attr.lower()
        if attr_name in ("get", "post", "put", "patch", "delete"):
            method = attr_name.upper()

    if not method or not path:
        return None

    # Extract function parameters
    params = _extract_params(func_node)

    # Check for Pydantic body model
    has_body_model = _has_body_model(func_node)

    # Check for validation
    has_validation = _has_validation(func_node)

    # Get line number
    line_number = func_node.lineno

    # Get function docstring
    docstring = ast.get_docstring(func_node) or ""

    return {
        "method": method,
        "path": path,
        "function": func_name,
        "params": params,
        "response_model": response_model,
        "has_validation": has_validation,
        "has_body_model": has_body_model,
        "docstring": docstring[:200] if docstring else "",
        "line_number": line_number,
    }


def _extract_params(func_node) -> list:
    """Extract function parameters with type hints."""
    params = []

    for arg in func_node.args.args:
        if arg.arg in ("self", "cls"):
            continue

        param_info = {"name": arg.arg}

        if arg.annotation:
            if isinstance(arg.annotation, ast.Name):
                param_info["type"] = arg.annotation.id
            elif isinstance(arg.annotation, ast.Constant):
                param_info["type"] = str(arg.annotation.value)

        # Check for default values (Query, Path, Body, etc.)
        defaults = func_node.args.defaults
        args = func_node.args.args
        default_index = len(args) - len(defaults)

        arg_index = args.index(arg)
        if arg_index >= default_index:
            default = defaults[arg_index - default_index]
            if isinstance(default, ast.Call) and isinstance(default.func, ast.Name):
                param_info["default_type"] = default.func.id  # Query, Path, Body, etc.

        params.append(param_info)

    return params


def _has_body_model(func_node) -> bool:
    """Check if function uses Pydantic body model."""
    for arg in func_node.args.args:
        if arg.arg in ("self", "cls"):
            continue
        if arg.annotation:
            if isinstance(arg.annotation, ast.Name):
                # Pydantic models start with uppercase
                name = arg.annotation.id
                if name[0].isupper() and name not in ("str", "int", "float", "bool", "list", "dict", "Optional", "List", "Dict"):
                    return True
    return False


def _has_validation(func_node) -> bool:
    """Check if function has any validation (type hints, Query, Path, Body)."""
    for arg in func_node.args.args:
        if arg.arg in ("self", "cls"):
            continue
        if arg.annotation:
            return True

        # Check defaults for Query/Path/Body
        defaults = func_node.args.defaults
        args = func_node.args.args
        default_index = len(args) - len(defaults)
        arg_index = args.index(arg)
        if arg_index >= default_index:
            default = defaults[arg_index - default_index]
            if isinstance(default, ast.Call) and isinstance(default.func, ast.Name):
                if default.func.id in ("Query", "Path", "Body", "Header", "Cookie"):
                    return True

    return False


def _build_tree(endpoints: list) -> dict:
    """
    Build a hierarchical tree from flat endpoint list.

    Groups by router prefix, then by method.
    """
    tree = {"name": "NovaGrid API", "children": []}

    # Group endpoints by router prefix
    routers = {}
    for ep in endpoints:
        path = ep["path"]
        parts = [p for p in path.split("/") if p]

        if len(parts) == 0:
            prefix = "/"
        else:
            prefix = "/" + parts[0]

        if prefix not in routers:
            routers[prefix] = {"name": prefix, "children": []}

        routers[prefix]["children"].append({
            "name": f"{ep['method']} {ep['path']}",
            "method": ep["method"],
            "path": ep["path"],
            "function": ep.get("function", ""),
            "has_validation": ep.get("has_validation", False),
            "has_body_model": ep.get("has_body_model", False),
            "response_model": ep.get("response_model"),
            "params": ep.get("params", []),
            "docstring": ep.get("docstring", ""),
            "file": ep.get("source_file", ""),
            "line": ep.get("line_number", 0),
        })

    for prefix in sorted(routers.keys()):
        tree["children"].append(routers[prefix])

    return tree
