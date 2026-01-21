"""Inventory model - tracks finished goods inventory per factory"""
from sqlalchemy import Column, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class Inventory(Base):
    """
    Inventory model - tracks finished goods inventory snapshot per factory.

    This represents the current state of finished goods at each factory location.
    For full transaction history, see InventoryLedger.

    Note: Unlike storage_items (raw materials/parts), this tracks finished/manufactured goods.
    """

    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False, index=True)
    factory_id = Column(Integer, ForeignKey("factories.id"), nullable=False, index=True)
    qty = Column(Integer, nullable=False, default=0)
    avg_price = Column(Float, nullable=True)  # Average cost to produce/acquire

    # Relationships
    item = relationship("Item", backref="inventory_items")
    factory = relationship("Factory", backref="inventory_items")
    workspace = relationship("Workspace", backref="inventory_items")
