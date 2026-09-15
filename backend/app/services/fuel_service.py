"""
Marine engineering fuel consumption model for polar research vessels.
Note: This is an engineering decision-support approximation for the project,
not a certified ship naval architecture fuel curve.
"""

from typing import Dict, Any

def calculate_fuel_consumption(
    distance_km: float,
    sea_ice_concentration: float,
    wind_speed_knots: float,
    wave_height_meters: float,
    ship_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Calculate estimated marine gas oil (MGO) bunker fuel consumption in Liters.
    Base consumption: Distance (nm) * Fuel rate (L/nm).
    Environmental resistance:
    - Sea-ice compact resistance penalty
    - Headwind aerodynamic form drag
    - Significant wave resistance
    """
    dist_nm = distance_km * 0.539957
    normal_speed = ship_data.get("normal_speed", 11.2)
    burn_rate = ship_data.get("fuel_consumption_rate", 85.0)

    # Base calm-water consumption
    base_fuel = dist_nm * burn_rate

    # Environmental resistance multipliers:
    # 1. Ice resistance: up to +60% in heavy pack ice
    ice_penalty = (sea_ice_concentration / 100.0) * 0.60

    # 2. Wind drag: 0.8% per knot over 15 knots
    wind_penalty = max(0.0, (wind_speed_knots - 15.0) * 0.008)

    # 3. Wave slamming penalty: 3% per meter over 1.5m
    wave_penalty = max(0.0, (wave_height_meters - 1.5) * 0.03)

    total_multiplier = 1.0 + ice_penalty + wind_penalty + wave_penalty
    total_fuel_liters = int(round(base_fuel * total_multiplier))

    # Calculate effective speed and transit duration
    speed_reduction = max(0.4, 1.0 - (sea_ice_concentration / 100.0) * 0.5)
    effective_speed = normal_speed * speed_reduction
    travel_time_hours = round(distance_km / (effective_speed * 1.852), 1)

    return {
        "estimated_fuel_liters": total_fuel_liters,
        "travel_time_hours": travel_time_hours,
        "base_fuel_liters": int(round(base_fuel)),
        "environmental_multiplier": round(total_multiplier, 2),
        "effective_speed_knots": round(effective_speed, 1)
    }
