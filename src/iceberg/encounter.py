"""Encounter detection module for identifying spatial proximity risks between icebergs and vessel routes."""

from pathlib import Path
from typing import Any
import numpy as np
import pandas as pd

from src.iceberg.config import DEFAULT_SAFETY_BUFFER_KM, OUTPUTS_DIR
from src.iceberg.features import haversine_km


def detect_route_encounters(
    route: str | Path | pd.DataFrame | list[dict[str, Any]],
    predictions: pd.DataFrame,
    buffer_km: float | None = None
) -> pd.DataFrame:
    """Detect spatial proximity hazards where predicted iceberg positions approach a vessel route.

    Parameters
    ----------
    route : str | Path | pd.DataFrame | list[dict[str, Any]]
        Vessel route waypoints. Accepts a CSV filepath, DataFrame, or list of dicts.
        Must contain [latitude, longitude, timestamp] (or arrival_timestamp).
    predictions : pd.DataFrame
        Predicted iceberg positions output from predict.py matching config.PREDICTION_SCHEMA.
    buffer_km : float | None
        Minimum safe separation distance threshold in kilometers (default: config.DEFAULT_SAFETY_BUFFER_KM [10.0 km]).

    Returns
    -------
    pd.DataFrame
        DataFrame of identified route encounters with schema:
        [iceberg_id, encounter_timestamp, hours_from_now, encounter_latitude,
         encounter_longitude, closest_distance_km, encounter_risk].
    """
    if buffer_km is None:
        buffer_km = DEFAULT_SAFETY_BUFFER_KM

    # 1. Parse route input
    if isinstance(route, (str, Path)):
        route_df = pd.read_csv(route, comment='#')
    elif isinstance(route, list):
        route_df = pd.DataFrame(route)
    elif isinstance(route, pd.DataFrame):
        route_df = route.copy()
    else:
        raise ValueError("route must be a file path, DataFrame, or list of dicts.")

    # Standardize route timestamp column
    ts_col = None
    for col in ['timestamp', 'arrival_timestamp', 'estimated_arrival_timestamp', 'time']:
        if col in route_df.columns:
            ts_col = col
            break

    if ts_col is None:
        raise ValueError("Route must contain a timestamp column (timestamp, arrival_timestamp, etc.).")

    route_df['timestamp'] = pd.to_datetime(route_df[ts_col], utc=True)
    route_df = route_df.sort_values('timestamp').reset_index(drop=True)

    epoch = pd.Timestamp('1970-01-01', tz='UTC')

    if len(route_df) < 2:
        vessel_trajectory = route_df[['timestamp', 'latitude', 'longitude']].copy()
        vessel_trajectory = vessel_trajectory.rename(columns={'latitude': 'vessel_latitude', 'longitude': 'vessel_longitude'})
        vessel_sec = (vessel_trajectory['timestamp'] - epoch).dt.total_seconds().values
    else:
        # Step 1: Interpolate vessel position at 1-hour steps along the route
        min_ts = route_df['timestamp'].min()
        max_ts = route_df['timestamp'].max()
        hourly_range = pd.date_range(start=min_ts, end=max_ts, freq='1h')

        route_sec = (route_df['timestamp'] - epoch).dt.total_seconds().values
        hourly_sec = (hourly_range - epoch).total_seconds().values

        interp_lats = np.interp(hourly_sec, route_sec, route_df['latitude'])
        interp_lons = np.interp(hourly_sec, route_sec, route_df['longitude'])

        vessel_trajectory = pd.DataFrame({
            'timestamp': hourly_range,
            'vessel_latitude': interp_lats,
            'vessel_longitude': interp_lons
        })
        vessel_sec = hourly_sec

    # Step 2: Evaluate encounters against predicted iceberg positions
    encounters = []

    pred_df = predictions.copy()
    pred_df['predicted_timestamp'] = pd.to_datetime(pred_df['predicted_timestamp'], utc=True)
    pred_df['origin_timestamp'] = pd.to_datetime(pred_df['origin_timestamp'], utc=True)

    vessel_lats = vessel_trajectory['vessel_latitude'].values
    vessel_lons = vessel_trajectory['vessel_longitude'].values

    for _, pred_row in pred_df.iterrows():
        pred_ts = pred_row['predicted_timestamp']
        pred_sec = (pred_ts - epoch).total_seconds()

        # Find nearest vessel position in time
        idx_nearest = np.argmin(np.abs(vessel_sec - pred_sec))
        vessel_ts = vessel_trajectory['timestamp'].iloc[idx_nearest]

        time_diff_hours = abs((pred_ts - vessel_ts).total_seconds()) / 3600.0

        if time_diff_hours <= 12.0:
            v_lat = vessel_lats[idx_nearest]
            v_lon = vessel_lons[idx_nearest]
            ice_lat = pred_row['predicted_latitude']
            ice_lon = pred_row['predicted_longitude']

            dist_km = haversine_km(ice_lat, ice_lon, v_lat, v_lon)

            if dist_km < buffer_km:
                orig_ts = pred_row['origin_timestamp']
                hours_from_now = (pred_ts - orig_ts).total_seconds() / 3600.0

                # ENCOUNTER RISK FORMULA:
                # -----------------------
                # dist_ratio = max(0.0, 1.0 - closest_distance_km / buffer_km)
                # time_factor = max(0.0, 1.0 - hours_from_now / 168.0)
                # encounter_risk = clip(0.7 * dist_ratio + 0.3 * time_factor, 0.0, 1.0)
                dist_ratio = max(0.0, 1.0 - (dist_km / buffer_km))
                time_factor = max(0.0, 1.0 - (hours_from_now / 168.0))
                risk = float(np.clip(0.7 * dist_ratio + 0.3 * time_factor, 0.0, 1.0))

                encounters.append({
                    'iceberg_id': pred_row['iceberg_id'],
                    'encounter_timestamp': pred_ts,
                    'hours_from_now': round(hours_from_now, 1),
                    'encounter_latitude': round(ice_lat, 4),
                    'encounter_longitude': round(ice_lon, 4),
                    'closest_distance_km': round(dist_km, 2),
                    'encounter_risk': round(risk, 4),
                })

    enc_cols = [
        'iceberg_id', 'encounter_timestamp', 'hours_from_now',
        'encounter_latitude', 'encounter_longitude', 'closest_distance_km',
        'encounter_risk'
    ]

    if not encounters:
        return pd.DataFrame(columns=enc_cols)

    enc_df = pd.DataFrame(encounters).sort_values('closest_distance_km').reset_index(drop=True)
    return enc_df[enc_cols]


