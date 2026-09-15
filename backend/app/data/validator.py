"""
Validation logic for geospatial datasets and observations.
"""

def validate_coordinates(lat: float, lon: float) -> bool:
    """Validate latitude is in [-90, 90] and longitude in [-180, 180]."""
    return -90.0 <= lat <= 90.0 and -180.0 <= lon <= 180.0

def validate_concentration(conc: float) -> bool:
    """Validate sea-ice concentration is between 0 and 100%."""
    return 0.0 <= conc <= 100.0

def validate_positive_metric(val: float) -> bool:
    """Ensure speed, height, or fuel capacity are strictly non-negative."""
    return val >= 0.0
