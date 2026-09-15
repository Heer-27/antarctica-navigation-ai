from typing import Dict, Any
from .grid import haversine_distance_km
from .risk import calculate_cell_risk

def compute_edge_cost(
    from_node: tuple,
    to_node: tuple,
    weights: Dict[str, float],
    env_data: Dict[str, Any],
    ship_data: Dict[str, Any]
) -> float:
    """
    Compute normalized multi-objective edge traversal cost for A* / Dijkstra.
    Combines: Distance, Safety (Risk Score), Fuel burn, and Transit time.
    """
    lat1, lon1 = from_node
    lat2, lon2 = to_node

    dist_km = haversine_distance_km(lat1, lon1, lat2, lon2)
    if dist_km <= 0.001:
        return 0.001

    # Environmental lookups (with realistic spatial interpolations)
    sea_ice = env_data.get("sea_ice", 45.0)
    icebergs = env_data.get("icebergs", [])
    wind_speed = env_data.get("wind_speed", 18.0)
    wave_height = env_data.get("wave_height", 2.0)
    ice_class = ship_data.get("ice_class", "PC3")

    risk_score, _, _ = calculate_cell_risk(
        lat2, lon2, sea_ice, icebergs, wind_speed, wave_height, ice_class
    )

    # Calculate vessel speed reduction in compact pack ice
    normal_speed = ship_data.get("normal_speed", 11.2)  # knots
    speed_factor = max(0.3, 1.0 - (sea_ice / 100.0) * 0.6)
    effective_speed_knots = normal_speed * speed_factor

    # Time in hours (1 knot = 1.852 km/h)
    time_hours = dist_km / (effective_speed_knots * 1.852)

    # Fuel burn in Liters (burn rate in L/nm; 1 km = 0.539957 nm)
    dist_nm = dist_km * 0.539957
    burn_rate = ship_data.get("fuel_consumption_rate", 85.0)
    # Fuel multiplier under ice resistance and waves
    fuel_multiplier = 1.0 + (sea_ice / 100.0) * 0.5 + (wave_height / 5.0) * 0.2
    fuel_liters = dist_nm * burn_rate * fuel_multiplier

    # Normalize components (typical segment scale: dist ~ 30km, risk ~ 30, fuel ~ 50L, time ~ 2h)
    norm_dist = dist_km / 30.0
    norm_risk = risk_score / 35.0
    norm_fuel = fuel_liters / 50.0
    norm_time = time_hours / 2.0

    w_safety = weights.get("safety", 0.7)
    w_fuel = weights.get("fuel", 0.2)
    w_time = weights.get("time", 0.1)

    # If risk is critical (>85), add quadratic wall barrier cost to force detour
    barrier = (risk_score - 80) ** 2 * 0.2 if risk_score > 80 else 0.0

    total_cost = (
        norm_dist * 0.2 +
        norm_risk * (w_safety * 2.5) +
        norm_fuel * (w_fuel * 2.0) +
        norm_time * (w_time * 1.5) +
        barrier
    )

    return total_cost
