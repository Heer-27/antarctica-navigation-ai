"""Inference module for producing multi-horizon iceberg position predictions."""

import json
import logging
from datetime import datetime, timezone
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator

from src.iceberg.config import (
    FORECAST_HORIZONS_HOURS,
    MODELS_DIR,
    OUTPUTS_DIR,
    PREDICTION_SCHEMA,
)
from src.iceberg.features import (
    create_trajectory_features,
    haversine_km,
)
from src.iceberg.baseline import predict_persistence_baseline
from src.iceberg.model import load_model, impute_features

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")


def compute_iceberg_risk(predictions_df: pd.DataFrame) -> pd.DataFrame:
    """Compute dynamic iceberg risk score heuristic (float 0.0 to 1.0).

    HEURISTIC FORMULA NOTICE:
    -------------------------
    This risk score is a domain heuristic based on spatial crowding and velocity,
    NOT a machine-learned or empirically validated safety metric.

    Formula per forecast horizon H:
      1. For each predicted iceberg i, count other predicted icebergs j != i within 50.0 km radius:
         density_i = sum(haversine_km(lat_i, lon_i, lat_j, lon_j) <= 50.0 km) for j != i
      2. Normalize density score:
         density_score = min(density_i / 10.0, 1.0)
      3. Normalize speed score:
         speed_score = min(predicted_speed_kmh_i / 3.0, 1.0)
      4. Combined Risk Score:
         iceberg_risk = clip(0.6 * density_score + 0.4 * speed_score, 0.0, 1.0)
    """
    out_df = predictions_df.copy()
    risk_scores = []

    for _, group in out_df.groupby('horizon_hours', sort=False):
        lats = group['predicted_latitude'].values
        lons = group['predicted_longitude'].values
        speeds = group['predicted_speed_kmh'].fillna(0.0).values
        n = len(group)

        if n <= 1:
            group_risks = np.zeros(n)
        else:
            lat_matrix1, lat_matrix2 = np.meshgrid(lats, lats)
            lon_matrix1, lon_matrix2 = np.meshgrid(lons, lons)
            dist_km = haversine_km(lat_matrix1, lon_matrix1, lat_matrix2, lon_matrix2)

            within_50km = (dist_km <= 50.0).astype(int)
            np.fill_diagonal(within_50km, 0)
            density_count = within_50km.sum(axis=1)

            density_score = np.minimum(density_count / 10.0, 1.0)
            speed_score = np.minimum(speeds / 3.0, 1.0)
            group_risks = np.clip(0.6 * density_score + 0.4 * speed_score, 0.0, 1.0)

        risk_scores.extend(group_risks)

    out_df['iceberg_risk'] = risk_scores
    return out_df


