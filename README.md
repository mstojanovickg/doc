# Robot Implementation Decision Support Tool

A full-stack web application that digitises and extends an Excel-based robot feasibility model. It guides users through a step-by-step wizard to collect production and financial parameters, then computes KPIs (ROI, payback period, NPV, OEE) and presents them in an interactive dashboard with charts and tables.

## Stack

- **Backend**: Python / FastAPI + SQLAlchemy (async) + PostgreSQL
- **Frontend**: React 18 / TypeScript + Zustand + Recharts + Tailwind CSS + Vite
- **Infrastructure**: Docker Compose

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose

That's it. No local Python or Node installation required.

## Running the Application

```bash
docker compose up --build
```

| Service  | URL                            |
|----------|-------------------------------|
| Frontend | http://localhost:3000          |
| Backend  | http://localhost:8000          |
| API docs | http://localhost:8000/docs     |

To stop:

```bash
docker compose down
```

To wipe the database volume as well:

```bash
docker compose down -v
```

## Local Development (without Docker)

**Backend** (requires Python 3.11+ and [uv](https://docs.astral.sh/uv/getting-started/installation/)):

```bash
cd backend
uv pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Set the `DATABASE_URL` environment variable to point at a running PostgreSQL instance, e.g.:

```bash
export DATABASE_URL=postgresql+asyncpg://robot:robotpass@localhost:5432/robotdb
```

**Frontend** (requires [Bun](https://bun.sh)):

```bash
cd frontend
bun install
bun run dev
```

The Vite dev server proxies `/api` requests to `http://localhost:8000`.

## Project Structure

```
/
├── docker-compose.yml
├── backend/
│   └── app/
│       ├── main.py           # FastAPI app entry point
│       ├── engine/
│       │   └── calculator.py # All KPI formulas (single source of truth)
│       ├── models/           # Pydantic input/output schemas
│       ├── routers/          # /api/calculate and /api/sessions endpoints
│       └── db/               # SQLAlchemy models and async engine
└── frontend/
    └── src/
        ├── components/
        │   ├── wizard/       # 5-step input wizard
        │   └── dashboard/    # Results charts and tables
        ├── store/useStore.ts # Global Zustand state
        └── api/client.ts     # Axios wrappers
```

## Key Features

- **5-step wizard** collecting general, manual production, robot technology, robot labor, and financing parameters
- **Live KPI sidebar** that recalculates as you type (800 ms debounce)
- **Dashboard** with financial charts (bar, waterfall, NPV fan, break-even) and operational charts (OEE radar, production comparison)
- **Session management** — save, load, and delete named sessions backed by PostgreSQL
- **3-scenario NPV analysis** (pessimistic / realistic / optimistic)
- **Print / export** support via CSS print styles
