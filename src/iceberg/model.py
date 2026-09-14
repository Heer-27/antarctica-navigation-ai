"""Machine learning model training, evaluation, and serialization module for iceberg trajectories."""

from pathlib import Path
from typing import Any
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.base import BaseEstimator

from src.iceberg.config import DEFAULT_MODEL_PARAMS, FORECAST_HORIZONS_HOURS, MODELS_DIR
from src.iceberg.features import create_trajectory_features, build_training_data, haversine_km
from src.iceberg.baseline import predict_persistence_baseline


def impute_features(df_features: pd.DataFrame) -> pd.DataFrame:
    """Impute missing feature values logically without setting initial unknown speeds to 0.0.

    1. For per-iceberg velocity, displacement, speed, and lag columns, backfills (bfill)
       per iceberg so initial observations take the iceberg's actual first observed velocity
       rather than 0.0 or stationary fallbacks.
    2. For any remaining global NaNs across numeric columns (e.g., single-observation icebergs),
       fills with the column median across all icebergs.
    """
    df_imp = df_features.copy()

    velocity_cols = [
        'time_delta_hours', 'displacement_km', 'velocity_lat_deg_per_hr',
        'velocity_lon_deg_per_hr', 'speed_kmh', 'bearing_deg', 'speed_kmh_roll3',
        'latitude_lag1', 'longitude_lag1', 'speed_kmh_lag1',
        'latitude_lag2', 'longitude_lag2', 'speed_kmh_lag2',
        'latitude_lag3', 'longitude_lag3', 'speed_kmh_lag3'
    ]

    if 'iceberg_id' in df_imp.columns:
        for col in velocity_cols:
            if col in df_imp.columns:
                df_imp[col] = df_imp.groupby('iceberg_id')[col].transform(lambda s: s.bfill().ffill())

    for col in df_imp.select_dtypes(include=[np.number]).columns:
        if df_imp[col].isna().any():
            median_val = df_imp[col].median()
            df_imp[col] = df_imp[col].fillna(median_val if pd.notna(median_val) else 0.0)

    return df_imp


def train_trajectory_model(
    X: pd.DataFrame,
    y: pd.DataFrame | pd.Series,
    horizon_hours: int,
    timestamps: pd.Series,
    test_size_pct: float = 0.20,
    model_kwargs: dict[str, Any] | None = None
) -> tuple[BaseEstimator, pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.Timestamp]:
    """Train a multi-output RandomForestRegressor for a specific horizon with strict chronological train/test split.

    Parameters
    ----------
    X : pd.DataFrame
        Feature matrix (excluding metadata columns like iceberg_id, timestamp, sensor).
    y : pd.DataFrame | pd.Series
        Target coordinate displacements [delta_lat_{H}h, delta_lon_{H}h].
    horizon_hours : int
        Forecast horizon in hours (e.g., 24, 72, 168).
    timestamps : pd.Series
        Origin observation timestamps aligned with X and y for date splitting.
    test_size_pct : float
        Percentage of date range allocated to test set (default: 0.20 / last 20%).
    model_kwargs : dict[str, Any] | None
        Hyperparameters for scikit-learn RandomForestRegressor.

    Returns
    -------
    tuple[BaseEstimator, pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.Timestamp]
        Trained model, X_train, y_train, X_test, y_test, cutoff_date.
    """
    if model_kwargs is None:
        params = DEFAULT_MODEL_PARAMS.copy()
    else:
        params = model_kwargs.copy()

    target_lat_col = f'delta_lat_{horizon_hours}h'
    target_lon_col = f'delta_lon_{horizon_hours}h'

    if isinstance(y, pd.DataFrame):
        if target_lat_col in y.columns and target_lon_col in y.columns:
            y_h = y[[target_lat_col, target_lon_col]]
        else:
            y_h = y.iloc[:, :2]
    else:
        y_h = y

    # 1. Drop rows where target is NaN BEFORE fitting, and drop matching rows from X & timestamps
    valid_mask = y_h.notna().all(axis=1)

    X_valid = X[valid_mask].copy()
    y_valid = y_h[valid_mask].copy()
    ts_valid = timestamps[valid_mask]

    # 2. Chronological split by Date (80th percentile cutoff)
    cutoff_date = ts_valid.quantile(1.0 - test_size_pct)
    train_mask = ts_valid < cutoff_date
    test_mask = ts_valid >= cutoff_date

    X_train_raw = X_valid[train_mask]
    y_train = y_valid[train_mask]

    X_test_raw = X_valid[test_mask]
    y_test = y_valid[test_mask]

    # Print split details
    print(f"\n========================================================")
    print(f"       CHRONOLOGICAL SPLIT DETAILS ({horizon_hours}h Horizon)       ")
    print(f"========================================================")
    print(f"Cutoff Date (80th Percentile): {cutoff_date.strftime('%Y-%m-%d')}")
    print(f"Train Row Count:              {len(X_train_raw)}")
    print(f"Test Row Count:               {len(X_test_raw)}")
    print(f"Total Valid Target Rows:       {len(X_valid)}")
    print(f"========================================================\n")

    # Impute feature matrices
    X_train = impute_features(X_train_raw)
    X_test = impute_features(X_test_raw)

    # 3. Fit ONLY on train
    model = RandomForestRegressor(**params)
    model.fit(X_train, y_train)

    return model, X_train, y_train, X_test, y_test, cutoff_date


