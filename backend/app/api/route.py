from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database import crud
from app.services.routing_service import routing_service
from app.schemas.route import (
    RouteOptimizeRequest, RouteOptimizeResponse,
    ScenarioSimulateRequest, ScenarioSimulateResponse
)

router = APIRouter(prefix="", tags=["ROUTING"])

@router.post("/api/route/optimize", response_model=RouteOptimizeResponse, summary="Optimize multi-objective polar navigation route")
def optimize_route(request: RouteOptimizeRequest, db: Session = Depends(get_db)):
    """
    Execute Pareto A* optimization evaluating sea-ice concentration, iceberg drift cones,
    wind vectors, and wave heights according to user safety, fuel, and time priorities.
    """
    ship_data = None
    target_ship_id = request.ship_id or request.shipId
    if target_ship_id:
        if isinstance(target_ship_id, int) or (isinstance(target_ship_id, str) and target_ship_id.isdigit()):
            ship_obj = crud.get_ship_by_id(db, int(target_ship_id))
            if ship_obj:
                ship_data = {
                    "name": ship_obj.name,
                    "ice_class": ship_obj.ice_class,
                    "normal_speed": ship_obj.normal_speed,
                    "fuel_consumption_rate": ship_obj.fuel_consumption_rate
                }

    try:
        result = routing_service.optimize_route(request.model_dump(), ship_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Routing engine calculation error: {str(e)}")

@router.post("/api/route/compare", summary="Compare alternative navigation strategies")
def compare_routes(request: RouteOptimizeRequest, db: Session = Depends(get_db)):
    """
    Compare Pareto alternatives: Shortest, Safest, Fuel-Efficient, and Balanced routes.
    """
    result = routing_service.optimize_route(request.model_dump())
    return {"options": result["options"]}

@router.post("/api/scenario/simulate", response_model=ScenarioSimulateResponse, summary="Simulate environmental What-If scenario")
def simulate_scenario(request: ScenarioSimulateRequest):
    """
    Simulate adverse polar perturbations (gale winds, sudden pack freeze, wave height jumps)
    and calculate mathematical divergence from baseline route.
    """
    base_result = routing_service.optimize_route({
        "startLat": -64.82,
        "startLon": -58.25,
        "destLat": -67.57,
        "destLon": -68.13,
        "weights": {"safety": 0.7, "fuel": 0.2, "time": 0.1}
    })
    base_route = base_result["recommendedRoute"]

    # Calculate realistic environmental divergence
    fuel_multiplier = 1.0 + (request.windDelta * 0.008) + (request.iceDelta * 0.015) + (request.waveDelta * 0.02)
    time_multiplier = 1.0 + (request.iceDelta * 0.018) + (request.waveDelta * 0.015)
    risk_delta = int(round((request.iceDelta * 0.4) + (request.windDelta * 0.3) + (request.waveDelta * 0.3)))

    distance_mult = 1.06 if request.iceDelta > 10.0 else 1.02
    scenario_dist = round(base_route["distanceKm"] * distance_mult, 1)
    scenario_fuel = int(round(base_route["estimatedFuelLiters"] * fuel_multiplier))
    scenario_time = round(base_route["travelTimeHours"] * time_multiplier, 1)
    scenario_risk = min(100, max(10, base_route["riskScore"] + risk_delta))

    scenario_route = {
        **base_route,
        "id": "scenario-sim",
        "name": "HYPOTHETICAL SCENARIO ROUTE",
        "type": "Simulation",
        "distanceKm": scenario_dist,
        "travelTimeHours": scenario_time,
        "estimatedFuelLiters": scenario_fuel,
        "riskScore": scenario_risk,
        "color": "#E09F3E"
    }

    divergence = {
        "distanceDiffKm": round(scenario_dist - base_route["distanceKm"], 1),
        "fuelDiffLiters": scenario_fuel - base_route["estimatedFuelLiters"],
        "timeDiffHours": round(scenario_time - base_route["travelTimeHours"], 1),
        "riskDiffScore": scenario_risk - base_route["riskScore"]
    }

    wind_sign = "+" if request.windDelta >= 0 else ""
    ice_sign = "+" if request.iceDelta >= 0 else ""
    fuel_pct = round((fuel_multiplier - 1.0) * 100.0, 1)

    impact = (
        f"Under simulated conditions (Wind {wind_sign}{request.windDelta} kn, "
        f"Sea Ice {ice_sign}{request.iceDelta}%), the vessel must deviate to avoid heavy pack ice, "
        f"increasing fuel consumption by {fuel_pct}% and voyage risk score by {divergence['riskDiffScore']} points."
    )

    return {
        "baselineRoute": base_route,
        "scenarioRoute": scenario_route,
        "divergence": divergence,
        "impactSummary": impact
    }
