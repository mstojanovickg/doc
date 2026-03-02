# CLAUDE.md

This file provides guidance to AI assistants (Claude and others) working in this repository.

---

## Repository Overview

- **Repository**: `mstojanovickg/doc`
- **Purpose**: Robot Implementation Decision Support Tool — a full-stack web application that digitises and extends an Excel-based robot feasibility model (Model_za_PhD).
- **Stack**: Python/FastAPI backend + React/TypeScript frontend + PostgreSQL + Docker Compose

---

## Repository Structure

```
/
├── CLAUDE.md                       # AI assistant guidance (this file)
├── docker-compose.yml              # Orchestrates postgres, backend, frontend
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py                 # FastAPI app, CORS, lifespan (DB init)
│       ├── models/
│       │   ├── inputs.py           # Pydantic input schema (CalculationInput)
│       │   └── outputs.py          # Pydantic output schema (CalculationResult)
│       ├── engine/
│       │   └── calculator.py       # All KPI formulas — core business logic
│       ├── routers/
│       │   ├── calculate.py        # POST /api/calculate
│       │   └── sessions.py         # CRUD /api/sessions
│       └── db/
│           ├── database.py         # SQLAlchemy async engine + session
│           └── models.py           # Session ORM model (PostgreSQL)
│
└── frontend/
    ├── Dockerfile
    ├── package.json                # React 18, Zustand, Recharts, Tailwind, Vite
    ├── vite.config.ts              # Proxy /api → backend:8000
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx                 # Root: header + wizard/dashboard switch
        ├── index.css               # Tailwind + print styles
        ├── types/index.ts          # TypeScript mirrors of Python Pydantic models
        ├── store/useStore.ts       # Zustand store (inputs, results, sessions)
        ├── api/client.ts           # Axios wrappers for backend endpoints
        ├── utils/formatting.ts     # RSD formatting, time parsing (h:mm:ss ↔ min)
        └── components/
            ├── common/
            │   ├── FormField.tsx   # Label+input wrapper with validation UI
            │   └── TimeInput.tsx   # h:mm:ss ↔ decimal-minutes input
            ├── wizard/
            │   ├── WizardLayout.tsx         # Step progress bar + nav buttons
            │   ├── KPISidebar.tsx           # Live KPI panel (auto-recalculates)
            │   └── steps/
            │       ├── Step1General.tsx     # Product price, takt time, growth
            │       ├── Step2Manual.tsx      # Shifts, CT, salary, OEE inputs
            │       ├── Step3RobotTech.tsx   # Robot price, power, maintenance
            │       ├── Step4RobotLabor.tsx  # Training, engineering, OPT%
            │       └── Step5Financing.tsx   # Loan/own funds, WACC, scenarios
            ├── dashboard/
            │   ├── Dashboard.tsx            # Container; print/export button
            │   ├── HeroStrip.tsx            # 4 large KPI cards (ΔNP, ROI, PP, NPV)
            │   ├── FinancialSection.tsx     # Bar, waterfall, NPV fan, BEP charts
            │   ├── OperationalSection.tsx   # OEE radar, production bar, saved hours
            │   ├── CostTable.tsx            # M vs R cost comparison table
            │   ├── SafetySection.tsx        # Defect/sick-leave rates, injury cost
            │   └── FinancingSection.tsx     # Investment breakdown, loan schedule
            └── SessionManager.tsx          # Save / load / delete sessions modal
```

---

## Development Workflows

### Running the Application

```bash
# Start all services
docker compose up --build

# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API docs: http://localhost:8000/docs
```

### Individual Service Development

```bash
# Backend only (with hot-reload)
cd backend && uvicorn app.main:app --reload --port 8000

# Frontend only
cd frontend && bun install && bun run dev
```

### Branching Strategy

- **Main branch**: `main` — protected; never commit directly
- **Feature branches**: `feature/<short-description>`
- **Bug-fix branches**: `fix/<short-description>`
- **AI-session branches**: `claude/<task-slug>-<session-id>` (auto-created per session)

### Commit Message Convention

Use the **imperative mood**, subject line under 72 characters:

