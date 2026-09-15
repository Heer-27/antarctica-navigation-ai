from datetime import datetime, timezone
from typing import Dict, Any

class OceanService:
    def get_ocean(self, lat: float = -64.82, lon: float = -58.25) -> Dict[str, Any]:
        """Return oceanographic hydrodynamic telemetry."""
        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "latitude": lat,
            "longitude": lon,
            "seaSurfaceTemperature": -1.6,
            "significantWaveHeight": 2.4,
            "peakWavePeriod": 8.5,
            "currentSpeed": 0.72,
            "currentDirectionDegrees": 142.0,
            "currentDirectionText": "SE",
            "salinityPsu": 34.2,
            "tideState": "FLOOD (+0.4m)"
        }

ocean_service = OceanService()
