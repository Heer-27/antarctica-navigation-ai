from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class ShipBase(BaseModel):
    name: str = Field(..., description="Vessel identification name")
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    destination_latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    destination_longitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    destination: Optional[str] = None
    max_speed: float = Field(15.0, gt=0.0, description="Max design speed in knots")
    normal_speed: float = Field(12.0, gt=0.0, description="Cruising speed in knots")
    fuel_consumption_rate: float = Field(80.0, gt=0.0, description="Tons of fuel per day at cruise")
    fuel_capacity: float = Field(1000000.0, gt=0.0, description="Fuel capacity in liters")
    ice_class: str = Field("PC3", description="Polar Class rating (e.g. PC1 to PC7)")
    status: str = Field("ACTIVE", description="Operating state")

class ShipCreate(ShipBase):
    pass

class ShipUpdate(BaseModel):
    name: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    destination_latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    destination_longitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    destination: Optional[str] = None
    max_speed: Optional[float] = Field(None, gt=0.0)
    normal_speed: Optional[float] = Field(None, gt=0.0)
    fuel_consumption_rate: Optional[float] = Field(None, gt=0.0)
    fuel_capacity: Optional[float] = Field(None, gt=0.0)
    ice_class: Optional[str] = None
    status: Optional[str] = None

class ShipResponse(ShipBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
