# Orders Module – Work in Progress

## Overview

This document tracks the ongoing work on the orders module (Purchase, Sales, Transfer, Expense, Work orders). Use it to continue next time.

---

## Completed

### 1. List consistency (left panel)

- **Width**: All order lists use `ORDER_LIST_WIDTH = 480px` from `orderListConstants.ts`.
- **Shared list row components**:
  - `PurchaseOrderListRow` – PO#, status, supplier, date, destination, item count, received status, total
  - `SalesOrderListRow` – SO#, status, customer, date, factory, item count, delivered status, total
  - `TransferOrderListRow` – TR#, status, source→dest, date, item count, approved status
  - `ExpenseOrderListRow` – EXP#, status, category, date, account, item count, total
  - `WorkOrderListRow` – WO#, status, title, date, work type, item count

### 2. Detail panel layout (right side)

- **Two-column layout**:
  - **Left**: Overview (order info, metadata, actions) – max width `ORDER_OVERVIEW_MAX_WIDTH = 380px`
  - **Right**: Items card – fixed width `ORDER_ITEMS_CARD_WIDTH = 520px`

- All five order types use this layout: Purchase, Sales, Transfer, Expense, Work.
- **Transfer Orders**: Source and destination shown as separate cards with arrow (→) between them. Location names resolved from factories, machines, projects.

### 3. Shared constants

**File**: `frontend/src/components/newcomponents/customui/orders/orderListConstants.ts`

```ts
ORDER_LIST_WIDTH = 480
ORDER_OVERVIEW_MAX_WIDTH = 380
ORDER_ITEMS_CARD_WIDTH = 520
```

### 4. Order status actions layout

- **Component**: `OrderStatusActions` (`OrderStatusActions.tsx`)
- **Layout**: Horizontal bar with three separate elements:
  - **Advance** – Primary button: "Advance to {next status} →"
  - **Status** – Dropdown to change status directly
  - **Delete** – Outline button with trash icon (when `onDelete` passed)
- **Used in**: Purchase, Transfer, Expense detail panels (Sales has no Delete)
- **Work orders**: Use their own status buttons, not OrderStatusActions

---

## Key file paths

| Purpose | Path |
|--------|------|
| Constants | `frontend/src/components/newcomponents/customui/orders/orderListConstants.ts` |
| Status actions | `frontend/src/components/newcomponents/customui/orders/OrderStatusActions.tsx` |
| List rows | `frontend/src/components/newcomponents/customui/orders/*OrderListRow.tsx` |
| Detail panels | `frontend/src/components/newcomponents/customui/orders/*OrderDetailPanel.tsx` |
| Add dialogs | `frontend/src/components/newcomponents/customui/orders/Add*OrderDialog.tsx` |
| Pages | `frontend/src/pages/newpages/orders/*OrdersPage.tsx` |
| Orders Overview | `frontend/src/pages/newpages/orders/OrdersOverviewPage.tsx` |
| Sales status mapping | `frontend/src/components/newcomponents/customui/orders/salesOrderStatusConstants.ts` |

---

## Routes

| Path | Page |
|------|------|
| `/orders` | Orders Overview (default landing) |
| `/orders/purchase` | Purchase Orders |
| `/orders/transfer` | Transfer Orders |
| `/orders/expense` | Expense Orders |
| `/orders/sales` | Sales Orders |
| `/orders/work` | Work Orders |

---

## Status workflow (March 2026)

- **Standard stages**: Pending → Approved → In Transit → Received (for Purchase, Transfer, Expense, Sales)
- **OrderStatusActions** component: Advance button + Change status dropdown on each detail panel
- **Statuses**: Standard workflow uses 4 statuses (id 1–4)
- **Work orders**: Use separate status enum (DRAFT, PENDING_APPROVAL, APPROVED, IN_PROGRESS, COMPLETED, CANCELLED)

---

## Sales Orders – Kanban + List (March 2026)

- **Kanban view**: 3 columns (Pending, Working, Completed) with draggable cards. Drag to another column opens modal to confirm status change.
- **List view**: Single list with status filter (All, Pending, Working, Completed).
- **Detail**: Popup modal (replaces side panel).
- **Card fields**: SO#, customer, amount, date, status, item count.
- **Status mapping**: Uses status **name** from API for Completed column (case-insensitive "Completed"). Fallback IDs: Pending=1, Working=2+3, Completed=4 or 8.
- **Files**: `salesOrderStatusConstants.ts`, `SalesOrderKanbanView.tsx`, `SalesOrderListView.tsx`, `SalesOrderStatusChangeModal.tsx`.

---

## Orders Overview Page (March 2026)

- **Route**: `/orders` – default landing when clicking Orders in sidebar.
- **Sidebar**: "Overview" added as first item in Orders submenu.
- **Features**:
  - Summary stats: Total orders, Pending approvals, Overdue, Pending value (this month)
  - Counts by type: Purchase, Transfer, Expense, Sales, Work (with values where applicable)
  - Status breakdown: Pie chart (Pending, Working, Completed)
  - Order value totals: Pending vs Completed this month
  - Factory breakdown: Orders and pending value per factory
  - Orders over time: Bar chart (last 7 days)
  - Recent activity: Last 10 orders across all types (links to each order type page)
- **Filters** (in header bar): Date range, Factory, Status.
- **Data**: Mock data for all sections.
- **File**: `frontend/src/pages/newpages/orders/OrdersOverviewPage.tsx`.

---

## Add Expense Order (March 2026)

- **Dialog**: `AddExpenseOrderDialog.tsx` – create single expense order with line items.
- **Fields**:
  - Account (optional – single account per order)
  - Category (required): Utilities, Payroll, Rent, Services, Maintenance, Other
  - Expense date, Due date
  - Description, Expense note
  - Line items: Description, Quantity, Unit (hr, day, month, pcs, kg, L, m, sqm), Unit price
- **Validation**: At least one line item required. Total calculated from line items.
- **API**: Uses `useCreateExpenseOrderMutation` – real backend. Account is optional (`account_id` nullable in schema).
- **Wired to**: Expense Orders page – "Add Expense Order" button opens dialog.
- **File**: `frontend/src/components/newcomponents/customui/orders/AddExpenseOrderDialog.tsx`.

---

## Possible next steps

- [ ] Add order dialogs for remaining types (Purchase, Transfer, Sales, Work – Purchase, Transfer, Sales, Expense have Add dialogs; Work has Add)
- [ ] Orders Overview: wire to real APIs (currently mock data)
- [ ] Recurring expense orders / templates (stage 2)
- [ ] Item names: some panels show item IDs; consider resolving to names where applicable
- [ ] Delete flows: confirm UX and error handling
- [ ] Responsive behavior: test on smaller screens
- [ ] Any remaining polish or UX tweaks

---

*Last updated: March 16, 2026*
