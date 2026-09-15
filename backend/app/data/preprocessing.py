import pandas as pd
from typing import Tuple
from app.core.logging_config import logger
from .validator import validate_coordinates, validate_concentration

def clean_sea_ice_dataframe(df: pd.DataFrame) -> Tuple[pd.DataFrame, dict]:
    """
    Clean, validate, and impute sea-ice observation data.
    Logs row counts: received, removed, modified, retained.
    """
    initial_count = len(df)
    
    # 1. Deduplicate
    df = df.drop_duplicates()
    
    # 2. Filter invalid coordinates
    valid_coords = df["latitude"].between(-90.0, 90.0) & df["longitude"].between(-180.0, 180.0)
    df = df[valid_coords]

    # 3. Clip concentration bounds [0, 100]
    if "target_concentration" in df.columns:
        df["target_concentration"] = df["target_concentration"].clip(0.0, 100.0)
    if "prev_concentration" in df.columns:
        df["prev_concentration"] = df["prev_concentration"].clip(0.0, 100.0)

    # 4. Fill minor missing values with column medians
    numeric_cols = df.select_dtypes(include=["number"]).columns
    df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())

    retained_count = len(df)
    stats = {
        "received": initial_count,
        "retained": retained_count,
        "removed": initial_count - retained_count
    }
    logger.info(f"Sea-ice preprocessing complete: {stats['retained']} of {stats['received']} rows retained.")
    return df, stats
