"""DAO operations for Machine model (workspace-scoped)"""
from typing import List
from sqlalchemy.orm import Session
from app.dao.base import BaseDAO
from app.models.machine import Machine
from app.schemas.machine import MachineCreate, MachineUpdate


class DAOMachine(BaseDAO[Machine, MachineCreate, MachineUpdate]):
    """
    DAO operations for Machine model.

    SECURITY: All methods MUST filter by workspace_id to prevent cross-workspace data access.
    """

    def get_by_section(
        self, db: Session, *, factory_section_id: int, workspace_id: int, skip: int = 0, limit: int = 100
    ) -> List[Machine]:
        """
        Get machines by factory section ID (SECURITY-CRITICAL: workspace-filtered)

        Args:
            db: Database session
            factory_section_id: Factory section ID
            workspace_id: Workspace ID to filter by
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of machines in the section belonging to the workspace
        """
        return (
            db.query(Machine)
            .filter(
                Machine.workspace_id == workspace_id,  # SECURITY: workspace isolation
                Machine.factory_section_id == factory_section_id
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_running_machines(
        self, db: Session, *, workspace_id: int, skip: int = 0, limit: int = 100
    ) -> List[Machine]:
        """
        Get all running machines (SECURITY-CRITICAL: workspace-filtered)

        Args:
            db: Database session
            workspace_id: Workspace ID to filter by
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of running machines belonging to the workspace

        Security Note:
            WITHOUT workspace filter, this would return ALL running machines from ALL workspaces!
            This was a SEVERE data leak vulnerability.
        """
        return (
            db.query(Machine)
            .filter(
                Machine.workspace_id == workspace_id,  # SECURITY: CRITICAL filter
                Machine.is_running == True
            )
            .offset(skip)
            .limit(limit)
            .all()
        )


machine_dao = DAOMachine(Machine)
