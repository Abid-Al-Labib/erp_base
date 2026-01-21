"""add_sales_order_statuses

Revision ID: a1b2c3d4e5f6
Revises: 5cab7419ce7e
Create Date: 2025-12-20 23:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = '5cab7419ce7e'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add default sales order statuses"""
    # Insert default statuses for workspace 1
    # Status 1: Started
    # Status 2: Completed

    op.execute("""
        INSERT INTO statuses (id, workspace_id, name, comment)
        VALUES
            (1, 1, 'Started', 'Sales order has been created and is active'),
            (2, 1, 'Completed', 'Sales order has been fully delivered and closed')
        ON CONFLICT (id) DO NOTHING;
    """)


def downgrade() -> None:
    """Remove default sales order statuses"""
    op.execute("""
        DELETE FROM statuses WHERE id IN (1, 2) AND workspace_id = 1;
    """)
