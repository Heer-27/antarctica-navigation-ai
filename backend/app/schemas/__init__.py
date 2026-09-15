"""
Pydantic API schemas.
"""

from .common import Coordinates, APIResponse, ErrorDetail
from .sea_ice import SeaIceCurrentResponse, SeaIceForecastResponse, SeaIceHistoryResponse
from .iceberg import IcebergResponse, IcebergListResponse, IcebergTrajectoryResponse, ProximityAlertResponse
from .weather import WeatherResponse
from .ocean import OceanResponse
from .ship import ShipCreate, ShipUpdate, ShipResponse
from .route import (
    RouteOptimizeRequest, RouteOptimizeResponse, RouteOption, RouteSegment,
    ScenarioSimulateRequest, ScenarioSimulateResponse
)

__all__ = [
    "Coordinates", "APIResponse", "ErrorDetail",
    "SeaIceCurrentResponse", "SeaIceForecastResponse", "SeaIceHistoryResponse",
    "IcebergResponse", "IcebergListResponse", "IcebergTrajectoryResponse", "ProximityAlertResponse",
    "WeatherResponse", "OceanResponse",
    "ShipCreate", "ShipUpdate", "ShipResponse",
    "RouteOptimizeRequest", "RouteOptimizeResponse", "RouteOption", "RouteSegment",
    "ScenarioSimulateRequest", "ScenarioSimulateResponse"
]
