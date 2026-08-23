# IKIGAI Judging Brief — NovaGrid API Guardian

**Track:** Open Innovation — Non-CS branches
**Problem:** Detect API changes in third-party services before they break production code, using structured OpenAPI spec comparison instead of AI.
**Repository assessment:** Working end-to-end system with frontend, backend, database, and external notification integration.

---

## What They Built

- Web app that monitors public APIs by registering OpenAPI spec URLs and auto-discovering endpoints
- Structural diff engine comparing old vs new specs field-by-field (Breaking vs Safe classification)
- Interactive SVG tree graph visualizing endpoints grouped by tags
- Human validation workflow — changes require explicit approval before action
- viaSocket email alerts + Google Sheets logging on change detection
- AST-based route scanner extracting FastAPI endpoint metadata from Python source

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
```

---

## Core Capability Check

| Capability | Status | Evidence |
|------------|--------|----------|
| API Registration & Discovery | ✅ Verified | `Backend/app/api/public_apis.py` |
| OpenAPI Diff Engine | ✅ Verified | `Backend/app/openapi_parser.py` |
| Tree Graph Visualization | ✅ Verified | `Frontend/src/components/TreeGraph.jsx` |
| Human Validation | ✅ Verified | `Backend/app/api/endpoint_tree.py` |
| Email Notifications | ✅ Verified | `Backend/app/viasocket.py` |
| AST Route Scanner | ✅ Verified | `Backend/app/route_scanner.py` |
| Auth (Login/Signup) | ✅ Verified | `Backend/app/main.py` |

---

## Technical Review

**Strongest aspect:** Diff engine handles endpoint add/remove, field type changes, param removal, and deprecation — all without AI, using pure JSON comparison.

**Biggest concern:** Does not deep-compare nested response schemas — a field type change inside a response object would be missed.

**Core workflow:** Complete — Register → Fetch → Parse → Store → Compare → Detect → Alert → Review → Approve/Reject

**Implementation confidence:** High — demonstrable with Petstore or httpbin out of the box.

---

## Track-Specific Checks (Open Innovation)

| Check | Assessment |
|-------|------------|
| Technology-problem fit | Diff engine directly solves silent API breakage |
| Data sources | OpenAPI/Swagger JSON specs from public URLs |
| Deployment assumptions | Requires APIs to publish OpenAPI specs (most major APIs do) |
| Accessibility | Web-based, any browser, no special hardware |

---

## Judge Metrics

| Metric | Assessment |
|--------|------------|
| Core workflow |  |
| Implementation confidence |  |
| Technical ambition | /5 |
| Architecture quality | /5 |
| Engineering quality | /5 |
| Demo risk |  |

---

## IKIGAI Score

| Criterion | Weight | Score |
|-----------|---------|-------|
| Innovation & Creativity | 25 |  |
| Technical Implementation | 30 |  |
| Problem Solving | 20 |  |
| UI/UX & Presentation | 10 |  |
| Impact & Scalability | 15 |  |
| **Total** | **100** |  |
