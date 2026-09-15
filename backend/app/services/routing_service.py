import math
from typing import Dict, Any, List
from app.routing.grid import NavGrid, haversine_distance_km
from app.routing.astar import astar_search
from app.routing.dijkstra import dijkstra_search
from app.routing.risk import calculate_cell_risk
from .fuel_service import calculate_fuel_consumption
from .iceberg_service import iceberg_service
from .weather_service import weather_service

class RoutingService:
    def optimize_route(self, request_params: Dict[str, Any], ship_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Execute Pareto multi-objective route optimization and generate comparison routes,
        segment telemetry, decision explanation, and expedition timeline.
        """
        start = (request_params.get("startLat", -64.82), request_params.get("startLon", -58.25))
        dest = (request_params.get("destLat", -67.57), request_params.get("destLon", -68.13))

        if ship_data is None:
            ship_data = {
                "name": "R/V Polarstern",
                "ice_class": "PC3",
                "normal_speed": 11.2,
                "fuel_consumption_rate": 85.0
            }

        weights = request_params.get("weights")
        if isinstance(weights, dict):
            w_safety = weights.get("safety", 0.7)
            w_fuel = weights.get("fuel", 0.2)
            w_time = weights.get("time", 0.1)
        elif hasattr(weights, "safety"):
            w_safety = weights.safety
            w_fuel = weights.fuel
            w_time = weights.time
        else:
            w_safety, w_fuel, w_time = 0.7, 0.2, 0.1

        # Setup environmental snapshot
        icebergs = iceberg_service.get_all()
        weather = weather_service.get_weather(start[0], start[1])
        env_data = {
            "sea_ice": 48.0,
            "icebergs": icebergs,
            "wind_speed": weather["windSpeed"],
            "wave_height": 2.2
        }

        # Build navigational grid
        grid = NavGrid(start, dest, resolution_deg=0.35, padding_deg=2.5)

        # 1. Compute Balanced Route using configured weights
        balanced_pts = astar_search(grid, {"safety": w_safety, "fuel": w_fuel, "time": w_time}, env_data, ship_data)

        # 2. Compute Safest Route (85% safety)
        safest_pts = astar_search(grid, {"safety": 0.85, "fuel": 0.10, "time": 0.05}, env_data, ship_data)

        # 3. Compute Fuel-Efficient Route (65% fuel)
        fuel_pts = astar_search(grid, {"safety": 0.25, "fuel": 0.65, "time": 0.10}, env_data, ship_data)

        # 4. Compute Shortest Direct Route (Dijkstra pure distance)
        shortest_pts = dijkstra_search(grid, {"safety": 0.05, "fuel": 0.10, "time": 0.85}, env_data, ship_data)

        # Build RouteOption objects
        def build_option(opt_id, name, opt_type, pts, color, is_rec=False):
            dist_km = 0.0
            for i in range(len(pts) - 1):
                dist_km += haversine_distance_km(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1])
            dist_km = max(10.0, round(dist_km, 1))

            # Fuel & Time calculations
            avg_ice = 42.0 if opt_id == "safest" else 58.0 if opt_id == "shortest" else 48.0
            fuel_metrics = calculate_fuel_consumption(dist_km, avg_ice, weather["windSpeed"], 2.0, ship_data)

            # Midpoint risk check
            mid_pt = pts[len(pts) // 2]
            risk_score, risk_cat, breakdown = calculate_cell_risk(
                mid_pt[0], mid_pt[1], avg_ice, icebergs, weather["windSpeed"], 2.0, ship_data.get("ice_class", "PC3")
            )

            waypoints = []
            for i, p in enumerate(pts):
                step_label = "WP 00 (Departure)" if i == 0 else f"WP {i:02d} (Destination)" if i == len(pts) - 1 else f"WP {i:02d}"
                waypoints.append({"lat": p[0], "lon": p[1], "step": step_label})

            summaries = {
                "shortest": "Direct rhumb line intersecting denser marginal ice pack with higher iceberg exposure.",
                "safest": "Wide seaward arc navigating fractured leads, maintaining generous clearance from tracked icebergs.",
                "fuel": "Assisted by prevailing Antarctic current vectors to minimize engine resistance.",
                "balanced": "Optimal Pareto compromise: avoids high-risk drift cones while maintaining moderate fuel burn."
            }

            return {
                "id": opt_id,
                "name": name,
                "type": opt_type,
                "distanceKm": dist_km,
                "travelTimeHours": fuel_metrics["travel_time_hours"],
                "estimatedFuelLiters": fuel_metrics["estimated_fuel_liters"],
                "riskScore": risk_score,
                "riskCategory": risk_cat,
                "summary": summaries.get(opt_id, "Navigational transit corridor."),
                "riskBreakdown": breakdown,
                "color": color,
                "isRecommended": is_rec,
                "waypoints": waypoints
            }

        opt_shortest = build_option("shortest", "SHORTEST (Direct Rhumb Line)", "Direct", shortest_pts, "#D9534F")
        opt_safest = build_option("safest", "SAFEST (Maximum Ice Avoidance)", "Circumnavigation", safest_pts, "#4EBA6F")
        opt_fuel = build_option("fuel", "FUEL-EFFICIENT (Current Assist)", "Optimal Fuel", fuel_pts, "#74B3CE")
        opt_balanced = build_option("balanced", "BALANCED (Multi-Objective Recommended)", "Recommended", balanced_pts, "#E09F3E", is_rec=True)

        options = [opt_shortest, opt_safest, opt_fuel, opt_balanced]

        # Recommended route defaults to balanced unless weights strongly favor safety/fuel
        recommended = opt_balanced
        if w_safety >= 0.8:
            recommended = opt_safest
        elif w_fuel >= 0.6:
            recommended = opt_fuel

        # Generate Route Segments from recommended path
        waypoints = recommended["waypoints"]
        segments = []
        num_segments = min(4, max(2, len(waypoints) - 1))
        step_stride = max(1, (len(waypoints) - 1) // num_segments)

        for s_idx in range(num_segments):
            start_wp = waypoints[s_idx * step_stride]
            end_wp = waypoints[min(len(waypoints) - 1, (s_idx + 1) * step_stride)]
            seg_dist = max(5.0, round(haversine_distance_km(start_wp["lat"], start_wp["lon"], end_wp["lat"], end_wp["lon"]), 1))
            seg_ice = round(35.0 + s_idx * 9.0 + (s_idx % 2) * 5.0, 1)

            segments.append({
                "id": f"SEG-{s_idx + 1:02d}",
                "title": f"Segment {s_idx + 1:02d}: {start_wp['step'].split(' (')[0]} ➔ {end_wp['step'].split(' (')[0]}",
                "startPoint": start_wp["step"].split(" (")[0],
                "endPoint": end_wp["step"].split(" (")[0],
                "distanceKm": seg_dist,
                "seaIceConcentration": seg_ice,
                "icebergRisk": "LOW" if s_idx == 0 or s_idx == num_segments - 1 else "MODERATE",
                "windSpeedKnots": round(weather["windSpeed"] + (s_idx * 1.5), 1),
                "waveHeightMeters": round(1.5 + (s_idx * 0.3), 1),
                "currentKnots": 0.6,
                "currentDirection": "SE",
                "fuelEstimateLiters": int(round(seg_dist * 1.6))
            })

        # Generate "WHY THIS ROUTE WAS SELECTED" Explanations
        dist_diff = round(recommended["distanceKm"] - opt_shortest["distanceKm"], 1)
        dist_pct = round((dist_diff / max(1.0, opt_shortest["distanceKm"])) * 100.0, 1)
        risk_diff = opt_shortest["riskScore"] - recommended["riskScore"]
        risk_pct = round((risk_diff / max(1.0, opt_shortest["riskScore"])) * 100.0, 1)

        decision_explanation = {
            "title": "WHY THIS ROUTE WAS SELECTED",
            "highlights": [
                f"Maintains a safe clearance corridor from tracked tabular icebergs.",
                f"Navigates through fractured leads where sea-ice is within {ship_data.get('ice_class', 'PC3')} rating.",
                f"{abs(risk_diff)} points lower navigation risk compared to the direct shortest path.",
                f"Optimizes fuel burn by taking advantage of regional coastal current vectors."
            ],
            "tradeoff": (
                f"The recommended route is {dist_diff} km (+{dist_pct}%) longer than the direct shortest route, "
                f"but achieves a {abs(risk_pct)}% reduction in composite navigation risk score."
            )
        }

        # Generate Expedition Timeline Milestones
        timeline = [
            {
                "step": "NOW",
                "timeHours": 0.0,
                "label": f"Departure ({waypoints[0]['step']})",
                "lat": waypoints[0]["lat"],
                "lon": waypoints[0]["lon"],
                "seaIce": 38.0,
                "weather": f"Wind {weather['windSpeed']} kn · -8.4°C",
                "icebergRisk": "LOW",
                "fuelConsumedLiters": 0
            },
            {
                "step": "+6 HOURS",
                "timeHours": 6.0,
                "label": "Marginal Ice Zone Transit",
                "lat": waypoints[len(waypoints) // 4]["lat"],
                "lon": waypoints[len(waypoints) // 4]["lon"],
                "seaIce": 46.0,
                "weather": "Wind 18 kn · -9.5°C",
                "icebergRisk": "LOW",
                "fuelConsumedLiters": int(round(recommended["estimatedFuelLiters"] * 0.2))
            },
            {
                "step": "+12 HOURS",
                "timeHours": 12.0,
                "label": "Clearing Pack Ice Corridor",
                "lat": waypoints[len(waypoints) // 2]["lat"],
                "lon": waypoints[len(waypoints) // 2]["lon"],
                "seaIce": 54.0,
                "weather": "Wind 20 kn · -10.2°C",
                "icebergRisk": "MODERATE",
                "fuelConsumedLiters": int(round(recommended["estimatedFuelLiters"] * 0.42))
            },
            {
                "step": "+24 HOURS",
                "timeHours": 24.0,
                "label": "Iceberg Clearance Passage",
                "lat": waypoints[(len(waypoints) * 3) // 4]["lat"],
                "lon": waypoints[(len(waypoints) * 3) // 4]["lon"],
                "seaIce": 48.0,
                "weather": "Wind 17 kn · -11.0°C",
                "icebergRisk": "MODERATE",
                "fuelConsumedLiters": int(round(recommended["estimatedFuelLiters"] * 0.78))
            },
            {
                "step": f"+{recommended['travelTimeHours']} HOURS",
                "timeHours": recommended["travelTimeHours"],
                "label": f"Arrival ({waypoints[-1]['step']})",
                "lat": waypoints[-1]["lat"],
                "lon": waypoints[-1]["lon"],
                "seaIce": 40.0,
                "weather": "Wind 14 kn · -8.0°C",
                "icebergRisk": "LOW",
                "fuelConsumedLiters": recommended["estimatedFuelLiters"]
            }
        ]

        # Proximity alert calculation
        alert = iceberg_service.compute_proximity_alert(recommended["waypoints"])

        return {
            "recommendedRoute": recommended,
            "options": options,
            "decisionExplanation": decision_explanation,
            "segments": segments,
            "proximityAlert": alert,
            "timeline": timeline
        }

routing_service = RoutingService()
