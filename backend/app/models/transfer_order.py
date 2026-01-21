"""Transfer order model - for internal item movements"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Numeric, Date
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base_class import Base


class TransferOrder(Base):
    """
    Transfer orders for internal movement of items between locations.
    No external accounts involved, no invoices generated.
    """

    __tablename__ = "transfer_orders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)

    # === REFERENCE ===
    transfer_number = Column(String(100), nullable=False, unique=True, index=True)
    # Auto-generated: TR-2025-001

    # === TEMPLATE LINKAGE ===
    order_template_id = Column(Integer, ForeignKey("order_templates.id", ondelete="SET NULL"), nullable=True, index=True)
    # Nullable - only set if generated from template

    # === SOURCE LOCATION ===
    source_location_type = Column(String(50), nullable=False)  # 'storage', 'machine', 'damaged'
    source_location_id = Column(Integer, nullable=False)  # factory_id, machine_id, etc.

    # === DESTINATION LOCATION ===
    destination_location_type = Column(String(50), nullable=False)  # 'storage', 'machine', 'project', 'damaged'
    destination_location_id = Column(Integer, nullable=False)  # factory_id, machine_id, project_component_id, etc.

    # For backward compatibility and easier querying
    src_factory_id = Column(Integer, ForeignKey("factories.id", ondelete="RESTRICT"), nullable=True, index=True)
    src_machine_id = Column(Integer, ForeignKey("machines.id", ondelete="RESTRICT"), nullable=True, index=True)
    dest_factory_id = Column(Integer, ForeignKey("factories.id", ondelete="RESTRICT"), nullable=True, index=True)
    dest_machine_id = Column(Integer, ForeignKey("machines.id", ondelete="RESTRICT"), nullable=True, index=True)
    dest_project_component_id = Column(Integer, ForeignKey("project_components.id", ondelete="RESTRICT"), nullable=True, index=True)

    # === TRANSFER TYPE ===
    transfer_type = Column(String(50), nullable=False, index=True)
    # 'STM' (Storage To Machine), 'MTM' (Machine To Machine), 'STP' (Storage To Project), etc.

    # === DATES ===
    request_date = Column(Date, nullable=False, default=datetime.utcnow)
    scheduled_transfer_date = Column(Date, nullable=True)
    actual_transfer_date = Column(Date, nullable=True)

    # === WORKFLOW ===
    current_status_id = Column(Integer, ForeignKey("statuses.id", ondelete="RESTRICT"), nullable=False, index=True)
    order_workflow_id = Column(Integer, ForeignKey("order_workflows.id", ondelete="RESTRICT"), nullable=True, index=True)

    # === DESCRIPTION & NOTES ===
    description = Column(Text, nullable=True)
    transfer_note = Column(Text, nullable=True)
    internal_note = Column(Text, nullable=True)

    # === AUDIT ===
    created_by = Column(Integer, ForeignKey("profiles.id", ondelete="SET NULL"), nullable=False, index=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_by = Column(Integer, ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True)
    updated_at = Column(DateTime, nullable=True, onupdate=datetime.utcnow)
    completed_by = Column(Integer, ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True)
    completed_at = Column(DateTime, nullable=True)

    # === RELATIONSHIPS ===
    template = relationship("OrderTemplate", backref="generated_transfer_orders")
    src_factory = relationship("Factory", foreign_keys=[src_factory_id], backref="transfer_orders_as_source")
    src_machine = relationship("Machine", foreign_keys=[src_machine_id], backref="transfer_orders_as_source")
    dest_factory = relationship("Factory", foreign_keys=[dest_factory_id], backref="transfer_orders_as_dest")
    dest_machine = relationship("Machine", foreign_keys=[dest_machine_id], backref="transfer_orders_as_dest")
    dest_project_component = relationship("ProjectComponent", backref="transfer_orders")
    current_status = relationship("Status", backref="transfer_orders")
    workflow = relationship("OrderWorkflow", backref="transfer_orders")
    creator = relationship("Profile", foreign_keys=[created_by], backref="created_transfer_orders")
    updater = relationship("Profile", foreign_keys=[updated_by], backref="updated_transfer_orders")
    completer = relationship("Profile", foreign_keys=[completed_by], backref="completed_transfer_orders")
