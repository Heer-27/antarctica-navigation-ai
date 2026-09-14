"""Feature engineering module for iceberg trajectory ML models."""

import pandas as pd


def compute_velocity_features(df: pd.DataFrame) -> pd.DataFrame:
    """Calculate speed, bearing (heading direction), and spatial displacement vectors.

    Parameters
    ----------
    df : pd.DataFrame
        Preprocessed iceberg tracking DataFrame.

    Returns
    -------
    pd.DataFrame
        DataFrame augmented with speed and direction features.
    """
    # TODO: Implement velocity vector calculations
    raise NotImplementedError("compute_velocity_features is not implemented yet.")


def compute_lag_features(df: pd.DataFrame, lags: list[int] = [1, 2, 3]) -> pd.DataFrame:
    """Generate lagged position and velocity features across recent observation timesteps.

    Parameters
    ----------
    df : pd.DataFrame
        DataFrame with coordinate and velocity attributes.
    lags : list[int]
        List of historical timestep offsets.

    Returns
    -------
    pd.DataFrame
        DataFrame with lag columns appended.
    """
    # TODO: Implement lagged feature generation per iceberg_id
    raise NotImplementedError("compute_lag_features is not implemented yet.")


def create_trajectory_features(df: pd.DataFrame) -> pd.DataFrame:
    """Build the complete feature set required by the trajectory prediction model.

    Parameters
    ----------
    df : pd.DataFrame
        Preprocessed tracking DataFrame.

    Returns
    -------
    pd.DataFrame
        Feature matrix suitable for scikit-learn model training and prediction.
    """
    # TODO: Assemble velocity, lag, and temporal features into feature matrix
    raise NotImplementedError("create_trajectory_features is not implemented yet.")
