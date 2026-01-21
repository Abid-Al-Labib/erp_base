# Database Schema Documentation

This document describes the database schema for the ERP system, with a focus on newly added tables and recent schema changes.

## Table of Contents

1. [Attachments System](#attachments-system)
2. [Machine Events](#machine-events)
3. [Vendors](#vendors)
4. [Schema Changes](#schema-changes)

---

## Attachments System

The attachments system provides file upload and management capabilities across multiple entities (orders, projects, project components).

### Table: `attachments`

Stores metadata about uploaded files.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | Integer | Primary Key, Auto-increment | Unique identifier |
| `file_url` | String | Not Null | URL/path to the uploaded file |
| `file_name` | String | Not Null | Original filename |
| `mime_type` | String | Not Null | File MIME type (e.g., "application/pdf") |
| `file_size` | BigInteger | Not Null | File size in bytes |
| `uploaded_by` | Integer | FK → `profiles.id`, Not Null | User who uploaded the file |
| `uploaded_at` | DateTime | Not Null, Server Default | Timestamp of upload |
| `note` | Text | Nullable | Optional notes about the attachment |
| `is_deleted` | Boolean | Not Null, Default: False | Soft delete flag |
| `deleted_at` | DateTime | Nullable | Timestamp of soft deletion |
| `deleted_by` | Integer | FK → `profiles.id`, Nullable | User who deleted the file |

**Relationships:**
- `uploader` → Profile (via `uploaded_by`)
- `deleter` → Profile (via `deleted_by`)

**Key Features:**
- Soft delete support with audit trail
- Tracks file metadata without storing actual file content
- File size tracking for storage management

---

### Table: `order_attachments`

Junction table linking orders to attachments.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | Integer | Primary Key, Auto-increment | Unique identifier |
| `order_id` | Integer | FK → `orders.id`, Not Null, Indexed, ON DELETE CASCADE | Order reference |
| `attachment_id` | Integer | FK → `attachments.id`, Not Null, Indexed, ON DELETE CASCADE | Attachment reference |
| `attached_at` | DateTime | Not Null, Server Default | Timestamp when attached |
| `attached_by` | Integer | FK → `profiles.id`, Not Null | User who attached the file |

**Relationships:**
- `order` → Order
- `attachment` → Attachment
- `attacher` → Profile

**Usage:**
```python
# Get all attachments for an order
attachments = order_attachment_dao.get_by_order(db, order_id=123)

# Link an attachment to an order
link = OrderAttachmentCreate(
    order_id=123,
    attachment_id=456,
    attached_by=current_user.id
)
order_attachment_dao.create(db, obj_in=link)
```

---

### Table: `project_attachments`

Junction table linking projects to attachments.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | Integer | Primary Key, Auto-increment | Unique identifier |
| `project_id` | Integer | FK → `projects.id`, Not Null, Indexed, ON DELETE CASCADE | Project reference |
| `attachment_id` | Integer | FK → `attachments.id`, Not Null, Indexed, ON DELETE CASCADE | Attachment reference |
| `attached_at` | DateTime | Not Null, Server Default | Timestamp when attached |
| `attached_by` | Integer | FK → `profiles.id`, Not Null | User who attached the file |

**Relationships:**
- `project` → Project
- `attachment` → Attachment
- `attacher` → Profile

---

### Table: `project_component_attachments`

Junction table linking project components to attachments.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | Integer | Primary Key, Auto-increment | Unique identifier |
| `project_component_id` | Integer | FK → `project_components.id`, Not Null, Indexed, ON DELETE CASCADE | Project component reference |
| `attachment_id` | Integer | FK → `attachments.id`, Not Null, Indexed, ON DELETE CASCADE | Attachment reference |
| `attached_at` | DateTime | Not Null, Server Default | Timestamp when attached |
| `attached_by` | Integer | FK → `profiles.id`, Not Null | User who attached the file |

**Relationships:**
- `project_component` → ProjectComponent
- `attachment` → Attachment
- `attacher` → Profile

---

## Machine Events

The machine events system provides audit logging for machine status changes (ON, OFF, REPAIRING, REPLACING).

### Table: `machine_events`

Tracks machine status changes and maintenance events.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | Integer | Primary Key, Auto-increment | Unique identifier |
| `machine_id` | Integer | FK → `machines.id`, Not Null, Indexed | Machine reference |
| `event_type` | Enum | Not Null | Type of event (see MachineEventTypeEnum) |
| `started_at` | DateTime | Not Null, Server Default | When the event started |
| `initiated_by` | Integer | FK → `profiles.id`, Nullable | User who initiated the event (NULL = system) |
| `note` | Text | Nullable | Additional notes about the event |

**Relationships:**
- `machine` → Machine
- `initiator` → Profile (nullable for system-initiated events)

**Event Types (MachineEventTypeEnum):**
- `ON` - Machine is turned on/running
- `OFF` - Machine is turned off/idle
- `REPAIRING` - Machine is under repair
- `REPLACING` - Machine is being replaced

**Key Features:**
- Tracks both user-initiated and system-initiated events
- Chronological history of machine status changes
- Supports undo/rollback functionality through event log
- Can determine current machine state from latest event

**Usage:**
```python
# Log a machine event
event = MachineEventCreate(
    machine_id=5,
    event_type=MachineEventTypeEnum.REPAIRING,
    initiated_by=current_user.id,  # or None for system
    note="Broken gear replacement"
)
machine_event_dao.create(db, obj_in=event)

# Get latest event for a machine
latest = machine_event_dao.get_latest_by_machine(db, machine_id=5)

# Get all events for a machine
events = machine_event_dao.get_by_machine(db, machine_id=5)
```

---

## Vendors

The vendors system normalizes vendor/supplier information.

### Table: `vendors`

Stores vendor/supplier information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | Integer | Primary Key, Auto-increment | Unique identifier |
| `name` | String | Not Null, Indexed | Vendor/supplier name |
| `vendor_code` | String | Unique, Indexed, Nullable | Internal reference code (e.g., "VEN-001") |
| **Primary Contact** | | | |
| `primary_contact_person` | String | Nullable | Primary contact person name |
| `primary_email` | String | Nullable | Primary contact email |
| `primary_phone` | String | Nullable | Primary contact phone |
| **Secondary Contact** | | | |
| `secondary_contact_person` | String | Nullable | Secondary contact person name |
| `secondary_email` | String | Nullable | Secondary contact email |
| `secondary_phone` | String | Nullable | Secondary contact phone |
| **Business Address** | | | |
| `address` | Text | Nullable | Full business address |
| `city` | String | Nullable | City |
| `country` | String | Nullable | Country |
| **Notes** | | | |
| `note` | Text | Nullable | General notes/comments |
| **Audit Trail** | | | |
| `created_at` | DateTime | Not Null, Server Default | Creation timestamp |
| `created_by` | Integer | FK → `profiles.id`, Not Null | User who created the vendor |
| `updated_at` | DateTime | Nullable, On Update | Last update timestamp |
| `updated_by` | Integer | FK → `profiles.id`, Nullable | User who last updated |
| **Status** | | | |
| `is_active` | Boolean | Not Null, Default: True | Active/inactive flag |
| `is_deleted` | Boolean | Not Null, Default: False | Soft delete flag |
| `deleted_at` | DateTime | Nullable | Soft deletion timestamp |
| `deleted_by` | Integer | FK → `profiles.id`, Nullable | User who deleted |

**Relationships:**
- `creator` → Profile (via `created_by`)
- `updater` → Profile (via `updated_by`)
- `deleter` → Profile (via `deleted_by`)

**Key Features:**
- Dual contact system (primary + secondary)
- Business address separate from contact info
- Complete audit trail (created, updated, deleted)
- Two-level status system: `is_active` (business logic) + `is_deleted` (data retention)
- Soft delete with tracking

**Usage:**
```python
# Create a vendor
vendor = VendorCreate(
    name="ABC Supplies Inc.",
    vendor_code="VEN-001",
    primary_contact_person="John Doe",
    primary_email="john@abcsupplies.com",
    primary_phone="+1-555-0100",
    address="123 Industrial Blvd",
    city="Karachi",
    country="Pakistan",
    created_by=current_user.id
)
vendor_dao.create(db, obj_in=vendor)

# Search vendors by name
vendors = vendor_dao.search_by_name(db, name="ABC")

# Get active vendors only
active_vendors = vendor_dao.get_active_vendors_only(db)

# Check vendor usage before deleting
usage_count = vendor_dao.get_vendor_usage_count(db, vendor_id=123)
if usage_count == 0:
    vendor_dao.soft_delete(db, id=123, deleted_by=current_user.id)
```

---

## Schema Changes

### Modified Table: `order_parts`

**Changed Fields:**

| Old Field | New Field | Type | Description |
|-----------|-----------|------|-------------|
| `vendor` (String) | `vendor_id` | Integer, FK → `vendors.id` | Changed from free-text to normalized FK |

**Migration Impact:**
- Old `vendor` field (string) has been replaced with `vendor_id` (foreign key)
- Existing string vendor data will need to be migrated to the vendors table
- New relationship: `vendor` → Vendor

**Benefits:**
- Data normalization and integrity
- Easier vendor management and updates
- Better analytics and reporting
- Consistent vendor information across orders

**Usage:**
```python
# Get order parts by vendor
parts = order_part_dao.get_by_vendor(db, vendor_id=123)

# Access vendor info from order part
order_part = order_part_dao.get(db, id=456)
vendor_name = order_part.vendor.name
vendor_email = order_part.vendor.primary_email
```

---

## DAO Layer

All new tables follow the **4-layer architecture** pattern with comprehensive DAO methods:

### Attachment DAOs

**AttachmentDAO** (`app/dao/attachment.py`):
- `get_active()` - Get non-deleted attachment
- `get_multi_active()` - Get multiple non-deleted attachments
- `get_by_uploader()` - Get attachments by uploader
- `soft_delete()` - Soft delete attachment
- `restore()` - Restore soft-deleted attachment

**Junction DAOs** (`order_attachment_dao`, `project_attachment_dao`, `project_component_attachment_dao`):
- `get_by_{entity}()` - Get all attachments for entity
- `get_by_attachment()` - Get all entity links for attachment
- `get_link()` - Get specific entity-attachment link
- `link_exists()` - Check if link exists
- `unlink()` - Remove link
- `get_attachment_count()` - Count attachments for entity

### Machine Event DAO

**MachineEventDAO** (`app/dao/machine_event.py`):
- `get_by_machine()` - All events for machine (newest first)
- `get_by_type()` - Events by type
- `get_latest_by_machine()` - Most recent event
- `get_by_machine_and_type()` - Filtered events
- `get_system_initiated()` - System-initiated events
- `get_user_initiated()` - User-initiated events
- `get_events_in_date_range()` - Events in date range
- `count_by_machine()` - Count events per machine
- `count_by_type()` - Count events by type

### Vendor DAO

**VendorDAO** (`app/dao/vendor.py`):
- `get_active()` - Get non-deleted vendor
- `get_multi_active()` - Get multiple non-deleted vendors
- `get_by_vendor_code()` - Find by vendor code
- `search_by_name()` - Search by name (partial match)
- `get_active_vendors_only()` - Active AND non-deleted
- `get_inactive_vendors()` - Inactive but not deleted
- `get_by_creator()` - Vendors by creator
- `soft_delete()` - Soft delete vendor
- `restore()` - Restore soft-deleted vendor
- `toggle_active()` - Toggle active status
- `update_with_user()` - Update with audit tracking
- `count_active()` - Count active vendors
- `get_vendor_usage_count()` - Count order parts using vendor

---

## Enums

### MachineEventTypeEnum

```python
class MachineEventTypeEnum(str, enum.Enum):
    ON = "ON"
    OFF = "OFF"
    REPAIRING = "REPAIRING"
    REPLACING = "REPLACING"
```

Location: `app/models/enums.py`

---

## Migration Notes

When you're ready to run migrations with Alembic:

1. **Import new models** - Already added to `app/db/base.py`:
   ```python
   from app.models.attachment import Attachment
   from app.models.order_attachment import OrderAttachment
   from app.models.project_attachment import ProjectAttachment
   from app.models.project_component_attachment import ProjectComponentAttachment
   from app.models.machine_event import MachineEvent
   from app.models.vendor import Vendor
   ```

2. **Generate migration**:
   ```bash
   cd backend
   alembic revision --autogenerate -m "add attachments, machine events, and vendors tables"
   ```

3. **Review migration file** in `alembic/versions/`

4. **Apply migration**:
   ```bash
   alembic upgrade head
   ```

5. **Data migration for order_parts.vendor**:
   - Create a data migration script to:
     1. Extract unique vendor strings from existing `order_parts.vendor` field
     2. Create vendor records in `vendors` table
     3. Update `order_parts.vendor_id` with new vendor IDs
     4. Verify all order parts have valid vendor references

---

## Best Practices

1. **Soft Deletes**: Always use soft delete methods (`soft_delete()`) instead of hard deletes for audit trail
2. **Audit Tracking**: Use `created_by`, `updated_by`, `deleted_by` fields to track user actions
3. **No Commits in DAO**: All DAO methods use `flush()` only; services handle `commit()`/`rollback()`
4. **Active Status**: Check both `is_active` and `is_deleted` for business logic
5. **Cascade Deletes**: Junction tables use `ON DELETE CASCADE` to maintain referential integrity
6. **File Storage**: `attachments.file_url` should point to actual file storage (S3, local filesystem, etc.)

---

## Future Considerations

- **Attachment Versioning**: Track file versions/revisions
- **Vendor Performance Metrics**: Rating, quality scores, delivery times
- **Machine Event State Management**: Track event completion/resolution
- **Vendor-Part Pricing**: Link vendors to specific parts with pricing
- **Multi-factory Vendor Support**: Vendor availability per factory
