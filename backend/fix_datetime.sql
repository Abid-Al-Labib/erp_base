-- Fix datetime values with trailing whitespace in SQLite database
-- This removes \r\n from all datetime columns

-- Fix workspaces table
UPDATE workspaces SET trial_ends_at = TRIM(trial_ends_at) WHERE trial_ends_at IS NOT NULL;
UPDATE workspaces SET subscription_started_at = TRIM(subscription_started_at) WHERE subscription_started_at IS NOT NULL;
UPDATE workspaces SET subscription_ends_at = TRIM(subscription_ends_at) WHERE subscription_ends_at IS NOT NULL;
UPDATE workspaces SET created_at = TRIM(created_at) WHERE created_at IS NOT NULL;
UPDATE workspaces SET updated_at = TRIM(updated_at) WHERE updated_at IS NOT NULL;
UPDATE workspaces SET last_usage_reset_at = TRIM(last_usage_reset_at) WHERE last_usage_reset_at IS NOT NULL;

-- Fix workspace_members table
UPDATE workspace_members SET invited_at = TRIM(invited_at) WHERE invited_at IS NOT NULL;
UPDATE workspace_members SET joined_at = TRIM(joined_at) WHERE joined_at IS NOT NULL;
UPDATE workspace_members SET created_at = TRIM(created_at) WHERE created_at IS NOT NULL;
UPDATE workspace_members SET updated_at = TRIM(updated_at) WHERE updated_at IS NOT NULL;

-- Verify the fix
SELECT 'Fixed!' as status;
