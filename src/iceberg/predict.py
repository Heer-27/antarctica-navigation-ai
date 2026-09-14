"""Inference module for producing multi-horizon iceberg position predictions."""

import pandas as pd
from sklearn.base import BaseEstimator
from src.iceberg.config import FORECAST_HORIZONS_HOURS, PREDICTION_SCHEMA


def predict_future_positions(
    df: pd.DataFrame,
    model: BaseEstimator,
    horizons: list[int] | None = None
) -> pd.DataFrame:
    """Forecast future iceberg coordinates across specified prediction horizons.

    Parameters
    ----------
    df : pd.DataFrame
        DataFrame containing latest iceberg tracking records and engineered features.
    model : BaseEstimator
        Trained trajectory prediction estimator.
    horizons : list[int] | None
        List of forecast horizons in hours. If None, defaults to config.FORECAST_HORIZONS_HOURS ([24, 72, 168]).

    Returns
    -------
    pd.DataFrame
        DataFrame containing predicted positions structured according to config.PREDICTION_SCHEMA:
        - iceberg_id: Unique identifier for the iceberg.
        - origin_timestamp: Last observed timestamp for that iceberg.
        - horizon_hours: Forecast horizon in hours (24, 72, or 168).
        - predicted_timestamp: Target prediction timestamp (origin_timestamp + horizon_hours).
        - predicted_latitude: Forecasted latitude coordinate.
        - predicted_longitude: Forecasted longitude coordinate.
        - predicted_speed_kmh: Forecasted movement speed in km/h.
        - iceberg_risk: Dynamic risk score heuristic float (0.0 to 1.0).
    """
    if horizons is None:
        horizons = FORECAST_HORIZONS_HOURS

    # TODO: Generate predictions for each horizon using the trained ML model
    raise NotImplementedError("predict_future_positions is not implemented yet.")


def format_predictions(predictions_df: pd.DataFrame) -> pd.DataFrame:
    """Format and standardize predicted trajectory DataFrame for downstream consumers.

    Parameters
    ----------
    predictions_df : pd.DataFrame
        Raw prediction output.

    Returns
    -------
    pd.DataFrame
        Cleaned, schema-compliant prediction DataFrame.
    """
    # TODO: Standardize schema for export/downstream processing
    raise NotImplementedError("format_predictions is not implemented yet.")
