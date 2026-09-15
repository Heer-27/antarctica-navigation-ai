from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.services.iceberg_service import iceberg_service
from app.schemas.iceberg import IcebergResponse, IcebergTrajectoryResponse, ProximityAlertResponse

router = APIRouter(prefix="/api/icebergs", tags=["ICEBERGS"])

@router.get("", summary="Get list of all tracked Southern Ocean icebergs")
async def get_all_icebergs(
    min_lat: Optional[float] = Query(None, ge=-90.0, le=90.0),
    max_lat: Optional[float] = Query(None, ge=-90.0, le=90.0),
    min_lon: Optional[float] = Query(None, ge=-180.0, le=180.0),
    max_lon: Optional[float] = Query(None, ge=-180.0, le=180.0)
):
    """Return catalog of active radar-tracked icebergs with spatial bounds filter."""
    icebergs = iceberg_service.get_all()
    if min_lat is not None:
        icebergs = [b for b in icebergs if b["latitude"] >= min_lat]
    if max_lat is not None:
        icebergs = [b for b in icebergs if b["latitude"] <= max_lat]
    if min_lon is not None:
        icebergs = [b for b in icebergs if b["longitude"] >= min_lon]
    if max_lon is not None:
        icebergs = [b for b in icebergs if b["longitude"] <= max_lon]
    return {"icebergs": icebergs}

@router.get("/alerts", summary="Get active iceberg proximity hazard alerts")
async def get_iceberg_alerts():
    """Return active proximity alerts for drifting icebergs approaching transit corridors."""
    # Synthetic default route waypoints near Bransfield Strait corridor
    waypoints = [
        {"lat": -64.82, "lon": -58.25},
        {"lat": -63.50, "lon": -57.00},
        {"lat": -63.00, "lon": -56.50}
    ]
    alert = iceberg_service.compute_proximity_alert(waypoints)
    return {"alerts": [alert] if alert else []}

@router.get("/{iceberg_id}", summary="Get detailed iceberg attributes by ID")
async def get_iceberg_by_id(iceberg_id: str):
    """Retrieve geometry, sail height, drift velocity, and heading for single iceberg."""
    berg = iceberg_service.get_by_id(iceberg_id)
    if not berg:
        raise HTTPException(status_code=404, detail=f"Iceberg {iceberg_id} not found in catalog.")
    return berg

@router.get("/{iceberg_id}/trajectory", summary="Predict Lagrangian iceberg drift trajectory")
async def get_iceberg_trajectory(
    iceberg_id: str,
    forecast_hours: str = Query("6,12,18,24,48", description="Comma-separated list of future hours")
):
    """Predict future coordinates (+6h to +48h) and confidence probabilities using coupled drift ML model."""
    try:
        hours = [int(h.strip()) for h in forecast_hours.split(",") if h.strip().isdigit()]
    except ValueError:
        hours = [6, 12, 18, 24, 48]

    return iceberg_service.get_trajectory(iceberg_id, hours)
