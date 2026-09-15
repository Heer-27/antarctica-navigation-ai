from typing import Optional
from pydantic import BaseModel

class WeatherResponse(BaseModel):
    timestamp: str
    locationName: str
    latitude: float
    longitude: float
    airTemperature: float
    windSpeed: float
    windDirectionDegrees: float
    windDirectionText: str
    barometricPressure: float
    pressureTrend: str
    visibilityKm: float
    freezingSprayRisk: str
    gustSpeed: float
