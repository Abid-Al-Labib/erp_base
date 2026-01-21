"""Machine event schemas"""
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.enums import MachineEventTypeEnum


class MachineEventBase(BaseModel):
    """Base machine event schema"""
    machine_id: int
    event_type: MachineEventTypeEnum
    note: str | None = None


class MachineEventCreate(MachineEventBase):
    """Machine event creation schema"""
    initiated_by: int | None = None  # NULL means system initiated


class MachineEventUpdate(BaseModel):
    """Machine event update schema"""
    event_type: MachineEventTypeEnum | None = None
    note: str | None = None


class MachineEventResponse(MachineEventBase):
    """Machine event response schema"""
    id: int
    started_at: datetime
    initiated_by: int | None

    model_config = ConfigDict(from_attributes=True)
