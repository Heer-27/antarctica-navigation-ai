from typing import Dict, Any, Tuple
from .grid import haversine_distance_km

RISK_DISCLAIMER = (
    "This risk score is a project-level decision-support indicator and must NOT be used "
    "as a substitute for professional maritime navigation, official ice charts, or vessel safety procedures."
)

POLAR_CLASS_LIMITS = {
    "PC1": 100.0,  # Year-round all polar ice
    "PC2": 95.0,
    "PC3": 85.0,   # R/V Polarstern
    "PC4": 75.0,   # R/V Sir David Attenborough
    "PC5": 65.0,   # S.A. Agulhas II
    "PC6": 50.0,
    "PC7": 40.0
}

def calculate_cell_risk(
    lat: float,
    lon: float,
    sea_ice_concentration: float,
    icebergs: list,
    wind_speed: float,
    wave_height: float,
    ice_class: str = "PC3"
) -> Tuple[float, str, Dict[str, int]]:
    """
    Calculate composite navigation risk score (0-100) and factor breakdown.
    """
    # 1. Sea Ice Risk Factor (0 - 45 pts)
    # Check vessel ice class threshold
    pc_key = ice_class.split(" ")[0].upper()
    max_safe_ice = POLAR_CLASS_LIMITS.get(pc_key, 75.0)

    ice_ratio = min(1.0, sea_ice_concentration / 100.0)
    if sea_ice_concentration > max_safe_ice:
        # Severe penalty if ice exceeds Polar Class capability
        ice_pts = 45.0 * (1.0 + (sea_ice_concentration - max_safe_ice) / 25.0)
    else:
        ice_pts = 45.0 * (ice_ratio ** 1.3)
    ice_pts = min(45.0, ice_pts)

    # 2. Iceberg Proximity Threat (0 - 30 pts)
    # Find distance to closest tracked iceberg
    min_berg_dist_km = 999.0
    for berg in icebergs:
        b_lat = berg.get("latitude", -90)
        b_lon = berg.get("longitude", 0)
        dist = haversine_distance_km(lat, lon, b_lat, b_lon)
        if dist < min_berg_dist_km:
            min_berg_dist_km = dist

    if min_berg_dist_km < 10.0:
        berg_pts = 30.0  # Imminent radar clearance threat
    elif min_berg_dist_km < 25.0:
        berg_pts = 22.0
    elif min_berg_dist_km < 50.0:
        berg_pts = 14.0
    elif min_berg_dist_km < 100.0:
        berg_pts = 6.0
    else:
        berg_pts = 2.0

    # 3. Wind Velocity Factor (0 - 15 pts)
    # 0-15kn = calm/light (2pts), 15-25kn (6pts), 25-35kn gale (11pts), >35kn severe (15pts)
    if wind_speed > 35.0:
        wind_pts = 15.0
    elif wind_speed > 25.0:
        wind_pts = 10.0
    elif wind_speed > 15.0:
        wind_pts = 5.0
    else:
        wind_pts = 2.0

    # 4. Ocean Swell / Wave Height (0 - 10 pts)
    if wave_height > 4.0:
        wave_pts = 10.0
    elif wave_height > 2.5:
        wave_pts = 6.0
    elif wave_height > 1.5:
        wave_pts = 3.0
    else:
        wave_pts = 1.0

    total_score = min(100.0, max(0.0, ice_pts + berg_pts + wind_pts + wave_pts))
    rounded_score = int(round(total_score))

    if rounded_score <= 20:
        category = "VERY LOW"
    elif rounded_score <= 40:
        category = "LOW"
    elif rounded_score <= 60:
        category = "MODERATE"
    elif rounded_score <= 80:
        category = "HIGH"
    else:
        category = "VERY HIGH"

    breakdown = {
        "seaIce": int(round(ice_pts)),
        "icebergs": int(round(berg_pts)),
        "weather": int(round(wind_pts)),
        "ocean": int(round(wave_pts))
    }

    return rounded_score, category, breakdown
