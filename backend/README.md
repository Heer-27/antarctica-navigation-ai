# Antarctic Decision Support System - Backend

### FastAPI, PostGIS, Scikit-Learn, and Pareto A* Routing Engine

---

## 1. Overview

The backend is a high-performance Python application built for Antarctic maritime decision support:
- **FastAPI & Uvicorn**: Async REST APIs with auto-generated OpenAPI / Swagger UI.
- **SQLAlchemy & PostGIS**: Geospatial observation and vessel storage (with automatic zero-dependency local SQLite fallback).
- **Scikit-Learn ML Pipelines**:
  - Spatiotemporal Random Forest Regressor for Antarctic sea-ice concentration forecasting.
  - Dual-target coupled Lagrangian drift model for iceberg coordinate trajectory prediction (+6h to +48h).
- **Pareto A* & Dijkstra Routing**: Grid-based multi-objective optimization minimizing navigation risk, fuel consumption, and transit time under IMO Polar Code constraints.

---

## 2. Directory Structure

```
backend/
├── app/
│   ├── main.py                  # FastAPI lifespan app, CORS, router mounting
│   ├── core/
│   │   ├── config.py            # Pydantic BaseSettings & env resolution
│   │   ├── security.py          # CORS & string sanitization
│   │   └── logging_config.py    # Structured polar operations logging
│   ├── database/
│   │   ├── connection.py        # PostgreSQL & SQLite fallback sessionmaker
│   │   ├── base.py              # Declarative Base & TimestampMixin
│   │   ├── models.py            # SQLAlchemy models
│   │   └── crud.py              # Ships, icebergs, and observation repositories
│   ├── schemas/                 # Pydantic v2 validation models
│   ├── api/                     # REST API route controllers
│   ├── services/                # Routing, fuel, metocean, and iceberg services
│   ├── ml/                      # Machine learning training & prediction pipelines
│   └── routing/                 # NavGrid, A*, Dijkstra, and risk scoring engine
├── data/
│   └── sample/                  # Synthetic Antarctic datasets (sea ice, icebergs, weather)
├── models/                      # Trained model binaries (*.pkl) & metadata JSON
├── tests/                       # Pytest test suite
├── requirements.txt
├── .env.example
├── Dockerfile
└── README.md
```

---

## 3. Quick Start (Local Setup)

### Step 1: Create and Activate Virtual Environment
```bash
python3 -m venv .venv

# On macOS/Linux:
source .venv/bin/activate

# On Windows:
.venv\Scripts\activate
```

### Step 2: Install Python Dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(By default, `DEMO_MODE=true` is enabled, allowing all APIs to run out-of-the-box with synthetic Antarctic datasets.)*

### Step 4: Run the Backend Server
```bash
uvicorn app.main:app --reload --port 8000
```
On startup, the lifespan handler will:
1. Initialize database tables.
2. Generate synthetic Antarctic CSV datasets in `data/sample/`.
3. Seed initial vessels (*R/V Polarstern*, *R/V Sir David Attenborough*, *S.A. Agulhas II*) and tracked icebergs (*A-23a*, *A-017*, *A-81*).
4. Train baseline Random Forest and Lagrangian drift models automatically.

### Step 5: Explore Interactive Documentation
Open your browser to:
- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **Health Check**: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

---

## 4. Running Tests

Run the automated test suite with:
```bash
pytest
```

---

## 5. Retraining ML Models Manually

To retrain the models on updated or external CSV data:
```bash
# Retrain Sea-Ice Concentration Regressor:
python -m app.ml.sea_ice.train

# Retrain Iceberg Drift Kinematic Models:
python -m app.ml.iceberg.train
```

---

## 6. Official Maritime Disclaimer

> **IMPORTANT NOTICE:** This platform is an educational decision-support prototype. It is not a certified maritime navigation system and must not be used as a substitute for official navigation charts, ice information, vessel procedures, or qualified maritime personnel. Final operational authority remains solely with the Vessel Master in accordance with the International Code for Ships Operating in Polar Waters (IMO Polar Code).
