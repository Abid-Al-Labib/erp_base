# Backend Architecture - 4-Layer Hybrid Pattern

## Overview

This backend follows a **4-layer hybrid architecture** optimized for complex ERP workflows with clear separation of concerns, testability, and maintainability.

```
┌─────────────────────────────────────────────────────────┐
│  Layer 1: ENDPOINTS (HTTP)                              │
│  - FastAPI routes                                       │
│  - Request/response handling                            │
│  - Authentication/authorization                         │
│  - Call services                                        │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 2: SERVICES (Orchestration)                      │
│  - Orchestrate multiple managers                        │
│  - **OWN TRANSACTION BOUNDARIES** (commit/rollback)     │
│  - Complex workflows (STM, STP, MTM orders)             │
│  - Cross-cutting concerns (email, notifications)        │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 3: MANAGERS (Business Logic) - HYBRID            │
│  - Aggregate Managers (Order + Parts + Status)          │
│  - Utility Managers (Inventory transfers)               │
│  - Standalone Managers (Part catalog)                   │
│  - **DO NOT COMMIT** - receive & pass session           │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 4: DAOs (Data Access Objects)                    │
│  - Pure database operations                             │
│  - **USE flush() NOT commit()**                         │
│  - 1:1 mapping to database tables                       │
└─────────────────────────────────────────────────────────┘
```

## Directory Structure

```
backend/app/
├── api/v1/endpoints/     # Layer 1: HTTP endpoints
│   ├── orders.py         # Calls OrderService
│   ├── parts.py          # Calls PartService
│   ├── machines.py       # Calls MachineService
│   └── ...
├── services/             # Layer 2: Workflow orchestration
│   ├── base_service.py
│   ├── order_service.py        # STM, STP, PFM workflows
│   ├── inventory_service.py    # Instant add, transfers
│   ├── project_service.py      # Budget, allocation
│   ├── part_service.py         # Simple CRUD
│   └── ...
├── managers/             # Layer 3: Business logic (HYBRID)
│   ├── base_manager.py
│   │
│   ├── # AGGREGATE MANAGERS (entity + children)
│   ├── order_manager.py        # Order + OrderPart + StatusTracker
│   ├── machine_manager.py      # Machine + MachinePart
│   ├── project_manager.py      # Project + Component + Task + Part
│   │
│   ├── # UTILITY MANAGERS (cross-cutting operations)
│   ├── inventory_manager.py    # Storage/Machine/Damaged transfers
│   ├── audit_manager.py        # Instant add logging
│   ├── workflow_manager.py     # Status transitions
│   ├── rbac_manager.py         # Permissions
│   │
│   └── # STANDALONE MANAGERS (independent entities)
│       ├── part_manager.py     # Part catalog
│       ├── factory_manager.py  # Factory operations
│       └── ...
└── dao/                  # Layer 4: Database access
    ├── base.py          # BaseDAO
    ├── order.py         # 1:1 with orders table
    ├── order_part.py    # 1:1 with order_parts table
    └── ...
```

## Hybrid Manager Pattern

### Three Types of Managers

#### 1. Aggregate Managers (Domain Aggregates)

**When to use:** Entity has child entities that MUST be consistent

**Example: OrderManager**
```python
class OrderManager(BaseManager[Order]):
    """
    Manages Order aggregate root
    Children: OrderPart, StatusTracker
    """
    def __init__(self):
        self.order_dao = order_dao
        self.order_part_dao = order_part_dao
        self.status_tracker_dao = status_tracker_dao

    def create_order_with_parts(
        self, session: Session, order_data: dict, parts_data: List[dict], user_id: int
    ) -> Order:
        """Business rule: Order MUST have parts and initial status"""
        if not parts_data:
            raise ValueError("Order must have at least one part")

        # Create order
        order = self.order_dao.create_with_user(session, OrderCreate(**order_data), user_id)

        # Create parts (children)
        for part in parts_data:
            self.order_part_dao.create(session, OrderPartCreate(order_id=order.id, **part))

        # Log initial status (child)
        self.status_tracker_dao.create(session, StatusTrackerCreate(
            order_id=order.id, status_id=1, changed_by_user_id=user_id
        ))

        return order
```

**Other Aggregate Managers:**
- `MachineManager` → Machine + MachinePart
- `ProjectManager` → Project + Component + Task + ComponentPart

#### 2. Utility Managers (Cross-Cutting Operations)