def format_lat_lon(lat: float, lon: float) -> str:
    """Format latitude and longitude with N/S and E/W direction labels."""
    ns = 'S' if lat < 0 else 'N'
    ew = 'W' if lon < 0 else 'E'
    return f"{abs(lat):.1f}{ns}, {abs(lon):.1f}{ew}"


def get_nearest_active_iceberg(
    route: str | Path | pd.DataFrame | list[dict[str, Any]],
    predictions: pd.DataFrame,
    max_time_diff_hours: float = 12.0
) -> dict[str, Any] | None:
    """Find the nearest active predicted iceberg position along a vessel route trajectory.

    Returns dict with keys ['iceberg_id', 'distance_km', 'hour', 'vessel_timestamp', 'predicted_timestamp']
    or None if no predictions match within max_time_diff_hours.
    """
    if isinstance(route, (str, Path)):
        route_df = pd.read_csv(route, comment='#')
    elif isinstance(route, list):
        route_df = pd.DataFrame(route)
    elif isinstance(route, pd.DataFrame):
        route_df = route.copy()
    else:
        raise ValueError("route must be a file path, DataFrame, or list of dicts.")

    ts_col = None
    for col in ['timestamp', 'arrival_timestamp', 'estimated_arrival_timestamp', 'time']:
        if col in route_df.columns:
            ts_col = col
            break

    if ts_col is None:
        raise ValueError("Route must contain a timestamp column.")

    route_df['timestamp'] = pd.to_datetime(route_df[ts_col], utc=True)
    route_df = route_df.sort_values('timestamp').reset_index(drop=True)
    route_start_ts = route_df['timestamp'].min()
    route_end_ts = route_df['timestamp'].max()

    epoch = pd.Timestamp('1970-01-01', tz='UTC')

    if len(route_df) < 2:
        vessel_trajectory = route_df[['timestamp', 'latitude', 'longitude']].rename(columns={'latitude': 'vessel_latitude', 'longitude': 'vessel_longitude'})
        vessel_sec = (vessel_trajectory['timestamp'] - epoch).dt.total_seconds().values
    else:
        hourly_range = pd.date_range(start=route_start_ts, end=route_end_ts, freq='1h')
        route_sec = (route_df['timestamp'] - epoch).dt.total_seconds().values
        hourly_sec = (hourly_range - epoch).total_seconds().values

        interp_lats = np.interp(hourly_sec, route_sec, route_df['latitude'])
        interp_lons = np.interp(hourly_sec, route_sec, route_df['longitude'])

        vessel_trajectory = pd.DataFrame({
            'timestamp': hourly_range,
            'vessel_latitude': interp_lats,
            'vessel_longitude': interp_lons
        })
        vessel_sec = hourly_sec

    pred_df = predictions.copy()
    pred_df['predicted_timestamp'] = pd.to_datetime(pred_df['predicted_timestamp'], utc=True)

    vessel_lats = vessel_trajectory['vessel_latitude'].values
    vessel_lons = vessel_trajectory['vessel_longitude'].values

    min_dist = float('inf')
    best_match = None

    for _, pred_row in pred_df.iterrows():
        pred_ts = pred_row['predicted_timestamp']
        pred_sec = (pred_ts - epoch).total_seconds()

        diffs_sec = np.abs(vessel_sec - pred_sec)
        min_idx = np.argmin(diffs_sec)
        time_diff_hours = diffs_sec[min_idx] / 3600.0

        if time_diff_hours <= max_time_diff_hours:
            d = haversine_km(
                pred_row['predicted_latitude'],
                pred_row['predicted_longitude'],
                vessel_lats[min_idx],
                vessel_lons[min_idx]
            )
            if d < min_dist:
                min_dist = d
                vessel_ts = vessel_trajectory['timestamp'].iloc[min_idx]
                hours_from_start = (vessel_ts - route_start_ts).total_seconds() / 3600.0
                best_match = {
                    'iceberg_id': str(pred_row['iceberg_id']).upper(),
                    'distance_km': int(round(d)),
                    'hour': int(round(hours_from_start)),
                    'vessel_timestamp': vessel_ts,
                    'predicted_timestamp': pred_ts
                }

    return best_match


