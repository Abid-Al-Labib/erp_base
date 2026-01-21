"""Purchase order model - for external procurement with items"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Numeric, Date
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base_class import Base


class PurchaseOrder(Base):
    """
    Purchase orders for external procurement of items.
    Linked to suppliers (accounts) and results in invoices.
    """

    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)

    # === REFERENCE ===
    po_number = Column(String(100), nullable=False, unique=True, index=True)
    # Auto-generated: PO-2025-001

    # === TEMPLATE LINKAGE ===
    order_template_id = Column(Integer, ForeignKey("order_templates.id", ondelete="SET NULL"), nullable=True, index=True)
    # Nullable - only set if generated from template

    # === SUPPLIER (ACCOUNT) ===
    account_id = Column(Integer, ForeignKey("accounts.id", ondelete="RESTRICT"), nullable=False, index=True)
    # Required - which supplier we're buying from

    # === DESTINATION ===
    destination_type = Column(String(50), nullable=False)  # 'storage', 'machine', 'project'
    destination_id = Column(Integer, nullable=False)  # factory_id, machine_id, project_component_id

    # For backward compatibility with old orders table
    factory_id = Column(Integer, ForeignKey("factories.id", ondelete="RESTRICT"), nullable=True, index=True)
    machine_id = Column(Integer, ForeignKey("machines.id", ondelete="RESTRICT"), nullable=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="RESTRICT"), nullable=True, index=True)
    project_component_id = Column(Integer, ForeignKey("project_components.id", ondelete="RESTRICT"), nullable=True, index=True)

    # === PURCHASE TYPE ===
    purchase_type = Column(String(50), nullable=False, index=True)
    # 'PFM' (Purchase For Machine), 'PFS' (Purchase For Storage), 'PFP' (Purchase For Project)

    # === DATES ===
    order_date = Column(Date, nullable=False, default=datetime.utcnow)
    expected_delivery_date = Column(Date, nullable=True)
    actual_delivery_date = Column(Date, nullable=True)

    # === TOTALS (calculated from line items) ===
    subtotal = Column(Numeric(15, 2), nullable=False, default=0)  # Sum of all line items
    tax_total = Column(Numeric(15, 2), nullable=False, default=0)  # Total tax
    total_amount = Column(Numeric(15, 2), nullable=False, default=0)  # subtotal + tax_total

    # === WORKFLOW ===
    current_status_id = Column(Integer, ForeignKey("statuses.id", ondelete="RESTRICT"), nullable=False, index=True)
    order_workflow_id = Column(Integer, ForeignKey("order_workflows.id", ondelete="RESTRICT"), nullable=True, index=True)

    # === INVOICE LINKAGE ===
    invoice_id = Column(Integer, ForeignKey("account_invoices.id", ondelete="SET NULL"), nullable=True, index=True)
    # Nullable - invoice created after approval

    # === DESCRIPTION & NOTES ===
    description = Column(Text, nullable=True)
    order_note = Column(Text, nullable=True)
    internal_note = Column(Text, nullable=True)

    # === AUDIT ===
    created_by = Column(Integer, ForeignKey("profiles.id", ondelete="SET NULL"), nullable=False, index=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_by = Column(Integer, ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True)
    updated_at = Column(DateTime, nullable=True, onupdate=datetime.utcnow)

    # === RELATIONSHIPS ===
    template = relationship("OrderTemplate", backref="generated_purchase_orders")
    account = relationship("Account", backref="purchase_orders")
    factory = relationship("Factory", backref="purchase_orders")
    machine = relationship("Machine", backref="purchase_orders")
    project = relationship("Project", backref="purchase_orders")
    project_component = relationship("ProjectComponent", backref="purchase_orders")
    current_status = relationship("Status", backref="purchase_orders")
    workflow = relationship("OrderWorkflow", backref="purchase_orders")
    invoice = relationship("AccountInvoice", backref="purchase_orders")
    creator = relationship("Profile", foreign_keys=[created_by], backref="created_purchase_orders")
    updater = relationship("Profile", foreign_keys=[updated_by], backref="updated_purchase_orders")
