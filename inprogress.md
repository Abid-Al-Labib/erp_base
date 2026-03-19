# In Progress – Session Log

**Last updated**: 2026-02-28

This file tracks current work, decisions made, and what to do next.

---

## Current Session Summary (2026-02-28)

### What We Did

#### 1. Add Work Order – Blank Page Fix
- **Problem**: Clicking "Add Work Order" showed a blank page instead of opening the dialog.
- **Root causes**:
  1. **Conditional mount**: Dialog was rendered only when `isAddOpen` was true (`{isAddOpen && <AddWorkOrderDialog />}`). Radix Dialog can misbehave when mounting with `open={true}` immediately.
  2. **Radix Select empty value**: Machine "None" option used `value=""`, which Radix Select does not handle well.
- **Fixes applied**:
  - Always mount the dialog; control visibility with `open={isAddOpen}` (same pattern as Purchase Orders).
  - Changed Machine Select "None" from `value=""` to `value="__none__"` and updated form logic.
  - Simplified `onOpenChange` to pass `setIsAddOpen` directly.

#### 2. Purchase Order – Supplier & Items Not Loading
- **Problem**: Add Purchase Order dialog had empty Supplier and Items dropdowns.
- **Root cause**: Backend enforces `limit ≤ 100` for accounts and items; frontend requested 200 and 500 → 422 validation errors → empty data.
- **Fixes applied**:
  - PurchaseOrdersPage: `useGetAccountsQuery` limit 200 → 100.
  - AddPurchaseOrderDialog: `useGetItemsQuery` limit 500 → 100.

#### 3. API Limit Mismatch – Broader Fix
- **Problem**: Same pattern (frontend limit > backend limit) likely elsewhere.
- **Actions**:
  - Created `frontend/src/constants/apiLimits.ts` with `STRICT_100` and `FLEXIBLE_1000`.
  - Fixed all affected new pages and components:
    - SalesOrdersPage: sales_orders 200→100, accounts 200→100
    - ExpenseOrdersPage: accounts 200→100
    - PurchaseOrderDetailPanel: accounts 200→100
    - ProjectsPage: items 500→100
    - MachineDetailPanel: items 200→100

---

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Dialog mounting | Always mount, toggle `open` | Radix Dialog works better when always in DOM; conditional mount can cause blank page. |
| Radix Select "None" | Use `value="__none__"` | Empty string `""` is not supported; sentinel value avoids issues. |
| API limits | Centralize in `apiLimits.ts` | Single source of truth; document which endpoints use which limit. |
| Backend limits | Match frontend to backend | Backend `le=100` or `le=1000`; frontend must not exceed. |

---

## Files Changed (This Session)

### Created
- `frontend/src/constants/apiLimits.ts` – API limit constants and documentation
- `inprogress.md` – This file

### Modified
- `frontend/src/pages/newpages/orders/WorkOrdersPage.tsx` – Always mount AddWorkOrderDialog
- `frontend/src/components/newcomponents/customui/orders/AddWorkOrderDialog.tsx` – Machine Select `__none__`, always mounted
- `frontend/src/pages/newpages/orders/PurchaseOrdersPage.tsx` – accounts limit 100
- `frontend/src/components/newcomponents/customui/orders/AddPurchaseOrderDialog.tsx` – items limit 100
- `frontend/src/pages/newpages/orders/SalesOrdersPage.tsx` – orders + accounts limit 100
- `frontend/src/pages/newpages/orders/ExpenseOrdersPage.tsx` – accounts limit 100
- `frontend/src/components/newcomponents/customui/orders/PurchaseOrderDetailPanel.tsx` – accounts limit 100
- `frontend/src/pages/newpages/ProjectsPage.tsx` – items limit 100
- `frontend/src/components/newcomponents/customui/MachineDetailPanel.tsx` – items limit 100

---

## Next Time – To Do

1. **Use API_LIMITS constants** – Replace raw `100` / `1000` in new API calls with `API_LIMITS.STRICT_100` or `API_LIMITS.FLEXIBLE_1000` for consistency.
2. **Backend limit review** – If >100 items/accounts are needed, consider raising backend limits (e.g. items, accounts to 500) or add pagination.
3. **Add dialogs for other order types** – Transfer, Expense, Sales order pages have placeholder Add dialogs; implement when needed.
4. **Verify all order pages** – Manually test Add flows for Purchase, Transfer, Expense, Sales, Work Orders.
5. **ApiTestPage limits** – ApiTestPage has many API calls; audit for limit mismatches if used.

---

## Reference: Backend Limit Summary

| Endpoint | Backend limit | Use |
|----------|---------------|-----|
| accounts, items, sales_orders, storage_items, ledgers, project_components, etc. | le=100 | STRICT_100 |
| purchase_orders, transfer_orders, expense_orders, work_orders, machines, factories, inventory, products, etc. | le=1000 | FLEXIBLE_1000 |
