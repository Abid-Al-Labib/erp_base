"""Inventory ledger model - tracks all finished goods inventory movements"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base_class import Base


class InventoryLedger(Base):
    """
    Ledger tracking all finished goods inventory transactions.
    Immutable audit trail of all inventory movements for manufactured/finished goods.

    This differs from storage_item_ledger (raw materials) by tracking finished goods.
    Future production and sales modules will create entries in this ledger.
    """

    __tablename__ = "inventory_ledger"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    factory_id = Column(Integer, ForeignKey("factories.id", ondelete="RESTRICT"), nullable=False, index=True)
    item_id = Column(Integer, ForeignKey("items.id", ondelete="RESTRICT"), nullable=False, index=True)

    # === TRANSACTION DETAILS ===
    transaction_type = Column(String(50), nullable=False, index=True)
    # Standard 8 transaction types (same as other ledgers):
    # 1. 'purchase_order' - Finished goods purchased from external supplier
    # 2. 'manual_add' - Admin manually adding inventory
    # 3. 'transfer_in' - Goods coming in from another location
    # 4. 'transfer_out' - Goods going out to another location or sold
    # 5. 'consumption' - Goods consumed/used (future use)
    # 6. 'damaged' - Goods marked as damaged/defective
    # 7. 'inventory_adjustment' - Reconciliation corrections (+/-)
    # 8. 'cost_adjustment' - Adjust cost without quantity change (qty=0)
    #
    # Future extensions (when production/sales modules added):
    # - Use transfer_in with source_type='production' for manufactured goods
    # - Use transfer_out with destination_type='sales_order' for sold goods

    quantity = Column(Integer, nullable=False)
    # Always positive, direction determined by transaction_type
    # For cost_adjustment, quantity = 0

    # === COST TRACKING ===
    unit_cost = Column(Numeric(15, 2), nullable=False)  # Cost per unit at time of transaction
    total_cost = Column(Numeric(15, 2), nullable=False)  # unit_cost * quantity
    # NOTE: For finished goods, unit_cost may represent production cost or purchase cost

    # === STATE TRACKING (for reconciliation) ===
    qty_before = Column(Integer, nullable=False)  # Quantity before this transaction
    qty_after = Column(Integer, nullable=False)   # Quantity after (calculated based on transaction_type)
    value_before = Column(Numeric(15, 2), nullable=True)  # Total value before transaction
    value_after = Column(Numeric(15, 2), nullable=True)   # Total value after transaction

    # TODO: Implement avg_price calculation strategy
    # Options: FIFO, LIFO, Weighted Average, Moving Average
    # Current: Store before/after values, calculate avg on-the-fly in DAO
    avg_price_before = Column(Numeric(15, 2), nullable=True)  # Average price before transaction
    avg_price_after = Column(Numeric(15, 2), nullable=True)   # Average price after transaction

    # === ATTRIBUTION (polymorphic source) ===
    source_type = Column(String(50), nullable=False, index=True)
    # Valid values: 'order', 'manual', 'adjustment', 'invoice_correction', 'transfer',
    #               'production' (future), 'sales_order' (future), 'damage_report'
    source_id = Column(Integer, nullable=True)  # Generic pointer to source entity

    # Denormalized FKs for easy querying
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="SET NULL"), nullable=True, index=True)
    invoice_id = Column(Integer, ForeignKey("account_invoices.id", ondelete="SET NULL"), nullable=True, index=True)
    # Future FKs when production/sales modules added:
    # production_order_id, sales_order_id

    # === TRANSFER CONTEXT ===
    # For transfer_in/transfer_out transactions
    transfer_source_type = Column(String(50), nullable=True)  # 'inventory', 'production', 'external'
    transfer_source_id = Column(Integer, nullable=True)  # factory_id, production_order_id, etc.
    transfer_destination_type = Column(String(50), nullable=True)  # 'inventory', 'sales_order', 'damaged'
    transfer_destination_id = Column(Integer, nullable=True)  # factory_id, sales_order_id, etc.

    # === NOTES & AUDIT ===
    notes = Column(Text, nullable=True)
    performed_by = Column(Integer, ForeignKey("profiles.id", ondelete="SET NULL"), nullable=False, index=True)
    performed_at = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)

    # === RELATIONSHIPS ===
    factory = relationship("Factory", backref="inventory_ledger_entries")
    item = relationship("Item", backref="inventory_ledger_entries")
    order = relationship("Order", backref="inventory_ledger_entries")
    invoice = relationship("AccountInvoice", backref="inventory_ledger_entries")
    performer = relationship("Profile", foreign_keys=[performed_by], backref="inventory_ledger_entries")
    workspace = relationship("Workspace", backref="inventory_ledger_entries")
