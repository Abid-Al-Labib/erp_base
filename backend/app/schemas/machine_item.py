"""Machine item schemas"""
from pydantic import BaseModel, ConfigDict


class MachineItemBase(BaseModel):
    """Base machine item schema"""
    machine_id: int
    item_id: int
    qty: int
    req_qty: int | None = None
    defective_qty: int | None = None


class MachineItemCreate(MachineItemBase):
    """Machine item creation schema"""
    pass


class MachineItemUpdate(BaseModel):
    """Machine item update schema"""
    qty: int | None = None
    req_qty: int | None = None
    defective_qty: int | None = None


class MachineItemResponse(MachineItemBase):
    """Machine item response schema"""
    id: int

    model_config = ConfigDict(from_attributes=True)
