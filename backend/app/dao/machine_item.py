"""DAO operations"""
from typing import List, Optional
from sqlalchemy.orm import Session
from app.dao.base import BaseDAO
from app.models.machine_item import MachineItem
from app.schemas.machine_item import MachineItemCreate, MachineItemUpdate


class DAOMachineItem(BaseDAO[MachineItem, MachineItemCreate, MachineItemUpdate]):
    """DAO operations for MachineItem model"""

    def get_by_machine(
        self, db: Session, *, machine_id: int, workspace_id: int, skip: int = 0, limit: int = 100
    ) -> List[MachineItem]:
        """
        Get machine items by machine ID (SECURITY-CRITICAL: workspace-filtered)

        Args:
            db: Database session
            machine_id: Machine ID
            workspace_id: Workspace ID to filter by
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of machine items belonging to the workspace
        """
        return (
            db.query(MachineItem)
            .filter(
                MachineItem.workspace_id == workspace_id,  # SECURITY: workspace isolation
                MachineItem.machine_id == machine_id
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_machine_and_item(
        self, db: Session, *, machine_id: int, item_id: int, workspace_id: int
    ) -> Optional[MachineItem]:
        """
        Get machine item by machine and item ID (SECURITY-CRITICAL: workspace-filtered)

        Args:
            db: Database session
            machine_id: Machine ID
            item_id: Item ID
            workspace_id: Workspace ID to filter by

        Returns:
            Machine item if found in workspace, None otherwise
        """
        return (
            db.query(MachineItem)
            .filter(
                MachineItem.workspace_id == workspace_id,  # SECURITY: workspace isolation
                MachineItem.machine_id == machine_id,
                MachineItem.item_id == item_id
            )
            .first()
        )


machine_item_dao = DAOMachineItem(MachineItem)
