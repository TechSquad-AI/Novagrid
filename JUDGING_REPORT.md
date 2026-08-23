# IKIGAI Judging Brief — NovaGrid API Guardian

**Track:** Open Innovation — Non-CS branches
**Problem:** Detect API changes in third-party services before they break production code, using structured OpenAPI spec comparison instead of AI.
**Repository assessment:** Working end-to-end system with frontend, backend, database, and external notification integration.

---

## What They Built

- A web application that monitors public APIs by registering their OpenAPI spec URLs and auto-discovering all endpoints
- A structural diff engine that compares old vs new OpenAPI specs field-by-field to classify changes as Breaking or Safe
- An interactive SVG tree graph that visualizes all endpoints grouped by tags
- A human validation workflow where detected changes require explicit approval before being acted on
- Integration with viaSocket for email alerts and Google Sheets for logging when changes are detected
- An AST-based route scanner that parses Python/FastAPI source code to extract endpoint metadata without requiring an OpenAPI spec

---

## Architecture

```mermaid
flowchart LR
    User --> Frontend[React + MUI]
    Frontend --> Backend[FastAPI]
    Backend --> Supabase[(Supabase DB)]
    Backend --> OpenAPI[OpenAPI Spec URL]
    OpenAPI --> Backend
    Backend --> viaSocket[viaSocket Webhook]
    viaSocket --> Email[Email Alert]
    viaSocket --> GoogleSheets[Google Sheets Log]
    Backend --> DiffEngine[Structural Diff Engine]
    DiffEngine --> Backend
```

---

## Core Capability Check

| Capability | Status | Evidence |
|------------|--------|----------|
| API Registration & Discovery | ✅ Verified | `Backend/app/api/public_apis.py` — `register_public_api()` fetches and parses OpenAPI specs |
| OpenAPI Diff Engine | ✅ Verified | `Backend/app/openapi_parser.py` — `compare_specs()` does field-by-field structural comparison |
| Tree Graph Visualization | ✅ Verified | `Frontend/src/components/TreeGraph.jsx` — SVG layout engine with router cards and endpoint nodes |
| Human Validation | ✅ Verified | `Backend/app/api/endpoint_tree.py` — `approve_change()` and `reject_change()` with status tracking |
| Email Notifications | ✅ Verified | `Backend/app/viasocket.py` — `send_webhook()` posts to viaSocket URL |
| AST Route Scanner | ✅ Verified | `Backend/app/route_scanner.py` — `scan_file()` uses Python `ast` module to extract FastAPI routes |
| Auth (Login/Signup) | ✅ Verified | `Backend/app/main.py` — Supabase auth integration with signup/login/logout |

---

## Technical Read

**Strongest technical aspect:** The OpenAPI diff engine is well-implemented — `compare_specs()` handles endpoint additions/removals, field type changes, path parameter removals, and deprecated flags with proper Breaking vs Safe classification, all without AI.

**Biggest technical concern:** The diff engine compares endpoint lists correctly but does not deep-compare response schemas or nested object structures — a field type change inside a response schema would be missed.

**Core workflow:** Complete — Register → Fetch → Parse → Store → Compare → Detect → Alert → Review → Approve/Reject

**Implementation confidence:** High — the core flow is implemented end-to-end and can be demonstrated with Petstore or httpbin.

---

---


