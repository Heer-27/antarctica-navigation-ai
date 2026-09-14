"""Baseline model module providing persistence trajectory forecasting."""

import pandas as pd
import numpy as np
from src.iceberg.config import FORECAST_HORIZONS_HOURS, PREDICTION_SCHEMA
from src.iceberg.features import create_trajectory_features


def predict_persistence_baseline(
    df: pd.DataFrame,
    horizons: list[int] | None = None
) -> pd.DataFrame:
    """Predict future iceberg positions assuming constant velocity (persistence baseline).

    Assumes each iceberg continues along its most recent latitude and longitude velocity
    vectors (velocity_lat_deg_per_hr and velocity_lon_deg_per_hr) over the forecast horizon H.

    Parameters
    ----------
    df : pd.DataFrame
        Cleaned tracking DataFrame.
    horizons : list[int] | None
        List of forecast horizons in hours (default: config.FORECAST_HORIZONS_HOURS [24, 72, 168]).

    Returns
    -------
    pd.DataFrame
        DataFrame of baseline predicted positions matching config.PREDICTION_SCHEMA.
    """
    if horizons is None:
        horizons = FORECAST_HORIZONS_HOURS

    # Ensure velocity features are computed
    if 'velocity_lat_deg_per_hr' not in df.columns or 'velocity_lon_deg_per_hr' not in df.columns:
        df_feat = create_trajectory_features(df)
    else:
        df_feat = df.copy()

    df_feat = df_feat.sort_values(by=['iceberg_id', 'timestamp']).reset_index(drop=True)

    results: list[pd.DataFrame] = []

    for H in horizons:
        sub_df = df_feat.copy()

        origin_lat = sub_df['latitude']
        origin_lon = sub_df['longitude']
        vel_lat = sub_df['velocity_lat_deg_per_hr'].fillna(0.0)
        vel_lon = sub_df['velocity_lon_deg_per_hr'].fillna(0.0)
        speed = sub_df['speed_kmh'].fillna(0.0) if 'speed_kmh' in sub_df.columns else pd.Series(0.0, index=sub_df.index)

        pred_lat = origin_lat + (vel_lat * H)
        pred_lon = origin_lon + (vel_lon * H)

        # Clip predicted latitude to valid geographical boundaries [-90, 90] and wrap longitude [-180, 180]
        pred_lat = pred_lat.clip(-90.0, 90.0)
        pred_lon = ((pred_lon + 180.0) % 360.0) - 180.0

        orig_ts = sub_df['timestamp']
        pred_ts = orig_ts + pd.Timedelta(hours=H)

        res_df = pd.DataFrame({
            'iceberg_id': sub_df['iceberg_id'],
            'origin_timestamp': orig_ts,
            'horizon_hours': H,
            'predicted_timestamp': pred_ts,
            'predicted_latitude': pred_lat,
            'predicted_longitude': pred_lon,
            'predicted_speed_kmh': speed,
            'iceberg_risk': 0.0,
        })
        results.append(res_df)

    out_df = pd.concat(results, ignore_index=True)
    return out_df[PREDICTION_SCHEMA]
