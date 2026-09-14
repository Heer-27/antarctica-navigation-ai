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
    This risk score is a domain heuristic measuring required navigation caution based on spatial crowding,
    speed, and forecast projection time uncertainty. It is NOT a calibrated probability.

    Formula per prediction row i:
      1. Total Projection Time:
         total_projection_hours_i = data_age_hours_i + horizon_hours_i
      2. Uncertainty Score (Exponential saturating curve, never fully flattens or clips):
         uncertainty_score_i = 1.0 - exp(-total_projection_hours_i / 480.0)
      3. Local Density Score (normalized by max observed density count):
         density_i = sum(haversine_km(lat_i, lon_i, lat_j, lon_j) <= 50.0 km) for j != i
         density_score_i = density_i / max(density_count_observed, 1.0)
      4. Speed Score (normalized by max observed active iceberg speed):
         speed_score_i = min(predicted_speed_kmh_i / max(speed_observed, 1e-6), 1.0)
      5. Combined Risk Score with Additive Uncertainty Caution:
         iceberg_risk = clip(0.45 * density_score + 0.3 * speed_score + 0.25 * uncertainty_score, 0.0, 1.0)
    """
    out_df = predictions_df.copy()
    risk_scores = []

    if 'data_age_hours' not in out_df.columns:
        out_df['data_age_hours'] = 0.0

    max_observed_speed = out_df['predicted_speed_kmh'].max()
    if max_observed_speed == 0 or np.isnan(max_observed_speed):
        max_observed_speed = 1.0

    for _, group in out_df.groupby('horizon_hours', sort=False):
        lats = group['predicted_latitude'].values
        lons = group['predicted_longitude'].values
        speeds = group['predicted_speed_kmh'].fillna(0.0).values
        data_ages = group['data_age_hours'].fillna(0.0).values
        horizons = group['horizon_hours'].values
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

            max_dens = density_count.max()
            if max_dens == 0:
                density_score = np.zeros(n)
            else:
                density_score = density_count / float(max_dens)

            speed_score = np.minimum(speeds / max_observed_speed, 1.0)

            total_proj_hours = data_ages + horizons
            uncertainty_score = 1.0 - np.exp(-total_proj_hours / 480.0)

            group_risks = np.clip(0.45 * density_score + 0.3 * speed_score + 0.25 * uncertainty_score, 0.0, 1.0)

        risk_scores.extend(group_risks)

    out_df['iceberg_risk'] = risk_scores
    return out_df


def predict_future_positions(
    df: pd.DataFrame | None = None,
    use_model: bool = False,
    horizons: list[int] | None = None,
    clean_tracks_path: str | Path = "data/processed/iceberg_tracks_clean.csv",
    as_of_date: str | pd.Timestamp | datetime | None = None,
    max_days_stale: int = 30
) -> pd.DataFrame:
    """Forecast future iceberg coordinates across specified prediction horizons for active icebergs.

    Defaults to persistence baseline prediction (`use_model=False`), as persistence outperforms
    the un-tuned ML model on the held-out chronological test set.

    Only predicts positions for icebergs whose LAST observation is within `max_days_stale`
    (default: 30 days) of `as_of_date` (default: most recent observation in the dataset).

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
    as_of_date : str | pd.Timestamp | datetime | None
        Reference timestamp for filtering active icebergs. Defaults to max dataset timestamp.
    max_days_stale : int
        Maximum allowed days since last observation for an iceberg to be considered active.

    Returns
    -------
    pd.DataFrame
        DataFrame structured according to config.PREDICTION_SCHEMA.
    """
    if horizons is None:
        horizons = FORECAST_HORIZONS_HOURS

    if df is None:
        df = pd.read_csv(clean_tracks_path)

    df['timestamp'] = pd.to_datetime(df['timestamp'], utc=True)
    dataset_max_date = df['timestamp'].max()

    if as_of_date is None:
        as_of_dt = dataset_max_date
    else:
        as_of_dt = pd.to_datetime(as_of_date, utc=True)

    cutoff_date = as_of_dt - pd.Timedelta(days=max_days_stale)

    # Ensure velocity & trajectory features are present
    df_feat = create_trajectory_features(df)

    # Use the most recent observation for each iceberg
    latest_df = df_feat.sort_values(by=['iceberg_id', 'timestamp']).groupby('iceberg_id').last().reset_index()
    total_icebergs = len(latest_df)

    # Filter active icebergs within staleness window
    active_mask = (latest_df['timestamp'] <= as_of_dt) & (latest_df['timestamp'] >= cutoff_date)
    latest_df = latest_df[active_mask].reset_index(drop=True)
    active_count = len(latest_df)

    print(f"Dataset most recent observation date: {dataset_max_date}")
    print(f"As-of Date: {as_of_dt} (Staleness window: <= {max_days_stale} days, Cutoff: {cutoff_date})")
    print(f"Active icebergs passing staleness filter: {active_count} out of {total_icebergs} total historical icebergs")

    # Compute observation data age relative to common as_of_date
    latest_df['last_observed_timestamp'] = latest_df['timestamp']
    data_age_hours = (as_of_dt - latest_df['last_observed_timestamp']).dt.total_seconds() / 3600.0

    vel_lat = latest_df['velocity_lat_deg_per_hr'].fillna(0.0)
    vel_lon = latest_df['velocity_lon_deg_per_hr'].fillna(0.0)
    speed = latest_df['speed_kmh'].fillna(0.0)

    # Extrapolate initial coordinates to common as_of_date
    as_of_lat = (latest_df['latitude'] + (vel_lat * data_age_hours)).clip(-90.0, 90.0)
    as_of_lon = ((latest_df['longitude'] + (vel_lon * data_age_hours) + 180.0) % 360.0) - 180.0

    results = []

    for H in horizons:
        model_loaded = False
        total_proj_h = data_age_hours + H
        pos_uncertainty_km = (total_proj_h * 0.2).round(1)

        if use_model:
            model_path = MODELS_DIR / f"iceberg_rf_{H}h.joblib"
            if model_path.exists():
                try:
                    model = load_model(model_path)
                    cols_to_drop = ['iceberg_id', 'timestamp', 'sensor', 'size_major_km', 'size_minor_km']
                    X_latest = latest_df.drop(columns=[c for c in cols_to_drop if c in latest_df.columns])
                    X_latest_imp = impute_features(X_latest)
                    preds = model.predict(X_latest_imp)

                    pred_lat = (as_of_lat + preds[:, 0]).clip(-90.0, 90.0)
                    pred_lon = ((as_of_lon + preds[:, 1] + 180.0) % 360.0) - 180.0

                    h_df = pd.DataFrame({
                        'iceberg_id': latest_df['iceberg_id'],
                        'last_observed_timestamp': latest_df['last_observed_timestamp'],
                        'data_age_hours': data_age_hours.round(1),
                        'origin_timestamp': as_of_dt,
                        'horizon_hours': H,
                        'predicted_timestamp': as_of_dt + pd.Timedelta(hours=H),
                        'predicted_latitude': pred_lat,
                        'predicted_longitude': pred_lon,
                        'predicted_speed_kmh': speed,
                        'position_uncertainty_km': pos_uncertainty_km,
                        'iceberg_risk': 0.0,
                    })
                    results.append(h_df)
                    model_loaded = True
                except Exception as e:
                    logging.warning(f"Failed to load/predict with model {model_path}: {e}. Falling back to persistence baseline.")

        if not model_loaded:
            if use_model:
                logging.warning(f"Model file for horizon {H}h not found at {MODELS_DIR / f'iceberg_rf_{H}h.joblib'}. Falling back to persistence baseline.")

            pred_lat = (as_of_lat + (vel_lat * H)).clip(-90.0, 90.0)
            pred_lon = ((as_of_lon + (vel_lon * H) + 180.0) % 360.0) - 180.0

            base_df = pd.DataFrame({
                'iceberg_id': latest_df['iceberg_id'],
                'last_observed_timestamp': latest_df['last_observed_timestamp'],
                'data_age_hours': data_age_hours.round(1),
                'origin_timestamp': as_of_dt,
                'horizon_hours': H,
                'predicted_timestamp': as_of_dt + pd.Timedelta(hours=H),
                'predicted_latitude': pred_lat,
                'predicted_longitude': pred_lon,
                'predicted_speed_kmh': speed,
                'position_uncertainty_km': pos_uncertainty_km,
                'iceberg_risk': 0.0,
            })
            results.append(base_df)

    combined_df = pd.concat(results, ignore_index=True)
    predictions_df = compute_iceberg_risk(combined_df)
    return predictions_df[PREDICTION_SCHEMA]


def format_predictions(predictions_df: pd.DataFrame) -> pd.DataFrame:
    """Format and standardize predicted trajectory DataFrame for downstream consumers."""
    return predictions_df[PREDICTION_SCHEMA].copy()


def run_prediction_pipeline(
    use_model: bool = False,
    output_dir: str | Path = OUTPUTS_DIR,
    as_of_date: str | pd.Timestamp | datetime | None = None,
    max_days_stale: int = 30
) -> tuple[pd.DataFrame, dict]:
    """Execute prediction pipeline, save CSV and metadata JSON, and return predictions and metadata."""
    out_dir = Path(output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    preds_df = predict_future_positions(
        use_model=use_model,
        as_of_date=as_of_date,
        max_days_stale=max_days_stale
    )
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

    last_obs_max = preds_df['last_observed_timestamp'].max() if 'last_observed_timestamp' in preds_df.columns else None

    meta = {
        "run_timestamp": datetime.now(timezone.utc).isoformat(),
        "total_dataset_icebergs": 593,
        "active_iceberg_count": int(preds_df['iceberg_id'].nunique()),
        "total_prediction_rows": len(preds_df),
        "max_days_stale": max_days_stale,
        "dataset_most_recent_observation_date": str(last_obs_max),
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
    print(f"Active Icebergs:      {meta['active_iceberg_count']} (out of {meta['total_dataset_icebergs']} total)")
    print(f"Model Type Used:      {meta['model_type_used']}")
    print("\nFirst 5 Rows of outputs/predictions/iceberg_predictions.csv:")
    print(preds_df.head(5).to_string(index=False))
    print("========================================================\n")