**When to use:** Operations span multiple aggregates or shared logic

**Example: InventoryManager**
```python
class InventoryManager(BaseManager):
    """
    Manages inventory across Storage, Machine, and Damaged
    Used by: OrderService, ProjectService, InventoryService
    """
    def __init__(self):
        self.storage_part_dao = storage_part_dao
        self.machine_part_dao = machine_part_dao
        self.damaged_part_dao = damaged_part_dao

    def transfer_storage_to_machine(
        self, session: Session, factory_id: int, machine_id: int, parts: List[dict]
    ) -> dict:
        """Atomic transfer: deduct from storage, add to machine"""
        # Deduct from storage
        for part in parts:
            storage_part = self.storage_part_dao.get_by_factory_and_part(
                session, factory_id, part['part_id']
            )
            if storage_part.qty < part['qty']:
                raise ValueError(f"Insufficient stock for part {part['part_id']}")

            self.storage_part_dao.update(
                session, storage_part, {'qty': storage_part.qty - part['qty']}
            )

        # Add to machine
        for part in parts:
            machine_part = self.machine_part_dao.get_by_machine_and_part(
                session, machine_id, part['part_id']
            )
            if machine_part:
                self.machine_part_dao.update(
                    session, machine_part, {'qty': machine_part.qty + part['qty']}
                )
            else:
                self.machine_part_dao.create(
                    session, MachinePartCreate(machine_id=machine_id, **part)
                )

        return {'deducted': parts, 'added': parts}
```

**Other Utility Managers:**
- `AuditManager` → Instant add logging across all entities
- `WorkflowManager` → Status transitions, validations
- `RBACManager` → Permission checks

#### 3. Standalone Managers (Independent Entities)

**When to use:** Entity has no children, simple operations

**Example: PartManager**
```python
class PartManager(BaseManager[Part]):
    """Simple catalog management - no children"""
    def __init__(self):
        self.part_dao = part_dao

    def search_parts(self, session: Session, name: str = None, skip: int = 0, limit: int = 100):
        if name:
            return self.part_dao.search_by_name(session, name, skip, limit)
        return self.part_dao.get_multi(session, skip=skip, limit=limit)
```

**Other Standalone Managers:**
- `FactoryManager` → Factory CRUD
- `DepartmentManager` → Department CRUD
- `StatusManager` → Status CRUD

---

## Service Layer Responsibilities

Services exist for **6 key purposes**:

### 1. Multi-Aggregate Coordination ⭐⭐⭐ (Most Important)

**Example: STM Order (Storage To Machine)**

```python
class OrderService(BaseService):
    def process_stm_order(self, db: Session, order_id: int, user: Profile) -> Order:
        """
        STM workflow coordinates:
        - OrderManager (order aggregate)
        - InventoryManager (inventory transfer)
        """
        try:
            # Get order aggregate
            order = order_manager.get_order_with_parts(db, order_id)

            if not order.machine_id:
                raise ValueError("STM order must have a machine")

            # Prepare parts for transfer
            parts_data = [
                {'part_id': op.part_id, 'qty': op.qty}
                for op in order.parts
            ]

            # Transfer inventory (InventoryManager)
            inventory_manager.transfer_storage_to_machine(
                session=db,
                factory_id=order.factory_id,
                machine_id=order.machine_id,
                parts=parts_data
            )

            # Advance order status (OrderManager)
            order = order_manager.advance_order_status(
                session=db,
                order_id=order_id,
                new_status_id=5,  # Completed
                user_id=user.id
            )

            # Commit both operations atomically
            db.commit()
            db.refresh(order)
            return order

        except Exception as e:
            db.rollback()
            raise
```

**Other workflows:**
- **STP** (Storage To Project): OrderManager + InventoryManager + ProjectManager
- **MTM** (Machine To Machine): OrderManager + InventoryManager + MachineManager
- **PFP** (Purchase For Project): OrderManager + ProjectManager (budget deduction)

### 2. Complex Workflows ⭐⭐⭐

**Example: Approve Order with Budget Check**

