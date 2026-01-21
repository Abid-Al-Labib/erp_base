"""Inventory schemas - finished goods inventory"""
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional


class InventoryBase(BaseModel):
    """Base inventory schema"""
    item_id: int
    factory_id: int
    qty: int = Field(..., ge=0)
    avg_price: Optional[float] = Field(None, ge=0)


class InventoryCreate(InventoryBase):
    """Inventory creation schema (workspace_id injected by service)"""
    pass


class InventoryUpdate(BaseModel):
    """Inventory update schema"""
    qty: Optional[int] = Field(None, ge=0)
    avg_price: Optional[float] = Field(None, ge=0)


class InventoryInDB(InventoryBase):
    """Inventory schema as stored in database"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    workspace_id: int


class InventoryResponse(InventoryInDB):
    """Inventory response schema"""
    pass
