from fastapi import APIRouter, Query
from app.services.sea_ice_service import sea_ice_service
from app.schemas.sea_ice import SeaIceCurrentResponse, SeaIceForecastResponse, SeaIceHistoryResponse

router = APIRouter(prefix="/api/sea-ice", tags=["SEA ICE"])

@router.get("/current", response_model=SeaIceCurrentResponse, summary="Get latest Antarctic sea-ice concentration")
async def get_current_sea_ice():
    """Return current spatial sea-ice concentration across Southern Ocean sectors."""
    return sea_ice_service.get_current_state()

@router.get("/forecast", response_model=SeaIceForecastResponse, summary="Get sea-ice concentration numerical forecast")
async def get_sea_ice_forecast(
    horizon: str = Query("24h", description="Forecast horizon (+6h, +12h, +24h, +48h, +72h, +5d)")
):
    """Predict sea-ice concentration using trained Random Forest model for given horizon."""
    return sea_ice_service.get_forecast(horizon)

@router.get("/history", response_model=SeaIceHistoryResponse, summary="Get historical sea-ice time series")
async def get_sea_ice_history(
    latitude: float = Query(-70.5, ge=-90.0, le=90.0),
    longitude: float = Query(-45.0, ge=-180.0, le=180.0),
    days: int = Query(14, ge=1, le=90, description="Number of historical days to inspect")
):
    """Query in-situ observation history and calculate localized freezing trend percentage."""
    return sea_ice_service.get_history(latitude, longitude, days)
