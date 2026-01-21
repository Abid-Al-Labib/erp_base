"""Machine schemas"""
from pydantic import BaseModel, ConfigDict


class MachineBase(BaseModel):
    """Base machine schema"""
    name: str
    is_running: bool
    factory_section_id: int


class MachineCreate(MachineBase):
    """Machine creation schema"""
    pass


class MachineUpdate(BaseModel):
    """Machine update schema"""
    name: str | None = None
    is_running: bool | None = None
    factory_section_id: int | None = None


class MachineResponse(MachineBase):
    """Machine response schema"""
    id: int

    model_config = ConfigDict(from_attributes=True)
