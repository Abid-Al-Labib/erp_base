"""
Database setup and seed script.

Run this after deleting erp.db to recreate all tables and seed global data.

Usage:
    cd backend
    python seed_db.py
"""
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.db.seed_default_subscription_plans import seed_default_subscription_plans


def seed_db():
    print("Creating all database tables...")
    Base.metadata.create_all(bind=engine)
    print("  Done.")

    db = SessionLocal()
    try:
        print("Seeding subscription plans...")
        plans = seed_default_subscription_plans(db)
        db.commit()
        if plans:
            for p in plans:
                print(f"  Created: {p.display_name} (is_default={p.is_default})")
        else:
            print("  Already seeded (no new plans created).")

        print("\nAll done! You can now start the server and register a new user.")
        print("  uvicorn app.main:app --reload")
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_db()
