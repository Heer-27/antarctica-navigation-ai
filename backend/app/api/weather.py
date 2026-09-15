from fastapi import APIRouter, Query
from app.services.weather_service import weather_service
from app.schemas.weather import WeatherResponse

router = APIRouter(prefix="/api/weather", tags=["WEATHER"])

@router.get("", response_model=WeatherResponse, summary="Get synoptic meteorological conditions")
async def get_weather(
    lat: float = Query(-64.82, ge=-90.0, le=90.0, description="Observation latitude"),
    lon: float = Query(-58.25, ge=-180.0, le=180.0, description="Observation longitude")
):
    """Retrieve 10m wind velocity vectors, barometric pressure, air temperature, and freezing spray risk."""
    return weather_service.get_weather(lat, lon)