```
<type>: <short summary>
```

| Type       | When to use                        |
|------------|------------------------------------|
| `feat`     | New feature or content             |
| `fix`      | Bug fix                            |
| `docs`     | Documentation only                 |
| `refactor` | Code restructuring, no logic change|
| `chore`    | Tooling, deps, config              |

---

## Key Conventions for AI Assistants

### General Principles

1. **Read before editing** — always read existing files before modifying them
2. **Minimal footprint** — make only the changes required by the task
3. **No unnecessary files** — do not create boilerplate unless explicitly requested
4. **Security first** — never commit secrets, credentials, or sensitive data
5. **Prefer editing over creating** — update existing files rather than creating new ones

### Calculation Engine Rules

- All time values are **stored and computed in minutes** internally
- Time is displayed as `h:mm:ss` or `h:mm` in the UI (see `utils/formatting.ts`)
- All monetary values are in **RSD (Serbian Dinar)**
- The Python engine in `backend/app/engine/calculator.py` is the **single source of truth** for all formulas — never replicate calculation logic in the frontend
- Division-by-zero is handled via `_safe_div()` which returns `0.0`; results show N/A in the UI when a computed value is not meaningful

### Frontend Rules

- The Zustand store (`useStore.ts`) owns all application state; components should read from and write to the store, not maintain their own state for shared data
- The KPI sidebar auto-recalculates with an 800 ms debounce whenever `inputs` changes (only when required fields are populated)
- Time inputs use the `TimeInput` component which handles `h:mm`, `h:mm:ss`, and plain decimal-minutes formats
- Percentage inputs are displayed as 0–100 but stored as fractions (0.0–1.0) in the store and backend

### Git Operations

- Develop on the session branch specified in the task context (`claude/...`)
- Use `git push -u origin <branch>` for the initial push
- Retry on network failures with exponential backoff: 2 s → 4 s → 8 s → 16 s
- Never force-push to `main`/`master`
- Never skip commit hooks (`--no-verify`)

### File Operations

| Task                | Preferred tool  |
|---------------------|-----------------|
| Read a file         | `Read`          |
| Edit a file         | `Edit`          |
| Create a new file   | `Write`         |
| Search for files    | `Glob`          |
| Search file content | `Grep`          |
| Run shell commands  | `Bash` (last resort) |

---

## Key Business Logic Reference

### Manual Production Formulas

| Symbol | Formula |
|--------|---------|
| TDW    | shifts × shift_duration |
| NDW    | TDW − shifts × breaks × break_duration |
| MWT    | TDW × workdays_month |
| AWT    | MWT × 12 |
| DPV_M  | NDW / CT |
| LC_M   | salary × 13 × workers |
| DTC_M  | breakdowns × repair_time_h × LCPH × 12 |

### Robot Production Formulas

| Symbol | Formula |
|--------|---------|
| DPV_R  | TDW / CT (robot works without breaks) |
| EC     | power_kW × AWT_robot_hours × electricity_price |
| INV    | robot + gripper + equipment + engineering + training |
| LC_R   | salary × 13 × workers × operator_time_fraction |

### Financial KPIs

| KPI | Formula |
|-----|---------|
| ΔNP | NP_R − NP_M |
| ROI | ΔNP / INV |
| PP  | INV / (ΔNP / 12) in months |
| NPV | −equity + Σ NCF_t / (1+WACC)^t over 5 years |
| IEI | NPV / INV |
| OEE | Availability × Performance × Quality |

### Scenario Engine

Three NPV scenarios apply multipliers to robot cash flows:

| Scenario    | Inflow adj. | Outflow adj. | WACC adj. |
|-------------|------------|--------------|-----------|
| Pessimistic | +2%        | +5%          | +2%       |
| Realistic   | +5%        | +3%          | 0%        |
| Optimistic  | +8%        | −2%          | −2%       |

---

## Updating This File

Keep this file current as the project evolves:

- Update the structure diagram when new files or directories are added
- Document new API endpoints when added to the backend
- Record formula changes in the business logic reference section
- Add test commands once a test suite is introduced
