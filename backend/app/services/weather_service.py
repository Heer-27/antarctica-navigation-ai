from datetime import datetime, timezone
from typing import Dict, Any

class WeatherService:
    def get_weather(self, lat: float = -64.82, lon: float = -58.25) -> Dict[str, Any]:
        """Return synoptic polar meteorological observation for coordinates."""
        # Calculate latitude-dependent temperature
        lat_diff = abs(lat) - 60.0
        air_temp = round(-5.0 - (lat_diff * 1.1), 1)

        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "locationName": "Antarctic Peninsula / Weddell Gateway",
            "latitude": lat,
            "longitude": lon,
            "airTemperature": air_temp,
            "windSpeed": 18.2,
            "windDirectionDegrees": 134.0,
            "windDirectionText": "SE",
            "barometricPressure": 982.5,
            "pressureTrend": "FALLING SLOWLY (-1.2 hPa/3h)",
            "visibilityKm": 12.0,
            "freezingSprayRisk": "MODERATE",
            "gustSpeed": 28.5
        }

weather_service = WeatherService()
