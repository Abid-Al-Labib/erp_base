"""Inventory DAO operations - finished goods inventory management"""
from typing import List, Optional
from sqlalchemy.orm import Session
from app.dao.base import BaseDAO
from app.models.inventory import Inventory
from app.schemas.inventory import InventoryCreate, InventoryUpdate


class InventoryDAO(BaseDAO[Inventory, InventoryCreate, InventoryUpdate]):
    """
    DAO operations for Inventory model (finished goods).

    All methods enforce workspace isolation for security.
    """

    def get_by_workspace(
        self, db: Session, *, workspace_id: int, skip: int = 0, limit: int = 100
    ) -> List[Inventory]:
        """
        Get all inventory items for a workspace (SECURITY-CRITICAL)

        Args:
            db: Database session
            workspace_id: Workspace ID to filter by
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of inventory items
        """
        return (
            db.query(Inventory)
            .filter(Inventory.workspace_id == workspace_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_factory(
        self, db: Session, *, factory_id: int, workspace_id: int, skip: int = 0, limit: int = 100
    ) -> List[Inventory]:
        """
        Get inventory items by factory (SECURITY-CRITICAL)

        Args:
            db: Database session
            factory_id: Factory ID
            workspace_id: Workspace ID to filter by
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of inventory items at the factory
        """
        return (
            db.query(Inventory)
            .filter(
                Inventory.workspace_id == workspace_id,
                Inventory.factory_id == factory_id
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_factory_and_item(
        self, db: Session, *, factory_id: int, item_id: int, workspace_id: int
    ) -> Optional[Inventory]:
        """
        Get specific inventory record by factory and item (SECURITY-CRITICAL)

        Args:
            db: Database session
            factory_id: Factory ID
            item_id: Item ID
            workspace_id: Workspace ID to filter by

        Returns:
            Inventory record or None
        """
        return (
            db.query(Inventory)
            .filter(
                Inventory.workspace_id == workspace_id,
                Inventory.factory_id == factory_id,
                Inventory.item_id == item_id
            )
            .first()
        )

    def get_by_item(
        self, db: Session, *, item_id: int, workspace_id: int
    ) -> List[Inventory]:
        """
        Get all inventory records for a specific item across all factories (SECURITY-CRITICAL)

        Args:
            db: Database session
            item_id: Item ID
            workspace_id: Workspace ID to filter by

        Returns:
            List of inventory records for the item
        """
        return (
            db.query(Inventory)
            .filter(
                Inventory.workspace_id == workspace_id,
                Inventory.item_id == item_id
            )
            .all()
        )

    def get_by_id_and_workspace(
        self, db: Session, *, id: int, workspace_id: int
    ) -> Optional[Inventory]:
        """
        Get inventory record by ID with workspace validation (SECURITY-CRITICAL)

        Args:
            db: Database session
            id: Inventory record ID
            workspace_id: Workspace ID to filter by

        Returns:
            Inventory record or None
        """
        return (
            db.query(Inventory)
            .filter(
                Inventory.id == id,
                Inventory.workspace_id == workspace_id
            )
            .first()
        )

    def get_low_stock_items(
        self, db: Session, *, workspace_id: int, threshold: int = 10
    ) -> List[Inventory]:
        """
        Get items with quantity below threshold (SECURITY-CRITICAL)

        Args:
            db: Database session
            workspace_id: Workspace ID to filter by
            threshold: Minimum quantity threshold

        Returns:
            List of low-stock inventory items
        """
        return (
            db.query(Inventory)
            .filter(
                Inventory.workspace_id == workspace_id,
                Inventory.qty < threshold
            )
            .all()
        )


inventory_dao = InventoryDAO(Inventory)