```python
class OrderService(BaseService):
    def approve_order_with_budget_check(
        self, db: Session, order_id: int, approver: Profile
    ) -> Order:
        """
        Approval workflow:
        1. Check RBAC permission
        2. Calculate total cost
        3. Check project budget
        4. Deduct from budget
        5. Approve parts
        6. Advance status
        """
        try:
            # RBAC check
            if not rbac_manager.can_approve_order(db, approver.id, order_id):
                raise PermissionError("Cannot approve this order")

            # Get order and calculate cost
            order = order_manager.get_order_with_parts(db, order_id)
            total_cost = sum(op.qty * op.unit_price for op in order.parts)

            # Budget check (if project order)
            if order.project_id:
                project = project_manager.get_project(db, order.project_id)
                if project.remaining_budget < total_cost:
                    raise ValueError(f"Insufficient budget: {project.remaining_budget}")

                # Deduct from budget
                project_manager.deduct_from_budget(db, order.project_id, total_cost)

            # Approve parts
            order_manager.approve_all_parts(db, order_id, approver.id)

            # Advance status
            order = order_manager.advance_order_status(
                db, order_id, new_status_id=2, user_id=approver.id
            )

            db.commit()
            db.refresh(order)
            return order

        except Exception as e:
            db.rollback()
            raise
```

### 3. Cross-Cutting Concerns ⭐⭐

**Example: Instant Add with Notifications**

```python
class InventoryService(BaseService):
    def instant_add_to_storage(
        self, db: Session, factory_id: int, parts: List[dict],
        user: Profile, remarks: str = None
    ) -> List[StoragePart]:
        """
        Instant add workflow:
        1. Check permission
        2. Add to storage + audit
        3. Commit
        4. Send notification (if large value)
        """
        try:
            # Permission check
            if not rbac_manager.has_feature_access(db, user.id, 'storage_instant_add'):
                raise PermissionError("No instant add permission")

            # Add to storage with audit (InventoryManager)
            storage_parts = inventory_manager.instant_add_to_storage(
                session=db,
                factory_id=factory_id,
                parts=parts,
                user_id=user.id,
                remarks=remarks
            )

            db.commit()

            # Cross-cutting: Send notification
            total_value = sum(p['qty'] * p['price'] for p in parts)
            if total_value > 10000:
                self._send_finance_notification(factory_id, parts, user, total_value)

            return storage_parts

        except Exception as e:
            db.rollback()
            raise

    def _send_finance_notification(self, factory_id, parts, user, total_value):
        """Send email to finance team for high-value instant adds"""
        # Email service call here
        pass
```

### 4. Transaction Boundaries ⭐⭐⭐ (Always)

**All services must:**
- Call `db.commit()` on success
- Call `db.rollback()` on failure
- Call `db.refresh()` after commit (for returned entities)

### 5. External Integrations ⭐ (Future)

```python
class OrderService(BaseService):
    def create_order_with_supplier_quote(self, db: Session, order_in: OrderCreate):
        """Future: Integration with supplier API"""
        try:
            # Create order
            order = order_manager.create_order_with_parts(db, ...)

            # External API call
            quote = supplier_api.get_quote(order.parts)
            order = order_manager.update_with_quote(db, order.id, quote)

            db.commit()
            return order
        except:
            db.rollback()
            raise
```

### 6. Authorization & Feature Flags ⭐

```python
class OrderService(BaseService):
    def delete_order(self, db: Session, order_id: int, user: Profile):
        """Check RBAC and feature flags"""
        try:
            # Feature flag check
            if not app_settings.get(db, 'order_delete_enabled'):
                raise PermissionError("Order deletion is disabled")

            # RBAC check
            if not rbac_manager.has_feature_access(db, user.id, 'order_delete'):
                raise PermissionError("No delete permission")

            order_manager.delete_order(db, order_id)
            db.commit()

        except:
            db.rollback()
            raise
```

---

## When to Skip Service Layer?

**You CAN call Manager directly from Endpoint for:**

1. **Simple reads (no transaction needed):**
   ```python
   @router.get("/parts")
   def get_parts(db: Session):
       return part_manager.search_parts(db, skip=0, limit=100)
   ```

2. **Very simple CRUD (but not recommended):**
   ```python
   @router.post("/factories")
   def create_factory(factory_in: FactoryCreate, db: Session):
       try:
           factory = factory_manager.create_factory(db, factory_in)
           db.commit()
           db.refresh(factory)
           return factory
       except:
           db.rollback()
           raise
   ```

**But even for simple operations, having a thin service helps with:**
- Consistent error handling
- Future extensibility (add notifications later)
- Centralized transaction management
- Testing (mock services in integration tests)

---

## Layer Responsibilities

### Layer 1: Endpoints (HTTP)

**Purpose:** Handle HTTP requests and responses

