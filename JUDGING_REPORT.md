# NovaGrid API Guardian

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

## Repository Assessment

| Capability | Status | Evidence |
|------------|--------|----------|
| API Registration & Discovery | ✅ Verified | `public_apis.py` — fetches and parses OpenAPI specs |
| OpenAPI Diff Engine | ✅ Verified | `openapi_parser.py` — field-by-field structural comparison |
| Tree Graph Visualization | ✅ Verified | `TreeGraph.jsx` — SVG layout with router cards |
| Human Validation | ✅ Verified | `endpoint_tree.py` — approve/reject with status tracking |
| Email Notifications | ✅ Verified | `viasocket.py` — webhook POST integration |
| AST Route Scanner | ✅ Verified | `route_scanner.py` — Python AST-based extraction |
| Auth (Login/Signup) | ✅ Verified | `main.py` — Supabase auth integration |

---

## Technical Review

- Does the core solution exist? ✅ Working API change detection with diff engine, tree visualization, and human validation.
- Is it end-to-end? ✅ Register → Fetch → Parse → Store → Compare → Detect → Alert → Review → Approve/Reject.
- Is the architecture sensible? ✅ Clean separation: React → FastAPI → Supabase. No unnecessary complexity.
- Are the technologies appropriate? ✅ FastAPI, Supabase, React+MUI, viaSocket — all lightweight and fit for purpose.
- What is technically interesting? Structural diff engine classifies Breaking vs Safe without AI using pure JSON comparison.

---

## Track-Specific Checks (Open Innovation)

| Check | Assessment |
|-------|------------|
| Technology-problem fit | Diff engine directly solves silent API breakage |
| Data sources | OpenAPI/Swagger JSON specs from public URLs |
| Deployment assumptions | Requires APIs to publish OpenAPI specs (most major APIs do) |
| Accessibility | Web-based, any browser, no special hardware |

---

## Questions for the Team

1. The diff engine in `openapi_parser.py:compare_specs()` compares endpoint-level changes but does not recursively compare response schemas — how would you handle a nested field type change inside a response object?
2. The `check_for_changes` endpoint fetches the live spec on every request — what happens if the OpenAPI URL is rate-limited or goes down during a check?
3. The human validation page shows approve/reject buttons but the backend `approve_change()` only updates a status field — what downstream action happens after approval?

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
