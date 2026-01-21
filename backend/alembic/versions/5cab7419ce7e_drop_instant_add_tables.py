"""drop_instant_add_tables

Revision ID: 5cab7419ce7e
Revises: 208fc645e016
Create Date: 2025-11-25 21:33:11.043778

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '5cab7419ce7e'
down_revision = '208fc645e016'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Drop instant add audit tables"""
    op.drop_table('instant_add_storage_item')
    op.drop_table('instant_add_machine_item')
    op.drop_table('instant_add_damaged_item')


def downgrade() -> None:
    """Recreate instant add audit tables if needed"""
    # instant_add_storage_item
    op.create_table(
        'instant_add_storage_item',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('workspace_id', sa.Integer(), nullable=False),
        sa.Column('added_at', sa.DateTime(), nullable=False),
        sa.Column('factory_id', sa.Integer(), nullable=False),
        sa.Column('item_id', sa.Integer(), nullable=False),
        sa.Column('added_by', sa.Integer(), nullable=False),
        sa.Column('avg_price', sa.Float(), nullable=False),
        sa.Column('qty', sa.Integer(), nullable=False),
        sa.Column('note', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['added_by'], ['profiles.id'], ),
        sa.ForeignKeyConstraint(['factory_id'], ['factories.id'], ),
        sa.ForeignKeyConstraint(['item_id'], ['items.id'], ),
        sa.ForeignKeyConstraint(['workspace_id'], ['workspaces.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_instant_add_storage_item_id', 'instant_add_storage_item', ['id'])
    op.create_index('ix_instant_add_storage_item_workspace_id', 'instant_add_storage_item', ['workspace_id'])
    op.create_index('ix_instant_add_storage_item_factory_id', 'instant_add_storage_item', ['factory_id'])
    op.create_index('ix_instant_add_storage_item_item_id', 'instant_add_storage_item', ['item_id'])

    # instant_add_machine_item
    op.create_table(
        'instant_add_machine_item',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('workspace_id', sa.Integer(), nullable=False),
        sa.Column('added_at', sa.DateTime(), nullable=False),
        sa.Column('machine_id', sa.Integer(), nullable=False),
        sa.Column('item_id', sa.Integer(), nullable=False),
        sa.Column('added_by', sa.Integer(), nullable=False),
        sa.Column('qty', sa.Integer(), nullable=False),
        sa.Column('note', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['added_by'], ['profiles.id'], ),
        sa.ForeignKeyConstraint(['machine_id'], ['machines.id'], ),
        sa.ForeignKeyConstraint(['item_id'], ['items.id'], ),
        sa.ForeignKeyConstraint(['workspace_id'], ['workspaces.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_instant_add_machine_item_id', 'instant_add_machine_item', ['id'])
    op.create_index('ix_instant_add_machine_item_workspace_id', 'instant_add_machine_item', ['workspace_id'])
    op.create_index('ix_instant_add_machine_item_machine_id', 'instant_add_machine_item', ['machine_id'])
    op.create_index('ix_instant_add_machine_item_item_id', 'instant_add_machine_item', ['item_id'])

    # instant_add_damaged_item
    op.create_table(
        'instant_add_damaged_item',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('workspace_id', sa.Integer(), nullable=False),
        sa.Column('added_at', sa.DateTime(), nullable=False),
        sa.Column('factory_id', sa.Integer(), nullable=False),
        sa.Column('item_id', sa.Integer(), nullable=False),
        sa.Column('added_by', sa.Integer(), nullable=False),
        sa.Column('avg_price', sa.Float(), nullable=False),
        sa.Column('qty', sa.Integer(), nullable=False),
        sa.Column('note', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['added_by'], ['profiles.id'], ),
        sa.ForeignKeyConstraint(['factory_id'], ['factories.id'], ),
        sa.ForeignKeyConstraint(['item_id'], ['items.id'], ),
        sa.ForeignKeyConstraint(['workspace_id'], ['workspaces.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_instant_add_damaged_item_id', 'instant_add_damaged_item', ['id'])
    op.create_index('ix_instant_add_damaged_item_workspace_id', 'instant_add_damaged_item', ['workspace_id'])
    op.create_index('ix_instant_add_damaged_item_factory_id', 'instant_add_damaged_item', ['factory_id'])
    op.create_index('ix_instant_add_damaged_item_item_id', 'instant_add_damaged_item', ['item_id'])
