"""
OpenAPI Spec Parser — Reads OpenAPI/Swagger specs and extracts all endpoints.
Works with both OpenAPI 3.x and Swagger 2.0 formats.
"""

import json
import requests
import yaml


def fetch_spec(url: str) -> dict:
    """Fetch an OpenAPI spec from a URL (JSON or YAML)."""
    resp = requests.get(url, timeout=15)
    resp.raise_for_status()
    content = resp.text

    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return yaml.safe_load(content)


def parse_spec(spec: dict) -> dict:
    """
    Parse an OpenAPI spec and extract all endpoints with full details.

    Returns:
        {
            "title": "Stripe API",
            "version": "2024-01-01",
            "base_url": "https://api.stripe.com",
            "endpoints": [
                {
                    "method": "POST",
                    "path": "/v1/charges",
                    "summary": "Create a charge",
                    "description": "...",
                    "parameters": [...],
                    "request_body": {...},
                    "responses": {...},
                    "tags": ["charges"],
                    "deprecated": false
                }
            ],
            "total_endpoints": 50,
            "methods_summary": {"GET": 20, "POST": 15, ...}
        }
    """
    info = spec.get("info", {})
    title = info.get("title", "Unknown API")
    version = info.get("version", "unknown")

    # Get base URL
    base_url = ""
    if "servers" in spec:
        base_url = spec["servers"][0].get("url", "")
    elif "host" in spec:
        scheme = "https" if spec.get("schemes", ["https"])[0] == "https" else "http"
        base_url = f"{scheme}://{spec['host']}"
        if spec.get("basePath"):
            base_url += spec["basePath"]

    # Parse paths
    endpoints = []
    paths = spec.get("paths", {})

    for path, path_item in paths.items():
        # Shared parameters for all methods in this path
        shared_params = path_item.get("parameters", [])

        for method in ["get", "post", "put", "patch", "delete", "head", "options"]:
            operation = path_item.get(method)
            if not operation:
                continue

            # Parse parameters
            params = []
            all_params = shared_params + operation.get("parameters", [])
            for p in all_params:
                param_info = {
                    "name": p.get("name", ""),
                    "in": p.get("in", ""),  # path, query, header, body
                    "required": p.get("required", False),
                    "type": _extract_type(p),
                    "description": p.get("description", ""),
                }

                # Handle Swagger 2.0 body params
                if p.get("in") == "body" and "schema" in p:
                    param_info["schema"] = p["schema"]

                params.append(param_info)

            # Parse request body (OpenAPI 3.x)
            request_body = None
            if "requestBody" in operation:
                rb = operation["requestBody"]
                content = rb.get("content", {})
                for media_type, media_obj in content.items():
                    request_body = {
                        "media_type": media_type,
                        "schema": media_obj.get("schema", {}),
                        "required": rb.get("required", False),
                    }
                    break

            # Parse responses
            responses = {}
            for status_code, resp_obj in operation.get("responses", {}).items():
                resp_info = {
                    "description": resp_obj.get("description", ""),
                    "schema": None,
                }
                # OpenAPI 3.x
                content = resp_obj.get("content", {})
                for media_type, media_obj in content.items():
                    resp_info["schema"] = media_obj.get("schema", {})
                    resp_info["media_type"] = media_type
                    break
                # Swagger 2.0
                if "schema" in resp_obj:
                    resp_info["schema"] = resp_obj["schema"]

                responses[str(status_code)] = resp_info

            endpoint = {
                "method": method.upper(),
                "path": path,
                "summary": operation.get("summary", ""),
                "description": operation.get("description", "")[:200],
                "operation_id": operation.get("operationId", ""),
                "parameters": params,
                "request_body": request_body,
                "responses": responses,
                "tags": operation.get("tags", []),
                "deprecated": operation.get("deprecated", False),
            }
            endpoints.append(endpoint)

    # Sort by path then method
    endpoints.sort(key=lambda e: (e["path"], e["method"]))

    # Methods summary
    methods_count = {}
    for ep in endpoints:
        m = ep["method"]
        methods_count[m] = methods_count.get(m, 0) + 1

    return {
        "title": title,
        "version": version,
        "base_url": base_url,
        "endpoints": endpoints,
        "total_endpoints": len(endpoints),
        "methods_summary": methods_count,
        "paths_count": len(paths),
    }


