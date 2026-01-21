"""Inventory ledger DAO operations - finished goods transaction tracking"""
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from decimal import Decimal
from app.dao.base import BaseDAO
from app.models.inventory_ledger import InventoryLedger
from app.schemas.inventory_ledger import InventoryLedgerCreate, InventoryLedgerUpdate


class InventoryLedgerDAO(BaseDAO[InventoryLedger, InventoryLedgerCreate, InventoryLedgerUpdate]):
    """
    DAO operations for InventoryLedger model.

    Manages immutable ledger entries for finished goods inventory.
    All methods enforce workspace isolation for security.
    """

    def get_by_factory_and_item(
        self, db: Session, *, factory_id: int, item_id: int, workspace_id: int,
        skip: int = 0, limit: int = 100
    ) -> List[InventoryLedger]:
        """
        Get ledger entries for specific factory and item (SECURITY-CRITICAL)

        Args:
            db: Database session
            factory_id: Factory ID
            item_id: Item ID
            workspace_id: Workspace ID to filter by
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of ledger entries ordered by time (newest first)
        """
        return (
            db.query(InventoryLedger)
            .filter(
                InventoryLedger.workspace_id == workspace_id,
                InventoryLedger.factory_id == factory_id,
                InventoryLedger.item_id == item_id
            )
            .order_by(InventoryLedger.performed_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_transaction_type(
        self, db: Session, *, transaction_type: str, workspace_id: int,
        skip: int = 0, limit: int = 100
    ) -> List[InventoryLedger]:
        """
        Get ledger entries by transaction type (SECURITY-CRITICAL)

        Args:
            db: Database session
            transaction_type: Transaction type to filter by
            workspace_id: Workspace ID to filter by
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of ledger entries
        """
        return (
            db.query(InventoryLedger)
            .filter(
                InventoryLedger.workspace_id == workspace_id,
                InventoryLedger.transaction_type == transaction_type
            )
            .order_by(InventoryLedger.performed_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_order(
        self, db: Session, *, order_id: int, workspace_id: int
    ) -> List[InventoryLedger]:
        """
        Get all ledger entries for an order (SECURITY-CRITICAL)

        Args:
            db: Database session
            order_id: Order ID
            workspace_id: Workspace ID to filter by

        Returns:
            List of ledger entries for the order
        """
        return (
            db.query(InventoryLedger)
            .filter(
                InventoryLedger.workspace_id == workspace_id,
                InventoryLedger.order_id == order_id
            )
            .order_by(InventoryLedger.performed_at)
            .all()
        )

    def get_by_date_range(
        self, db: Session, *, workspace_id: int, start_date: datetime, end_date: datetime,
        skip: int = 0, limit: int = 100
    ) -> List[InventoryLedger]:
        """
        Get ledger entries within date range (SECURITY-CRITICAL)

        Args:
            db: Database session
            workspace_id: Workspace ID to filter by
            start_date: Start datetime (inclusive)
            end_date: End datetime (inclusive)
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of ledger entries in date range
        """
        return (
            db.query(InventoryLedger)
            .filter(
                InventoryLedger.workspace_id == workspace_id,
                InventoryLedger.performed_at >= start_date,
                InventoryLedger.performed_at <= end_date
            )
            .order_by(InventoryLedger.performed_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_performer(
        self, db: Session, *, performed_by: int, workspace_id: int,
        skip: int = 0, limit: int = 100
    ) -> List[InventoryLedger]:
        """
        Get ledger entries by performer (SECURITY-CRITICAL)

        Args:
            db: Database session
            performed_by: User ID who performed transactions
            workspace_id: Workspace ID to filter by
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of ledger entries
        """
        return (
            db.query(InventoryLedger)
            .filter(
                InventoryLedger.workspace_id == workspace_id,
                InventoryLedger.performed_by == performed_by
            )
            .order_by(InventoryLedger.performed_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_source(
        self, db: Session, *, source_type: str, source_id: int, workspace_id: int
    ) -> List[InventoryLedger]:
        """
        Get ledger entries by source (SECURITY-CRITICAL)

        Args:
            db: Database session
            source_type: Type of source (e.g., 'production', 'sales_order')
            source_id: ID of source entity
            workspace_id: Workspace ID to filter by

        Returns:
            List of ledger entries from the source
        """
        return (
            db.query(InventoryLedger)
            .filter(
                InventoryLedger.workspace_id == workspace_id,
                InventoryLedger.source_type == source_type,
                InventoryLedger.source_id == source_id
            )
            .order_by(InventoryLedger.performed_at)
            .all()
        )

    def calculate_balance(
        self, db: Session, *, factory_id: int, item_id: int, workspace_id: int
    ) -> tuple[int, Decimal]:
        """
        Calculate current balance from ledger (for reconciliation)

        Args:
            db: Database session
            factory_id: Factory ID
            item_id: Item ID
            workspace_id: Workspace ID to filter by

        Returns:
            Tuple of (quantity, total_value)
        """
        entry = (
            db.query(InventoryLedger)
            .filter(
                InventoryLedger.workspace_id == workspace_id,
                InventoryLedger.factory_id == factory_id,
                InventoryLedger.item_id == item_id
            )
            .order_by(InventoryLedger.performed_at.desc())
            .first()
        )

        if entry:
            return (entry.qty_after, entry.value_after or Decimal('0.00'))
        return (0, Decimal('0.00'))

    def get_latest_entry(
        self, db: Session, *, factory_id: int, item_id: int, workspace_id: int
    ) -> Optional[InventoryLedger]:
        """
        Get the most recent ledger entry for factory/item (SECURITY-CRITICAL)

        Args:
            db: Database session
            factory_id: Factory ID
            item_id: Item ID
            workspace_id: Workspace ID to filter by

        Returns:
            Latest ledger entry or None
        """
        return (
            db.query(InventoryLedger)
            .filter(
                InventoryLedger.workspace_id == workspace_id,
                InventoryLedger.factory_id == factory_id,
                InventoryLedger.item_id == item_id
            )
            .order_by(InventoryLedger.performed_at.desc())
            .first()
        )

    def get_production_output_entries(
        self, db: Session, *, workspace_id: int, factory_id: Optional[int] = None,
        skip: int = 0, limit: int = 100
    ) -> List[InventoryLedger]:
        """
        Get entries from production (transfer_in with source_type='production')

        Args:
            db: Database session
            workspace_id: Workspace ID to filter by
            factory_id: Optional factory filter
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of production output entries
        """
        query = db.query(InventoryLedger).filter(
            InventoryLedger.workspace_id == workspace_id,
            InventoryLedger.transaction_type == 'transfer_in',
            InventoryLedger.source_type == 'production'
        )

        if factory_id is not None:
            query = query.filter(InventoryLedger.factory_id == factory_id)

        return (
            query
            .order_by(InventoryLedger.performed_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_sales_entries(
        self, db: Session, *, workspace_id: int, factory_id: Optional[int] = None,
        skip: int = 0, limit: int = 100
    ) -> List[InventoryLedger]:
        """
        Get entries from sales (transfer_out with destination_type='sales_order')

        Args:
            db: Database session
            workspace_id: Workspace ID to filter by
            factory_id: Optional factory filter
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of sales entries
        """
        query = db.query(InventoryLedger).filter(
            InventoryLedger.workspace_id == workspace_id,
            InventoryLedger.transaction_type == 'transfer_out',
            InventoryLedger.destination_type == 'sales_order'
        )

        if factory_id is not None:
            query = query.filter(InventoryLedger.factory_id == factory_id)

        return (
            query
            .order_by(InventoryLedger.performed_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )


inventory_ledger_dao = InventoryLedgerDAO(InventoryLedger)
