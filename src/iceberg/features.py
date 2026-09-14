"""Feature engineering module for iceberg trajectory ML models."""

import pandas as pd
import numpy as np
from src.iceberg.config import FORECAST_HORIZONS_HOURS


def haversine_km(
    lat1: pd.Series | float,
    lon1: pd.Series | float,
    lat2: pd.Series | float,
    lon2: pd.Series | float
) -> pd.Series | float:
    """Calculate the great-circle distance between two geographic points in kilometers.

    Vectorized implementation over pandas Series, numpy arrays, or scalar floats.
    Serves as the single source of truth for geographic distance in this module.

    Parameters
    ----------
    lat1 : pd.Series | float
        Latitude of the first point(s) in degrees.
    lon1 : pd.Series | float
        Longitude of the first point(s) in degrees.
    lat2 : pd.Series | float
        Latitude of the second point(s) in degrees.
    lon2 : pd.Series | float
        Longitude of the second point(s) in degrees.

    Returns
    -------
    pd.Series | float
        Distance in kilometers.
    """
    R = 6371.0  # Earth radius in kilometers

    phi1 = np.radians(lat1)
    phi2 = np.radians(lat2)
    delta_phi = np.radians(lat2 - lat1)
    delta_lambda = np.radians(lon2 - lon1)

    a = np.sin(delta_phi / 2.0)**2 + np.cos(phi1) * np.cos(phi2) * np.sin(delta_lambda / 2.0)**2
    a = np.clip(a, 0.0, 1.0)
    c = 2.0 * np.arctan2(np.sqrt(a), np.sqrt(1.0 - a))

    return R * c


def calculate_bearing(
    lat1: pd.Series,
    lon1: pd.Series,
    lat2: pd.Series,
    lon2: pd.Series
) -> pd.Series:
    """Calculate initial bearing angle in degrees [0, 360) from point 1 to point 2.

    Parameters
    ----------
    lat1, lon1 : pd.Series
        Origin coordinates in degrees.
    lat2, lon2 : pd.Series
        Destination coordinates in degrees.

    Returns
    -------
    pd.Series
        Bearing in degrees normalized to [0, 360).
    """
    phi1 = np.radians(lat1)
    phi2 = np.radians(lat2)
    delta_lambda = np.radians(lon2 - lon1)

    y = np.sin(delta_lambda) * np.cos(phi2)
    x = np.cos(phi1) * np.sin(phi2) - np.sin(phi1) * np.cos(phi2) * np.cos(delta_lambda)

    bearing_rad = np.arctan2(y, x)
    return (np.degrees(bearing_rad) + 360.0) % 360.0


def compute_velocity_features(df: pd.DataFrame) -> pd.DataFrame:
    """Calculate speed, bearing (heading direction), and spatial displacement vectors.

    Parameters
    ----------
    df : pd.DataFrame
        Preprocessed iceberg tracking DataFrame with [iceberg_id, timestamp, latitude, longitude].

    Returns
    -------
    pd.DataFrame
        DataFrame augmented with:
        [time_delta_hours, displacement_km, velocity_lat_deg_per_hr, velocity_lon_deg_per_hr,
         speed_kmh, bearing_deg, speed_kmh_roll3].
    """
    df_out = df.copy()

    # Ensure dataset is sorted chronologically per iceberg
    df_out = df_out.sort_values(by=['iceberg_id', 'timestamp']).reset_index(drop=True)
    grouped = df_out.groupby('iceberg_id')

    prev_lat = grouped['latitude'].shift(1)
    prev_lon = grouped['longitude'].shift(1)
    prev_time = grouped['timestamp'].shift(1)

    # Time delta in hours
    time_delta = (df_out['timestamp'] - prev_time).dt.total_seconds() / 3600.0
    time_delta = time_delta.where(time_delta > 0, np.nan)

    # Displacement in kilometers
    displacement = haversine_km(prev_lat, prev_lon, df_out['latitude'], df_out['longitude'])
    displacement = displacement.where(prev_lat.notna() & time_delta.notna(), np.nan)

    # Velocity components
    vel_lat = (df_out['latitude'] - prev_lat) / time_delta
    vel_lon = (df_out['longitude'] - prev_lon) / time_delta
    speed = displacement / time_delta
    bearing = calculate_bearing(prev_lat, prev_lon, df_out['latitude'], df_out['longitude'])
    bearing = bearing.where(prev_lat.notna() & time_delta.notna(), np.nan)

    df_out['time_delta_hours'] = time_delta
    df_out['displacement_km'] = displacement
    df_out['velocity_lat_deg_per_hr'] = vel_lat
    df_out['velocity_lon_deg_per_hr'] = vel_lon
    df_out['speed_kmh'] = speed
    df_out['bearing_deg'] = bearing

    # Rolling average speed over window of 3 per iceberg_id
    df_out['speed_kmh_roll3'] = df_out.groupby('iceberg_id')['speed_kmh'].transform(
        lambda s: s.rolling(window=3, min_periods=1).mean()
    )

    return df_out


def compute_lag_features(df: pd.DataFrame, lags: list[int] | None = None) -> pd.DataFrame:
    """Generate lagged position and velocity features across recent observation timesteps.

    Parameters
    ----------
    df : pd.DataFrame
        DataFrame with coordinate and velocity attributes.
    lags : list[int] | None
        List of historical timestep offsets. If None, defaults to [1, 2, 3].

    Returns
    -------
    pd.DataFrame
        DataFrame with lag columns appended.
    """
    if lags is None:
        lags = [1, 2, 3]

    df_out = df.copy()
    grouped = df_out.groupby('iceberg_id')

    for lag in lags:
        df_out[f'latitude_lag{lag}'] = grouped['latitude'].shift(lag)
        df_out[f'longitude_lag{lag}'] = grouped['longitude'].shift(lag)
        if 'speed_kmh' in df_out.columns:
            df_out[f'speed_kmh_lag{lag}'] = grouped['speed_kmh'].shift(lag)

    return df_out


