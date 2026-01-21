"""Machine item model (renamed from MachinePart)"""
from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class MachineItem(Base):
    """Machine item model - tracks item inventory per machine"""

    __tablename__ = "machine_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    machine_id = Column(Integer, ForeignKey("machines.id"), nullable=False, index=True)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False, index=True)
    qty = Column(Integer, nullable=False, default=0)
    req_qty = Column(Integer, nullable=True)
    defective_qty = Column(Integer, nullable=True)

    # Relationships
    machine = relationship("Machine", backref="machine_items")
    item = relationship("Item", backref="machine_items")