**Rules:**
- ✅ DO call services
- ✅ DO handle HTTP errors (404, 400, 500)
- ✅ DO validate input (Pydantic)
- ✅ DO check authentication
- ❌ DO NOT implement business logic
- ❌ DO NOT commit/rollback transactions
- ❌ DO NOT call managers/DAOs directly

**Example:**
```python
@router.post("/orders/{order_id}/process-stm")
def process_stm_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_active_user)
):
    try:
        order = order_service.process_stm_order(db, order_id, current_user)
        return order
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")
```

### Layer 2: Services (Orchestration)

**Purpose:** Orchestrate workflows and manage transactions

**Rules:**
- ✅ DO call managers
- ✅ DO commit/rollback transactions
- ✅ DO orchestrate multiple managers
- ✅ DO call `db.refresh()` after commit
- ✅ DO handle cross-cutting concerns (email, notifications)
- ✅ DO implement complex workflows
- ❌ DO NOT implement business logic (delegate to managers)
- ❌ DO NOT call DAOs directly (use managers)

### Layer 3: Managers (Business Logic)

**Three types: Aggregate, Utility, Standalone**

**Rules:**
- ✅ DO call DAOs
- ✅ DO receive session from service
- ✅ DO pass session to DAOs
- ✅ DO implement business validation
- ✅ DO raise domain exceptions (ValueError, etc.)
- ✅ DO coordinate related DAOs (for aggregates)
- ❌ DO NOT commit/rollback
- ❌ DO NOT call `db.refresh()`
- ❌ DO NOT handle HTTP concerns

**Aggregate Manager Example:**
```python
class OrderManager:
    """Aggregate: Order + OrderPart + StatusTracker"""
    def __init__(self):
        self.order_dao = order_dao
        self.order_part_dao = order_part_dao
        self.status_tracker_dao = status_tracker_dao
```

**Utility Manager Example:**
```python
class InventoryManager:
    """Utility: Cross-cutting inventory operations"""
    def __init__(self):
        self.storage_part_dao = storage_part_dao
        self.machine_part_dao = machine_part_dao
        self.damaged_part_dao = damaged_part_dao
```

**Standalone Manager Example:**
```python
class PartManager:
    """Standalone: Simple entity, no children"""
    def __init__(self):
        self.part_dao = part_dao
```

### Layer 4: DAOs (Data Access)

**Purpose:** Pure database operations

**Rules:**
- ✅ DO use `db.flush()` to make changes visible
- ✅ DO use `db.add()`, `db.query()`, `db.delete()`
- ✅ DO receive session from manager
- ✅ DO 1:1 mapping to database tables
- ❌ DO NOT commit (use `flush()` instead)
- ❌ DO NOT rollback
- ❌ DO NOT call `db.refresh()`
- ❌ DO NOT implement business logic

**Example:**
```python
class OrderDAO(BaseDAO[Order, OrderCreate, OrderUpdate]):
    def create_with_user(self, db: Session, obj_in: OrderCreate, user_id: int) -> Order:
        db_obj = Order(**obj_in.model_dump(), created_by_user_id=user_id, current_status_id=1)
        db.add(db_obj)
        db.flush()  # NOT commit!
        return db_obj
```

---

## ERP-Specific Workflows

### Order Type Workflows

| Order Type | Description | Managers Used |
|------------|-------------|---------------|
| **PFM** | Purchase For Machine | OrderManager + (future: external supplier API) |
| **PFS** | Purchase For Storage | OrderManager + InventoryManager |
| **STM** | Storage To Machine | OrderManager + InventoryManager |
| **STP** | Storage To Project | OrderManager + InventoryManager + ProjectManager |
| **PFP** | Purchase For Project | OrderManager + ProjectManager |
| **MTM** | Machine To Machine | OrderManager + InventoryManager + MachineManager |

### Inventory Operations

| Operation | Service | Managers Used |
|-----------|---------|---------------|
| Instant Add Storage | InventoryService | InventoryManager + AuditManager |
| Instant Add Machine | InventoryService | InventoryManager + MachineManager + AuditManager |
| Transfer Storage→Machine | OrderService (STM) | InventoryManager + OrderManager |
| Transfer Machine→Machine | OrderService (MTM) | InventoryManager + OrderManager + MachineManager |
| Mark Damaged | InventoryService | InventoryManager + AuditManager |

---

## Testing Strategy

