"""Machine item endpoints"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_active_user
from app.models.profile import Profile
from app.schemas.machine_item import MachineItemCreate, MachineItemUpdate, MachineItemResponse
from app.dao.machine_item import machine_item_dao


router = APIRouter()


@router.get("/", response_model=List[MachineItemResponse])
def get_machine_items(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=100),
    machine_id: int = Query(None),
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_active_user)
):
    """Get all machine items, optionally filtered by machine"""
    if machine_id:
        items = machine_item_dao.get_by_machine(db, machine_id=machine_id, skip=skip, limit=limit)
    else:
        items = machine_item_dao.get_multi(db, skip=skip, limit=limit)
    return items


@router.get("/{machine_item_id}", response_model=MachineItemResponse)
def get_machine_part(
    machine_item_id: int,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_active_user)
):
    """Get machine item by ID"""
    item = machine_item_dao.get(db, id=machine_item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Machine item not found")
    return item


@router.post("/", response_model=MachineItemResponse, status_code=201)
def create_machine_part(
    item_in: MachineItemCreate,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_active_user)
):
    """Create new machine part"""
    part = machine_item_dao.create(db, obj_in=item_in)
    return part


@router.put("/{machine_item_id}", response_model=MachineItemResponse)
def update_machine_item(
    machine_item_id: int,
    item_in: MachineItemUpdate,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_active_user)
):
    """Update machine item"""
    item = machine_item_dao.get(db, id=machine_item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Machine item not found")
    item = machine_item_dao.update(db, db_obj=item, obj_in=item_in)
    return item


@router.delete("/{machine_item_id}", status_code=204)
def delete_machine_item(
    machine_item_id: int,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_active_user)
):
    """Delete machine item"""
    item = machine_item_dao.get(db, id=machine_item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Machine item not found")
    machine_item_dao.remove(db, id=machine_item_id)