def summarise_encounters(
    encounters_df: pd.DataFrame,
    buffer_km: float = 10.0,
    route: str | Path | pd.DataFrame | list[dict[str, Any]] | None = None,
    predictions: pd.DataFrame | None = None
) -> str:
    """Produce a concise plain-English summary string of predicted route encounter hazards.

    Designed for consumption by dashboard modules (e.g. Person 5 dashboard UI).

    Parameters
    ----------
    encounters_df : pd.DataFrame
        Encounter DataFrame output from detect_route_encounters.
    buffer_km : float
        Safety buffer distance threshold in kilometers.
    route : str | Path | pd.DataFrame | list[dict[str, Any]] | None
        Optional route input for computing nearest active iceberg when encounters_df is empty.
    predictions : pd.DataFrame | None
        Optional predictions DataFrame for computing nearest active iceberg when encounters_df is empty.

    Returns
    -------
    str
        Plain-English text summary.
    """
    if encounters_df.empty:
        base_msg = f"No encounters within {buffer_km:.0f} km."
        if route is not None and predictions is not None and not predictions.empty:
            nearest = get_nearest_active_iceberg(route, predictions)
            if nearest:
                return f"{base_msg} Nearest time-overlapping active iceberg: {nearest['iceberg_id']} at {nearest['distance_km']} km, hour {nearest['hour']}."
        return base_msg

    n_enc = len(encounters_df)
    earliest_row = encounters_df.sort_values('hours_from_now').iloc[0]

    hours = int(round(earliest_row['hours_from_now']))
    lat = earliest_row['encounter_latitude']
    lon = earliest_row['encounter_longitude']
    coord_str = format_lat_lon(lat, lon)

    iceberg_str = "iceberg encounter" if n_enc == 1 else "iceberg encounters"
    return f"{n_enc} predicted {iceberg_str} within {buffer_km:.0f} km. Earliest in {hours} hours near {coord_str}."


