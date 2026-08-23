# NovaGrid API Guardian

> Detect API changes before they break your app.

NovaGrid monitors public APIs by tracking their OpenAPI specs, detecting breaking changes automatically, and alerting you before your production code fails. No AI needed — just structured JSON comparison.

---

## What It Does

```
Register an API (one time)
        ↓
NovaGrid fetches & stores the OpenAPI spec
        ↓
Every 60 seconds: fetch spec → compare → detect changes
        ↓
Alert via email (viaSocket) + Google Sheets log
        ↓
You review → approve or reject
```

### Core Features

| Feature | What It Does |
|---------|-------------|
| **Public API Registration** | Register any API with its OpenAPI URL — NovaGrid auto-discovers all endpoints |
| **Tree Graph Visualization** | See every endpoint organized by tags in an interactive SVG tree |
| **OpenAPI Diff Engine** | Compares old vs new spec field-by-field to find breaking and safe changes |
| **Impact Analysis** | Scores each change (0–100) and classifies as Breaking, Safe, or Warning |
| **Human Validation** | Approve or reject every detected change — nothing auto-applies |
| **viaSocket Notifications** | Get email alerts when changes are detected |
| **Google Sheets Logging** | All changes logged to a spreadsheet automatically |
| **History & Audit Trail** | Complete timeline of every scan, change, approval, and rejection |

---

## Tech Stack

**Frontend:**
- React 19 + Vite
- Material UI 9
- Framer Motion (animations)
- Recharts (charts)
- React Router DOM 7

**Backend:**
- Python 3.13 + FastAPI
- Supabase (PostgreSQL database + auth)
- viaSocket (webhook notifications)

**Deployment:**
- Frontend: Vercel
- Backend: Railway

---

## Project Structure

```
NovaGrid/
├── Backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application entry
│   │   ├── openapi_parser.py    # Fetch & parse OpenAPI specs
│   │   ├── route_scanner.py     # AST-based Python route scanner
│   │   ├── viasocket.py         # Webhook notification sender
│   │   └── api/
│   │       ├── endpoint_tree.py # Scan, diff, validate, approve
│   │       └── public_apis.py   # Register, track, check public APIs
│   ├── sql/
│   │   └── create_tables.sql    # Supabase table definitions
│   ├── requirements.txt
│   ├── Dockerfile
│   └── Procfile
│
└── Frontend/
    └── src/
        ├── App.jsx               # Router + layout
        ├── api/
        │   ├── axios.js          # HTTP client with auth interceptor
        │   └── services.js       # All API service functions
        ├── context/
        │   └── AuthContext.jsx   # Auth state management
        ├── components/
        │   ├── Sidebar.jsx       # Navigation sidebar
        │   └── TreeGraph.jsx     # Interactive SVG tree visualization
        └── pages/
            ├── Login.jsx         # Login page
            ├── Signup.jsx        # Signup page
            ├── Dashboard.jsx     # KPIs, quick actions, system status
            ├── PublicAPIs.jsx    # Register APIs, view trees, check changes
            ├── ImpactAnalysis.jsx # Impact score, breaking/safe tabs
            ├── HumanValidation.jsx # Approve/reject changes
            ├── History.jsx       # Audit timeline
            └── Settings.jsx      # Configuration
```

---

## Pages

