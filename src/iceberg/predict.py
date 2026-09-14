"""Inference module for producing multi-horizon iceberg position predictions."""

import pandas as pd
from sklearn.base import BaseEstimator


def predict_future_positions(
    df: pd.DataFrame,
    model: BaseEstimator,
    horizons: list[int] = [6, 12, 24]
) -> pd.DataFrame:
    """Forecast future iceberg coordinates across specified prediction horizons.

    Parameters
    ----------
    df : pd.DataFrame
        DataFrame containing latest iceberg tracking records and engineered features.
    model : BaseEstimator
        Trained trajectory prediction estimator.
    horizons : list[int]
        List of forecast horizons in hours (default: [6, 12, 24]).

    Returns
    -------
    pd.DataFrame
        DataFrame containing predicted positions with columns:
        [iceberg_id, forecast_timestamp, horizon_hours, predicted_latitude, predicted_longitude].
    """
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
