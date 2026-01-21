"""drop_status_tracker_table

Revision ID: 208fc645e016
Revises: 001
Create Date: 2025-11-25 16:19:01.105813

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '208fc645e016'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Drop status_tracker table"""
    op.drop_table('status_tracker')


def downgrade() -> None:
    """Recreate status_tracker table if needed"""
    op.create_table(
        'status_tracker',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('workspace_id', sa.Integer(), nullable=False),
        sa.Column('action_at', sa.DateTime(), nullable=False),
        sa.Column('order_id', sa.Integer(), nullable=False),
        sa.Column('action_by_user_id', sa.Integer(), nullable=False),
        sa.Column('status_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['action_by_user_id'], ['profiles.id'], ),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ),
        sa.ForeignKeyConstraint(['status_id'], ['statuses.id'], ),
        sa.ForeignKeyConstraint(['workspace_id'], ['workspaces.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_status_tracker_id', 'status_tracker', ['id'])
    op.create_index('ix_status_tracker_workspace_id', 'status_tracker', ['workspace_id'])
