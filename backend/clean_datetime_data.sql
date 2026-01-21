-- Clean datetime values with trailing whitespace in SQLite database
-- Run this with: sqlite3 your_database.db < clean_datetime_data.sql

-- Clean workspaces table
UPDATE workspaces
SET trial_ends_at = TRIM(trial_ends_at)
WHERE trial_ends_at IS NOT NULL;

UPDATE workspaces
SET subscription_started_at = TRIM(subscription_started_at)
WHERE subscription_started_at IS NOT NULL;

UPDATE workspaces
SET subscription_ends_at = TRIM(subscription_ends_at)
WHERE subscription_ends_at IS NOT NULL;

UPDATE workspaces
SET created_at = TRIM(created_at)
WHERE created_at IS NOT NULL;

UPDATE workspaces
SET updated_at = TRIM(updated_at)
WHERE updated_at IS NOT NULL;

UPDATE workspaces
SET last_usage_reset_at = TRIM(last_usage_reset_at)
WHERE last_usage_reset_at IS NOT NULL;

-- Verify the fix
SELECT
    'workspaces' as table_name,
    COUNT(*) as total_rows,
    SUM(CASE WHEN trial_ends_at LIKE '%' || char(13) || '%' OR trial_ends_at LIKE '%' || char(10) || '%' THEN 1 ELSE 0 END) as bad_trial_ends,
    SUM(CASE WHEN created_at LIKE '%' || char(13) || '%' OR created_at LIKE '%' || char(10) || '%' THEN 1 ELSE 0 END) as bad_created_at
FROM workspaces;
