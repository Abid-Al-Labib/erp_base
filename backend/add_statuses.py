"""Add default sales order statuses to database"""
import sqlite3

# Connect to database
conn = sqlite3.connect('E:/Projects/ERP-Revamp/erp_base/backend/erp.db')
cursor = conn.cursor()

try:
    # Add statuses
    cursor.execute("""
        INSERT OR IGNORE INTO statuses (id, workspace_id, name, comment)
        VALUES
            (1, 1, 'Started', 'Sales order has been created and is active'),
            (2, 1, 'Completed', 'Sales order has been fully delivered and closed')
    """)

    conn.commit()
    print("SUCCESS: Added sales order statuses!")

    # Verify
    cursor.execute("SELECT * FROM statuses WHERE workspace_id = 1")
    statuses = cursor.fetchall()
    print(f"\nCurrent statuses in workspace 1:")
    for status in statuses:
        print(f"  - ID {status[0]}: {status[2]} - {status[3]}")

except Exception as e:
    print(f"ERROR: {e}")
    conn.rollback()
finally:
    conn.close()
