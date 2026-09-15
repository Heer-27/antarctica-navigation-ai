from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings, MODELS_DIR
from app.core.logging_config import setup_logging, logger
from app.database.connection import init_db
from app.data.demo_data import generate_sample_datasets, seed_database_demo_records
from app.ml.sea_ice.train import train_sea_ice_model
from app.ml.iceberg.train import train_iceberg_models

from app.api import (
    health_router,
    sea_ice_router,
    icebergs_router,
    weather_router,
    ocean_router,
    ships_router,
    route_router
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifespan context."""
    setup_logging()
    logger.info("Initializing Antarctic Decision Support System...")

    # 1. Initialize database schema
    try:
        init_db()
    except Exception as e:
        logger.error(f"Database initialization error: {e}")

    # 2. Ensure synthetic demo datasets exist
    try:
        generate_sample_datasets()
        seed_database_demo_records()
    except Exception as e:
        logger.error(f"Demo data seeding error: {e}")

    # 3. Ensure baseline ML models are trained and present
    sea_ice_model_path = MODELS_DIR / "sea_ice_model.pkl"
    if not sea_ice_model_path.exists():
        logger.info("Sea-ice model missing. Executing initial training pipeline...")
        try:
            train_sea_ice_model()
        except Exception as e:
            logger.error(f"Failed to train initial sea-ice model: {e}")

    iceberg_model_path = MODELS_DIR / "iceberg_latitude_model.pkl"
    if not iceberg_model_path.exists():
        logger.info("Iceberg drift models missing. Executing initial training pipeline...")
        try:
            train_iceberg_models()
        except Exception as e:
            logger.error(f"Failed to train initial iceberg drift models: {e}")

    logger.info("All polar systems, ML engines, and databases are OPERATIONAL.")
    yield
    logger.info("Antarctic Decision Support System shutting down.")

app = FastAPI(
    title="Antarctic Decision Support System API",
    description=(
        "AI-Enabled Antarctic Sea-Ice Forecasting, Iceberg Trajectory Prediction, "
        "and Maritime Navigation Decision Support System.\n\n"
        "**Official Disclaimer:** This platform is an educational decision-support prototype. "
        "It is not a certified maritime navigation system and must not be used as a substitute "
        "for official navigation charts, ice information, vessel procedures, or qualified maritime personnel."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_tags=[
        {"name": "HEALTH", "description": "System health, database connectivity, and telemetry metrics."},
        {"name": "SEA ICE", "description": "Spatiotemporal sea-ice concentration observations, forecasts, and history."},
        {"name": "ICEBERGS", "description": "Radar-tracked icebergs, Lagrangian drift trajectories, and proximity alerts."},
        {"name": "WEATHER", "description": "Synoptic Antarctic meteorological conditions and wind vectors."},
        {"name": "OCEAN", "description": "Hydrodynamic currents, wave heights, and sea surface temperatures."},
        {"name": "SHIPS", "description": "Research vessel fleet registry and Polar Class specifications."},
        {"name": "ROUTING", "description": "Pareto multi-objective route optimization and scenario simulation."}
    ]
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all API routers
app.include_router(health_router)
app.include_router(sea_ice_router)
app.include_router(icebergs_router)
app.include_router(weather_router)
app.include_router(ocean_router)
app.include_router(ships_router)
app.include_router(route_router)

@app.get("/", tags=["HEALTH"], summary="Root system landing")
async def root():
    return {
        "system": "Antarctic Decision Support System",
        "status": "ONLINE",
        "documentation": "/docs",
        "mode": "DEMO" if settings.DEMO_MODE else "LIVE",
        "version": "1.0.0"
    }

@app.get("/health", tags=["HEALTH"], summary="Root health check alias")
async def health_alias():
    from app.api.health import get_health_status
    return await get_health_status()

