from typing import Tuple, Optional
import pandas as pd
import numpy as np

SEA_ICE_FEATURE_NAMES = [
    "latitude", "longitude", "month", "day_of_year", "prev_concentration",
    "sst", "air_temperature", "wind_speed", "wind_direction",
    "current_speed", "wave_height"
]

def prepare_sea_ice_features(df: pd.DataFrame) -> Tuple[pd.DataFrame, Optional[pd.Series]]:
    """Extract and validate feature matrix X and target vector y."""
    X = df[SEA_ICE_FEATURE_NAMES].copy()
    y = df["target_concentration"].copy() if "target_concentration" in df.columns else None
    return X, y
