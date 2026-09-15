from fastapi import APIRouter, Query
from app.services.ocean_service import ocean_service
from app.schemas.ocean import OceanResponse

router = APIRouter(prefix="/api/ocean", tags=["OCEAN"])

@router.get("", response_model=OceanResponse, summary="Get oceanographic and hydrodynamic conditions")
async def get_ocean(
    lat: float = Query(-64.82, ge=-90.0, le=90.0, description="Observation latitude"),
    lon: float = Query(-58.25, ge=-180.0, le=180.0, description="Observation longitude")
):
    """Retrieve sea surface temperature, significant wave heights, peak period, and Ekman ocean current vectors."""
    return ocean_service.get_ocean(lat, lon)
