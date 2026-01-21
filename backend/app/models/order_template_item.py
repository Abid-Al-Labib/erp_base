"""Order template item model - line items for order templates"""
from sqlalchemy import Column, Integer, String, ForeignKey, Text, Numeric, Boolean
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class OrderTemplateItem(Base):
    """
    Line items for order templates.
    Can represent items to purchase, transfer, or expense line items.
    """

    __tablename__ = "order_template_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    order_template_id = Column(Integer, ForeignKey("order_templates.id", ondelete="CASCADE"), nullable=False, index=True)

    # === LINE ITEM DETAILS ===
    line_number = Column(Integer, nullable=False)  # For ordering (1, 2, 3...)
    description = Column(Text, nullable=True)

    # === FOR PURCHASE/TRANSFER TEMPLATES (items) ===
    item_id = Column(Integer, ForeignKey("items.id", ondelete="RESTRICT"), nullable=True, index=True)
    # Required for purchase/transfer templates, null for expense templates

    # === FOR EXPENSE TEMPLATES ===
    account_id = Column(Integer, ForeignKey("accounts.id", ondelete="RESTRICT"), nullable=True, index=True)
    # Can override parent template account_id for mixed-account expenses

    # === QUANTITY & PRICING ===
    quantity = Column(Numeric(15, 2), nullable=False, default=1)
    unit = Column(String(50), nullable=True)  # 'pcs', 'kg', 'hours', 'service', 'month', etc.
    unit_price = Column(Numeric(15, 2), nullable=True)  # Nullable for variable amounts
    is_variable_amount = Column(Boolean, nullable=False, default=False)  # True if amount changes each generation

    # === TAX (optional) ===
    tax_rate = Column(Numeric(5, 2), nullable=True)  # Percentage (e.g., 18.00 for 18%)

    # === COST ALLOCATION (optional) ===
    cost_center_type = Column(String(50), nullable=True)  # 'factory', 'machine', 'project', 'department'
    cost_center_id = Column(Integer, nullable=True)

    # === CATEGORIZATION (for expense items) ===
    expense_subcategory = Column(String(100), nullable=True)  # More granular categorization

    # === NOTES ===
    notes = Column(Text, nullable=True)

    # === RELATIONSHIPS ===
    template = relationship("OrderTemplate", backref="template_items")
    item = relationship("Item", backref="template_items")
    account = relationship("Account", backref="template_items")
