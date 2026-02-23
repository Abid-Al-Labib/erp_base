# Production Module - Implementation Plan & Progress

**Created:** February 3, 2025
**Status:** 🟢 Code Complete (Phases 1-3)
**Completed:** ~85% (Code done, testing remaining)

---

## Overview

The Production Module is a **formula-driven manufacturing system** that tracks expected vs actual production for variance analysis and efficiency measurement.

### Core Concept
```
1. Create Formula (recipe/BOM)
   ↓
2. Start Batch (system calculates expected values)
   ↓
3. Log Actual Production
   ↓
4. Compare Variance (expected vs actual)
```

### Key Features
- **Production Lines** - Physical production locations (can attach to machines or standalone)
- **Production Formulas** - Recipes/BOM defining inputs → outputs + waste/byproducts
- **Production Batches** - Actual production runs with variance tracking
- **Dual Mode**: Simple mode (just log output) vs Formula mode (full variance analysis)
- **Inventory Integration** - Auto-updates ledgers when batches complete

---

## Architecture Pattern

Based on completed Items feature, using standard 4-layer architecture:

```
┌─────────────────────────────────────────────────────────┐
│  Layer 1: ENDPOINT (*.py in endpoints/)                 │
│  - HTTP request/response handling                       │
│  - Calls: service layer                                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Layer 2: SERVICE (*_service.py in services/)           │
│  - Transaction management (commit/rollback)             │
│  - Calls: manager layer                                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Layer 3: MANAGER (*_manager.py in managers/)           │
│  - Business logic                                       │
│  - Uses flush() - NO commits                            │
│  - Calls: DAO layer                                     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Layer 4: DAO (*.py in dao/)                            │
│  - Pure database operations                             │
│  - Workspace-filtered queries                           │
└─────────────────────────────────────────────────────────┘
```

---

## What's Already Done ✅

| Component | Status | Files |
|-----------|--------|-------|
| **Models** | ✅ COMPLETE | 5 files (production_line, formula, formula_item, batch, batch_item) |
| **Schemas** | ✅ COMPLETE | 5 files (all Pydantic schemas done) |
| **DAOs** | ✅ COMPLETE | 5 files (all with workspace-filtered queries) |
| **Managers** | ✅ COMPLETE | 3 files (production_line, production_formula, production_batch) |
| **Services** | ✅ COMPLETE | 3 files (production_line, production_formula, production_batch) |
| **Endpoints** | ✅ COMPLETE | 3 files (5 + 9 + 12 = 26 routes total) |

---

## Implementation Phases

### Phase 1: Production Lines API ✅ COMPLETE
**Status:** ✅ Complete
**Started:** February 3, 2025
**Completed:** February 3, 2025

#### Scope
Production Lines are the simplest component - just CRUD operations with factory/machine validation.

#### Files Created
- [x] `backend/app/managers/production_line_manager.py` - Business logic with factory/machine validation
- [x] `backend/app/services/production_line_service.py` - Transaction management
- [x] `backend/app/api/v1/endpoints/production_lines.py` - 5 REST endpoints

