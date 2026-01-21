"""Order template model - for creating reusable order templates"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean, Date
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base_class import Base


class OrderTemplate(Base):
    """
    Generic template for auto-generating any type of order (purchase, transfer, expense).
    Can be one-time template or recurring for automation.
    """

    __tablename__ = "order_templates"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)

    # === TEMPLATE TYPE ===
    template_type = Column(String(50), nullable=False, index=True)
    # Valid values: 'purchase', 'transfer', 'expense'

    template_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    # === FOR PURCHASE/EXPENSE TEMPLATES ===
    account_id = Column(Integer, ForeignKey("accounts.id", ondelete="RESTRICT"), nullable=True, index=True)
    # Required for purchase/expense, null for transfer

    # === FOR TRANSFER TEMPLATES ===
    source_location_type = Column(String(50), nullable=True)  # 'storage', 'machine', 'damaged'
    source_location_id = Column(Integer, nullable=True)  # factory_id, machine_id, etc.
    destination_location_type = Column(String(50), nullable=True)  # 'storage', 'machine', 'project', 'damaged'
    destination_location_id = Column(Integer, nullable=True)  # factory_id, machine_id, project_component_id, etc.

    # === RECURRENCE PATTERN ===
    is_recurring = Column(Boolean, nullable=False, default=False)
    recurrence_type = Column(String(50), nullable=True)  # 'daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'annually', 'custom'
    recurrence_interval = Column(Integer, nullable=True)  # For custom patterns: every X days
    recurrence_day = Column(Integer, nullable=True)  # Day of month (1-31) or day of week (0-6)

    # === SCHEDULE ===
    start_date = Column(Date, nullable=True)  # When to start generating (for recurring)
    end_date = Column(Date, nullable=True)  # When to stop (null = indefinite)
    next_generation_date = Column(Date, nullable=True)  # When to generate next order
    last_generated_date = Column(Date, nullable=True)  # Last time order was generated

    # === AUTO-GENERATION SETTINGS ===
    is_active = Column(Boolean, nullable=False, default=True)  # Can pause template
    auto_generate = Column(Boolean, nullable=False, default=False)  # Should system auto-create orders?
    generate_days_before = Column(Integer, nullable=False, default=0)  # Generate X days before due date
    auto_approve = Column(Boolean, nullable=False, default=False)  # Auto-approve generated orders?

    # === WORKFLOW ===
    requires_approval = Column(Boolean, nullable=False, default=True)
    default_approver_id = Column(Integer, ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True)

    # === NOTES ===
    notes = Column(Text, nullable=True)

    # === AUDIT ===
    created_by = Column(Integer, ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_by = Column(Integer, ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True)
    updated_at = Column(DateTime, nullable=True, onupdate=datetime.utcnow)

    # === RELATIONSHIPS ===
    account = relationship("Account", backref="order_templates")
    creator = relationship("Profile", foreign_keys=[created_by], backref="created_templates")
    updater = relationship("Profile", foreign_keys=[updated_by], backref="updated_templates")
    default_approver = relationship("Profile", foreign_keys=[default_approver_id], backref="templates_to_approve")
