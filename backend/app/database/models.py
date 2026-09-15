from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import (
    Integer, String, Float, DateTime, ForeignKey, Text, JSON, Boolean, Index
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base, TimestampMixin

class SeaIceObservation(Base, TimestampMixin):
    __tablename__ = "sea_ice_observations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=False, index=True)
    longitude: Mapped[float] = mapped_column(Float, nullable=False, index=True)
    observation_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    ice_concentration: Mapped[float] = mapped_column(Float, nullable=False)  # 0 - 100%
    ice_extent: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    surface_temperature: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # °C
    source: Mapped[str] = mapped_column(String(100), default="DEMO_SYNTHETIC")

    __table_args__ = (
        Index("idx_sea_ice_lat_lon_time", "latitude", "longitude", "observation_time"),
    )


class SeaIcePrediction(Base, TimestampMixin):
    __tablename__ = "sea_ice_predictions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=False, index=True)
    longitude: Mapped[float] = mapped_column(Float, nullable=False, index=True)
    prediction_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    target_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    predicted_concentration: Mapped[float] = mapped_column(Float, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=85.0)  # 0 - 100%
    model_version: Mapped[str] = mapped_column(String(50), default="v1.0")


class Iceberg(Base, TimestampMixin):
    __tablename__ = "icebergs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    external_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=False, index=True)
    longitude: Mapped[float] = mapped_column(Float, nullable=False, index=True)
    observation_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    length: Mapped[float] = mapped_column(Float, default=500.0)   # meters
    width: Mapped[float] = mapped_column(Float, default=250.0)    # meters
    height: Mapped[float] = mapped_column(Float, default=40.0)    # meters freeboard
    speed: Mapped[float] = mapped_column(Float, default=1.0)      # knots
    direction: Mapped[float] = mapped_column(Float, default=0.0)  # degrees (0-360)
    source: Mapped[str] = mapped_column(String(100), default="DEMO_SYNTHETIC")

    trajectories: Mapped[List["IcebergTrajectoryPrediction"]] = relationship(
        "IcebergTrajectoryPrediction", back_populates="iceberg", cascade="all, delete-orphan"
    )


class IcebergTrajectoryPrediction(Base, TimestampMixin):
    __tablename__ = "iceberg_trajectory_predictions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    iceberg_id: Mapped[int] = mapped_column(Integer, ForeignKey("icebergs.id"), nullable=False, index=True)
    prediction_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    target_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    predicted_latitude: Mapped[float] = mapped_column(Float, nullable=False)
    predicted_longitude: Mapped[float] = mapped_column(Float, nullable=False)
    probability: Mapped[float] = mapped_column(Float, default=0.85)
    model_version: Mapped[str] = mapped_column(String(50), default="v1.2")

    iceberg: Mapped["Iceberg"] = relationship("Iceberg", back_populates="trajectories")


class WeatherObservation(Base, TimestampMixin):
    __tablename__ = "weather_observations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=False, index=True)
    longitude: Mapped[float] = mapped_column(Float, nullable=False, index=True)
    observation_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    temperature: Mapped[float] = mapped_column(Float, nullable=False)       # °C
    wind_speed: Mapped[float] = mapped_column(Float, nullable=False)        # knots
    wind_direction: Mapped[float] = mapped_column(Float, nullable=False)    # degrees (0-360)
    pressure: Mapped[float] = mapped_column(Float, default=985.0)          # hPa
    precipitation: Mapped[Optional[float]] = mapped_column(Float, default=0.0) # mm
    wave_height: Mapped[Optional[float]] = mapped_column(Float, default=2.0)    # meters
    source: Mapped[str] = mapped_column(String(100), default="DEMO_SYNTHETIC")


class OceanObservation(Base, TimestampMixin):
    __tablename__ = "ocean_observations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=False, index=True)
    longitude: Mapped[float] = mapped_column(Float, nullable=False, index=True)
    observation_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    water_temperature: Mapped[float] = mapped_column(Float, nullable=False)  # °C
    current_speed: Mapped[float] = mapped_column(Float, nullable=False)      # knots
    current_direction: Mapped[float] = mapped_column(Float, nullable=False)  # degrees (0-360)
    wave_height: Mapped[float] = mapped_column(Float, default=2.0)          # meters
    source: Mapped[str] = mapped_column(String(100), default="DEMO_SYNTHETIC")


class Ship(Base, TimestampMixin):
    __tablename__ = "ships"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    destination_latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    destination_longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    destination: Mapped[Optional[str]] = mapped_column(String(150), default="Rothera Station")
    max_speed: Mapped[float] = mapped_column(Float, default=15.0)             # knots
    normal_speed: Mapped[float] = mapped_column(Float, default=11.0)          # knots
    fuel_consumption_rate: Mapped[float] = mapped_column(Float, default=85.0) # L/nm
    fuel_capacity: Mapped[float] = mapped_column(Float, default=950000.0)      # Liters
    ice_class: Mapped[str] = mapped_column(String(100), default="PC3")
    status: Mapped[str] = mapped_column(String(50), default="OPERATIONAL")


class RouteRequest(Base, TimestampMixin):
    __tablename__ = "route_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    ship_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("ships.id"), nullable=True)
    start_latitude: Mapped[float] = mapped_column(Float, nullable=False)
    start_longitude: Mapped[float] = mapped_column(Float, nullable=False)
    destination_latitude: Mapped[float] = mapped_column(Float, nullable=False)
    destination_longitude: Mapped[float] = mapped_column(Float, nullable=False)
    safety_weight: Mapped[float] = mapped_column(Float, default=0.7)
    fuel_weight: Mapped[float] = mapped_column(Float, default=0.2)
    time_weight: Mapped[float] = mapped_column(Float, default=0.1)
    requested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    results: Mapped[List["RouteResult"]] = relationship("RouteResult", back_populates="request", cascade="all, delete-orphan")


class RouteResult(Base, TimestampMixin):
    __tablename__ = "route_results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    route_request_id: Mapped[int] = mapped_column(Integer, ForeignKey("route_requests.id"), nullable=False, index=True)
    route_type: Mapped[str] = mapped_column(String(50), default="balanced")  # shortest, safest, fuel_efficient, balanced
    distance_km: Mapped[float] = mapped_column(Float, nullable=False)
    estimated_time_hours: Mapped[float] = mapped_column(Float, nullable=False)
    estimated_fuel: Mapped[float] = mapped_column(Float, nullable=False)
    safety_score: Mapped[float] = mapped_column(Float, nullable=False)        # 0 - 100
    overall_risk: Mapped[str] = mapped_column(String(50), default="LOW")
    route_geometry: Mapped[dict] = mapped_column(JSON, nullable=False)        # GeoJSON or list of waypoints

    request: Mapped["RouteRequest"] = relationship("RouteRequest", back_populates="results")
