from typing import List, Optional
from pydantic import BaseModel, Field

class TrajectoryPoint(BaseModel):
    step: str
    time: str
    latitude: float
    longitude: float
    probability: float = Field(..., ge=0.0, le=100.0)
    speed: float

class IcebergResponse(BaseModel):
    id: str
    name: str
    latitude: float
    longitude: float
    lastObserved: Optional[str] = None
    length: float
    width: float
    height: float
    speed: float
    heading: float
    direction: str
    riskLevel: str
    riskScore: int
    origin: Optional[str] = None
    notes: Optional[str] = None
    trajectory: Optional[List[TrajectoryPoint]] = None

class IcebergListResponse(BaseModel):
    icebergs: List[IcebergResponse]

class IcebergTrajectoryResponse(BaseModel):
    id: str
    name: str
    currentPosition: dict
    speedKnots: float
    headingDegrees: float
    direction: str
    predictionModel: str
    trajectory: List[TrajectoryPoint]

class ProximityAlertResponse(BaseModel):
    severity: str
    icebergId: str
    icebergName: str
    closestApproachKm: float
    estimatedTimeToCpaHours: float
    riskCategory: str
    coordinates: List[float]
    message: str