def get_diagnostic_funnel(
    route: str | Path | pd.DataFrame | list[dict[str, Any]],
    predictions: pd.DataFrame,
    buffer_km: float | None = None
) -> dict[str, int]:
    """Compute diagnostic funnel counting total predicted icebergs, icebergs within 100 km, and within safety buffer.

    Parameters
    ----------
    route : str | Path | pd.DataFrame | list[dict[str, Any]]
        Vessel route input.
    predictions : pd.DataFrame
        Predicted iceberg positions DataFrame.
    buffer_km : float | None
        Safety separation distance threshold in kilometers. Defaults to config.DEFAULT_SAFETY_BUFFER_KM (10.0 km).

    Returns
    -------
    dict[str, int]
        Dictionary with keys ['total_predicted', 'within_100km', 'within_buffer'].
    """
    if buffer_km is None:
        buffer_km = DEFAULT_SAFETY_BUFFER_KM

    if isinstance(route, (str, Path)):
        route_df = pd.read_csv(route, comment='#')
    elif isinstance(route, list):
        route_df = pd.DataFrame(route)
    elif isinstance(route, pd.DataFrame):
        route_df = route.copy()
    else:
        raise ValueError("route must be a file path, DataFrame, or list of dicts.")

    ts_col = None
    for col in ['timestamp', 'arrival_timestamp', 'estimated_arrival_timestamp', 'time']:
        if col in route_df.columns:
            ts_col = col
            break

    if ts_col is None:
        raise ValueError("Route must contain a timestamp column.")

    route_df['timestamp'] = pd.to_datetime(route_df[ts_col], utc=True)
    route_df = route_df.sort_values('timestamp').reset_index(drop=True)

    epoch = pd.Timestamp('1970-01-01', tz='UTC')

    if len(route_df) < 2:
        vessel_trajectory = route_df[['timestamp', 'latitude', 'longitude']].rename(columns={'latitude': 'vessel_latitude', 'longitude': 'vessel_longitude'})
        vessel_sec = (vessel_trajectory['timestamp'] - epoch).dt.total_seconds().values
    else:
        min_ts = route_df['timestamp'].min()
        max_ts = route_df['timestamp'].max()
        hourly_range = pd.date_range(start=min_ts, end=max_ts, freq='1h')

        route_sec = (route_df['timestamp'] - epoch).dt.total_seconds().values
        hourly_sec = (hourly_range - epoch).total_seconds().values

        interp_lats = np.interp(hourly_sec, route_sec, route_df['latitude'])
        interp_lons = np.interp(hourly_sec, route_sec, route_df['longitude'])

        vessel_trajectory = pd.DataFrame({
            'timestamp': hourly_range,
            'vessel_latitude': interp_lats,
            'vessel_longitude': interp_lons
        })
        vessel_sec = hourly_sec

    pred_df = predictions.copy()
    pred_df['predicted_timestamp'] = pd.to_datetime(pred_df['predicted_timestamp'], utc=True)

    vessel_lats = vessel_trajectory['vessel_latitude'].values
    vessel_lons = vessel_trajectory['vessel_longitude'].values

    within_100km_set = set()
    within_buffer_set = set()

    for _, pred_row in pred_df.iterrows():
        pred_ts = pred_row['predicted_timestamp']
        pred_sec = (pred_ts - epoch).total_seconds()

        idx_nearest = np.argmin(np.abs(vessel_sec - pred_sec))
        vessel_ts = vessel_trajectory['timestamp'].iloc[idx_nearest]
        time_diff_hours = abs((pred_ts - vessel_ts).total_seconds()) / 3600.0

        if time_diff_hours <= 12.0:
            d = haversine_km(pred_row['predicted_latitude'], pred_row['predicted_longitude'], vessel_lats[idx_nearest], vessel_lons[idx_nearest])
            key = (pred_row['iceberg_id'], pred_row['horizon_hours'])
            if d < 100.0:
                within_100km_set.add(key)
            if d < buffer_km:
                within_buffer_set.add(key)

    return {
        "total_predicted": len(pred_df),
        "within_100km": len(within_100km_set),
        "within_buffer": len(within_buffer_set),
    }


def run_encounter_pipeline(
    route_path: str | Path = "data/sample/demo_route.csv",
    predictions_path: str | Path = "outputs/predictions/iceberg_predictions.csv",
    output_path: str | Path = OUTPUTS_DIR / "route_encounters.csv",
    buffer_km: float = DEFAULT_SAFETY_BUFFER_KM
) -> tuple[pd.DataFrame, str, dict[str, int]]:
    """Run route encounter detection pipeline, write output CSV, and return summary and diagnostic funnel."""
    preds = pd.read_csv(predictions_path)
    enc_df = detect_route_encounters(route_path, preds, buffer_km=buffer_km)

    out_file = Path(output_path)
    out_file.parent.mkdir(parents=True, exist_ok=True)
    enc_df.to_csv(out_file, index=False)

    summary = summarise_encounters(enc_df, buffer_km=buffer_km, route=route_path, predictions=preds)
    funnel = get_diagnostic_funnel(route_path, preds, buffer_km=buffer_km)
    return enc_df, summary, funnel


if __name__ == "__main__":
    enc_df, summary, funnel = run_encounter_pipeline()
    print("\n========================================================")
    print("                ROUTE ENCOUNTER DETECTION               ")
    print("========================================================")
    print(f"DIAGNOSTIC FUNNEL:")
    print(f"  - Total Predicted Iceberg Positions:            {funnel['total_predicted']}")
    print(f"  - Predicted Icebergs Within 100 km of Route:    {funnel['within_100km']}")
    print(f"  - Predicted Icebergs Within Safety Buffer:      {funnel['within_buffer']}")
    print("--------------------------------------------------------")
    print(f"Summary: {summary}")
    print(f"\nEncounters Table (outputs/predictions/route_encounters.csv):")
    print(enc_df.to_string(index=False) if not enc_df.empty else "No encounters detected.")
    print("========================================================\n")