def save_model(model: BaseEstimator, filepath: str | Path) -> None:
    """Serialize and save the trained scikit-learn model to disk."""
    target_path = Path(filepath)
    target_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, target_path)


def load_model(filepath: str | Path) -> BaseEstimator:
    """Load a trained scikit-learn trajectory prediction model from disk."""
    target_path = Path(filepath)
    if not target_path.exists():
        raise FileNotFoundError(f"Model file does not exist: {target_path}")

    return joblib.load(target_path)


def evaluate_models(
    clean_tracks_path: str | Path = "data/processed/iceberg_tracks_clean.csv"
) -> pd.DataFrame:
    """Train models per horizon on chronological split data, evaluate errors against persistence baseline on held-out test set."""
    clean_df = pd.read_csv(clean_tracks_path)
    clean_df['timestamp'] = pd.to_datetime(clean_df['timestamp'])

    df_feat = create_trajectory_features(clean_df)
    X, y, timestamps = build_training_data(clean_df)

    origin_lat = df_feat['latitude']
    origin_lon = df_feat['longitude']
    vel_lat = df_feat['velocity_lat_deg_per_hr'].fillna(0.0)
    vel_lon = df_feat['velocity_lon_deg_per_hr'].fillna(0.0)

    eval_results = []

    for H in FORECAST_HORIZONS_HOURS:
        target_lat_col = f'delta_lat_{H}h'
        target_lon_col = f'delta_lon_{H}h'

        valid_target_mask = y[target_lat_col].notna() & y[target_lon_col].notna()

        X_valid = X[valid_target_mask]
        y_valid = y.loc[valid_target_mask, [target_lat_col, target_lon_col]]
        ts_valid = timestamps[valid_target_mask]

        orig_lat_valid = origin_lat[valid_target_mask]
        orig_lon_valid = origin_lon[valid_target_mask]
        vel_lat_valid = vel_lat[valid_target_mask]
        vel_lon_valid = vel_lon[valid_target_mask]

        # 80th percentile date split cutoff
        cutoff_date = ts_valid.quantile(0.80)
        train_mask = ts_valid < cutoff_date
        test_mask = ts_valid >= cutoff_date

        X_train_raw = X_valid[train_mask]
        y_train = y_valid[train_mask]

        X_test_raw = X_valid[test_mask]
        y_test = y_valid[test_mask]

        test_orig_lat = orig_lat_valid[test_mask]
        test_orig_lon = orig_lon_valid[test_mask]
        test_vel_lat = vel_lat_valid[test_mask]
        test_vel_lon = vel_lon_valid[test_mask]

        print(f"\n========================================================")
        print(f"       CHRONOLOGICAL SPLIT DETAILS ({H}h Horizon)       ")
        print(f"========================================================")
        print(f"Cutoff Date (80th Percentile): {cutoff_date.strftime('%Y-%m-%d')}")
        print(f"Train Row Count:              {len(X_train_raw)}")
        print(f"Test Row Count:               {len(X_test_raw)}")
        print(f"Total Valid Target Rows:       {len(X_valid)}")
        print(f"========================================================\n")

        # Impute features separately for train and test
        X_train = impute_features(X_train_raw)
        X_test = impute_features(X_test_raw)

        # Fit model ONLY on train
        model = RandomForestRegressor(**DEFAULT_MODEL_PARAMS)
        model.fit(X_train, y_train)

        # Save model to models/iceberg_rf_{H}h.joblib
        MODELS_DIR.mkdir(parents=True, exist_ok=True)
        save_model(model, MODELS_DIR / f"iceberg_rf_{H}h.joblib")

        # Predict on test set
        preds = model.predict(X_test)
        pred_delta_lat = preds[:, 0]
        pred_delta_lon = preds[:, 1]

        # Ground truth coordinates
        true_lat = test_orig_lat + y_test[target_lat_col]
        true_lon = test_orig_lon + y_test[target_lon_col]

        # Model predicted coordinates
        model_lat = test_orig_lat + pred_delta_lat
        model_lon = test_orig_lon + pred_delta_lon

        # Persistence baseline predicted coordinates on SAME test rows
        base_lat = (test_orig_lat + (test_vel_lat * H)).clip(-90.0, 90.0)
        base_lon = ((test_orig_lon + (test_vel_lon * H) + 180.0) % 360.0) - 180.0

        # Calculate great-circle error in km using haversine_km
        model_errors_km = haversine_km(true_lat, true_lon, model_lat, model_lon)
        base_errors_km = haversine_km(true_lat, true_lon, base_lat, base_lon)

        base_median = float(np.median(base_errors_km))
        model_median = float(np.median(model_errors_km))
        base_mean = float(np.mean(base_errors_km))
        model_mean = float(np.mean(model_errors_km))
        n_test = len(X_test)

        eval_results.append({
            'horizon': f"{H}h",
            'n_test': n_test,
            'baseline_median_km': round(base_median, 2),
            'model_median_km': round(model_median, 2),
            'baseline_mean_km': round(base_mean, 2),
            'model_mean_km': round(model_mean, 2),
        })

    eval_df = pd.DataFrame(eval_results)
    eval_df = eval_df[['horizon', 'n_test', 'baseline_median_km', 'model_median_km', 'baseline_mean_km', 'model_mean_km']]

    print("\n=======================================================================================================")
    print("                               MODEL vs BASELINE EVALUATION TABLE                                       ")
    print("=======================================================================================================")
    print(eval_df.to_string(index=False))
    print("=======================================================================================================\n")

    return eval_df
