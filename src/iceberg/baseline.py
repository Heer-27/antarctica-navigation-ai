"""Baseline model module providing persistence trajectory forecasting."""

import pandas as pd
from src.iceberg.config import FORECAST_HORIZONS_HOURS, PREDICTION_SCHEMA


def predict_persistence_baseline(
    df: pd.DataFrame,
    horizons: list[int] | None = None
) -> pd.DataFrame:
    """Predict future iceberg positions assuming constant velocity (persistence baseline).

    Assumes each iceberg continues along its current speed vector and heading angle over
    the forecast horizon.

    Parameters
    ----------
    df : pd.DataFrame
        DataFrame with latest iceberg position, speed, and heading angle.
    horizons : list[int] | None
        List of forecast horizons in hours. If None, defaults to config.FORECAST_HORIZONS_HOURS ([6, 12, 24]).

    Returns
    -------
    pd.DataFrame
        DataFrame of baseline predicted positions matching config.PREDICTION_SCHEMA.
    """
    if horizons is None:
        horizons = FORECAST_HORIZONS_HOURS

    # TODO: Extrapolate iceberg position assuming linear motion based on current speed and bearing
    raise NotImplementedError("predict_persistence_baseline is not implemented yet.")