def create_trajectory_features(df: pd.DataFrame) -> pd.DataFrame:
    """Build the complete feature set required by the trajectory prediction model.

    Groups by iceberg_id, orders by timestamp, and produces:
    - time_delta_hours
    - displacement_km
    - velocity_lat_deg_per_hr, velocity_lon_deg_per_hr
    - speed_kmh
    - bearing_deg
    - speed_kmh_roll3
    - month, day_of_year
    - is_observed carried through

    Parameters
    ----------
    df : pd.DataFrame
        Preprocessed tracking DataFrame with columns:
        [iceberg_id, timestamp, latitude, longitude, is_observed, sensor, size_major_km, size_minor_km].

    Returns
    -------
    pd.DataFrame
        Full engineered feature DataFrame.
    """
    # 1. Velocity features
    df_feat = compute_velocity_features(df)

    # 2. Lag features
    df_feat = compute_lag_features(df_feat, lags=[1, 2, 3])

    # 3. Calendar features
    df_feat['month'] = df_feat['timestamp'].dt.month
    df_feat['day_of_year'] = df_feat['timestamp'].dt.dayofyear

    # 4. Ensure is_observed is carried through as integer/boolean
    if 'is_observed' in df_feat.columns:
        df_feat['is_observed'] = df_feat['is_observed'].astype(int)

    return df_feat


def build_training_data(
    df: pd.DataFrame,
    horizons: list[int] | None = None,
    observed_only: bool = False
) -> tuple[pd.DataFrame, pd.DataFrame, pd.Series]:
    """Construct feature matrix X, target matrix y, and timestamps series for trajectory model training.

    Target ground-truth positions are matched for each forecast horizon H in `horizons`
    (defaulting to config.FORECAST_HORIZONS_HOURS [24, 72, 168] hours):
    - For horizon H, finds the observation for that iceberg closest to `origin_timestamp + H hours`.
    - Accepts it only if its timestamp delta from `origin_timestamp + H` is within 0.25 * H hours
      (tolerance: 6h for 24h, 18h for 72h, 42h for 168h).
    - Otherwise, sets the target coordinate to NaN.
    - Targets are named delta_lat_{H}h and delta_lon_{H}h.
    - If `observed_only=True`, filters input origin records to rows where `is_observed` is True.
    - Drops `sensor` (string observation artifact), `iceberg_id`, `timestamp`, and `size_major_km`/`size_minor_km`
      (if non-null coverage is under 30%) from feature matrix X.
    - X, y, and timestamps are aligned by index.

    Parameters
    ----------
    df : pd.DataFrame
        Cleaned iceberg tracks DataFrame.
    horizons : list[int] | None
        Forecast horizons in hours (default: config.FORECAST_HORIZONS_HOURS [24, 72, 168]).
    observed_only : bool
        If True, filter training data to rows where `is_observed` is True. Default False.

    Returns
    -------
    tuple[pd.DataFrame, pd.DataFrame, pd.Series]
        Tuple of (X, y, timestamps) where:
        - X contains feature matrix (without metadata/size/sensor/timestamp columns).
        - y contains target coordinate deltas [delta_lat_{H}h, delta_lon_{H}h].
        - timestamps contains origin observation timestamps aligned by index for date splitting.
    """
    if horizons is None:
        horizons = FORECAST_HORIZONS_HOURS

    df_clean = df.copy()
    if observed_only and 'is_observed' in df_clean.columns:
        df_clean = df_clean[df_clean['is_observed'] == True].reset_index(drop=True)

    df_feat = create_trajectory_features(df_clean)

    target_df = pd.DataFrame(index=df_feat.index)

    right_df = df_clean[['iceberg_id', 'timestamp', 'latitude', 'longitude']].copy()
    right_df = right_df.sort_values(by='timestamp').reset_index(drop=True)

    for H in horizons:
        tol_hours = 0.25 * H
        left_df = df_feat[['iceberg_id', 'timestamp', 'latitude', 'longitude']].copy()
        left_df['target_ideal_time'] = left_df['timestamp'] + pd.Timedelta(hours=H)
        left_df['orig_idx'] = left_df.index
        left_df = left_df.sort_values(by='target_ideal_time').reset_index(drop=True)

        merged = pd.merge_asof(
            left_df,
            right_df,
            by='iceberg_id',
            left_on='target_ideal_time',
            right_on='timestamp',
            direction='nearest',
            tolerance=pd.Timedelta(hours=tol_hours),
            suffixes=('', '_target')
        )

        merged = merged.sort_values(by='orig_idx').set_index('orig_idx')

        delta_lat = merged['latitude_target'] - merged['latitude']
        delta_lon = merged['longitude_target'] - merged['longitude']

        target_df[f'delta_lat_{H}h'] = delta_lat
        target_df[f'delta_lon_{H}h'] = delta_lon

    # Check size column coverage and exclude non-predictive/non-numeric metadata columns from X
    cols_to_drop_from_X = ['iceberg_id', 'timestamp', 'sensor']

    for size_col in ['size_major_km', 'size_minor_km']:
        if size_col in df_feat.columns:
            non_null_count = df_feat[size_col].notna().sum()
            coverage_pct = (non_null_count / len(df_feat)) * 100 if len(df_feat) > 0 else 0.0
            if coverage_pct < 30.0:
                cols_to_drop_from_X.append(size_col)

    X = df_feat.drop(columns=[c for c in cols_to_drop_from_X if c in df_feat.columns])
    y = target_df
    timestamps = df_feat['timestamp']

    return X, y, timestamps
