"""
Script to clean datetime values with trailing whitespace in SQLite database.
This fixes the "Invalid isoformat string" error caused by \r\n in datetime strings.

Usage:
    python clean_datetime_data.py
"""
import sys
from pathlib import Path

# Add app directory to path
sys.path.append(str(Path(__file__).parent))

from sqlalchemy import text
from app.db.session import engine
from app.core.config import settings


def clean_datetime_whitespace():
    """Clean datetime columns in workspaces table"""
    print(f"Cleaning datetime data in database: {settings.DATABASE_URL}")

    with engine.connect() as conn:
        # Clean workspaces table
        tables_and_columns = [
            ('workspaces', ['trial_ends_at', 'subscription_started_at', 'subscription_ends_at',
                           'created_at', 'updated_at', 'last_usage_reset_at']),
            ('workspace_invitations', ['expires_at', 'created_at', 'accepted_at', 'cancelled_at']),
            ('workspace_members', ['joined_at', 'left_at']),
            ('workspace_audit_logs', ['created_at']),
        ]

        total_updated = 0

        for table, columns in tables_and_columns:
            print(f"\nCleaning table: {table}")

            for column in columns:
                try:
                    result = conn.execute(
                        text(f"UPDATE {table} SET {column} = TRIM({column}) WHERE {column} IS NOT NULL")
                    )
                    conn.commit()

                    if result.rowcount > 0:
                        print(f"  ✓ Cleaned {result.rowcount} rows in {column}")
                        total_updated += result.rowcount
                    else:
                        print(f"  - No changes needed for {column}")

                except Exception as e:
                    print(f"  ✗ Error cleaning {column}: {e}")
                    conn.rollback()

        print(f"\n{'='*60}")
        print(f"Total rows updated: {total_updated}")
        print(f"{'='*60}")

        # Verify the fix
        print("\nVerifying fix...")
        result = conn.execute(
            text("""
                SELECT
                    COUNT(*) as total_rows,
                    SUM(CASE WHEN trial_ends_at LIKE '%' || char(13) || '%'
                              OR trial_ends_at LIKE '%' || char(10) || '%'
                        THEN 1 ELSE 0 END) as bad_trial_ends,
                    SUM(CASE WHEN created_at LIKE '%' || char(13) || '%'
                              OR created_at LIKE '%' || char(10) || '%'
                        THEN 1 ELSE 0 END) as bad_created_at
                FROM workspaces
            """)
        )
        row = result.fetchone()

        if row:
            print(f"Total workspace rows: {row[0]}")
            print(f"Bad trial_ends_at: {row[1]}")
            print(f"Bad created_at: {row[2]}")

            if row[1] == 0 and row[2] == 0:
                print("\n✓ All datetime values are clean!")
            else:
                print("\n⚠ Some datetime values still have whitespace. Manual investigation needed.")


if __name__ == "__main__":
    try:
        clean_datetime_whitespace()
        print("\n✓ Database cleanup completed successfully!")
    except Exception as e:
        print(f"\n✗ Error during cleanup: {e}")
        sys.exit(1)
