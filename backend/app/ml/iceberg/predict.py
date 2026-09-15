import joblib
import math
import pandas as pd
from typing import Dict, Any, List
from pathlib import Path
from app.core.config import MODELS_DIR
from app.core.logging_config import logger
from .preprocess import ICEBERG_FEATURE_NAMES

_lat_model_cache = None
_lon_model_cache = None

def get_iceberg_models():
    """Lazy-load the trained iceberg drift models."""
    global _lat_model_cache, _lon_model_cache
    if _lat_model_cache is None or _lon_model_cache is None:
        lat_file = MODELS_DIR / "iceberg_latitude_model.pkl"
        lon_file = MODELS_DIR / "iceberg_longitude_model.pkl"

        if not lat_file.exists() or not lon_file.exists():
            from .train import train_iceberg_models
            logger.warning("Iceberg drift models missing. Running automated baseline training...")
            train_iceberg_models()

        _lat_model_cache = joblib.load(lat_file)
        _lon_model_cache = joblib.load(lon_file)
    return _lat_model_cache, _lon_model_cache

def _parse_float(val: Any, default: float = 0.0) -> float:
    """Safely convert numerical or string inputs (e.g. 'NE 042°') to float."""
    if val is None:
        return default
    if isinstance(val, (int, float)):
        return float(val)
    if isinstance(val, str):
        import re
        nums = re.findall(r"[-+]?(?:\d*\.\d+|\d+)", val)
        if nums:
            try:
                return float(nums[-1])
            except ValueError:
                pass
    return default

def predict_iceberg_trajectory(
    current_state: Dict[str, Any],
    forecast_hours: List[int] = None
) -> List[Dict[str, Any]]:
    """
    Project future coordinates across multiple temporal horizons (+6h, +12h, +18h, +24h, +48h).
    """
    if forecast_hours is None:
        forecast_hours = [6, 12, 18, 24, 48]

    lat_model, lon_model = get_iceberg_models()

    trajectory = []
    # Step 0: Current position
    curr_lat = _parse_float(current_state.get("latitude"), -63.15)
    curr_lon = _parse_float(current_state.get("longitude"), -56.80)
    prev_lat = _parse_float(current_state.get("prev_latitude"), curr_lat - 0.05)
    prev_lon = _parse_float(current_state.get("prev_longitude"), curr_lon - 0.08)
    speed = _parse_float(current_state.get("speed"), 1.4)

    # Handle heading or direction (e.g. "NE 042°" -> 42.0)
    dir_val = current_state.get("heading")
    if dir_val is None:
        dir_val = current_state.get("direction", 45.0)
    direction = _parse_float(dir_val, 45.0)

    trajectory.append({
        "step": "CURRENT",
        "time": "NOW",
        "latitude": round(curr_lat, 4),
        "longitude": round(curr_lon, 4),
        "probability": 100.0,
        "speed": round(speed, 2)
    })

    sim_lat = curr_lat
    sim_lon = curr_lon
    sim_prev_lat = prev_lat
    sim_prev_lon = prev_lon

    for h in forecast_hours:
        features = {
            "latitude": _parse_float(sim_lat, -63.15),
            "longitude": _parse_float(sim_lon, -56.80),
            "prev_latitude": _parse_float(sim_prev_lat, sim_lat - 0.05),
            "prev_longitude": _parse_float(sim_prev_lon, sim_lon - 0.08),
            "length": _parse_float(current_state.get("length"), 800.0),
            "width": _parse_float(current_state.get("width"), 400.0),
            "height": _parse_float(current_state.get("height"), 40.0),
            "speed": _parse_float(speed, 1.4),
            "direction": _parse_float(direction, 45.0),
            "wind_speed": _parse_float(current_state.get("wind_speed"), 18.0),
            "wind_direction": _parse_float(current_state.get("wind_direction"), 135.0),
            "current_speed": _parse_float(current_state.get("current_speed"), 0.7),
            "current_direction": _parse_float(current_state.get("current_direction"), 140.0),
            "sea_ice_concentration": _parse_float(current_state.get("sea_ice_concentration"), 45.0)
        }
        df_row = pd.DataFrame([{col: float(features.get(col, 0.0)) for col in ICEBERG_FEATURE_NAMES}])

        pred_next_lat = float(lat_model.predict(df_row)[0])
        pred_next_lon = float(lon_model.predict(df_row)[0])

        # Step multiplier for extended horizons (+12h, +24h, +48h)
        scale_factor = h / 6.0
        d_lat = (pred_next_lat - curr_lat) * scale_factor
        d_lon = (pred_next_lon - curr_lon) * scale_factor

        final_lat = round(curr_lat + d_lat, 4)
        final_lon = round(curr_lon + d_lon, 4)

        # Decay probability as prediction horizon extends
        probability = max(50.0, round(98.0 - (h / 6.0) * 3.2, 1))
        drift_speed = round(speed * (1.0 + (h / 48.0) * 0.1), 2)

        trajectory.append({
            "step": f"+{h}H",
            "time": f"+{h} HOURS",
            "latitude": final_lat,
            "longitude": final_lon,
            "probability": probability,
            "speed": drift_speed
        })

    return trajectory