#### Implementation Notes
- Machine → factory validation traverses `machine.factory_section_id → FactorySection.factory_id` (machines don't have direct factory_id)
- Added all 5 production model imports to `db/base.py` for Alembic discovery

#### API Endpoints
1. `GET /production-lines` - List all production lines
2. `GET /production-lines/{id}` - Get single production line
3. `POST /production-lines` - Create production line
4. `PUT /production-lines/{id}` - Update production line
5. `DELETE /production-lines/{id}` - Soft delete production line

#### Business Logic
- Simple CRUD (no complex relationships)
- Validate factory exists
- Validate machine exists (if provided)
- Workspace isolation
- Soft delete (set `is_active = False`)

#### Acceptance Criteria
- [ ] All 5 endpoints working in Swagger UI
- [ ] Workspace isolation tested (cannot access other workspace's lines)
- [ ] Factory validation working
- [ ] Machine validation working (when provided)
- [ ] Soft delete working

#### Notes
- Production line can be standalone OR attached to a machine
- `machine_id` is nullable in database
- Need to validate both factory and machine belong to same workspace

---

### Phase 2: Production Formulas API ✅ COMPLETE
**Status:** ✅ Complete
**Started:** February 3, 2025
**Completed:** February 3, 2025

#### Scope
Production Formulas define recipes (BOM) with inputs, outputs, waste, and byproducts.

#### Files Created
- [x] `backend/app/managers/production_formula_manager.py` - Formula + formula item business logic
- [x] `backend/app/services/production_formula_service.py` - Transaction management
- [x] `backend/app/api/v1/endpoints/production_formulas.py` - 9 routes (5 formula + 4 formula items)

#### Implementation Notes
- Manager handles both formulas AND formula items (tightly coupled)
- Validates formula_code uniqueness per workspace
- Validates output_item_id exists in workspace
- Default formula management: setting is_default=True clears other defaults for same output item
- Formula items support 4 roles: input, output, waste, byproduct
- Formula items are nested under formula routes: `/{formula_id}/items`
- Item update/delete routes use `/items/{formula_item_id}` for flat access

#### API Endpoints
1. `GET /production-formulas` - List all formulas
2. `GET /production-formulas/{id}` - Get formula with items
3. `POST /production-formulas` - Create formula with items
4. `PUT /production-formulas/{id}` - Update formula
5. `DELETE /production-formulas/{id}` - Soft delete formula
6. `GET /production-formulas/{id}/items` - Get formula items breakdown

#### Business Logic
- Create formula + formula_items in one transaction
- Validate output_item exists
- Validate all input items exist
- Set default formula per output item
- Version management for formula updates
- Calculate material requirements helper method

#### Key Manager Methods
```python
def calculate_required_materials(formula_id, target_quantity):
    """Given target output, calculate needed inputs"""

def get_formulas_by_output_item(output_item_id):
    """Get all formulas that produce this item"""

def set_as_default_formula(formula_id):
    """Set this as default formula for its output item"""
```

#### Acceptance Criteria
- [ ] Can create formula with multiple items (inputs, outputs, waste, byproducts)
- [ ] Formula versioning works
- [ ] Default formula logic works
- [ ] Material calculation method accurate
- [ ] Formula with items returned together in GET requests

#### Notes
- Formula items have `item_role` field: 'input' | 'output' | 'waste' | 'byproduct'
- Base quantity stored in `output_quantity` (e.g., "per 1000 kg")
- Formula can be versioned when updated

---

### Phase 3: Production Batches API ✅ COMPLETE
**Status:** ✅ Complete
**Started:** February 3, 2025
**Completed:** February 3, 2025

#### Scope
Production Batches track actual production runs with full variance analysis.

#### Files Created
- [x] `backend/app/managers/production_batch_manager.py` - Batch workflow + item logic
- [x] `backend/app/services/production_batch_service.py` - Transaction management
- [x] `backend/app/api/v1/endpoints/production_batches.py` - 12 routes (7 batch + 2 workflow + 3 items)

#### Implementation Notes
- Batch workflow: draft → in_progress → completed (or cancelled at any point)
- `start_batch`: If formula attached, calculates expected values using multiplier (target_qty / formula.output_qty), creates batch items from formula items
- `complete_batch`: Calculates output variance (qty, percentage, efficiency), per-item variance for all batch items
- Status guards: cannot update completed/cancelled batches, cannot add/remove items from completed batches
- Inline request schemas (StartBatchRequest, CompleteBatchRequest, CancelBatchRequest) for workflow endpoints
- Ledger integration is NOT yet implemented in complete_batch - this is deferred to Phase 4 or future work

#### API Endpoints
1. `GET /production-batches` - List batches (with filters)
2. `GET /production-batches/{id}` - Get batch with items
3. `POST /production-batches` - Create draft batch
4. `POST /production-batches/{id}/start` - Start batch (set expected values)
5. `POST /production-batches/{id}/complete` - Complete batch (log actual, update ledgers)
6. `PUT /production-batches/{id}` - Update batch (draft only)
7. `DELETE /production-batches/{id}` - Cancel batch
8. `GET /production-batches/{id}/variance` - Get variance analysis

#### Complex Business Logic

**When Starting Batch:**
```python
def start_batch(batch_id, target_quantity):
    1. Load formula
    2. Calculate multiplier = target_quantity / formula.output_quantity
    3. Calculate expected inputs (formula_items * multiplier)
    4. Calculate expected outputs, waste, byproducts
    5. Create production_batch_items for all expected items
    6. Set status = 'in_progress'
    7. Record started_by, started_at
    8. Check material availability (optional warning)
```

**When Completing Batch:**
```python
def complete_batch(batch_id, actual_data):
    # 1. Update batch with actual values
    - actual_output_quantity
    - actual_duration_minutes
    - actual_start_time, actual_end_time

    # 2. Calculate variance
    - output_variance_quantity = actual - expected
    - output_variance_percentage = (variance / expected) * 100
    - efficiency_percentage = (actual / expected) * 100

    # 3. Update production_batch_items with actual quantities

    # 4. INVENTORY INTEGRATION (CRITICAL)
    For each INPUT item:
        - Create storage_item_ledger (transfer_out, source='production')
        - Update storage_items snapshot

    For each OUTPUT item:
        - Create inventory_ledger (transfer_in, source='production')
        - Update inventory snapshot

    For each WASTE item:
        - Create damaged_item_ledger (transfer_in, source='production')
        - Update damaged_items snapshot

    # 5. Finalize batch
    - Set status = 'completed'
    - Record completed_by, completed_at
```

#### Key Manager Methods
```python
def start_batch(batch_id, target_quantity):
    """Start batch and calculate expected values from formula"""

def complete_batch(batch_id, actual_data):
    """Complete batch, calculate variance, update inventory"""

def get_variance_report(batch_id):
    """Detailed variance analysis for a batch"""

def get_efficiency_stats(production_line_id, date_range):
    """Analytics: efficiency over time for a production line"""

def check_material_availability(formula_id, target_quantity):
    """Check if enough materials available for batch"""
```

#### Acceptance Criteria
- [ ] Can create draft batch (with or without formula)
- [ ] Start batch calculates expected values correctly
- [ ] Complete batch updates all ledgers correctly
- [ ] Variance calculations accurate
- [ ] Inventory snapshots updated correctly
- [ ] Batch number auto-generated (BATCH-2025-001)
- [ ] Status transitions enforced (draft → in_progress → completed)
- [ ] Cannot complete batch twice
- [ ] Cannot edit completed batch

#### Ledger Integration Details
```
Batch Completion → Multiple Ledger Entries:

1. storage_item_ledger (for each input consumed)
   - transaction_type: 'transfer_out'
   - source_type: 'production'
   - source_id: batch.id
   - quantity: actual_quantity_used

2. inventory_ledger (for each output produced)
   - transaction_type: 'transfer_in'
   - source_type: 'production'
   - source_id: batch.id
   - quantity: actual_quantity_produced

3. damaged_item_ledger (for each waste generated)
   - transaction_type: 'transfer_in'
   - source_type: 'production'
   - source_id: batch.id
   - quantity: actual_waste_quantity
```

#### Notes
- Batch can be created WITHOUT formula (simple mode)
- If formula provided, expected values calculated
- Status flow: draft → in_progress → completed (or cancelled)
- Variance only calculated when completing with formula
- Batch number format: `BATCH-{year}-{sequence}` (e.g., BATCH-2025-001)

---

### Phase 4: Integration & Testing ⏸️ NOT STARTED
**Status:** ⚪ Not Started
**Estimated Effort:** 2-3 hours
**Dependencies:** Phases 1, 2, 3

#### Tasks
- [ ] Add all routes to main router (`app/api/v1/router.py`)
- [ ] Test all endpoints in Swagger UI (`http://localhost:8000/docs`)
- [ ] Test workspace isolation (critical security test)
- [ ] Test ledger integration (verify inventory updates)
- [ ] Test variance calculations with real data
- [ ] Error handling for edge cases
- [ ] Test material availability checks
- [ ] Test formula versioning
- [ ] Performance testing (batch completion with many items)

#### Security Testing Checklist
- [ ] Cannot access production lines from other workspaces
- [ ] Cannot access formulas from other workspaces
- [ ] Cannot access batches from other workspaces
- [ ] Cannot use formulas from other workspaces in batches
- [ ] Cannot use items from other workspaces in formulas

#### Integration Testing Checklist
- [ ] Complete batch updates all correct ledgers
- [ ] Inventory snapshots match ledger balances
- [ ] Formula calculations accurate for different multipliers
- [ ] Batch number generation unique per workspace
- [ ] Status transitions enforced correctly

---

## Design Decisions

### 1. Ledger Integration Strategy ✅ DECIDED
**Decision:** Use existing inventory managers/services for ledger updates
**Rationale:** Consistency with rest of system, reuse existing logic
**Implementation:** ProductionBatchService calls InventoryManager for ledger entries

### 2. Simple Mode vs Formula Mode ✅ DECIDED
**Decision:** Single endpoint with conditional logic based on `formula_id`
**Rationale:** Simpler API, less duplication
**Implementation:** If `formula_id` provided, calculate expected; if null, skip expectations

### 3. Batch Number Generation ✅ DECIDED
**Decision:** Use existing DAO method: `BATCH-{year}-{sequence}`
**Format:** BATCH-2025-001, BATCH-2025-002, etc.
**Rationale:** Already implemented in DAO, simple and readable

### 4. Variance Calculation Timing ✅ DECIDED
**Decision:** Calculate variance only on batch completion
**Rationale:** Performance - no need to recalculate on every update
**Implementation:** Variance calculated in `complete_batch()` method only

---

## Progress Tracking

### Overall Progress
- [x] Phase 0: Planning & Documentation (This file)
- [x] Phase 1: Production Lines API ✅
- [x] Phase 2: Production Formulas API ✅
- [x] Phase 3: Production Batches API ✅
- [ ] Phase 4: Integration & Testing (manual testing + ledger integration)

### Summary of Created Files
| File | Layer | Routes |
|------|-------|--------|
| `managers/production_line_manager.py` | Manager | - |
| `services/production_line_service.py` | Service | - |
| `endpoints/production_lines.py` | Endpoint | 5 routes |
| `managers/production_formula_manager.py` | Manager | - |
| `services/production_formula_service.py` | Service | - |
| `endpoints/production_formulas.py` | Endpoint | 9 routes |
| `managers/production_batch_manager.py` | Manager | - |
| `services/production_batch_service.py` | Service | - |
| `endpoints/production_batches.py` | Endpoint | 12 routes |
| **Total** | **9 new files** | **26 routes** |

---

## Future Enhancements (Post-MVP)

### Potential Features to Add Later
- [ ] **Batch Scheduling** - Schedule batches in advance
- [ ] **Material Reservation** - Reserve materials for planned batches
- [ ] **Quality Control** - Add quality check steps in workflow
- [ ] **Batch Templates** - Save common batch configurations
- [ ] **Production Reports** - Dashboard with KPIs (efficiency, waste, etc.)
- [ ] **Alerts** - Notify when variance exceeds threshold
- [ ] **Cost Tracking** - Track production costs per batch
- [ ] **Labor Tracking** - Track labor hours per batch
- [ ] **Equipment Maintenance** - Link to maintenance schedules
- [ ] **Batch Photos** - Attach photos to batches for quality records

### API Enhancements
- [ ] Bulk batch operations (complete multiple batches)
- [ ] Export batch data to CSV/Excel
- [ ] Advanced filtering (by date range, efficiency threshold, etc.)
- [ ] Batch cloning (duplicate batch settings)
- [ ] Batch comparison (compare multiple batches)

---

## Known Issues & Blockers

### Current Issues
- None yet (just starting)

### Potential Blockers
- Need to verify ledger manager methods exist and work correctly
- Need to verify inventory manager can be called from production service
- Need to clarify cost tracking (not in current scope but may be needed)

---

## Notes & Feedback

### Development Notes
- Following same pattern as Items feature for consistency
- Using workspace isolation at every layer (critical for multi-tenancy)
- Transaction management at service layer only
- DAOs use flush(), services use commit()

### Feedback & Questions
- **Question:** Should batch completion be atomic? (All ledgers update or none)
  - **Answer:** Yes, all in one transaction via service layer commit/rollback

- **Question:** What happens if batch completion fails partway?
  - **Answer:** Service layer rollback ensures no partial updates

- **Question:** Should we check material availability before starting batch?
  - **Answer:** Optional warning, but don't block (materials might arrive)

---

## Related Documentation

- Main project documentation: `CLAUDE.md`
- API patterns: `backend/API.md`
- Authentication: `backend/AUTH.md`
- Database schema: `backend/db.md`

---

**Last Updated:** February 3, 2025
**Next Review:** Phase 4 - Manual testing via Swagger UI + ledger integration
