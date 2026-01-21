"""Quick script to check database for bad datetime data"""
import sqlite3
import sys

# Connect to database
conn = sqlite3.connect('erp.db')
cursor = conn.cursor()

print("=" * 60)
print("Checking for bad datetime data in database...")
print("=" * 60)

# Check workspaces table
try:
    cursor.execute("""
        SELECT
            id,
            name,
            trial_ends_at,
            created_at,
            length(trial_ends_at) as trial_len,
            length(created_at) as created_len
        FROM workspaces
        LIMIT 5
    """)

    rows = cursor.fetchall()
    print(f"\n{'ID':<5} {'Name':<20} {'Trial Ends':<30} {'Created At':<30}")
    print("-" * 100)

    for row in rows:
        id_val, name, trial, created, trial_len, created_len = row
        print(f"{id_val:<5} {name:<20} {trial:<30} {created:<30}")

        # Check for line endings
        if trial and ('\r' in trial or '\n' in trial):
            print(f"  ⚠️  WARNING: trial_ends_at contains line endings! repr: {repr(trial)}")
        if created and ('\r' in created or '\n' in created):
            print(f"  ⚠️  WARNING: created_at contains line endings! repr: {repr(created)}")

    # Count bad records
    cursor.execute("""
        SELECT
            COUNT(*) as total,
            SUM(CASE WHEN trial_ends_at LIKE '%' || char(13) || '%'
                      OR trial_ends_at LIKE '%' || char(10) || '%'
                THEN 1 ELSE 0 END) as bad_trial,
            SUM(CASE WHEN created_at LIKE '%' || char(13) || '%'
                      OR created_at LIKE '%' || char(10) || '%'
                THEN 1 ELSE 0 END) as bad_created
        FROM workspaces
    """)

    total, bad_trial, bad_created = cursor.fetchone()
    print(f"\n{'='*60}")
    print(f"Summary:")
    print(f"  Total workspaces: {total}")
    print(f"  Bad trial_ends_at: {bad_trial}")
    print(f"  Bad created_at: {bad_created}")
    print(f"{'='*60}")

except sqlite3.Error as e:
    print(f"Database error: {e}")
except Exception as e:
    print(f"Error: {e}")
finally:
    conn.close()
