"""Configuration settings for the Iceberg Trajectory & Encounter Detection module."""

from pathlib import Path

# Base Directory
BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent

# Data Directories
DATA_DIR: Path = BASE_DIR / "data"
DATA_RAW_DIR: Path = DATA_DIR / "raw"
DATA_PROCESSED_DIR: Path = DATA_DIR / "processed"
DATA_SAMPLE_DIR: Path = DATA_DIR / "sample"

# Model Storage Directory
MODELS_DIR: Path = BASE_DIR / "models"

# Forecast Horizons in Hours
FORECAST_HORIZONS_HOURS: list[int] = [6, 12, 24]

# Prediction Output Schema Constants
PREDICTION_SCHEMA: list[str] = [
    "iceberg_id",
    "origin_timestamp",
    "horizon_hours",
    "predicted_timestamp",
    "predicted_latitude",
    "predicted_longitude",
    "predicted_speed_kmh",
    "iceberg_risk",
]


# Spatial Risk & Safety Constants
DEFAULT_SAFETY_BUFFER_KM: float = 10.0  # Safety distance buffer for encounter detection in kilometers

# Default Model Parameters (scikit-learn)
RANDOM_STATE: int = 42
DEFAULT_MODEL_PARAMS: dict[str, float | int] = {
    "n_estimators": 100,
    "max_depth": 10,
    "random_state": RANDOM_STATE,
}
