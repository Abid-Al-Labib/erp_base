"""Inventory ledger schemas - finished goods transaction tracking"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from decimal import Decimal


class InventoryLedgerBase(BaseModel):
    """Base inventory ledger schema"""
    factory_id: int
    item_id: int
    transaction_type: str = Field(
        ...,
        pattern=r'^(purchase_order|manual_add|transfer_in|transfer_out|consumption|damaged|inventory_adjustment|cost_adjustment)$'
    )
    quantity: int = Field(..., ge=0)
    unit_cost: Decimal = Field(..., ge=0)
    total_cost: Decimal = Field(..., ge=0)

    # State tracking
    qty_before: int
    qty_after: int
    value_before: Optional[Decimal] = None
    value_after: Optional[Decimal] = None
    avg_price_before: Optional[Decimal] = None
    avg_price_after: Optional[Decimal] = None

    # Attribution
    source_type: str
    source_id: Optional[int] = None
    order_id: Optional[int] = None
    invoice_id: Optional[int] = None

    # Transfer context
    transfer_source_type: Optional[str] = None
    transfer_source_id: Optional[int] = None
    transfer_destination_type: Optional[str] = None
    transfer_destination_id: Optional[int] = None

    # Notes
    notes: Optional[str] = None


class InventoryLedgerCreate(InventoryLedgerBase):
    """
    Schema for creating an inventory ledger entry.
    """
    workspace_id: int
    performed_by: Optional[int] = None


class InventoryLedgerUpdate(BaseModel):
    """
    Schema for updating an inventory ledger entry.
    Ledger entries are generally immutable - only notes can be updated.
    """
    notes: Optional[str] = None


class InventoryLedgerInDB(InventoryLedgerBase):
    """Inventory ledger schema as stored in database"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    workspace_id: int
    performed_by: int
    performed_at: datetime


class InventoryLedgerResponse(InventoryLedgerInDB):
    """Inventory ledger response schema"""
    pass
