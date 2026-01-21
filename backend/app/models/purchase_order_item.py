"""Purchase order item model - items within a purchase order"""
from sqlalchemy import Column, Integer, String, ForeignKey, Text, Numeric, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base_class import Base


class PurchaseOrderItem(Base):
    """
    Individual line items within a purchase order.
    Tracks items being purchased with quantities, pricing, and approval status.
    """

    __tablename__ = "purchase_order_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    purchase_order_id = Column(Integer, ForeignKey("purchase_orders.id", ondelete="CASCADE"), nullable=False, index=True)

    # === LINE ITEM DETAILS ===
    line_number = Column(Integer, nullable=False)  # For ordering (1, 2, 3...)

    # === ITEM ===
    item_id = Column(Integer, ForeignKey("items.id", ondelete="RESTRICT"), nullable=False, index=True)

    # === QUANTITY & PRICING ===
    quantity_ordered = Column(Numeric(15, 2), nullable=False)
    quantity_received = Column(Numeric(15, 2), nullable=False, default=0)  # Track partial deliveries
    unit_price = Column(Numeric(15, 2), nullable=False)
    line_subtotal = Column(Numeric(15, 2), nullable=False)  # quantity_ordered * unit_price

    # === TAX ===
    tax_rate = Column(Numeric(5, 2), nullable=True)  # Percentage
    tax_amount = Column(Numeric(15, 2), nullable=False, default=0)
    line_total = Column(Numeric(15, 2), nullable=False)  # line_subtotal + tax_amount

    # === APPROVAL FLAGS (from old order_parts table) ===
    approved_pending_order = Column(Boolean, nullable=False, default=False)
    approved_office_order = Column(Boolean, nullable=False, default=False)
    approved_budget = Column(Boolean, nullable=False, default=False)
    approved_storage_withdrawal = Column(Boolean, nullable=False, default=False)

    # === APPROVAL TRACKING ===
    pending_approved_by = Column(Integer, ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True)
    pending_approved_at = Column(DateTime, nullable=True)
    office_approved_by = Column(Integer, ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True)
    office_approved_at = Column(DateTime, nullable=True)
    budget_approved_by = Column(Integer, ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True)
    budget_approved_at = Column(DateTime, nullable=True)
    storage_approved_by = Column(Integer, ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True)
    storage_approved_at = Column(DateTime, nullable=True)

    # === DELIVERY TRACKING ===
    expected_delivery_date = Column(DateTime, nullable=True)
    actual_delivery_date = Column(DateTime, nullable=True)

    # === NOTES ===
    notes = Column(Text, nullable=True)

    # === RELATIONSHIPS ===
    purchase_order = relationship("PurchaseOrder", backref="line_items")
    item = relationship("Item", backref="purchase_order_items")
    pending_approver = relationship("Profile", foreign_keys=[pending_approved_by], backref="pending_approved_po_items")
    office_approver = relationship("Profile", foreign_keys=[office_approved_by], backref="office_approved_po_items")
    budget_approver = relationship("Profile", foreign_keys=[budget_approved_by], backref="budget_approved_po_items")
    storage_approver = relationship("Profile", foreign_keys=[storage_approved_by], backref="storage_approved_po_items")
