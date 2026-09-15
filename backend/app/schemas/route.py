from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, model_validator
from .common import Coordinates
from .iceberg import ProximityAlertResponse

class OptimizationWeights(BaseModel):
    safety: float = Field(default=0.7, ge=0.0)
    fuel: float = Field(default=0.2, ge=0.0)
    time: float = Field(default=0.1, ge=0.0)

    @model_validator(mode="after")
    def normalize_weights(self):
        total = self.safety + self.fuel + self.time
        if total == 0:
            self.safety, self.fuel, self.time = 0.7, 0.2, 0.1
            return self
        # Auto-normalize whether weights were passed as 0-1 or 0-100 percentages
        self.safety = round(self.safety / total, 3)
        self.fuel = round(self.fuel / total, 3)
        self.time = round(1.0 - (self.safety + self.fuel), 3)
        return self

class RouteOptimizeRequest(BaseModel):
    startLat: Optional[float] = Field(None, ge=-90.0, le=90.0)
    startLon: Optional[float] = Field(None, ge=-180.0, le=180.0)
    destLat: Optional[float] = Field(None, ge=-90.0, le=90.0)
    destLon: Optional[float] = Field(None, ge=-180.0, le=180.0)
    # Also support nested format {"start": {"latitude": ..., "longitude": ...}}
    start: Optional[Coordinates] = None
    destination: Optional[Coordinates] = None
    ship_id: Optional[Any] = None
    shipId: Optional[Any] = None
    weights: Optional[OptimizationWeights] = Field(default_factory=OptimizationWeights)
    safety_weight: Optional[float] = None
    fuel_weight: Optional[float] = None
    time_weight: Optional[float] = None

    @model_validator(mode="after")
    def unify_coordinates(self):
        # Resolve start coordinate
        if self.start:
            self.startLat = self.start.latitude
            self.startLon = self.start.longitude
        elif self.startLat is None or self.startLon is None:
            self.startLat = -64.82
            self.startLon = -58.25

        # Resolve destination coordinate
        if self.destination:
            self.destLat = self.destination.latitude
            self.destLon = self.destination.longitude
        elif self.destLat is None or self.destLon is None:
            self.destLat = -67.57
            self.destLon = -68.13

        # Resolve weights
        if self.safety_weight is not None or self.fuel_weight is not None or self.time_weight is not None:
            s = self.safety_weight or 0.7
            f = self.fuel_weight or 0.2
            t = self.time_weight or 0.1
            self.weights = OptimizationWeights(safety=s, fuel=f, time=t)

        return self

class Waypoint(BaseModel):
    lat: float
    lon: float
    step: str

class RiskBreakdown(BaseModel):
    seaIce: int
    icebergs: int
    weather: int
    ocean: int

class RouteOption(BaseModel):
    id: str
    name: str
    type: str
    distanceKm: float
    travelTimeHours: float
    estimatedFuelLiters: int
    riskScore: int
    riskCategory: str
    summary: str
    riskBreakdown: RiskBreakdown
    color: str
    isRecommended: Optional[bool] = False
    waypoints: List[Waypoint]

class DecisionExplanation(BaseModel):
    title: str
    highlights: List[str]
    tradeoff: str

class RouteSegment(BaseModel):
    id: str
    title: str
    startPoint: str
    endPoint: str
    distanceKm: float
    seaIceConcentration: float
    icebergRisk: str
    windSpeedKnots: float
    waveHeightMeters: float
    currentKnots: float
    currentDirection: str
    fuelEstimateLiters: int

class RouteTimelineMilestone(BaseModel):
    step: str
    timeHours: float
    label: str
    lat: float
    lon: float
    seaIce: float
    weather: str
    icebergRisk: str
    fuelConsumedLiters: int

class RouteOptimizeResponse(BaseModel):
    recommendedRoute: RouteOption
    options: List[RouteOption]
    decisionExplanation: DecisionExplanation
    segments: List[RouteSegment]
    proximityAlert: Optional[ProximityAlertResponse] = None
    timeline: List[RouteTimelineMilestone]

class ScenarioSimulateRequest(BaseModel):
    windDelta: float = Field(default=0.0, description="Wind speed offset in knots")
    iceDelta: float = Field(default=0.0, description="Sea ice concentration offset in %")
    waveDelta: float = Field(default=0.0, description="Wave height offset in meters")
    safetyPreference: Optional[float] = 70.0
    fuelPreference: Optional[float] = 20.0

class ScenarioDivergence(BaseModel):
    distanceDiffKm: float
    fuelDiffLiters: int
    timeDiffHours: float
    riskDiffScore: int

class ScenarioSimulateResponse(BaseModel):
    baselineRoute: RouteOption
    scenarioRoute: RouteOption
    divergence: ScenarioDivergence
    impactSummary: str
