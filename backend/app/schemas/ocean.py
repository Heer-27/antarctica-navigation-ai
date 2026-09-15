from pydantic import BaseModel

class OceanResponse(BaseModel):
    timestamp: str
    latitude: float
    longitude: float
    seaSurfaceTemperature: float
    significantWaveHeight: float
    peakWavePeriod: float
    currentSpeed: float
    currentDirectionDegrees: float
    currentDirectionText: str
    salinityPsu: float
    tideState: str
