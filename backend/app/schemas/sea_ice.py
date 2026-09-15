from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

class RegionalZone(BaseModel):
    name: str
    center: List[float]
    radiusKm: float
    concentration: float = Field(..., ge=0.0, le=100.0)
    status: str

class SeaIceCurrentResponse(BaseModel):
    timestamp: str
    averageConcentration: float = Field(..., ge=0.0, le=100.0)
    extentSqKm: float
    regionalZones: List[RegionalZone]

class ForecastZone(BaseModel):
    name: str
    center: List[float]
    radiusKm: float
    concentration: float
    forecastHorizon: str

class SeaIceForecastResponse(BaseModel):
    timestamp: str
    forecastHorizon: str
    modelName: str
    confidence: float
    regionalZones: List[ForecastZone]

class HistoryPoint(BaseModel):
    date: str
    concentration: float
    isPredicted: bool = False

class HistoryStats(BaseModel):
    min: float
    max: float
    average: float
    trendPercent: float

class SeaIceHistoryResponse(BaseModel):
    latitude: float
    longitude: float
    points: List[HistoryPoint]
    stats: HistoryStats
