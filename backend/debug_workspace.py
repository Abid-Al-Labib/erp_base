"""Debug script to manually test workspace loading"""
import sqlite3
from datetime import datetime

# Connect to database
conn = sqlite3.connect('erp.db')
cursor = conn.cursor()

print("=" * 60)
print("Checking workspace data directly from SQLite...")
print("=" * 60)

# Get all workspaces
cursor.execute("SELECT id, name, trial_ends_at, created_at FROM workspaces")
rows = cursor.fetchall()

for row in rows:
    id_val, name, trial, created = row
    print(f"\nWorkspace ID: {id_val}")
    print(f"Name: {name}")
    print(f"trial_ends_at RAW: {repr(trial)}")
    print(f"created_at RAW: {repr(created)}")

    # Try to parse
    if trial:
        try:
            # Strip and try to parse
            cleaned = trial.strip()
            if cleaned.endswith('Z'):
                cleaned = cleaned[:-1] + '+00:00'
            parsed = datetime.fromisoformat(cleaned)
            print(f"✓ trial_ends_at parsed successfully: {parsed}")
        except Exception as e:
            print(f"✗ trial_ends_at parse failed: {e}")

    if created:
        try:
            cleaned = created.strip()
            if cleaned.endswith('Z'):
                cleaned = cleaned[:-1] + '+00:00'
            parsed = datetime.fromisoformat(cleaned)
            print(f"✓ created_at parsed successfully: {parsed}")
        except Exception as e:
            print(f"✗ created_at parse failed: {e}")

conn.close()
print("\n" + "=" * 60)
