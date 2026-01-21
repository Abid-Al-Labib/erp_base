"""Expense order item model - line items within an expense order"""
from sqlalchemy import Column, Integer, String, ForeignKey, Text, Numeric, Boolean
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class ExpenseOrderItem(Base):
    """
    Individual line items within an expense order.
    Examples: electricity bill, employee salary, service fees, etc.
    """

    __tablename__ = "expense_order_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    expense_order_id = Column(Integer, ForeignKey("expense_orders.id", ondelete="CASCADE"), nullable=False, index=True)

    # === LINE ITEM DETAILS ===
    line_number = Column(Integer, nullable=False)  # For ordering (1, 2, 3...)
    description = Column(Text, nullable=False)  # "Electricity", "John Doe Salary", "Emergency Repair", etc.

    # === ACCOUNT (can override parent) ===
    account_id = Column(Integer, ForeignKey("accounts.id", ondelete="RESTRICT"), nullable=True, index=True)
    # Nullable - can use parent expense_order.account_id, or specify different account per line

    # === QUANTITY & PRICING ===
    quantity = Column(Numeric(15, 2), nullable=False, default=1)
    unit = Column(String(50), nullable=True)  # 'service', 'hours', 'kWh', 'month', 'unit', etc.
    unit_price = Column(Numeric(15, 2), nullable=False)
    line_subtotal = Column(Numeric(15, 2), nullable=False)  # quantity * unit_price

    # === TAX ===
    tax_rate = Column(Numeric(5, 2), nullable=True)  # Percentage
    tax_amount = Column(Numeric(15, 2), nullable=False, default=0)
    line_total = Column(Numeric(15, 2), nullable=False)  # line_subtotal + tax_amount

    # === COST ALLOCATION (optional) ===
    cost_center_type = Column(String(50), nullable=True)  # 'factory', 'machine', 'project', 'department'
    cost_center_id = Column(Integer, nullable=True)  # Which entity to charge this expense to

    # For easier querying/reporting
    factory_id = Column(Integer, ForeignKey("factories.id", ondelete="SET NULL"), nullable=True, index=True)
    machine_id = Column(Integer, ForeignKey("machines.id", ondelete="SET NULL"), nullable=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="SET NULL"), nullable=True, index=True)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True, index=True)

    # === CATEGORIZATION ===
    expense_subcategory = Column(String(100), nullable=True)  # More granular than parent category

    # === APPROVAL ===
    approved = Column(Boolean, nullable=False, default=False)

    # === NOTES ===
    notes = Column(Text, nullable=True)

    # === RELATIONSHIPS ===
    expense_order = relationship("ExpenseOrder", backref="line_items")
    account = relationship("Account", backref="expense_order_items")
    factory = relationship("Factory", backref="expense_items")
    machine = relationship("Machine", backref="expense_items")
    project = relationship("Project", backref="expense_items")
    department = relationship("Department", backref="expense_items")
