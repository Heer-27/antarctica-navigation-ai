from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel, Field, field_validator

T = TypeVar("T")

class Coordinates(BaseModel):
    """Geographic coordinate pair with strict boundary validation."""
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Latitude in decimal degrees (-90 to +90)")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Longitude in decimal degrees (-180 to +180)")

class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[Any] = None

class APIResponse(BaseModel, Generic[T]):
    """Standardized API response wrapper."""
    success: bool = True
    data: Optional[T] = None
    message: Optional[str] = None
    error: Optional[ErrorDetail] = None
    mode: str = "demo"  # 'demo' or 'live'