def compare_specs(old_endpoints: list, new_endpoints: list) -> dict:
    """
    Compare two lists of parsed endpoints and find changes.

    Returns:
        {
            "breaking": [...],
            "safe": [...],
            "summary": {"total": 5, "breaking": 2, "safe": 3}
        }
    """
    old_map = {(e["method"], e["path"]): e for e in old_endpoints}
    new_map = {(e["method"], e["path"]): e for e in new_endpoints}

    old_keys = set(old_map.keys())
    new_keys = set(new_map.keys())

    breaking = []
    safe = []

    # Endpoints removed (BREAKING)
    for key in old_keys - new_keys:
        ep = old_map[key]
        breaking.append({
            "type": "endpoint_removed",
            "method": key[0],
            "path": key[1],
            "detail": f"Endpoint {key[0]} {key[1]} was removed",
            "summary": ep.get("summary", ""),
        })

    # Endpoints added (SAFE)
    for key in new_keys - old_keys:
        ep = new_map[key]
        safe.append({
            "type": "endpoint_added",
            "method": key[0],
            "path": key[1],
            "detail": f"New endpoint {key[0]} {key[1]} added",
            "summary": ep.get("summary", ""),
        })

    # Endpoints that exist in both — check for changes
    for key in old_keys & new_keys:
        old_ep = old_map[key]
        new_ep = new_map[key]

        # Parameters removed (BREAKING)
        old_params = {p["name"] for p in old_ep.get("parameters", []) if p.get("in") == "path"}
        new_params = {p["name"] for p in new_ep.get("parameters", []) if p.get("in") == "path"}
        removed_params = old_params - new_params
        if removed_params:
            breaking.append({
                "type": "params_removed",
                "method": key[0],
                "path": key[1],
                "detail": f"Path parameters removed: {', '.join(removed_params)}",
            })

        # Request body fields removed (BREAKING)
        old_body = _extract_body_fields(old_ep)
        new_body = _extract_body_fields(new_ep)
        removed_fields = set(old_body.keys()) - set(new_body.keys())
        added_fields = set(new_body.keys()) - set(old_body.keys())

        for field in removed_fields:
            breaking.append({
                "type": "field_removed",
                "method": key[0],
                "path": key[1],
                "detail": f"Field '{field}' removed from {key[0]} {key[1]}",
            })

        for field in added_fields:
            safe.append({
                "type": "field_added",
                "method": key[0],
                "path": key[1],
                "detail": f"New field '{field}' added to {key[0]} {key[1]}",
            })

        # Field type changed (BREAKING)
        for field in set(old_body.keys()) & set(new_body.keys()):
            old_type = old_body[field]
            new_type = new_body[field]
            if old_type != new_type:
                breaking.append({
                    "type": "type_changed",
                    "method": key[0],
                    "path": key[1],
                    "detail": f"Field '{field}' type changed from {old_type} to {new_type} in {key[0]} {key[1]}",
                })

        # Deprecated endpoint (WARNING)
        if not old_ep.get("deprecated") and new_ep.get("deprecated"):
            safe.append({
                "type": "deprecated",
                "method": key[0],
                "path": key[1],
                "detail": f"Endpoint {key[0]} {key[1]} is now deprecated",
            })

    return {
        "breaking": breaking,
        "safe": safe,
        "summary": {
            "total": len(breaking) + len(safe),
            "breaking": len(breaking),
            "safe": len(safe),
        },
    }


def _extract_type(param: dict) -> str:
    """Extract type from a parameter (handles both OpenAPI 3.x and Swagger 2.0)."""
    if "schema" in param:
        return param["schema"].get("type", "unknown")
    return param.get("type", "unknown")


def _extract_body_fields(endpoint: dict) -> dict:
    """Extract request body field names and types from an endpoint."""
    fields = {}

    # OpenAPI 3.x requestBody
    rb = endpoint.get("request_body")
    if rb and rb.get("schema"):
        schema = rb["schema"]
        if schema.get("type") == "object":
            for prop_name, prop in schema.get("properties", {}).items():
                fields[prop_name] = prop.get("type", "unknown")

    # Swagger 2.0 body parameter
    for param in endpoint.get("parameters", []):
        if param.get("in") == "body" and "schema" in param:
            schema = param["schema"]
            if schema.get("type") == "object":
                for prop_name, prop in schema.get("properties", {}).items():
                    fields[prop_name] = prop.get("type", "unknown")

    return fields
