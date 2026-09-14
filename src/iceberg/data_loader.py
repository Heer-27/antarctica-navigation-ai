"""Data loader module for reading raw iceberg tracking data."""

from pathlib import Path
import pandas as pd


def load_iceberg_data(filepath: str | Path) -> pd.DataFrame:
    """Load raw iceberg tracking observations from a CSV or Parquet file.

    Parameters
    ----------
    filepath : str | Path
        Path to the iceberg data file.

    Returns
    -------
    pd.DataFrame
        DataFrame containing iceberg tracking records (e.g., iceberg_id, timestamp, latitude, longitude, speed, direction).
    """
    # TODO: Implement loading logic for CSV/Parquet files
    raise NotImplementedError("load_iceberg_data is not implemented yet.")


def load_sample_iceberg_data() -> pd.DataFrame:
    """Load sample iceberg tracking data for testing and demonstration.

    Returns
    -------
    pd.DataFrame
        Sample DataFrame with representative iceberg positions and timestamps.
    """
    # TODO: Implement sample data loading from data/sample directory
    raise NotImplementedError("load_sample_iceberg_data is not implemented yet.")
