"""Baseline model module providing persistence trajectory forecasting."""

import pandas as pd


def predict_persistence_baseline(
    df: pd.DataFrame,
    horizons: list[int] = [6, 12, 24]
) -> pd.DataFrame:
    """Predict future iceberg positions assuming constant velocity (persistence baseline).

    Assumes each iceberg continues along its current speed vector and heading angle over
    the forecast horizon.

    Parameters
    ----------
    df : pd.DataFrame
        DataFrame with latest iceberg position, speed, and heading angle.
    horizons : list[int]
        List of forecast horizons in hours (default: [6, 12, 24]).

    Returns
    -------
    pd.DataFrame
        DataFrame of baseline predicted positions:
        [iceberg_id, forecast_timestamp, horizon_hours, baseline_latitude, baseline_longitude].
    """
    # TODO: Extrapolate iceberg position assuming linear motion based on current speed and bearing
    raise NotImplementedError("predict_persistence_baseline is not implemented yet.")