### Layer 4: DAO Testing (Unit Tests with DB)
```python
def test_order_dao_create():
    session = create_test_session()
    dao = OrderDAO(Order)
    order = dao.create_with_user(session, OrderCreate(...), user_id=1)
    assert order.id is not None
```

### Layer 3: Manager Testing (Mock DAOs)
```python
def test_order_manager_create_with_parts():
    mock_session = MagicMock()
    manager = OrderManager()
    manager.order_dao = MagicMock()
    manager.order_part_dao = MagicMock()

    manager.create_order_with_parts(mock_session, {...}, [{...}], 1)

    manager.order_dao.create_with_user.assert_called_once()
    manager.order_part_dao.create.assert_called()
```

### Layer 2: Service Testing (Mock Managers)
```python
def test_order_service_process_stm():
    mock_db = MagicMock()
    service = OrderService()
    service.order_manager = MagicMock()
    service.inventory_manager = MagicMock()

    service.process_stm_order(mock_db, order_id=1, user=mock_user)

    mock_db.commit.assert_called_once()
```

### Layer 1: Endpoint Testing (Integration)
```python
def test_process_stm_endpoint():
    response = client.post(
        "/api/v1/orders/1/process-stm",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
```

---

## Naming Conventions

### Classes
- **Endpoints:** Function names (`get_orders`, `create_order`)
- **Services:** `{Domain}Service` (`OrderService`, `InventoryService`)
- **Managers:** `{Domain}Manager` (`OrderManager`, `InventoryManager`)
- **DAOs:** `{Model}DAO` or `DAO{Model}` (`OrderDAO`)

### Instances (singletons)
- **Services:** `{domain}_service` (`order_service`)
- **Managers:** `{domain}_manager` (`order_manager`)
- **DAOs:** `{model}_dao` (`order_dao`)

### Methods
- **Services:** Workflow names (`process_stm_order`, `approve_order_with_budget_check`)
- **Managers:** Business operations (`create_order_with_parts`, `transfer_storage_to_machine`)
- **DAOs:** CRUD operations (`create`, `get`, `update`, `remove`, `get_by_*`)

---

## Decision Matrix: Aggregate vs Standalone Manager

| Entity | Has Children? | Business Rules Span Children? | Manager Type |
|--------|---------------|-------------------------------|--------------|
| Order | Yes (OrderPart, StatusTracker) | Yes (must have parts and status) | **Aggregate** |
| Machine | Yes (MachinePart) | Yes (operability depends on parts) | **Aggregate** |
| Project | Yes (Component, Task, Part) | Yes (completion depends on components) | **Aggregate** |
| Part | No | No | **Standalone** |
| Factory | No | No | **Standalone** |
| StoragePart | No | No (transfers handled by InventoryManager) | **Utility handles it** |

---

## Future Extensions

### AI Integration
```python
class OrderService(BaseService):
    def create_order_with_ai_suggestions(self, db: Session, order_in: OrderCreate):
        try:
            # AI suggests optimal parts
            suggestions = ai_service.suggest_parts(order_in)

            # User can accept/modify suggestions
            order = order_manager.create_order_with_parts(db, ...)

            db.commit()
            return order
        except:
            db.rollback()
            raise
```

Just add `app/ai/` folder and call from services!

---

## Key Takeaways

1. **Services coordinate managers** - they don't implement business logic
2. **Aggregate managers encapsulate** Order+Parts+Status as one unit
3. **Utility managers are reusable** - InventoryManager used by multiple services
4. **DAOs are dumb** - just database operations, no logic
5. **Transactions live in services** - only services commit/rollback
6. **Workflows are complex** - STM, STP, MTM need multiple managers coordinated

---

## Migration Status

✅ **Fully Migrated:**
- `BaseDAO`, `BaseManager`, `BaseService` created
- `OrderService` → `OrderManager` → `OrderDAO`
- `PartService` → `PartManager` → `PartDAO`

⚠️ **Needs Refactoring:**
- Other services need to be created with proper workflow orchestration
- Managers need to be categorized (Aggregate, Utility, Standalone)
- Complex workflows (STM, STP, MTM) need to be implemented in services

📝 **Next Steps:**
1. Refactor managers into Aggregate/Utility/Standalone categories
2. Implement order workflow services (STM, STP, MTM, etc.)
3. Create InventoryManager for cross-cutting inventory operations
4. Add email/notification infrastructure to services
5. Write comprehensive tests for each layer