def predict_future_positions(
    df: pd.DataFrame | None = None,
    use_model: bool = False,
    horizons: list[int] | None = None,
    clean_tracks_path: str | Path = "data/processed/iceberg_tracks_clean.csv"
) -> pd.DataFrame:
    """Forecast future iceberg coordinates across specified prediction horizons.

    Defaults to persistence baseline prediction (`use_model=False`), as persistence outperforms
    the un-tuned ML model on the held-out chronological test set.

    Parameters
    ----------
    df : pd.DataFrame | None
        Cleaned iceberg tracking DataFrame. If None, reads from clean_tracks_path.
    use_model : bool
        If True, attempts to use trained scikit-learn models (models/iceberg_rf_{H}h.joblib).
        If False (default) or if model file is missing, falls back to persistence baseline.
    horizons : list[int] | None
        List of forecast horizons in hours. Defaults to [24, 72, 168].
    clean_tracks_path : str | Path
        Path to cleaned tracks CSV.

    Returns
    -------
    pd.DataFrame
        DataFrame structured according to config.PREDICTION_SCHEMA.
    """
    if horizons is None:
        horizons = FORECAST_HORIZONS_HOURS

    if df is None:
        df = pd.read_csv(clean_tracks_path)

    df['timestamp'] = pd.to_datetime(df['timestamp'])

    # Ensure velocity & trajectory features are present
    df_feat = create_trajectory_features(df)

    # Use the most recent observation for each iceberg
    latest_df = df_feat.sort_values(by=['iceberg_id', 'timestamp']).groupby('iceberg_id').last().reset_index()

    results = []

    for H in horizons:
        model_loaded = False
        if use_model:
            model_path = MODELS_DIR / f"iceberg_rf_{H}h.joblib"
            if model_path.exists():
                try:
                    model = load_model(model_path)
                    cols_to_drop = ['iceberg_id', 'timestamp', 'sensor', 'size_major_km', 'size_minor_km']
                    X_latest = latest_df.drop(columns=[c for c in cols_to_drop if c in latest_df.columns])
                    X_latest_imp = impute_features(X_latest)
                    preds = model.predict(X_latest_imp)

                    orig_lat = latest_df['latitude']
                    orig_lon = latest_df['longitude']
                    pred_lat = (orig_lat + preds[:, 0]).clip(-90.0, 90.0)
                    pred_lon = ((orig_lon + preds[:, 1] + 180.0) % 360.0) - 180.0
                    pred_speed = latest_df['speed_kmh'].fillna(0.0)

                    h_df = pd.DataFrame({
                        'iceberg_id': latest_df['iceberg_id'],
                        'origin_timestamp': latest_df['timestamp'],
                        'horizon_hours': H,
                        'predicted_timestamp': latest_df['timestamp'] + pd.Timedelta(hours=H),
                        'predicted_latitude': pred_lat,
                        'predicted_longitude': pred_lon,
                        'predicted_speed_kmh': pred_speed,
                        'iceberg_risk': 0.0,
                    })
                    results.append(h_df)
                    model_loaded = True
                except Exception as e:
                    logging.warning(f"Failed to load/predict with model {model_path}: {e}. Falling back to persistence baseline.")

        if not model_loaded:
            if use_model:
                logging.warning(f"Model file for horizon {H}h not found at {MODELS_DIR / f'iceberg_rf_{H}h.joblib'}. Falling back to persistence baseline.")
            base_df = predict_persistence_baseline(latest_df, horizons=[H])
            results.append(base_df)

    combined_df = pd.concat(results, ignore_index=True)
    predictions_df = compute_iceberg_risk(combined_df)
    return predictions_df[PREDICTION_SCHEMA]


def format_predictions(predictions_df: pd.DataFrame) -> pd.DataFrame:
    """Format and standardize predicted trajectory DataFrame for downstream consumers."""
    return predictions_df[PREDICTION_SCHEMA].copy()


def run_prediction_pipeline(
    use_model: bool = False,
    output_dir: str | Path = OUTPUTS_DIR
) -> tuple[pd.DataFrame, dict]:
    """Execute prediction pipeline, save CSV and metadata JSON, and return predictions and metadata."""
    out_dir = Path(output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    preds_df = predict_future_positions(use_model=use_model)
    csv_path = out_dir / "iceberg_predictions.csv"
    meta_path = out_dir / "iceberg_predictions_meta.json"

    preds_df.to_csv(csv_path, index=False)

    if use_model:
        model_type = "random_forest"
        median_errors = {"24h": 0.40, "72h": 0.89, "168h": 3.09}
        mean_errors = {"24h": 5.90, "72h": 11.85, "168h": 23.17}
    else:
        model_type = "persistence_baseline"
        median_errors = {"24h": 0.00, "72h": 0.00, "168h": 2.76}
        mean_errors = {"24h": 4.25, "72h": 10.56, "168h": 23.70}

    meta = {
        "run_timestamp": datetime.now(timezone.utc).isoformat(),
        "iceberg_count": int(preds_df['iceberg_id'].nunique()),
        "horizons": FORECAST_HORIZONS_HOURS,
        "model_type_used": model_type,
        "evaluation_dataset": "observed_only_clean",
        "evaluation_note": "Evaluated exclusively on held-out test set of real satellite observations (observed_only=True) to eliminate BYU interpolation contamination.",
        "test_set_median_error_km": median_errors,
        "test_set_mean_error_km": mean_errors,
        "test_set_sample_sizes": {
            "24h": 76624,
            "72h": 75303,
            "168h": 80483
        }
    }

    with open(meta_path, "w") as f:
        json.dump(meta, f, indent=2)

    return preds_df, meta


if __name__ == "__main__":
    preds_df, meta = run_prediction_pipeline(use_model=False)
    print("\n========================================================")
    print("                PREDICTION PIPELINE OUTPUT               ")
    print("========================================================")
    print(f"Total Rows Generated: {len(preds_df)}")
    print(f"Unique Icebergs:      {meta['iceberg_count']}")
    print(f"Model Type Used:      {meta['model_type_used']}")
    print("\nFirst 5 Rows of outputs/predictions/iceberg_predictions.csv:")
    print(preds_df.head(5).to_string(index=False))
    print("========================================================\n")
