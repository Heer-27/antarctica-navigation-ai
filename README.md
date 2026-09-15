# Antarctic Decision Support System (ADSS)

### AI-Enabled Antarctic Sea-Ice, Iceberg Trajectory, and Navigation Decision Support System

An end-to-end polar operations platform combining machine learning forecasting, Lagrangian drift kinematic modeling, multi-objective Pareto route optimization, and an authentic **"Polar Research Operations Center"** user interface.

---

## 1. System Architecture

```
antarctic-ai/
│
├── frontend/                     # React 18 + Vite + Leaflet Web Application
│   ├── src/
│   │   ├── api/                  # Centralized REST API client
│   │   ├── components/           # Maps, legends, instruments, timeline, drawers
│   │   ├── pages/                # 13 complete views (Dashboard, Sea Ice, Icebergs, Route, etc.)
│   │   └── styles/               # Polar design system tokens & CSS variables
│   ├── package.json
│   └── vite.config.js
│
├── backend/                      # Python 3.11+ FastAPI + PostGIS + Scikit-Learn
│   ├── app/
│   │   ├── api/                  # REST endpoints (health, sea-ice, icebergs, ships, route)
│   │   ├── database/             # PostgreSQL/PostGIS models with local SQLite fallback
│   │   ├── ml/                   # Random Forest sea-ice & Lagrangian drift models
│   │   ├── routing/              # NavGrid, A*, Dijkstra, and composite risk engine
│   │   └── services/             # Domain logic (fuel model, Pareto optimizer, metocean)
│   ├── data/sample/              # Realistic synthetic Antarctic datasets
│   ├── models/                   # Serialized ML model binaries (*.pkl) & metadata
│   ├── tests/                    # Pytest test suite
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml            # Complete multi-container orchestration
├── .gitignore
└── README.md
```

---

## 2. Quick Start

### Option A: Using Docker Compose (Recommended)
Launch the entire platform (PostGIS database, FastAPI backend, and React frontend) with a single command:
```bash
docker compose up --build
```
- **Frontend Dashboard**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Backend Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

### Option B: Running Locally (Development Mode)

#### 1. Start the Backend
```bash
cd backend

# Create & activate virtual environment
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```
*(On first startup, the backend automatically seeds sample Antarctic datasets, initializes the database tables, and trains baseline ML models in `backend/models/`.)*

#### 2. Start the Frontend
In a separate terminal:
```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 3. Core REST API Endpoints

| Category | Method | Endpoint | Description |
|---|---|---|---|
| **HEALTH** | `GET` | `/api/health` | System status, database engine, and telemetry metrics |
| **SEA ICE** | `GET` | `/api/sea-ice/current` | Spatial ice concentration across Southern Ocean sectors |
| **SEA ICE** | `GET` | `/api/sea-ice/forecast` | ML concentration forecasts (+6h to +5d) |
| **SEA ICE** | `GET` | `/api/sea-ice/history` | Historical observation time series & freezing trend % |
| **ICEBERGS** | `GET` | `/api/icebergs` | Radar target catalog with spatial bounding box filter |
| **ICEBERGS** | `GET` | `/api/icebergs/{id}` | Dimensions, freeboard sail height, and drift speed |
| **ICEBERGS** | `GET` | `/api/icebergs/{id}/trajectory` | Lagrangian drift predictions (+6h to +48h) |
| **WEATHER** | `GET` | `/api/weather` | 10m wind vector, barometric pressure, freezing spray |
| **OCEAN** | `GET` | `/api/ocean` | Sea surface temperature, significant waves, ocean currents |
| **SHIPS** | `GET` | `/api/ships` | Active research vessel fleet registry |
| **SHIPS** | `POST` | `/api/ships` | Register vessel with IMO Polar Class rating (PC1–PC7) |
| **ROUTING** | `POST` | `/api/route/optimize` | Multi-objective Pareto A* optimization |
| **ROUTING** | `POST` | `/api/route/compare` | Compare Shortest, Safest, Fuel-efficient & Balanced |
| **SCENARIO** | `POST` | `/api/scenario/simulate` | Environmental "What If?" perturbation simulator |

---

## 4. Running Backend Tests

```bash
cd backend
pytest
```

---

## 5. Official Maritime Navigation Disclaimer

> **IMPORTANT NOTICE:** This platform is an educational decision-support prototype developed for academic and demonstration purposes. It is not a certified maritime navigation system and must not be used as a substitute for official navigation charts, ice information, vessel procedures, or qualified maritime personnel. Final operational authority remains solely with the Vessel Master in accordance with the International Code for Ships Operating in Polar Waters (IMO Polar Code).
