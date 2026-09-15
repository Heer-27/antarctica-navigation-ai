import joblib
import pandas as pd
from typing import Dict, Any, List
from pathlib import Path
from app.core.config import MODELS_DIR
from app.core.logging_config import logger
from .preprocess import SEA_ICE_FEATURE_NAMES

_model_cache = None

def get_sea_ice_model():
    """Lazy-load the trained sea-ice model once into memory."""
    global _model_cache
    if _model_cache is None:
        model_file = MODELS_DIR / "sea_ice_model.pkl"
        if not model_file.exists():
            from .train import train_sea_ice_model
            logger.warning("Sea-ice model file missing. Running automated baseline training...")
            train_sea_ice_model()
        _model_cache = joblib.load(model_file)
    return _model_cache

def predict_sea_ice_concentration(features: Dict[str, Any]) -> float:
    """Predict sea-ice concentration percentage (0-100%) for input environmental features."""
    model = get_sea_ice_model()
    # Format input into single-row dataframe matching training features
    input_data = {col: [features.get(col, 0.0)] for col in SEA_ICE_FEATURE_NAMES}
    df = pd.DataFrame(input_data)
    prediction = float(model.predict(df)[0])
    return max(0.0, min(100.0, round(prediction, 1)))

def forecast_sea_ice_multi_horizon(base_features: Dict[str, Any], horizons: List[int]) -> List[Dict[str, Any]]:
    """Generate concentration forecasts and confidence intervals for given hours ahead."""
    results = []
    base_pred = predict_sea_ice_concentration(base_features)

    for h in horizons:
        # Thermodynamic divergence over time horizon
        delta = (h / 24.0) * (0.8 if base_features.get("air_temperature", -10) < -8 else -0.6)
        pred = max(0.0, min(100.0, round(base_pred + delta, 1)))
        # Confidence decays as forecast horizon extends
        confidence = max(65.0, round(94.0 - (h / 24.0) * 4.5, 1))
        results.append({
            "hours_ahead": h,
            "predicted_concentration": pred,
            "confidence": confidence
        })
    return results
