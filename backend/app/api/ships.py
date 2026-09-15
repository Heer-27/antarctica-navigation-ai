from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database import crud
from app.schemas.ship import ShipCreate, ShipUpdate, ShipResponse

router = APIRouter(prefix="/api/ships", tags=["SHIPS"])

@router.get("", response_model=List[ShipResponse], summary="List all registered research vessels")
def list_ships(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Retrieve all active research vessels in the polar fleet registry."""
    return crud.get_ships(db, skip=skip, limit=limit)

@router.get("/{ship_id}", response_model=ShipResponse, summary="Get vessel specifications by ID")
def get_ship(ship_id: int, db: Session = Depends(get_db)):
    """Retrieve machinery specs, Polar Class, fuel capacity, and assigned coordinates for single vessel."""
    ship = crud.get_ship_by_id(db, ship_id)
    if not ship:
        raise HTTPException(status_code=404, detail=f"Vessel with ID {ship_id} not found.")
    return ship

@router.post("", response_model=ShipResponse, status_code=status.HTTP_201_CREATED, summary="Register a new research vessel")
def register_ship(ship_in: ShipCreate, db: Session = Depends(get_db)):
    """Register an expedition vessel with verified coordinates, Polar Class rating, and fuel burn rates."""
    return crud.create_ship(db, ship_in.model_dump())

@router.put("/{ship_id}", response_model=ShipResponse, summary="Update vessel telemetry and parameters")
def update_ship(ship_id: int, ship_in: ShipUpdate, db: Session = Depends(get_db)):
    """Update position, speed, or mission parameters for an existing vessel."""
    updated = crud.update_ship(db, ship_id, ship_in.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail=f"Vessel with ID {ship_id} not found.")
    return updated

@router.delete("/{ship_id}", status_code=status.HTTP_200_OK, summary="Remove vessel from registry")
def delete_ship(ship_id: int, db: Session = Depends(get_db)):
    """Deregister an expedition vessel from the fleet registry."""
    success = crud.delete_ship(db, ship_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Vessel with ID {ship_id} not found.")
    return {"success": True, "message": f"Vessel {ship_id} successfully deleted."}
