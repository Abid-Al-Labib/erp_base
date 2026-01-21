"""Machine endpoints"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_active_user
from app.models.profile import Profile
from app.schemas.machine import MachineCreate, MachineUpdate, MachineResponse
from app.dao.machine import machine_dao


router = APIRouter()


@router.get("/", response_model=List[MachineResponse])
def get_machines(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=100),
    factory_section_id: int = Query(None),
    is_running: bool = Query(None),
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_active_user)
):
    """Get all machines, optionally filtered by factory section or running status"""
    if factory_section_id:
        machines = machine_dao.get_by_section(db, factory_section_id=factory_section_id, skip=skip, limit=limit)
    elif is_running is not None:
        if is_running:
            machines = machine_dao.get_running_machines(db, skip=skip, limit=limit)
        else:
            machines = machine_dao.get_multi(db, skip=skip, limit=limit)
    else:
        machines = machine_dao.get_multi(db, skip=skip, limit=limit)
    return machines


@router.get("/{machine_id}", response_model=MachineResponse)
def get_machine(
    machine_id: int,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_active_user)
):
    """Get machine by ID"""
    machine = machine_dao.get(db, id=machine_id)
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")
    return machine


@router.post("/", response_model=MachineResponse, status_code=201)
def create_machine(
    machine_in: MachineCreate,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_active_user)
):
    """Create new machine"""
    machine = machine_dao.create(db, obj_in=machine_in)
    return machine


@router.put("/{machine_id}", response_model=MachineResponse)
def update_machine(
    machine_id: int,
    machine_in: MachineUpdate,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_active_user)
):
    """Update machine"""
    machine = machine_dao.get(db, id=machine_id)
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")
    machine = machine_dao.update(db, db_obj=machine, obj_in=machine_in)
    return machine


@router.delete("/{machine_id}", status_code=204)
def delete_machine(
    machine_id: int,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_active_user)
):
    """Delete machine"""
    machine = machine_dao.get(db, id=machine_id)
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")
    machine_dao.remove(db, id=machine_id)
