"""Configuration settings for the Iceberg Trajectory & Encounter Detection module."""

from pathlib import Path

# Base Directory
BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent

# Data Directories
DATA_DIR: Path = BASE_DIR / "data"
DATA_RAW_DIR: Path = DATA_DIR / "raw"
DATA_PROCESSED_DIR: Path = DATA_DIR / "processed"
DATA_SAMPLE_DIR: Path = DATA_DIR / "sample"

# BYU consolidated database v8.0
RAW_ICEBERG_DIR: Path = DATA_RAW_DIR / "consolidated_database_v8.0" / "updated7_consol"

# Model Storage Directory
MODELS_DIR: Path = BASE_DIR / "models"

# Output Directory
OUTPUTS_DIR: Path = BASE_DIR / "outputs" / "predictions"

# Forecast Horizons in Hours
# The BYU consolidated database stores dates as YYYYDDD (year + day of year) with
# no time of day, so the finest available resolution is one day. Sub-daily
# horizons are therefore not supportable from this dataset.
FORECAST_HORIZONS_HOURS: list[int] = [24, 72, 168]  # 1 day, 3 days, 7 days

# Sensor preference when several sensors report a position on the same date.
# Scatterometers generally give daily coverage; NIC reports are irregular and
# infrequent, so NIC is used last.
SENSOR_PRIORITY: list[str] = [
    "ascat", "qscat", "oscat", "seawinds", "ers", "nscat", "sass", "nic",
]

# A latitude/longitude pair of exactly (0, 0) means "no data" in this database.
NO_DATA_SENTINEL: float = 0.0

# Iceberg sizes are reported in nautical miles.
NM_TO_KM: float = 1.852

# Spatial Risk & Safety Constants
DEFAULT_SAFETY_BUFFER_KM: float = 10.0

# Prediction output schema — downstream modules import this instead of
# hardcoding column names.
PREDICTION_SCHEMA: list[str] = [
    "iceberg_id",
    "last_observed_timestamp",
    "data_age_hours",
    "origin_timestamp",
    "horizon_hours",
    "predicted_timestamp",
    "predicted_latitude",
    "predicted_longitude",
    "predicted_speed_kmh",
    "position_uncertainty_km",
    "iceberg_risk",
]

# Default Model Parameters (scikit-learn)
RANDOM_STATE: int = 42
DEFAULT_MODEL_PARAMS: dict[str, float | int] = {
    "n_estimators": 100,
    "max_depth": 10,
    "random_state": RANDOM_STATE,
    "n_jobs": -1,
}