"""Data preprocessing module for cleaning, filtering, and persisting iceberg tracking data."""

from pathlib import Path
import pandas as pd
from src.iceberg.config import DATA_PROCESSED_DIR, DATA_SAMPLE_DIR, SENSOR_PRIORITY


def clean_tracks(
    df: pd.DataFrame,
    output_path: Path | str | None = None,
    sample_path: Path | str | None = None
) -> pd.DataFrame:
    """Clean and filter raw iceberg tracking observations, printing a summary table of dropped rows.

    Performs the following steps:
    1. Filters missing or zero latitude/longitude coordinates (explaining if done during ingestion).
    2. Sorts observations chronologically by iceberg_id then timestamp.
    3. Resolves multi-sensor duplicates per (iceberg_id, timestamp) based on config.SENSOR_PRIORITY,
       preferring real observations (is_observed == True) over interpolated ones on ties.
    4. Filters spatial boundaries to latitude -90 to -40 and longitude -180 to 180.
    5. Drops icebergs with fewer than 10 total observations.
    6. Prints a summary table of dropped rows and collision resolution breakdown.
    7. Saves full cleaned dataset to data/processed/iceberg_tracks_clean.csv.
    8. Saves first 500 rows to data/sample/iceberg_sample.csv.
    9. Prints final statistics and percentage of interpolated rows (is_observed == False).

    Parameters
    ----------
    df : pd.DataFrame
        Raw concatenated DataFrame with schema:
        [iceberg_id, timestamp, latitude, longitude, is_observed, sensor, size_major_km, size_minor_km].
    output_path : Path | str | None
        Destination path for clean CSV export. Defaults to DATA_PROCESSED_DIR / "iceberg_tracks_clean.csv".
    sample_path : Path | str | None
        Destination path for sample CSV export. Defaults to DATA_SAMPLE_DIR / "iceberg_sample.csv".

    Returns
    -------
    pd.DataFrame
        Cleaned, filtered DataFrame.
    """
    summary_steps: list[dict[str, str | int]] = []
    initial_rows = len(df)
    current_df = df.copy()

    # Step 1: Drop missing lat/lon or lat/lon == 0
    valid_coord = (
        current_df['latitude'].notna() &
        current_df['longitude'].notna() &
        (current_df['latitude'] != 0) &
        (current_df['longitude'] != 0)
    )
    df_step1 = current_df[valid_coord].copy()
    dropped_step1 = len(current_df) - len(df_step1)
    summary_steps.append({
        "Step": "1. Filter missing/zero coordinates",
        "Rows Dropped": f"{dropped_step1} (filtered during ingestion)" if dropped_step1 == 0 else dropped_step1,
        "Rows Remaining": len(df_step1)
    })
    current_df = df_step1

    # Step 2: Sort by iceberg_id then timestamp
    current_df = current_df.sort_values(
        by=['iceberg_id', 'timestamp'],
        ascending=[True, True]
    ).reset_index(drop=True)
    summary_steps.append({
        "Step": "2. Sort by iceberg_id then timestamp",
        "Rows Dropped": 0,
        "Rows Remaining": len(current_df)
    })

    # Step 3: Priority-based multi-sensor duplicate resolution per (iceberg_id, timestamp)
    sensor_rank_map = {sensor: i for i, sensor in enumerate(SENSOR_PRIORITY)}
    current_df['sensor_rank'] = current_df['sensor'].map(sensor_rank_map).fillna(999)
    current_df['obs_rank'] = current_df['is_observed'].apply(lambda x: 0 if x else 1)

    # Count multi-sensor collisions before resolution
    group_sizes = current_df.groupby(['iceberg_id', 'timestamp']).size()
    multi_sensor_collisions = int((group_sizes > 1).sum())
    total_duplicate_rows_dropped = len(current_df) - len(group_sizes)

    # Sort so earliest SENSOR_PRIORITY and real observations come first
    sorted_df = current_df.sort_values(
        by=['iceberg_id', 'timestamp', 'sensor_rank', 'obs_rank'],
        ascending=[True, True, True, True]
    )

    # Keep winning row per (iceberg_id, timestamp)
    dedup_df = sorted_df.drop_duplicates(
        subset=['iceberg_id', 'timestamp'],
        keep='first'
    ).reset_index(drop=True)

    summary_steps.append({
        "Step": "3. Priority-based multi-sensor duplicate resolution",
        "Rows Dropped": total_duplicate_rows_dropped,
        "Rows Remaining": len(dedup_df)
    })

    winning_sensor_counts = dedup_df['sensor'].value_counts()
    current_df = dedup_df.drop(columns=['sensor_rank', 'obs_rank'])

    # Step 4: Filter latitude (-90 to -40) and longitude (-180 to 180)
    valid_range = (
        (current_df['latitude'] >= -90.0) & (current_df['latitude'] <= -40.0) &
        (current_df['longitude'] >= -180.0) & (current_df['longitude'] <= 180.0)
    )
    df_step4 = current_df[valid_range].reset_index(drop=True)
    dropped_step4 = len(current_df) - len(df_step4)
    summary_steps.append({
        "Step": "4. Filter latitude (-90 to -40) & longitude (-180 to 180)",
        "Rows Dropped": f"{dropped_step4} (0 out-of-bounds rows)" if dropped_step4 == 0 else dropped_step4,
        "Rows Remaining": len(df_step4)
    })
    current_df = df_step4

    # Step 5: Drop icebergs with fewer than 10 observations
    obs_counts = current_df.groupby('iceberg_id')['timestamp'].transform('count')
    df_step5 = current_df[obs_counts >= 10].reset_index(drop=True)
    dropped_step5 = len(current_df) - len(df_step5)
    summary_steps.append({
        "Step": "5. Drop icebergs with <10 observations",
        "Rows Dropped": dropped_step5,
        "Rows Remaining": len(df_step5)
    })
    current_df = df_step5

    # Print Summary Table
    summary_df = pd.DataFrame(summary_steps)
    print("\n========================================================")
    print("                DATA CLEANING SUMMARY TABLE             ")
    print("========================================================")
    print(summary_df.to_string(index=False))
    print("========================================================")
    print(f"Total Initial Rows: {initial_rows} | Final Cleaned Rows: {len(current_df)}\n")

    # Print Multi-Sensor Resolution Breakdown
    print("========================================================")
    print("        MULTI-SENSOR COLLISION RESOLUTION BREAKDOWN     ")
    print("========================================================")
    print(f"Total Multi-Sensor Collisions Resolved: {multi_sensor_collisions}")
    print("Winning Sensor Distribution:")
    for sensor_name, count in winning_sensor_counts.items():
        pct = (count / len(current_df)) * 100
        print(f"  - {sensor_name:<10}: {count:>6} rows ({pct:>5.2f}%)")
    print("========================================================\n")

    # Export outputs
    if output_path is None:
        target_output = DATA_PROCESSED_DIR / "iceberg_tracks_clean.csv"
    else:
        target_output = Path(output_path)

    target_output.parent.mkdir(parents=True, exist_ok=True)
    current_df.to_csv(target_output, index=False)

    if sample_path is None:
        target_sample = DATA_SAMPLE_DIR / "iceberg_sample.csv"
    else:
        target_sample = Path(sample_path)

    target_sample.parent.mkdir(parents=True, exist_ok=True)
    current_df.head(500).to_csv(target_sample, index=False)

    # Print Final Statistics
    n_icebergs = current_df['iceberg_id'].nunique()
    n_rows = len(current_df)
    min_date = current_df['timestamp'].min().strftime('%Y-%m-%d') if not current_df.empty else 'N/A'
    max_date = current_df['timestamp'].max().strftime('%Y-%m-%d') if not current_df.empty else 'N/A'

    false_obs_count = int((current_df['is_observed'] == False).sum())
    false_obs_pct = (false_obs_count / n_rows) * 100 if n_rows > 0 else 0.0

    print("========================================================")
    print("               FINAL DATASET STATISTICS                 ")
    print("========================================================")
    print(f"Number of Icebergs: {n_icebergs}")
    print(f"Number of Rows:     {n_rows}")
    print(f"Date Range:         {min_date} to {max_date}")
    print(f"Interpolated Rows (is_observed == False): {false_obs_count} ({false_obs_pct:.2f}%)")
    print("========================================================\n")

    return current_df


def clean_iceberg_data(df: pd.DataFrame) -> pd.DataFrame:
    """Wrapper for legacy interface."""
    return clean_tracks(df)


def sort_iceberg_data(df: pd.DataFrame) -> pd.DataFrame:
    """Sort dataframe chronologically by iceberg_id and timestamp."""
    return df.sort_values(by=['iceberg_id', 'timestamp'], ascending=[True, True]).reset_index(drop=True)


def handle_missing_values(df: pd.DataFrame) -> pd.DataFrame:
    """Filter out missing/zero coordinates."""
    valid = (
        df['latitude'].notna() &
        df['longitude'].notna() &
        (df['latitude'] != 0) &
        (df['longitude'] != 0)
    )
    return df[valid].reset_index(drop=True)


def preprocess_pipeline(df: pd.DataFrame) -> pd.DataFrame:
    """Run full cleaning pipeline."""
    return clean_tracks(df)
