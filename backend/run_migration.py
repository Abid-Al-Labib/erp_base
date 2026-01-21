"""Quick script to add sales order statuses"""
from sqlalchemy import create_engine, text
from app.core.config import settings

# Create engine
engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))

# Run migration SQL
with engine.connect() as conn:
    # Add statuses
    conn.execute(text("""
        INSERT INTO statuses (id, workspace_id, name, comment)
        VALUES
            (1, 1, 'Started', 'Sales order has been created and is active'),
            (2, 1, 'Completed', 'Sales order has been fully delivered and closed')
        ON CONFLICT (id) DO NOTHING;
    """))
    conn.commit()
    print("✅ Successfully added sales order statuses!")

    # Verify
    result = conn.execute(text("SELECT * FROM statuses WHERE workspace_id = 1"))
    statuses = result.fetchall()
    print(f"\nAdded {len(statuses)} statuses:")
    for status in statuses:
        print(f"  - ID {status[0]}: {status[2]} - {status[3]}")
