from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import select, desc
from . import models

# --- SHIPS CRUD ---
def get_ships(db: Session, skip: int = 0, limit: int = 100) -> List[models.Ship]:
    return list(db.scalars(select(models.Ship).offset(skip).limit(limit)).all())

def get_ship_by_id(db: Session, ship_id: int) -> Optional[models.Ship]:
    return db.scalar(select(models.Ship).where(models.Ship.id == ship_id))

def create_ship(db: Session, ship_data: dict) -> models.Ship:
    ship = models.Ship(**ship_data)
    db.add(ship)
    db.commit()
    db.refresh(ship)
    return ship

def update_ship(db: Session, ship_id: int, ship_data: dict) -> Optional[models.Ship]:
    ship = get_ship_by_id(db, ship_id)
    if not ship:
        return None
    for key, value in ship_data.items():
        if value is not None and hasattr(ship, key):
            setattr(ship, key, value)
    db.commit()
    db.refresh(ship)
    return ship

def delete_ship(db: Session, ship_id: int) -> bool:
    ship = get_ship_by_id(db, ship_id)
    if not ship:
        return False
    db.delete(ship)
    db.commit()
    return True


# --- ICEBERGS CRUD ---
def get_icebergs(db: Session, min_lat: Optional[float] = None, max_lat: Optional[float] = None,
                 min_lon: Optional[float] = None, max_lon: Optional[float] = None) -> List[models.Iceberg]:
    stmt = select(models.Iceberg)
    if min_lat is not None:
        stmt = stmt.where(models.Iceberg.latitude >= min_lat)
    if max_lat is not None:
        stmt = stmt.where(models.Iceberg.latitude <= max_lat)
    if min_lon is not None:
        stmt = stmt.where(models.Iceberg.longitude >= min_lon)
    if max_lon is not None:
        stmt = stmt.where(models.Iceberg.longitude <= max_lon)
    return list(db.scalars(stmt).all())

def get_iceberg_by_id_or_external(db: Session, identifier: str) -> Optional[models.Iceberg]:
    if identifier.isdigit():
        berg = db.scalar(select(models.Iceberg).where(models.Iceberg.id == int(identifier)))
        if berg:
            return berg
    return db.scalar(select(models.Iceberg).where(models.Iceberg.external_id == identifier))

def create_iceberg(db: Session, berg_data: dict) -> models.Iceberg:
    berg = models.Iceberg(**berg_data)
    db.add(berg)
    db.commit()
    db.refresh(berg)
    return berg


# --- SEA ICE CRUD ---
def get_latest_sea_ice(db: Session, limit: int = 50) -> List[models.SeaIceObservation]:
    stmt = select(models.SeaIceObservation).order_by(desc(models.SeaIceObservation.observation_time)).limit(limit)
    return list(db.scalars(stmt).all())

def create_sea_ice_observation(db: Session, obs_data: dict) -> models.SeaIceObservation:
    obs = models.SeaIceObservation(**obs_data)
    db.add(obs)
    db.commit()
    db.refresh(obs)
    return obs


# --- WEATHER & OCEAN CRUD ---
def get_latest_weather(db: Session, lat: float, lon: float) -> Optional[models.WeatherObservation]:
    # Nearest observation within ~2 degrees
    stmt = (
        select(models.WeatherObservation)
        .where(models.WeatherObservation.latitude.between(lat - 2.5, lat + 2.5))
        .where(models.WeatherObservation.longitude.between(lon - 5.0, lon + 5.0))
        .order_by(desc(models.WeatherObservation.observation_time))
    )
    return db.scalar(stmt)

def get_latest_ocean(db: Session, lat: float, lon: float) -> Optional[models.OceanObservation]:
    stmt = (
        select(models.OceanObservation)
        .where(models.OceanObservation.latitude.between(lat - 2.5, lat + 2.5))
        .where(models.OceanObservation.longitude.between(lon - 5.0, lon + 5.0))
        .order_by(desc(models.OceanObservation.observation_time))
    )
    return db.scalar(stmt)
