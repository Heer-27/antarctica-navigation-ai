import json
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from datetime import datetime, timezone
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from app.core.config import DATA_DIR, MODELS_DIR
from app.core.logging_config import logger
from app.data.demo_data import generate_sample_datasets
from .preprocess import SEA_ICE_FEATURE_NAMES

def train_sea_ice_model(csv_path: Path = None) -> dict:
    """Train Random Forest regression model on Antarctic sea-ice observations."""
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    if csv_path is None:
        csv_path = DATA_DIR / "sample" / "sea_ice_sample.csv"
        if not csv_path.exists():
            generate_sample_datasets()

    logger.info(f"Loading training data from {csv_path}...")
    df = pd.read_csv(csv_path)

    X = df[SEA_ICE_FEATURE_NAMES]
    y = df["target_concentration"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    logger.info("Training Random Forest Regressor (100 estimators)...")
    model = RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)

    # Evaluate
    predictions = model.predict(X_test)
    mae = float(mean_absolute_error(y_test, predictions))
    rmse = float(np.sqrt(mean_squared_error(y_test, predictions)))
    r2 = float(r2_score(y_test, predictions))

    logger.info(f"Sea-Ice Model Evaluation: MAE={mae:.2f}%, RMSE={rmse:.2f}%, R²={r2:.4f}")

    # Save model and metadata
    model_file = MODELS_DIR / "sea_ice_model.pkl"
    meta_file = MODELS_DIR / "sea_ice_metadata.json"

    joblib.dump(model, model_file)

    metadata = {
        "model_name": "Antarctic Sea-Ice Concentration Regressor",
        "algorithm": "RandomForestRegressor(n_estimators=100)",
        "version": "v1.0.4",
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "sample_count": len(df),
        "features": SEA_ICE_FEATURE_NAMES,
        "metrics": {
            "mae": f"{mae:.2f}%",
            "rmse": f"{rmse:.2f}%",
            "r2": f"{r2:.4f}"
        }
    }

    with open(meta_file, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    logger.info(f"Saved model to {model_file} and metadata to {meta_file}")
    return metadata

if __name__ == "__main__":
    train_sea_ice_model()
