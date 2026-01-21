"""Inventory Manager for inventory business logic"""
from typing import List, Optional
from sqlalchemy.orm import Session
from app.managers.base_manager import BaseManager
from app.models.storage_item import StorageItem
from app.models.machine_item import MachineItem
from app.models.damaged_item import DamagedItem
from app.schemas.storage_item import StorageItemCreate
from app.dao.storage_item import storage_item_dao
from app.schemas.machine_item import MachineItemCreate
from app.dao.machine_item import machine_item_dao
from app.dao.damaged_item import damaged_item_dao

class InventoryManager(BaseManager[StorageItem]):
    """
    UTILITY MANAGER: Cross-cutting inventory operations.

    Coordinates inventory across:
    - StorageItem (storage inventory)
    - MachineItem (machine inventory)
    - DamagedItem (damaged inventory)

    Reusable by: OrderService, ProjectService, InventoryService

    Does NOT commit transactions - that's the service layer's responsibility.
    """

    def __init__(self):
        super().__init__(StorageItem)
        self.storage_item_dao = storage_item_dao
        self.machine_item_dao = machine_item_dao
        self.damaged_item_dao = damaged_item_dao

    def deduct_from_storage(
        self,
        session: Session,
        factory_id: int,
        items: List[dict],  # [{'item_id': 1, 'qty': 10}, ...]
    ) -> List[StorageItem]:
        """
        Deduct items from storage inventory.

        Args:
            session: Database session
            factory_id: Factory ID
            items: List of items with item_id and qty

        Returns:
            List of updated storage items (not yet committed)

        Raises:
            ValueError: If item not in storage or insufficient stock

        Note:
            This method does NOT commit. The service layer must commit.
        """
        updated_items = []

        for item_info in items:
            storage_item = self.storage_item_dao.get_by_factory_and_item(
                session, factory_id=factory_id, item_id=item_info['item_id']
            )

            if not storage_item:
                raise ValueError(
                    f"Item {item_info['item_id']} not found in storage for factory {factory_id}"
                )

            if storage_item.qty < item_info['qty']:
                raise ValueError(
                    f"Insufficient stock for item {item_info['item_id']}. "
                    f"Available: {storage_item.qty}, Required: {item_info['qty']}"
                )

            # Deduct quantity
            updated_item = self.storage_item_dao.update(
                session,
                db_obj=storage_item,
                obj_in={'qty': storage_item.qty - item_info['qty']}
            )
            updated_items.append(updated_item)

        return updated_items

    def add_to_storage(
        self,
        session: Session,
        factory_id: int,
        items: List[dict],  # [{'item_id': 1, 'qty': 10, 'price': 100.0}, ...]
    ) -> List[StorageItem]:
        """
        Add items to storage inventory.

        Args:
            session: Database session
            factory_id: Factory ID
            items: List of items with item_id, qty, and optional price

        Returns:
            List of created/updated storage items (not yet committed)

        Note:
            This method does NOT commit. The service layer must commit.
        """
        updated_items = []

        for item_info in items:
            storage_item = self.storage_item_dao.get_by_factory_and_item(
                session, factory_id=factory_id, item_id=item_info['item_id']
            )

            if storage_item:
                # Update existing - calculate new average price
                new_qty = storage_item.qty + item_info['qty']
                if 'price' in item_info:
                    total_value = (storage_item.qty * storage_item.avg_price) + \
                                  (item_info['qty'] * item_info['price'])
                    new_avg_price = total_value / new_qty
                else:
                    new_avg_price = storage_item.avg_price

                updated_item = self.storage_item_dao.update(
                    session,
                    db_obj=storage_item,
                    obj_in={
                        'qty': new_qty,
                        'avg_price': new_avg_price
                    }
                )
                updated_items.append(updated_item)
            else:
                # Create new

                new_item_data = StorageItemCreate(
                    factory_id=factory_id,
                    item_id=item_info['item_id'],
                    qty=item_info['qty'],
                    avg_price=item_info.get('price', 0.0)
                )
                new_item = self.storage_item_dao.create(session, obj_in=new_item_data)
                updated_items.append(new_item)

        return updated_items

    def add_to_machine(
        self,
        session: Session,
        machine_id: int,
        items: List[dict],  # [{'item_id': 1, 'qty': 10}, ...]
    ) -> List[MachineItem]:
        """
        Add items to machine inventory.

        Args:
            session: Database session
            machine_id: Machine ID
            items: List of items with item_id and qty

        Returns:
            List of created/updated machine items (not yet committed)

        Note:
            This method does NOT commit. The service layer must commit.
        """
        updated_items = []

        for item_info in items:
            machine_item = self.machine_item_dao.get_by_machine_and_item(
                session, machine_id=machine_id, item_id=item_info['item_id']
            )

            if machine_item:
                # Update existing
                updated_item = self.machine_item_dao.update(
                    session,
                    db_obj=machine_item,
                    obj_in={'qty': machine_item.qty + item_info['qty']}
                )
                updated_items.append(updated_item)
            else:                
                new_item_data = MachineItemCreate(
                    machine_id=machine_id,
                    item_id=item_info['item_id'],
                    qty=item_info['qty'],
                    req_qty=item_info.get('req_qty', 0),
                    defective_qty=item_info.get('defective_qty', 0)
                )
                new_item = self.machine_item_dao.create(session, obj_in=new_item_data)
                updated_items.append(new_item)

        return updated_items

    def transfer_storage_to_machine(
        self,
        session: Session,
        factory_id: int,
        machine_id: int,
        parts: List[dict],
    ) -> dict:
        """
        Transfer parts from storage to machine.

        Args:
            session: Database session
            factory_id: Factory ID
            machine_id: Machine ID
            parts: List of parts with part_id and qty

        Returns:
            Dict with storage_parts and machine_parts lists (not yet committed)

        Raises:
            ValueError: If insufficient stock in storage

        Note:
            This method does NOT commit. The service layer must commit.
        """
        # Deduct from storage
        storage_parts = self.deduct_from_storage(session, factory_id, parts)

        # Add to machine
        machine_parts = self.add_to_machine(session, machine_id, parts)

        return {
            'storage_parts': storage_parts,
            'machine_parts': machine_parts
        }


# Singleton instance
inventory_manager = InventoryManager()
