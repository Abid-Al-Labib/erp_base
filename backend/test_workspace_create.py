"""Test workspace creation to reproduce the error"""
import sys
from pathlib import Path

# Add app directory to path
sys.path.append(str(Path(__file__).parent))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.managers.workspace_manager import workspace_manager
from app.schemas.workspace import WorkspaceCreate
from app.dao.profile import profile_dao

def test_create_workspace():
    """Test creating a workspace"""
    db = SessionLocal()

    try:
        # Get the first user (should be the owner of Default Workspace)
        user = profile_dao.get(db, id=1)
        if not user:
            print("No user found with ID 1")
            return

        print(f"Creating workspace for user: {user.email}")

        # Create workspace data
        workspace_data = WorkspaceCreate(
            name="Test Workspace",
            slug="test-workspace"
        )

        print(f"Workspace data: {workspace_data}")

        # Try to create workspace
        print("\nAttempting to create workspace...")
        workspace = workspace_manager.create_workspace_with_owner(
            session=db,
            workspace_data=workspace_data,
            owner_user_id=user.id
        )

        db.commit()
        print(f"\n✓ Success! Created workspace: {workspace.name} (ID: {workspace.id})")

    except Exception as e:
        print(f"\n✗ Error: {type(e).__name__}: {e}")
        import traceback
        print("\nFull traceback:")
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    test_create_workspace()