| Page | Route | Purpose |
|------|-------|---------|
| **Login** | `/login` | Sign in with Supabase auth |
| **Signup** | `/signup` | Create a new account |
| **Dashboard** | `/dashboard` | Overview: monitored APIs, changes detected, pending reviews |
| **Public APIs** | `/public-apis` | Register APIs, view tree graphs, trigger change checks |
| **Impact Analysis** | `/impact` | Impact score gauge, breaking/safe/warnings tabs |
| **Human Validation** | `/human-validation` | Review and approve/reject detected changes |
| **History** | `/history` | Full audit trail of all events |
| **Settings** | `/settings` | Configure scan interval, thresholds, notifications |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- A [Supabase](https://supabase.com) project
- A [viaSocket](https://viasocket.com) webhook URL (optional)

### 1. Set Up Database

Go to your Supabase Dashboard → SQL Editor and run:

```sql
-- From Backend/sql/create_tables.sql
```

This creates the required tables:
- `endpoint_manifests` — stores scanned endpoint data
- `endpoint_change_reports` — change reports for human review
- `tracked_apis` — registered public APIs
- `public_api_changes` — change history per API

### 2. Backend Setup

```bash
cd Backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your Supabase credentials:
#   SUPABASE_URL=https://your-project.supabase.co
#   SUPABASE_KEY=your-anon-key
#   VIASOCKET_WEBHOOK_URL=your-webhook-url (optional)

# Start the server
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd Frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env:
#   VITE_API_URL=http://localhost:8000

# Start the dev server
npm run dev
```

Open http://localhost:5173 — you'll see the login page.

---

## How It Works (Technical)

### Step 1: Register an API

Enter an API name and its OpenAPI URL (e.g., `https://petstore.swagger.io/v2/swagger.json`).

```
POST /public-apis/register
{
  "name": "Petstore",
  "url": "https://petstore.swagger.io/v2",
  "openapi_url": "https://petstore.swagger.io/v2/swagger.json"
}
```

The backend fetches the spec, parses all endpoints with `openapi_parser.py`, and stores everything in Supabase as "Version 1".

### Step 2: Build the Tree

From the stored endpoints, NovaGrid groups them by OpenAPI tags and renders an interactive SVG tree:

```
Petstore (root)
├── /pet           (3 endpoints)
├── /store         (3 endpoints)
├── /user          (3 endpoints)
```

### Step 3: Detect Changes

When you click "Check" (or the scheduler runs), NovaGrid:

1. Fetches the current OpenAPI spec from the URL
2. Parses it the same way as the original
3. Compares endpoint-by-endpoint:

| What Changed | Classification |
|-------------|----------------|
| Endpoint added | Safe |
| Endpoint removed | **Breaking** |
| Field added to request body | Safe |
| Field removed from request body | **Breaking** |
| Field type changed | **Breaking** |
| Path parameter removed | **Breaking** |
| Endpoint deprecated | Warning |

### Step 4: Human Review

Changes appear in **Human Validation** as pending. You:
- **Approve** — acknowledges the change (logged in history)
- **Reject** — flags it for follow-up

### Step 5: Notifications

If a viaSocket webhook is configured, an email is sent when changes are detected. All changes are also logged to Google Sheets if connected.

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Create a new user |
| POST | `/auth/login` | Sign in |
| POST | `/auth/logout` | Sign out |

### Public APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/public-apis/register` | Register a new public API |
| GET | `/public-apis` | List all tracked APIs |
| GET | `/public-apis/{id}` | Get API details |
| GET | `/public-apis/{id}/tree` | Get tree structure for visualization |
| POST | `/public-apis/{id}/check` | Check for changes |
| POST | `/public-apis/check-all` | Check all APIs at once |
| GET | `/public-apis/{id}/changes` | Get change history |
| DELETE | `/public-apis/{id}` | Remove a tracked API |

### Endpoint Tree
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tree/scan` | Scan backend endpoints (AST) |
| POST | `/tree/scan-and-store` | Scan and store manifest |
| GET | `/tree/manifest` | Get latest manifest |
| GET | `/tree/manifests` | List all manifests |
| POST | `/tree/diff` | Compare with previous manifest |
| GET | `/tree/validate` | Validate endpoint hygiene |
| GET | `/tree/reports` | Get pending change reports |
| GET | `/tree/reports/all` | Get all change reports |
| POST | `/tree/approve/{id}` | Approve a change |
| POST | `/tree/reject/{id}` | Reject a change |
| GET | `/tree/tree-data` | Get tree graph data |

---

## Configuration

Settings are saved in the browser (localStorage):

| Setting | Default | Description |
|---------|---------|-------------|
| Auto-scan | On | Automatically check APIs on schedule |
| Scan interval | 60s | How often to check for changes |
| Auto-fix | Off | Auto-apply low-risk fixes (not implemented) |
| Confidence threshold | 80% | Minimum confidence for auto-fix |
| Risk threshold | 60% | Maximum risk for auto-fix |
| Email notifications | On | Send alerts via viaSocket |
| Google Sheets logging | On | Log changes to spreadsheet |
| viaSocket webhook | On | Enable webhook notifications |

---

## Deployment

### Frontend (Vercel)

1. Push to GitHub
2. Connect repo to [Vercel](https://vercel.com)
3. Set environment variable: `VITE_API_URL` → your Railway backend URL
4. Deploy

### Backend (Railway)

1. Push to GitHub
2. Connect repo to [Railway](https://railway.app)
3. Set environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `VIASOCKET_WEBHOOK_URL`
   - `FRONTEND_URL` → your Vercel frontend URL
4. Railway auto-detects the Dockerfile/Procfile and deploys

---

## How the Diff Engine Works (No AI)

The core comparison is pure JSON structure analysis:

```python
# Old spec (stored in Supabase):
POST /users { name: string, email: string }

# New spec (fetched from URL):
POST /users { name: string, email: string, age: integer }

# Result:
→ Safe: New field "age" added (optional)
```

**Why no AI?**
- Deterministic — same input always gives same output
- Fast — JSON comparison takes milliseconds
- Free — no API costs
- Reliable — no hallucinations or wrong classifications

---

## Supabase Tables

```sql
-- Tracked public APIs
tracked_apis (id, name, base_url, openapi_url, spec, parsed, status, last_checked, created_at)

-- Change history per API
public_api_changes (id, api_id, api_name, change_type, method, path, detail, severity, status, created_at)

-- Endpoint manifests (from AST scanning)
endpoint_manifests (id, manifest, version, total_endpoints, warnings, created_at)

-- Change reports for human review
endpoint_change_reports (id, change_type, severity, method, path, file, detail, change_data, status, resolved_at, created_at)
```

---

## License

MIT
