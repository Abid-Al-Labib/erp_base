"""add workspace multi-tenancy

Revision ID: 001
Revises:
Create Date: 2025-01-15 20:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create subscription_plans table
    op.create_table(
        'subscription_plans',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('name', sa.String(100), unique=True, nullable=False),
        sa.Column('display_name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),

        # Pricing
        sa.Column('price_monthly', sa.Numeric(10, 2), nullable=True),
        sa.Column('price_yearly', sa.Numeric(10, 2), nullable=True),
        sa.Column('currency', sa.String(3), nullable=False, server_default='USD'),

        # Limits
        sa.Column('max_members', sa.Integer(), nullable=False, server_default='5'),
        sa.Column('max_storage_mb', sa.Integer(), nullable=False, server_default='1000'),
        sa.Column('max_orders_per_month', sa.Integer(), nullable=False, server_default='100'),
        sa.Column('max_factories', sa.Integer(), nullable=False, server_default='2'),
        sa.Column('max_machines', sa.Integer(), nullable=False, server_default='10'),
        sa.Column('max_projects', sa.Integer(), nullable=False, server_default='5'),

        # Features (JSONB array)
        sa.Column('features', postgresql.JSONB, nullable=False, server_default='[]'),

        # Plan metadata
        sa.Column('is_default', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('is_custom', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),

        # Timestamps
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('idx_subscription_plans_name', 'subscription_plans', ['name'])
    op.create_index('idx_subscription_plans_active', 'subscription_plans', ['is_active'])

    # Create workspaces table
    op.create_table(
        'workspaces',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('slug', sa.String(100), unique=True, nullable=False),

        # Ownership
        sa.Column('owner_user_id', sa.Integer(), sa.ForeignKey('profiles.id', ondelete='SET NULL'), nullable=True),
        sa.Column('created_by_user_id', sa.Integer(), sa.ForeignKey('profiles.id', ondelete='SET NULL'), nullable=True),

        # Subscription
        sa.Column('subscription_plan_id', sa.Integer(), sa.ForeignKey('subscription_plans.id'), nullable=False),
        sa.Column('subscription_status', sa.String(50), nullable=False, server_default='trial'),
        sa.Column('trial_ends_at', sa.DateTime(), nullable=True),
        sa.Column('subscription_started_at', sa.DateTime(), nullable=True),
        sa.Column('subscription_ends_at', sa.DateTime(), nullable=True),
        sa.Column('billing_cycle', sa.String(20), nullable=True),

        # Billing
        sa.Column('billing_email', sa.String(255), nullable=True),
        sa.Column('stripe_customer_id', sa.String(255), nullable=True),
        sa.Column('stripe_subscription_id', sa.String(255), nullable=True),

        # Current usage
        sa.Column('current_members_count', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('current_storage_mb', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('current_orders_this_month', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('current_factories_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('current_machines_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('current_projects_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('last_usage_reset_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),

        # Settings
        sa.Column('settings', postgresql.JSONB, nullable=False, server_default='{}'),

        # Timestamps
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('idx_workspaces_slug', 'workspaces', ['slug'])
    op.create_index('idx_workspaces_owner', 'workspaces', ['owner_user_id'])
    op.create_index('idx_workspaces_subscription_plan', 'workspaces', ['subscription_plan_id'])
    op.create_index('idx_workspaces_subscription_status', 'workspaces', ['subscription_status'])

    # Create workspace_members table
    op.create_table(
        'workspace_members',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('workspace_id', sa.Integer(), sa.ForeignKey('workspaces.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('profiles.id', ondelete='CASCADE'), nullable=False),

        # Role assignment
        sa.Column('role', sa.String(50), nullable=False),

        # Invitation tracking
        sa.Column('invited_by_user_id', sa.Integer(), sa.ForeignKey('profiles.id', ondelete='SET NULL'), nullable=True),
        sa.Column('invited_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('joined_at', sa.DateTime(), nullable=True),

        # Status
        sa.Column('status', sa.String(50), nullable=False, server_default='active'),

        # Timestamps
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now(), onupdate=sa.func.now()),

        sa.UniqueConstraint('workspace_id', 'user_id', name='uq_workspace_user'),
    )
    op.create_index('idx_workspace_members_workspace', 'workspace_members', ['workspace_id'])
    op.create_index('idx_workspace_members_user', 'workspace_members', ['user_id'])
    op.create_index('idx_workspace_members_status', 'workspace_members', ['workspace_id', 'status'])

    # Create workspace_invitations table
    op.create_table(
        'workspace_invitations',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('workspace_id', sa.Integer(), sa.ForeignKey('workspaces.id', ondelete='CASCADE'), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('role', sa.String(50), nullable=False),

        # Invitation details
        sa.Column('invited_by_user_id', sa.Integer(), sa.ForeignKey('profiles.id', ondelete='SET NULL'), nullable=True),
        sa.Column('token', sa.String(255), unique=True, nullable=False),

        # Status
        sa.Column('status', sa.String(50), nullable=False, server_default='pending'),

        # Timestamps
        sa.Column('invited_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('accepted_at', sa.DateTime(), nullable=True),

        sa.UniqueConstraint('workspace_id', 'email', name='uq_workspace_invitation_email'),
    )
    op.create_index('idx_workspace_invitations_workspace', 'workspace_invitations', ['workspace_id'])
    op.create_index('idx_workspace_invitations_token', 'workspace_invitations', ['token'])
    op.create_index('idx_workspace_invitations_status', 'workspace_invitations', ['status', 'expires_at'])

    # Create workspace_audit_logs table
    op.create_table(
        'workspace_audit_logs',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('workspace_id', sa.Integer(), sa.ForeignKey('workspaces.id', ondelete='CASCADE'), nullable=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('profiles.id', ondelete='SET NULL'), nullable=True),

        # Action details
        sa.Column('action', sa.String(100), nullable=False),
        sa.Column('resource_type', sa.String(50), nullable=True),
        sa.Column('resource_id', sa.Integer(), nullable=True),

        # Request metadata
        sa.Column('ip_address', postgresql.INET, nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),

        # Additional context
        sa.Column('metadata', postgresql.JSONB, nullable=True),

        # Timestamp
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('idx_workspace_audit_logs_workspace', 'workspace_audit_logs', ['workspace_id', sa.text('created_at DESC')])
    op.create_index('idx_workspace_audit_logs_user', 'workspace_audit_logs', ['user_id', sa.text('created_at DESC')])
    op.create_index('idx_workspace_audit_logs_action', 'workspace_audit_logs', ['action'])

    # Update access_control table to add workspace_id
    op.add_column('access_control', sa.Column('workspace_id', sa.Integer(), sa.ForeignKey('workspaces.id', ondelete='CASCADE'), nullable=True))
    op.create_index('idx_access_control_workspace_role', 'access_control', ['workspace_id', 'role'])

    # Seed default subscription plans
    op.execute("""
        INSERT INTO subscription_plans (name, display_name, description, price_monthly, price_yearly, max_members, max_storage_mb, max_orders_per_month, max_factories, max_machines, max_projects, features, is_default, is_custom) VALUES
        ('free', 'Free Plan', 'Perfect for small teams getting started', 0, 0, 5, 1000, 100, 2, 10, 5, '[]', true, false),
        ('pro', 'Pro Plan', 'For growing businesses', 99, 990, 50, 100000, -1, 10, 100, 50, '["api_access", "advanced_analytics", "export_data", "priority_support"]', false, false),
        ('enterprise', 'Enterprise Plan', 'For large organizations', NULL, NULL, -1, -1, -1, -1, -1, -1, '["api_access", "advanced_analytics", "export_data", "custom_branding", "sso", "priority_support", "dedicated_support"]', false, false);
    """)


def downgrade() -> None:
    # Drop in reverse order
    op.drop_index('idx_access_control_workspace_role', 'access_control')
    op.drop_column('access_control', 'workspace_id')

    op.drop_index('idx_workspace_audit_logs_action', 'workspace_audit_logs')
    op.drop_index('idx_workspace_audit_logs_user', 'workspace_audit_logs')
    op.drop_index('idx_workspace_audit_logs_workspace', 'workspace_audit_logs')
    op.drop_table('workspace_audit_logs')

    op.drop_index('idx_workspace_invitations_status', 'workspace_invitations')
    op.drop_index('idx_workspace_invitations_token', 'workspace_invitations')
    op.drop_index('idx_workspace_invitations_workspace', 'workspace_invitations')
    op.drop_table('workspace_invitations')

    op.drop_index('idx_workspace_members_status', 'workspace_members')
    op.drop_index('idx_workspace_members_user', 'workspace_members')
    op.drop_index('idx_workspace_members_workspace', 'workspace_members')
    op.drop_table('workspace_members')

    op.drop_index('idx_workspaces_subscription_status', 'workspaces')
    op.drop_index('idx_workspaces_subscription_plan', 'workspaces')
    op.drop_index('idx_workspaces_owner', 'workspaces')
    op.drop_index('idx_workspaces_slug', 'workspaces')
    op.drop_table('workspaces')

    op.drop_index('idx_subscription_plans_active', 'subscription_plans')
    op.drop_index('idx_subscription_plans_name', 'subscription_plans')
    op.drop_table('subscription_plans')
