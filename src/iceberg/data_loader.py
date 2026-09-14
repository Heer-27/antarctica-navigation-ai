"""Data loader module for reading and consolidating raw BYU iceberg tracking datasets."""

from pathlib import Path
import pandas as pd
import numpy as np
from src.iceberg.config import RAW_ICEBERG_DIR, NM_TO_KM


def parse_julian_dates(series: pd.Series) -> pd.Series:
    """Parse YYYYDDD (7-digit) and YYDDD (5-digit) Julian dates into UTC pandas DatetimeSeries.

    Parameters
    ----------
    series : pd.Series
        Series containing raw date values as integers or strings.

    Returns
    -------
    pd.Series
        Datetime series with UTC timezone.
    """
    def fix_date_str(val: str) -> str:
        clean_val = str(val).split('.')[0].strip()
        if len(clean_val) == 5:
            yy = int(clean_val[:2])
            year = 1900 + yy if yy >= 70 else 2000 + yy
            return f"{year}{clean_val[2:]}"
        return clean_val

    fixed_series = series.apply(fix_date_str)
    return pd.to_datetime(fixed_series, format='%Y%j', utc=True)


def load_iceberg_tracks(
    data_dir: Path | str | None = None,
    max_files: int | None = None
) -> pd.DataFrame:
    """Read and concatenate raw iceberg tracking CSV files into a unified DataFrame.

    Parameters
    ----------
    data_dir : Path | str | None
        Directory containing raw iceberg CSV files. Defaults to RAW_ICEBERG_DIR.
    max_files : int | None
        Maximum number of CSV files to read for quick testing. If None, reads all files.

    Returns
    -------
    pd.DataFrame
        DataFrame with schema:
        [iceberg_id, timestamp, latitude, longitude, is_observed, sensor, size_major_km, size_minor_km].
        Note: If a sensor has no `_3` flag column, `is_observed` is assumed True (1).
        `size_major_km` and `size_minor_km` are converted from nautical miles using config.NM_TO_KM,
        with 0 or missing sizes represented as NaN.
    """
    if data_dir is None:
        target_dir = RAW_ICEBERG_DIR
    else:
        target_dir = Path(data_dir)

    if not target_dir.exists():
        raise FileNotFoundError(f"Raw data directory does not exist: {target_dir}")

    csv_files = sorted([
        f for f in target_dir.iterdir()
        if f.is_file()
        and f.suffix.lower() == '.csv'
        and not f.name.startswith('#')
        and not f.name.lower().startswith('readme')
    ])

    if max_files is not None:
        csv_files = csv_files[:max_files]

    all_records: list[pd.DataFrame] = []

    for filepath in csv_files:
        iceberg_id = filepath.stem
        try:
            df = pd.read_csv(filepath)
            if 'date' not in df.columns:
                continue

            has_size1 = 'size_1' in df.columns
            has_size2 = 'size_2' in df.columns

            # Identify sensor lat/lon column pairs
            sensor_names = []
            for col in df.columns:
                if col.endswith('_1') and not col.startswith('size'):
                    sensor_name = col[:-2]
                    if f"{sensor_name}_2" in df.columns:
                        sensor_names.append(sensor_name)

            for s in sensor_names:
                lat_col = f"{s}_1"
                lon_col = f"{s}_2"
                flag_col = f"{s}_3"

                # Filter valid non-missing, non-zero coordinates
                valid_mask = (
                    df[lat_col].notna() &
                    df[lon_col].notna() &
                    (df[lat_col] != 0) &
                    (df[lon_col] != 0)
                )

                if not valid_mask.any():
                    continue

                sub_df = df[valid_mask].copy()

                # Determine is_observed (1 = observation -> True, 0 = interpolated -> False)
                # If _3 column is missing, default to True
                if flag_col in sub_df.columns:
                    is_obs = sub_df[flag_col].fillna(1) != 0
                else:
                    is_obs = pd.Series(True, index=sub_df.index)

                # Determine size dimensions in km
                if has_size1:
                    size_maj = sub_df['size_1'].apply(lambda x: float(x) * NM_TO_KM if pd.notna(x) and float(x) > 0 else np.nan)
                else:
                    size_maj = pd.Series(np.nan, index=sub_df.index)

                if has_size2:
                    size_min = sub_df['size_2'].apply(lambda x: float(x) * NM_TO_KM if pd.notna(x) and float(x) > 0 else np.nan)
                else:
                    size_min = pd.Series(np.nan, index=sub_df.index)

                rec_df = pd.DataFrame({
                    'iceberg_id': iceberg_id,
                    'date': sub_df['date'],
                    'latitude': sub_df[lat_col].astype(float),
                    'longitude': sub_df[lon_col].astype(float),
                    'is_observed': is_obs,
                    'sensor': s,
                    'size_major_km': size_maj,
                    'size_minor_km': size_min,
                })
                all_records.append(rec_df)

        except Exception as err:
            print(f"Warning: Failed to load file {filepath.name}: {err}")

    cols = [
        'iceberg_id', 'timestamp', 'latitude', 'longitude',
        'is_observed', 'sensor', 'size_major_km', 'size_minor_km'
    ]

    if not all_records:
        return pd.DataFrame(columns=cols)

    combined_df = pd.concat(all_records, ignore_index=True)
    combined_df['timestamp'] = parse_julian_dates(combined_df['date'])

    return combined_df[cols]


def load_iceberg_data(filepath: Path | str) -> pd.DataFrame:
    """Load single iceberg file (legacy interface wrapper).

    Parameters
    ----------
    filepath : Path | str
        Path to single iceberg CSV.

    Returns
    -------
    pd.DataFrame
        Loaded iceberg tracking DataFrame.
    """
    return load_iceberg_tracks(data_dir=Path(filepath).parent, max_files=1)


def load_sample_iceberg_data() -> pd.DataFrame:
    """Load sample iceberg tracking data for testing.

    Returns
    -------
    pd.DataFrame
        Sample DataFrame from data/sample directory.
    """
    return load_iceberg_tracks(max_files=20)
