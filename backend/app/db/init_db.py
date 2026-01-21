"""
Database initialization and seeding

Note: Status and Department seeding has been moved to workspace-scoped seed functions:
- seed_default_statuses() in app/db/seed_default_statuses.py
- seed_default_departments() in app/db/seed_default_departments.py

These are called when a workspace is created.
"""
from sqlalchemy.orm import Session


def init_db(db: Session) -> None:
    """
    Initialize database with default data

    Args:
        db: Database session

    Note:
        This function is kept for backward compatibility but no longer
        creates workspace-scoped data (statuses, departments). Those
        are now created per-workspace via seed functions.
    """
    # Status and Department seeding moved to workspace-scoped functions
    # See: seed_default_statuses() and seed_default_departments()
    pass
