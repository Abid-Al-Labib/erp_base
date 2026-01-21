# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an ERP (Enterprise Resource Planning) system for Akbar Cotton Mill, providing procurement and inventory management capabilities. The project is transitioning from a prototype to a production-ready application with separate frontend, backend, and database repositories.

**NOTE**: The `working_app/` directory contains the legacy prototype (React + Supabase) and will be deprecated. Do not make changes to this directory unless explicitly requested.

## Recent Implementation (December 2025)

### Authentication & Workspace System - ✅ COMPLETED

A comprehensive authentication and multi-tenant workspace system has been implemented with the following components:

**1. WorkspaceManager** (`app/managers/workspace_manager.py`)
- Complete aggregate manager for workspace + members + invitations + audit logs
- Business logic: workspace creation, member management, invitation system
- Enforces subscription limits, permission checks, email matching security
- All methods use flush() (no commits) - service layer owns transactions

**2. AuthService** (`app/services/auth_service.py`)
- Handles all authentication workflows with transaction management
- Registration: Create workspace OR accept invitation (hybrid approach)
- Login: With optional workspace selection
- Workspace switching: Generate new JWT with different workspace context
- Password reset: Forgot password flow (token storage TODO)
- Admin password reset: Owner can reset user passwords
- Invitation validation: Preview invitation without accepting

**3. API Endpoints - 24 New Endpoints**

**Authentication** (`app/api/v1/endpoints/auth.py` - 11 endpoints):
- `POST /auth/register` - Register with workspace creation or invitation
- `POST /auth/login` - Login with optional workspace selection
- `POST /auth/switch-workspace` - Switch between workspaces
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset with token (requires password_reset_tokens table)
- `POST /auth/admin/reset-password` - Owner resets user password
- `POST /auth/validate-invitation` - Validate invitation token
- `GET /auth/me` - Get current user + workspace
- `POST /auth/logout` - Logout (client-side token deletion)

**Workspaces** (`app/api/v1/endpoints/workspaces.py` - 13 endpoints):
- `GET /workspaces` - List user's workspaces
- `POST /workspaces` - Create workspace
- `GET /workspaces/{id}` - Get workspace with plan details
- `PATCH /workspaces/{id}` - Update workspace (owner only)
- `GET /workspaces/{id}/members` - List members
- `PATCH /workspaces/{id}/members/{user_id}/role` - Update role
- `DELETE /workspaces/{id}/members/{user_id}` - Remove member
- `POST /workspaces/{id}/invitations` - Send invitation
- `GET /workspaces/{id}/invitations` - List invitations
- `POST /workspaces/{id}/invitations/accept` - Accept (existing users)
- `DELETE /workspaces/{id}/invitations/{id}` - Cancel invitation
- `GET /workspaces/me/invitations` - Get my pending invitations

**4. Updated Schemas** (`app/schemas/auth.py`)
- Complete request/response schemas for all auth flows
- Registration, login, workspace switching, password reset, invitation validation

**5. Frontend Documentation** (`AUTH.md`)
- Comprehensive guide for frontend team
- All endpoints with request/response examples
- Complete user flows (registration, login, invitation)
- Security best practices and integration examples

**Security Features:**
- ✅ Email matching for invitations (prevents token sharing)
- ✅ Secure random tokens (secrets.token_urlsafe)
- ✅ 7-day invitation expiration
- ✅ Single-use tokens (status changes after acceptance)
- ✅ Permission-based access control
- ✅ Subscription limit enforcement
- ✅ Audit logging for all workspace actions

**TODOs:**
- ⚠️ Password reset requires `password_reset_tokens` table
- 📧 Email sending not implemented (TODO comments in code)
- 🧪 End-to-end testing needed before production

### Ledger System - ✅ COMPLETED (Prior Implementation)

**LedgerManager** (`app/managers/ledger_manager.py`)
- Unified manager for all 5 ledger types (storage, machine, damaged, project, inventory)
- Reconciliation logic: compare ledger vs snapshot, create adjustments
- Cross-ledger reporting: item movement, user transactions, order transactions

**LedgerService** (`app/services/ledger_service.py`)
- Service layer with transaction management
- User-friendly messages for reconciliation results

**Ledger API** (`app/api/v1/endpoints/ledgers.py` - 17 endpoints)
- Complete CRUD for all ledger types
- Balance queries and reconciliation endpoints
- Cross-ledger reporting endpoints

## Architecture

The production architecture consists of three separate repositories:

1. **Frontend**: React + TypeScript with Redux Toolkit (this repository will contain the new frontend)
2. **Backend**: FastAPI (Python) - separate repository
3. **Database**: PostgreSQL - separate repository with migrations

## Frontend Development

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

### Frontend Stack

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Redux Toolkit (RTK) + RTK Query for API calls
- **UI Library**: Radix UI + Tailwind CSS (based on prototype)
- **Form Handling**: React Hook Form with Zod validation
- **Authentication**: JWT tokens from backend API
- **Notifications**: React Hot Toast

### Frontend Structure

```
src/
├── app/
│   ├── store.ts          # Redux store configuration
│   └── hooks.ts          # Typed Redux hooks (useAppDispatch, useAppSelector)
├── features/
│   ├── auth/
│   │   ├── authSlice.ts      # Auth state slice
│   │   ├── authApi.ts        # RTK Query auth endpoints
│   │   └── components/       # Auth-related components
│   ├── orders/
│   │   ├── ordersSlice.ts    # Orders state slice
│   │   ├── ordersApi.ts      # RTK Query orders endpoints
│   │   └── components/       # Order-related components
│   ├── items/
│   ├── accounts/
│   ├── machines/
│   ├── projects/
│   └── ...                   # Other feature modules
├── components/
│   ├── ui/               # Reusable UI components (shadcn/ui)
│   └── common/           # Shared business components
├── layouts/              # Layout components
├── pages/                # Page components
├── routes/               # Route configuration and guards
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
└── App.tsx               # Root component
```

### Redux Toolkit Setup

```typescript
// src/app/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from '@/features/auth/authSlice';
import { ordersApi } from '@/features/orders/ordersApi';
import { itemsApi } from '@/features/items/itemsApi';
import { accountsApi } from '@/features/accounts/accountsApi';
// ... other API imports

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
    [itemsApi.reducerPath]: itemsApi.reducer,
    [accountsApi.reducerPath]: accountsApi.reducer,
    // ... other API reducers
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      ordersApi.middleware,
      itemsApi.middleware,
      accountsApi.middleware,
      // ... other API middleware
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

```typescript
// src/app/hooks.ts
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

### RTK Query API Pattern

```typescript
// src/features/orders/ordersApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/app/store';

export interface Order {
  id: number;
  req_num: string;
  order_note: string | null;
  created_at: string;
  created_by_user_id: number;
  department_id: number;
  factory_id: number;
  machine_id: number | null;
  current_status_id: number;
  order_type: string;
  // ... other fields
}

export interface CreateOrderDTO {
  req_num: string;
  order_note?: string;
  department_id: number;
  factory_id: number;
  machine_id?: number;
  order_type: string;
  // ... other fields
}

export const ordersApi = createApi({
  reducerPath: 'ordersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Order', 'OrderItem'],
  endpoints: (builder) => ({
    getOrders: builder.query<Order[], { skip?: number; limit?: number }>({
      query: ({ skip = 0, limit = 100 }) =>
        `/orders?skip=${skip}&limit=${limit}`,
      providesTags: ['Order'],
    }),
    getOrderById: builder.query<Order, number>({
      query: (id) => `/orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),
    createOrder: builder.mutation<Order, CreateOrderDTO>({
      query: (body) => ({
        url: '/orders',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Order'],
    }),
    updateOrder: builder.mutation<Order, { id: number; data: Partial<Order> }>({
      query: ({ id, data }) => ({
        url: `/orders/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }],
    }),
    deleteOrder: builder.mutation<void, number>({
      query: (id) => ({
        url: `/orders/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Order'],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
} = ordersApi;
```

### Using RTK Query in Components

```typescript
// Example component using RTK Query
import { useGetOrdersQuery, useCreateOrderMutation } from '@/features/orders/ordersApi';

function OrdersPage() {
  const { data: orders, isLoading, error } = useGetOrdersQuery({ skip: 0, limit: 50 });
  const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation();

  const handleCreateOrder = async (orderData: CreateOrderDTO) => {
    try {
      await createOrder(orderData).unwrap();
      toast.success('Order created successfully');
    } catch (err) {
      toast.error('Failed to create order');
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {orders?.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
```

### Authentication Flow

1. User logs in via `/auth/login` endpoint
2. Backend returns JWT access token (store in Redux state)
3. RTK Query `prepareHeaders` automatically adds token to all requests
4. On 401 responses, trigger refresh token flow or redirect to login
5. Store auth state in Redux (`authSlice`)

```typescript
// src/features/auth/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('authToken'),
  isAuthenticated: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('authToken', action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('authToken');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
```

## Backend Development

### Setup

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run tests
pytest

# Run tests with coverage
pytest --cov=app tests/
```

### Backend Stack

- **Framework**: FastAPI
- **ORM**: SQLAlchemy 2.0
- **Database**: PostgreSQL
- **Migrations**: Alembic
- **Authentication**: JWT (python-jose)
- **Validation**: Pydantic v2
- **Testing**: Pytest + httpx

### Backend Structure (4-Layer Architecture)

The backend follows a **4-layer architecture** for better separation of concerns, testability, and maintainability:

```
Layer 1: Endpoints (HTTP)  →  Layer 2: Services (Orchestration)  →  Layer 3: Managers (Business Logic)  →  Layer 4: DAOs (Database)
```

```
app/
├── api/
│   └── v1/
│       ├── endpoints/        # Layer 1: HTTP handling
│       │   ├── auth.py       # HTTP requests/responses, validation, auth
│       │   ├── orders.py     # Calls services
│       │   ├── parts.py
│       │   ├── machines.py
│       │   ├── projects.py
│       │   └── ...
│       └── router.py
├── core/
│   ├── config.py             # Settings and environment variables
│   ├── security.py           # JWT and password hashing
│   └── deps.py               # FastAPI dependencies (DB session, auth, etc.)
├── services/                 # Layer 2: Business orchestration
│   ├── base_service.py       # Base service with transaction management
│   ├── order_service.py      # Orchestrates order workflows, handles commit/rollback
│   ├── part_service.py       # Orchestrates part operations
│   └── ...
├── managers/                 # Layer 3: Business logic
│   ├── base_manager.py       # Base manager class
│   ├── order_manager.py      # Order business logic, coordinates DAOs
│   ├── inventory_manager.py  # Inventory transfers and operations
│   ├── part_manager.py       # Part catalog logic
│   └── ...
├── dao/                      # Layer 4: Database access (renamed from crud)
│   ├── base.py               # BaseDAO with flush() (NO commits)
│   ├── order.py              # OrderDAO
│   ├── part.py               # PartDAO
│   └── ...
├── db/
│   ├── base.py               # SQLAlchemy base and imports
│   ├── session.py            # Database session
│   └── init_db.py            # Initial data seeding
├── models/                   # SQLAlchemy models (match database schema)
│   ├── order.py
│   ├── part.py
│   ├── machine.py
│   ├── project.py
│   └── ...
├── schemas/                  # Pydantic schemas (request/response DTOs)
│   ├── order.py
│   ├── part.py
│   └── ...
└── main.py                   # FastAPI application entry point
```

### 4-Layer Architecture Responsibilities

**Layer 1: Endpoints (HTTP)**
- Handle HTTP requests and responses
- Validate input using Pydantic schemas
- Authentication and authorization checks
- Call services
- Convert exceptions to HTTP status codes

**Layer 2: Services (Orchestration)**
- Orchestrate multiple managers
- **Own transaction boundaries** (commit/rollback)
- Handle cross-cutting concerns (notifications, logging)
- Error handling and exception translation

**Layer 3: Managers (Business Logic)**
- Implement business rules and domain logic
- Coordinate multiple DAOs
- **Do NOT commit** - pass session through
- Reusable across services

**Layer 4: DAOs (Database Access)**
- Pure database operations
- **Use flush() instead of commit()**
- No business logic
- Reusable across managers

### FastAPI Main App

```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.core.config import settings

app = FastAPI(
    title="ERP API",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)
```

### 4-Layer Architecture Examples

**Layer 4: DAO (Database Access)**
```python
# app/dao/order.py
from app.dao.base import BaseDAO
from app.models.order import Order
from app.schemas.order import OrderCreate, OrderUpdate

class OrderDAO(BaseDAO[Order, OrderCreate, OrderUpdate]):
    """DAO for Order model - pure database operations"""

    def create_with_user(self, db: Session, *, obj_in: OrderCreate, user_id: int) -> Order:
        """Create order with user ID (does NOT commit)"""
        obj_in_data = obj_in.model_dump()
        db_obj = Order(**obj_in_data, created_by_user_id=user_id, current_status_id=1)
        db.add(db_obj)
        db.flush()  # Flush to get ID, but don't commit
        return db_obj

order_dao = OrderDAO(Order)
```

**Layer 3: Manager (Business Logic)**
```python
# app/managers/order_manager.py
from app.managers.base_manager import BaseManager
from app.dao.order import order_dao
from app.dao.order_item import order_item_dao

class OrderManager(BaseManager[Order]):
    """Manager for order business logic"""

    def create_order_with_items(
        self, session: Session, order_data: dict, items_data: List[dict], user_id: int
    ) -> Order:
        """Create order with items (does NOT commit)"""
        # Create order
        order_in = OrderCreate(**order_data)
        order = order_dao.create_with_user(session, obj_in=order_in, user_id=user_id)

        # Create order items
        for item_data in items_data:
            item_data['order_id'] = order.id
            item_in = OrderItemCreate(**item_data)
            order_item_dao.create(session, obj_in=item_in)

        return order

order_manager = OrderManager()
```

**Layer 2: Service (Orchestration & Transaction Management)**
```python
# app/services/order_service.py
from app.services.base_service import BaseService
from app.managers.order_manager import order_manager
from app.managers.inventory_manager import inventory_manager

class OrderService(BaseService):
    """Service for order workflows - handles transactions"""

    def create_order(
        self, db: Session, order_in: OrderCreate, current_user: Profile
    ) -> Order:
        """Create order with transaction management"""
        try:
            # Extract items data
            order_data = order_in.model_dump(exclude={'items'})
            items_data = [i.model_dump() for i in order_in.items] if order_in.items else []

            # Use manager to create order
            order = order_manager.create_order_with_items(
                session=db, order_data=order_data,
                items_data=items_data, user_id=current_user.id
            )

            # Commit transaction
            self._commit_transaction(db)
            db.refresh(order)
            return order
        except Exception as e:
            self._rollback_transaction(db)
            raise

    def process_stm_order(
        self, db: Session, order_id: int, current_user: Profile
    ) -> Order:
        """Process Storage-To-Machine order (multiple managers, one transaction)"""
        try:
            order = order_dao.get(db, id=order_id)
            order_items = order_item_dao.get_by_order(db, order_id=order_id)

            items_data = [{'item_id': oi.item_id, 'qty': oi.qty} for oi in order_items]

            # Use inventory manager to transfer
            inventory_manager.transfer_storage_to_machine(
                session=db, factory_id=order.factory_id,
                machine_id=order.machine_id, items=items_data
            )

            # Use order manager to update status
            order = order_manager.advance_order_status(
                session=db, order_id=order_id,
                new_status_id=5, user_id=current_user.id
            )

            # Commit transaction
            self._commit_transaction(db)
            db.refresh(order)
            return order
        except Exception as e:
            self._rollback_transaction(db)
            raise

order_service = OrderService()
```

**Layer 1: Endpoint (HTTP Handling)**
```python
# app/api/v1/endpoints/orders.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_active_user
from app.services.order_service import order_service

router = APIRouter()

@router.post("/", response_model=OrderResponse, status_code=201)
def create_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_active_user)
):
    """Create new order - HTTP layer only"""
    try:
        order = order_service.create_order(db, order_in, current_user)
        return order
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/{order_id}/process-stm")
def process_stm_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_active_user)
):
    """Process Storage-To-Machine order"""
    try:
        order = order_service.process_stm_order(db, order_id, current_user)
        return order
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
```

### Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply all migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# View migration history
alembic history

# View current migration
alembic current
```

## Database Schema

### Core Tables

**users & profiles**
- `profiles` - User profiles with roles (owner, finance, ground-team, ground-team-manager)

**items & inventory** (renamed from "parts" for flexibility)
- `items` - Universal item catalog (raw materials, machine parts, consumables, tools, finished goods)
- `item_tags` - Tags for categorizing items (raw_material, machine_part, project_item, consumable, tool, finished_good)
- `item_tag_assignments` - Junction table for item-tag many-to-many relationships
- `storage_items` - Storage inventory snapshot (factory_id, item_id, qty, avg_price)
- `machine_items` - Machine inventory snapshot (machine_id, item_id, qty, req_qty, defective_qty)
- `damaged_items` - Damaged items inventory snapshot (factory_id, item_id, qty, avg_price)

**item ledgers** (immutable transaction logs)
- `storage_item_ledger` - Audit trail of all storage inventory movements
- `machine_item_ledger` - Audit trail of all machine inventory movements
- `damaged_item_ledger` - Audit trail of all damaged inventory movements
- `project_component_item_ledger` - Audit trail of project component item consumption

**finished goods inventory**
- `inventory` - Finished goods inventory snapshot (factory_id, item_id, qty, avg_price)
- `inventory_ledger` - Audit trail of finished goods movements (production outputs, sales, transfers)

**production module**
- `production_lines` - Production lines (can attach to machines or standalone)
- `production_formulas` - Production recipes/BOM (Bill of Materials)
- `production_formula_items` - Formula ingredients (inputs, outputs, waste, byproducts)
- `production_batches` - Actual production logs with expected vs actual tracking
- `production_batch_items` - Item-level tracking per batch (variance analysis)

**accounts & financial**
- `accounts` - Unified entity for suppliers, clients, utilities, payroll (no type flags - determined by tags)
- `account_tags` - Tags for categorizing accounts (supplier, client, utility, payroll)
- `account_tag_assignments` - Junction table for account-tag many-to-many relationships
- `account_invoices` - Invoices tracking payables/receivables with payment controls
- `invoice_payments` - Individual payment transactions for invoices

**order templates** (reusable templates for automation)
- `order_templates` - Generic templates for purchase, transfer, or expense orders (recurring or one-time)
- `order_template_items` - Line items for templates (items or expense line items)

**purchase orders** (external procurement with items)
- `purchase_orders` - Purchase orders from suppliers (PFM, PFS, PFP)
- `purchase_order_items` - Items being purchased with quantities, pricing, approval flags

**transfer orders** (internal item movements)
- `transfer_orders` - Internal transfers between locations (STM, MTM, STP)
- `transfer_order_items` - Items being transferred with quantities

**expense orders** (direct expenses, no inventory)
- `expense_orders` - Expense orders for utilities, services, rent, payroll, etc.
- `expense_order_items` - Expense line items (can have mixed accounts per line)

**sales orders** (customer orders and deliveries)
- `sales_orders` - Sales contracts with customers (linked to accounts with 'client' tag)
- `sales_order_items` - Line items in sales orders (tracks ordered vs delivered quantities)
- `sales_deliveries` - Individual deliveries for sales orders (one order can have multiple deliveries)
- `sales_delivery_items` - Items in each delivery (links to sales_order_items)

**orders (legacy)** ⚠️ **DEPRECATED** - Being migrated to new split structure
- `orders` - ~~Old unified order table~~ → Migrate to purchase/transfer/expense orders
- `order_items` - ~~Old order items~~ → Migrate to respective item tables

**order workflows & status**
- `order_workflows` - Workflow definitions per order type (status_sequence, allowed_reverts)
- `statuses` - Status master table
- ~~`status_tracker`~~ - ⚠️ **REMOVED** - Order status history/audit log has been removed. New status tracking system needed (see TODOs section)

**organization structure**
- `factories` - Factory locations
- `factory_sections` - Sections within factories
- `departments` - Departments
- `machines` - Machines within factory sections

**projects**
- `projects` - Projects with budget, deadlines, status
- `project_components` - Components within projects
- `project_component_items` - Items required for components (renamed from project_component_parts)
- `project_component_tasks` - Tasks within components
- `miscellaneous_project_costs` - Additional project costs

~~**instant add (audit tables)**~~ - ⚠️ **REMOVED** (Nov 2025)
- ~~`instant_add_storage_item`~~ - REMOVED - Use `storage_item_ledger` with `source_type='manual'`
- ~~`instant_add_machine_item`~~ - REMOVED - Use `machine_item_ledger` with `source_type='manual'`
- ~~`instant_add_damaged_item`~~ - REMOVED - Use `damaged_item_ledger` with `source_type='manual'`

**settings & access**
- `app_settings` - Application feature flags
- `access_control` - RBAC configuration (role, type, target)

### Order Types

- **PFM** (Purchase For Machine) - Purchase parts for machines
- **PFS** (Purchase For Storage) - Purchase parts for storage
- **STM** (Storage To Machine) - Transfer from storage to machine
- **STP** (Storage To Project) - Transfer from storage to project
- **PFP** (Purchase For Project) - Purchase parts for projects
- **MTM** (Machine To Machine) - Transfer between machines

Each order type has a workflow in `order_workflows` table with:
- `status_sequence` - Array of status IDs the order flows through
- `allowed_reverts_json` - JSON defining which status transitions can be reverted

### Order Workflow System

⚠️ **NOTE**: Status tracking has been removed. Orders still have `current_status_id`, but status history is no longer tracked automatically. A new status tracking system needs to be implemented for different order types.

1. Order created with `current_status_id` (typically status 1 = "Pending")
2. Order advances through `status_sequence` defined in workflow
3. Each status transition:
   - ~~Recorded in `status_tracker` (audit log)~~ - REMOVED
   - May trigger approval logic (e.g., deduct from storage, add to machine)
   - May trigger completion logic (e.g., mark machine as running/not running)
4. Order items have multiple approval flags:
   - `approved_pending_order` - Initial approval
   - `approved_office_order` - Office approval
   - `approved_budget` - Budget approval
   - `approved_storage_withdrawal` - Storage withdrawal approval

### RBAC System

Access control via `access_control` table with three types:

1. **Page Access** (`type = "page"`)
   - Controls which pages/routes users can access
   - Examples: "home", "orders", "create order", "manage order"

2. **Manage Order Status Access** (`type = "manage-order-status"`)
   - Controls which order statuses users can manage/modify
   - Target is the status ID

3. **Feature Access** (`type = "feature"`)
   - Granular feature flags
   - Examples: "finance_visibility", "storage_instant_add", "order_delete"

Roles: `owner`, `finance`, `ground-team`, `ground-team-manager`

### Items System: Universal Item Catalog with Tagging

The system uses a **unified Items model** (renamed from "Parts") to support various material types beyond just machine parts.

#### Why "Items" instead of "Parts"?

**Original Problem:**
- "Parts" terminology too narrow for:
  - Raw materials for production
  - Consumables (oil, cleaning supplies)
  - Tools and equipment
  - Future production line inputs
  - Finished goods from production

**Solution:**
- Renamed `parts` → `items` across all models
- Flexible tagging system for categorization
- Future-proof for production line features

#### Item Model

```python
class Item:
    id, workspace_id
    name, description, unit
    sku  # Stock Keeping Unit (optional)
    created_by, updated_by
    is_active  # Soft delete flag
```

**Related Inventory Tables:**
- `storage_items` - Items in storage (factory_id, item_id, qty, avg_price)
- `machine_items` - Items assigned to machines (machine_id, item_id, qty, req_qty, defective_qty)
- `damaged_items` - Damaged/defective items (factory_id, item_id, qty, avg_price)
- `order_items` - Items in orders (renamed from `order_parts`)
- `project_component_items` - Items for project components

#### Item Tagging System

Items are categorized using **tags** (many-to-many):

**6 Default System Tags:**
1. **Raw Material** (`raw_material`) - Input materials for production
2. **Machine Part** (`machine_part`) - Parts and components for machines
3. **Project Item** (`project_item`) - Items allocated to specific projects
4. **Consumable** (`consumable`) - Supplies that are used up (oil, cleaning supplies)
5. **Tool** (`tool`) - Tools and equipment
6. **Finished Good** (`finished_good`) - Products manufactured/produced by us

**Benefits:**
- One item can have multiple tags (e.g., machine part + consumable)
- Workspaces can create custom tags beyond the 6 defaults
- System tags cannot be deleted/renamed (`is_system_tag=True`)
- Tag usage tracked with `usage_count`
- Easy filtering and searching by tag

**Tag Assignment:**
```python
class ItemTagAssignment:
    item_id, tag_id, workspace_id
    assigned_at, assigned_by
    # Unique constraint: (item_id, tag_id)
```

#### Item Queries (DAO Methods)

- `search_by_name_in_workspace()` - Search items by name
- `get_by_sku_in_workspace()` - Find by SKU
- `get_active_items_in_workspace()` - Active items only
- `get_tags_for_item()` - Get all tags for an item (via ItemTagAssignment)
- `get_items_for_tag()` - Get all items with a specific tag

#### Default Data Seeding

When a workspace is created, seed default item tags:

```python
from app.db.seed_default_tags import seed_default_tags

# In workspace creation service:
seed_default_tags(db, workspace_id=new_workspace.id, created_by_user_id=owner.id)
```

This creates the 6 system tags automatically.

### Ledger System: Immutable Transaction Logs

The system uses **ledger tables** to maintain an immutable audit trail of all inventory movements. Think of ledgers as bank statements - they record every transaction that ever happened.

#### Why Ledgers?

**Problem with Snapshot Tables:**
- `storage_items`, `machine_items`, `damaged_items` only show current state (like a bank account balance)
- No history of how we got here
- Can't audit or reconcile discrepancies
- Can't answer "who moved what, when, and why?"

**Solution: Ledger Tables**
- Immutable transaction log (entries never deleted or updated, only notes can be amended)
- Full audit trail for compliance
- Reconciliation: sum ledger = current snapshot
- Analytics: track usage patterns, consumption rates
- Debugging: find when/where discrepancies occurred

#### Ledger Architecture

**4 Ledger Tables:**
1. `storage_item_ledger` - Tracks storage inventory movements
2. `machine_item_ledger` - Tracks machine inventory movements
3. `damaged_item_ledger` - Tracks damaged inventory movements
4. `project_component_item_ledger` - Tracks project item consumption

**Each ledger entry records:**
```python
class StorageItemLedger:
    # What changed
    transaction_type  # 'purchase_order', 'manual_add', 'transfer_in', 'transfer_out',
                      # 'consumption', 'damaged', 'inventory_adjustment', 'cost_adjustment'
    quantity          # Always positive, direction determined by type

    # Cost tracking
    unit_cost         # Cost per unit at transaction time
    total_cost        # unit_cost * quantity

    # State snapshots (for reconciliation)
    qty_before, qty_after          # Quantity before/after
    value_before, value_after      # Total value before/after
    avg_price_before, avg_price_after  # Average price before/after

    # Attribution (who/what caused this)
    source_type       # 'order', 'manual', 'adjustment', 'transfer', etc.
    order_id          # If from an order
    invoice_id        # If from an invoice
    performed_by      # User who performed transaction
    performed_at      # Timestamp

    # Transfer context
    transfer_source_type, transfer_source_id           # Where it came from
    transfer_destination_type, transfer_destination_id # Where it went

    # Notes
    notes  # Free text explanation
```

#### Transaction Types (8 total)

All ledgers use the same 8 transaction types:

1. **purchase_order** - Items received from supplier (via PFM, PFS orders)
2. **manual_add** - Admin manually adding items (replaces instant_add tables)
3. **transfer_in** - Items coming in from another location
4. **transfer_out** - Items going out to another location
5. **consumption** - Items consumed/used during operation
6. **damaged** - Items marked as damaged
7. **inventory_adjustment** - Reconciliation corrections (can be + or -)
8. **cost_adjustment** - Adjust cost without quantity change (quantity=0)

#### Double-Entry for Transfers

When transferring items between locations, create **two ledger entries**:

```python
# Transfer: Storage (Factory 1) → Machine (Machine 5)

# Entry 1: Storage ledger
storage_entry = StorageItemLedger(
    transaction_type='transfer_out',
    quantity=50,
    transfer_destination_type='machine',
    transfer_destination_id=5,
    order_id=123
)

# Entry 2: Machine ledger
machine_entry = MachineItemLedger(
    transaction_type='transfer_in',
    quantity=50,
    transfer_source_type='storage',
    transfer_source_id=1,  # factory_id
    order_id=123
)
```

Both sides recorded = easier reconciliation.

#### Cost Tracking

**Costs are required** for all transactions (except cost_adjustment where qty=0).

**Where costs come from:**
- **Purchase orders**: From invoice (if exists) or estimated cost
- **Manual adds**: User must enter cost
- **Transfers**: Inherited from source location's avg_price
- **Adjustments**: User enters adjustment cost

**Average Price Calculation:**
- TODO: Choose method (FIFO, LIFO, Weighted Average, Moving Average)
- Currently: Ledger stores avg_price_before/after, but calculation logic not implemented
- See "TODOs & Future Work" section for details

#### Ledger DAO Methods

**Common Queries (all ledgers):**
- `get_by_[location]_and_item()` - Get ledger for specific location/item
- `get_by_transaction_type()` - Filter by transaction type
- `get_by_order()` - All transactions for an order
- `get_by_date_range()` - Transactions in date range
- `calculate_balance()` - Sum ledger to get current qty/value
- `get_latest_entry()` - Most recent transaction

**Specialized Queries:**
- `get_consumption_entries()` - Track consumption (machine & project ledgers)
- `get_damage_reports()` - Track damage reports (damaged ledger)
- `calculate_total_cost_for_component()` - Project costs (project ledger)

#### Reconciliation

Compare ledger balance vs snapshot table:

```python
# Get current balance from ledger
ledger_qty, ledger_value = storage_item_ledger_dao.calculate_balance(
    db, factory_id=1, item_id=100, workspace_id=workspace.id
)

# Get current balance from snapshot
snapshot = storage_item_dao.get_by_factory_and_item(
    db, factory_id=1, item_id=100, workspace_id=workspace.id
)

# Compare
if ledger_qty != snapshot.qty:
    # Discrepancy! Create adjustment transaction
    create_adjustment_entry(...)
```

#### Immutability Rules

**Ledger entries are immutable:**
- ✅ Can update: `notes` field only (for corrections/clarifications)
- ❌ Cannot update: quantity, cost, transaction_type, dates
- ❌ Cannot delete: entries are permanent

**To fix mistakes:**
- Create new adjustment transaction with opposite effect
- Use `inventory_adjustment` or `cost_adjustment` transaction type
- Reference original entry in notes

### Production Module: Formula-Driven Manufacturing

The system uses a **formula-driven production system** that tracks expected vs actual production for variance analysis and efficiency measurement.

#### Core Workflow

```
1. Create Formula (recipe/BOM) → 2. Start Batch (calculate expected) → 3. Log Actual → 4. Compare Variance
```

#### Production Tables

**5 Core Tables:**

1. **`production_lines`** - Where production happens
```python
production_lines
├─ id, workspace_id
├─ factory_id
├─ machine_id (NULLABLE) ← Can attach to machine OR standalone
├─ name, description, is_active
├─ created_by, updated_by
```

2. **`production_formulas`** - Production recipes (BOM - Bill of Materials)
```python
production_formulas
├─ id, workspace_id
├─ formula_code ("YARN-001") ← Unique identifier
├─ name ("Cotton Yarn Production Formula")
├─ description
├─ version (1, 2, 3...) ← Track formula changes
├─ output_item_id → What gets produced
├─ output_quantity (base: 1000) ← "Per X units"
├─ estimated_duration_minutes
├─ is_active, is_default
├─ created_by, updated_by, created_at
```

3. **`production_formula_items`** - Formula ingredients
```python
production_formula_items
├─ id, workspace_id, formula_id
├─ item_id
├─ item_role → 'input' | 'output' | 'waste' | 'byproduct'
├─ quantity ← Amount per formula.output_quantity
├─ unit (kg, L, pcs, etc.)
├─ is_optional, tolerance_percentage
```

**Example Formula:**
```
Formula: YARN-001 (To produce 1000 kg Cotton Yarn)
├─ Input: Raw Cotton (1100 kg)
├─ Input: Dye (50 L)
├─ Output: Cotton Yarn (1000 kg)
├─ Waste: Cotton Dust (50 kg)
└─ Byproduct: Short Fiber (50 kg)
```

4. **`production_batches`** - Actual production logs
```python
production_batches
├─ id, workspace_id
├─ batch_number (auto: "BATCH-2025-001")
├─ production_line_id
├─ formula_id (NULLABLE) ← Can produce without formula
├─ batch_date, shift (nullable)
├─ status → 'draft' | 'in_progress' | 'completed' | 'cancelled'
│
├─── EXPECTED (from formula) ───
├─ expected_output_quantity
├─ expected_duration_minutes
│
├─── ACTUAL (user logged) ───
├─ actual_output_quantity
├─ actual_duration_minutes
├─ actual_start_time, actual_end_time
│
├─── VARIANCE (auto-calculated) ───
├─ output_variance_quantity ← actual - expected
├─ output_variance_percentage ← (variance / expected) * 100
├─ efficiency_percentage ← (actual / expected) * 100
│
├─ notes
├─ created_by, updated_by, created_at
├─ started_by, started_at
├─ completed_by, completed_at
```

5. **`production_batch_items`** - Item-level tracking
```python
production_batch_items
├─ id, workspace_id, batch_id
├─ item_id
├─ item_role → 'input' | 'output' | 'waste' | 'byproduct'
│
├─── EXPECTED ───
├─ expected_quantity
│
├─── ACTUAL ───
├─ actual_quantity
│
├─── SOURCE/DESTINATION ───
├─ source_location_type → 'storage' | 'machine' | 'inventory'
├─ source_location_id (factory_id, machine_id)
├─ destination_location_type → 'inventory' | 'storage' | 'damaged'
├─ destination_location_id
│
├─── VARIANCE ───
├─ variance_quantity ← actual - expected
├─ variance_percentage
│
├─ notes
```

#### Formula Intelligence

**Scenario 1: User wants to produce X units**
```python
User: "I want to produce 1500 kg Cotton Yarn"
Formula base: 1000 kg output

System calculates (multiplier = 1.5):
├─ Raw Cotton needed: 1100 * 1.5 = 1650 kg
├─ Dye needed: 50 * 1.5 = 75 L
├─ Expected waste: 50 * 1.5 = 75 kg
└─ Expected byproduct: 50 * 1.5 = 75 kg
```

**Scenario 2: How much can we produce with available materials?**
```python
Available: 2200 kg Raw Cotton
Formula needs: 1100 kg per 1000 kg output

System calculates:
├─ Max batches: 2200 / 1100 = 2
├─ Can produce: 2 * 1000 = 2000 kg Yarn
└─ Will also need: 2 * 50 = 100 L Dye
```

#### Batch Workflow Example

**Step 1: Start Batch**
- User selects formula, target quantity
- System calculates expected inputs, outputs, waste
- System checks material availability
- Creates batch with status `in_progress`

**Step 2: Complete Batch (Log Actual)**
```
Expected vs Actual:
├─ Output: 1000 kg expected → 950 kg actual (-5% variance ⚠️)
├─ Input (Cotton): 1100 kg expected → 1100 kg actual (0% ✓)
├─ Input (Dye): 50 L expected → 52 L actual (+4% variance ⚠️)
└─ Waste: 50 kg expected → 60 kg actual (+20% variance ⚠️)

Efficiency: 95%
```

**Step 3: Ledger Integration**
When batch completes:
```python
# Outputs → inventory_ledger
inventory_ledger.create(
    transaction_type='transfer_in',
    source_type='production',
    source_id=batch.id,
    quantity=950  # Actual output
)

# Inputs → storage_item_ledger
storage_item_ledger.create(
    transaction_type='transfer_out',
    destination_type='production',
    destination_id=batch.id,
    quantity=1100  # Cotton consumed
)

# Waste → damaged_item_ledger
damaged_item_ledger.create(
    transaction_type='transfer_in',
    source_type='production',
    source_id=batch.id,
    quantity=60  # Waste generated
)
```

#### Simple Mode vs Formula Mode

| Feature | Simple Mode | Formula Mode |
|---------|-------------|--------------|
| **Create Batch** | Just log output | Select formula, system calculates |
| **Material Check** | Manual | Auto-calculated from formula |
| **Variance Tracking** | No | Yes (expected vs actual) |
| **Inputs** | Optional | Tracked & compared |
| **Waste** | Optional | Tracked & compared |
| **Use Case** | "Just track what we made" | "Optimize production, find issues" |

Both use the same `production_batches` table - `formula_id` is nullable for simple mode.

#### DAO Methods

**production_batch_dao:**
- `generate_batch_number(db, workspace_id, year)` - Auto-generates "BATCH-2025-001"
- `get_by_production_line()`, `get_by_formula()`, `get_by_status()`
- `get_by_date_range()`, `get_in_progress_batches()`, `get_completed_batches()`

**production_formula_item_dao:**
- `get_inputs_for_formula()`, `get_outputs_for_formula()`
- `get_waste_for_formula()`, `get_byproducts_for_formula()`

**production_batch_item_dao:**
- `get_inputs_for_batch()`, `get_outputs_for_batch()`
- `get_waste_for_batch()`, `get_byproducts_for_batch()`

### Order System: Split Architecture for Better Workflows

The system uses a **split order architecture** separating purchase orders, transfer orders, and expense orders into distinct tables with appropriate workflows.

#### Why Split Orders?

**Problem with Unified `orders` Table:**
- Single table handled ALL order types (PFM, PFS, STM, MTM, STP + future expenses)
- Purchase orders, transfers, and expenses have fundamentally different workflows
- Lots of nullable fields (account_id null for transfers, items null for expenses)
- Hard to enforce constraints (e.g., expense orders MUST NOT have items)
- Different approval flows mixed together

**Solution: 3 Separate Order Types**
- **Purchase Orders** - External procurement with items and invoices
- **Transfer Orders** - Internal movements between locations, no invoices
- **Expense Orders** - Direct expenses with no inventory impact
- Clear boundaries, enforced constraints, dedicated workflows

#### Order Templates System

**Generic templates for automation:**

```python
class OrderTemplate:
    template_type          # 'purchase', 'transfer', 'expense'
    template_name          # "Monthly Rent", "Weekly Stock Replenishment"

    # Recurrence (optional)
    is_recurring           # Boolean
    recurrence_type        # 'monthly', 'quarterly', 'weekly', 'daily'
    recurrence_day         # Day of month/week
    next_generation_date   # When to auto-generate next order

    # Auto-generation
    auto_generate          # Should system create orders automatically?
    auto_approve           # Auto-approve generated orders?

    # Template items
    template_items[]       # Line items (reusable)
```

**Use Cases:**
- **Recurring Expenses**: Monthly utilities, rent, payroll auto-generated
- **Standard Orders**: Common purchase orders saved as templates
- **Scheduled Transfers**: Regular stock replenishment patterns

#### Purchase Orders

**External procurement of items:**

```python
class PurchaseOrder:
    po_number              # Auto: PO-2025-001
    account_id             # Supplier (required)
    destination_type       # 'storage', 'machine', 'project'
    purchase_type          # 'PFM', 'PFS', 'PFP'

    # Dates
    order_date
    expected_delivery_date
    actual_delivery_date

    # Totals (from line items)
    subtotal, tax_total, total_amount

    # Workflow
    current_status_id
    order_workflow_id

    # Invoice linkage
    invoice_id             # Created after approval

    # Line items
    line_items[]           # PurchaseOrderItems
```

**Line Items:**
```python
class PurchaseOrderItem:
    item_id                # What to purchase
    quantity_ordered
    quantity_received      # Track partial deliveries
    unit_price

    # Approval flags (multi-stage)
    approved_pending_order
    approved_office_order
    approved_budget
    approved_storage_withdrawal
```

**Workflow**: Complex (6-8 statuses)
1. Pending → Budget Review → Manager Approval → PO Sent → Received → Invoice Created → Paid

#### Transfer Orders

**Internal item movements:**

```python
class TransferOrder:
    transfer_number        # Auto: TR-2025-001

    # Source
    source_location_type   # 'storage', 'machine', 'damaged'
    source_location_id

    # Destination
    destination_location_type  # 'storage', 'machine', 'project', 'damaged'
    destination_location_id

    transfer_type          # 'STM', 'MTM', 'STP'

    # Workflow (simpler)
    current_status_id

    # NO account_id (internal)
    # NO invoice_id (internal)

    # Line items
    line_items[]           # TransferOrderItems
```

**Line Items:**
```python
class TransferOrderItem:
    item_id
    quantity_requested
    quantity_transferred   # Track partial transfers
    approved               # Simple boolean approval
```

**Workflow**: Simple (3-4 statuses)
1. Pending → Approved → In Transit → Completed

**Double-Entry Ledger:**
When transfer completes, creates 2 ledger entries:
- Source location: `transfer_out`
- Destination location: `transfer_in`

#### Expense Orders

**Direct expenses without inventory:**

```python
class ExpenseOrder:
    expense_number         # Auto: EXP-2025-001
    account_id             # Nullable (can have mixed accounts in line items)
    expense_category       # 'utilities', 'payroll', 'rent', 'services', 'maintenance'

    # Dates
    expense_date           # When expense occurred
    due_date               # When payment is due

    # Totals (from line items)
    subtotal, tax_total, total_amount

    # Workflow (simple)
    current_status_id

    # Invoice linkage
    invoice_id             # Created after approval

    # Line items
    line_items[]           # ExpenseOrderItems
```

**Line Items** (the power of expense orders):
```python
class ExpenseOrderItem:
    description            # "Electricity", "John Doe Salary", "Emergency Repair"
    account_id             # Can override parent for mixed-account expenses

    quantity, unit, unit_price

    # Cost allocation
    cost_center_type       # 'factory', 'machine', 'project', 'department'
    cost_center_id         # Which entity to charge
```

**Examples:**

**Monthly Utilities (Mixed Accounts):**
```
Expense Order: EXP-2025-001
├─ Line 1: Electricity - $1500 (Power Company)
├─ Line 2: Water - $200 (Water Company)
└─ Line 3: Internet - $150 (ISP)
Total: $1850
```

**Payroll (Multiple Employees):**
```
Expense Order: EXP-2025-002
├─ Line 1: John Doe Salary - $5000
├─ Line 2: Jane Smith Salary - $4500
└─ Line 3: Bob Johnson Overtime - $1000 (20 hrs × $50)
Total: $10,500
```

**Workflow**: Simple (3-4 statuses)
1. Pending → Approved → Invoice Created → Paid

#### Recurring Expense Automation

**How it works:**

1. **Create Template** (one-time setup):
```python
template = OrderTemplate(
    template_type='expense',
    template_name="Factory 1 Monthly Utilities",
    is_recurring=True,
    recurrence_type='monthly',
    recurrence_day=15,  # Generate on 15th each month
    auto_generate=True,
    auto_approve=False,  # Needs review
)

# Template items
template_items = [
    OrderTemplateItem(description="Electricity", is_variable_amount=True),
    OrderTemplateItem(description="Water", is_variable_amount=True),
]
```

2. **System Auto-Generates** (scheduled job runs daily):
```python
if template.next_generation_date <= today():
    expense_order = ExpenseOrder(
        template_id=template.id,
        expense_category='utilities',
        line_items=[
            ExpenseOrderItem(description="Electricity", unit_price=None),  # User fills in
            ExpenseOrderItem(description="Water", unit_price=None),
        ]
    )
    template.next_generation_date = next_month(15)
```

3. **User Reviews & Approves:**
- Receives notification: "3 new expenses generated"
- Fills in actual amounts from bills
- Approves → Creates invoice → Pays

#### Order Workflows

**Shared `order_workflows` table:**
- Purchase orders: Complex workflow (6-8 statuses)
- Transfer orders: Simple workflow (3-4 statuses)
- Expense orders: Simple workflow (3-4 statuses)

~~**Shared `status_tracker` table:**~~ - ⚠️ **REMOVED**
- Status tracking has been removed
- New system needed for different order types (see TODOs section)

#### Migration from Old `orders` Table

**Status**: TODO - Migration needed

The old unified `orders` table needs migration:
1. Analyze `order_type` field (PFM, PFS, STM, etc.)
2. Migrate to appropriate new table:
   - PFM, PFS, PFP → `purchase_orders`
   - STM, MTM, STP → `transfer_orders`
3. Migrate `order_items` to respective item tables
4. Drop old tables after verification

### Sales Module: Customer Orders & Deliveries

The system supports **sales orders (contracts)** with **multiple deliveries** over time. Sales orders link to customer accounts and can be invoiced per-delivery or per-contract.

#### Sales Order Structure

**One contract, multiple deliveries:**
```
Sales Order SO-2025-001 (10,000 kg Cotton Yarn)
├─ Delivery 1: 3,000 kg on Jan 15
├─ Delivery 2: 4,000 kg on Feb 10
└─ Delivery 3: 3,000 kg on Mar 5
```

#### Sales Orders (Main Contract)

```python
class SalesOrder:
    sales_order_number         # Auto: SO-2025-001
    workspace_id
    account_id                 # Customer (must have 'client' tag)
    factory_id                 # Which factory handles this

    # Dates
    order_date
    quotation_sent_date        # When quotation sent to customer
    expected_delivery_date

    # Money
    total_amount               # Total contract value

    # Status
    current_status_id          # order_workflows
    is_fully_delivered         # All items delivered?

    # Invoice
    invoice_id                 # Links to account_invoices (receivable)
    is_invoiced                # Has invoice been created?

    notes
    created_by, created_at
```

#### Sales Order Items (What's Being Sold)

```python
class SalesOrderItem:
    sales_order_id
    item_id
    workspace_id

    quantity_ordered           # Total in contract
    quantity_delivered         # How much delivered so far
    # quantity_remaining = quantity_ordered - quantity_delivered (calculated)

    unit_price
    line_total

    notes
```

#### Sales Deliveries (Each Delivery)

```python
class SalesDelivery:
    delivery_number            # Auto: DEL-2025-001
    sales_order_id             # Parent contract
    workspace_id

    scheduled_date             # When planned
    actual_delivery_date       # When actually delivered

    delivery_status            # 'planned' | 'delivered' | 'cancelled'

    tracking_number
    notes
    created_by, created_at
```

#### Sales Delivery Items (What's in This Delivery)

```python
class SalesDeliveryItem:
    delivery_id
    sales_order_item_id        # Links back to contract line item
    item_id                    # Denormalized for easy querying
    workspace_id

    quantity_delivered         # Qty in THIS delivery

    notes
```

#### Sales Workflow

**Simple workflow:**
```
Draft → Quotation Sent → Accepted → In Progress →
Delivered → Invoiced → Paid → Completed
```

**Key Transitions:**
- **Accepted → In Progress**: Work/production started
- **Delivered**: Customer received goods, inventory ledger updated
- **Invoiced**: Receivable invoice created in `account_invoices`
- **Paid**: Invoice fully paid via `invoice_payments`

#### Sales Flow Example

**1. Create Contract**
```python
order = SalesOrder(
    sales_order_number="SO-2025-001",
    account_id=customer_id,
    factory_id=factory_id,
    order_date=today(),
    quotation_sent_date=today(),
    expected_delivery_date="2025-02-15",
    total_amount=100000,
    current_status_id=1  # Draft
)

items = [
    SalesOrderItem(
        item_id=50,
        quantity_ordered=10000,  # Total contract
        unit_price=10,
        line_total=100000
    )
]
```

**2. Plan Multiple Deliveries**
```python
delivery1 = SalesDelivery(
    sales_order_id=order.id,
    delivery_number="DEL-2025-001",
    scheduled_date="2025-01-15",
    delivery_status='planned'
)

delivery1_items = [
    SalesDeliveryItem(
        sales_order_item_id=items[0].id,
        item_id=50,
        quantity_delivered=3000  # First delivery: 3,000 kg
    )
]
```

**3. Complete Delivery (Updates Inventory)**
```python
# Mark as delivered
delivery1.delivery_status = 'delivered'
delivery1.actual_delivery_date = today()

# Update contract line item
items[0].quantity_delivered += 3000  # Now 3,000 delivered
items[0].quantity_remaining = 7000   # 7,000 remaining

# Inventory ledger entry (transfer_out)
inventory_ledger.create(
    transaction_type='transfer_out',
    quantity=3000,
    source_type='sales_delivery',
    source_id=delivery1.id,
    destination_type='customer',
    destination_id=order.account_id
)

# Update inventory snapshot
inventory.qty -= 3000
```

**4. Create Invoice (When Ready)**
```python
# Can invoice per-delivery or per-contract
invoice = AccountInvoice(
    account_id=order.account_id,
    invoice_type='receivable',  # Customer owes us
    invoice_amount=order.total_amount,
    invoice_date=today(),
    due_date=today() + payment_terms
)

order.invoice_id = invoice.id
order.is_invoiced = True
```

**5. Receive Payments**
```python
# Use existing invoice_payments table
payment1 = InvoicePayment(
    invoice_id=invoice.id,
    payment_amount=50000,  # Partial payment
    payment_method='bank_transfer'
)

# Invoice auto-updates:
invoice.paid_amount = 50000
invoice.payment_status = 'partial'
```

#### DAO Methods

**sales_order_dao:**
- `generate_sales_order_number(workspace_id, year)` - Auto-generates "SO-2025-001"
- `create_with_user(obj_in, workspace_id, user_id)` - Creates order with auto number
- `get_by_account()`, `get_by_factory()`, `get_by_status()`
- `get_pending_deliveries()` - Orders with `is_fully_delivered=False`
- `get_uninvoiced_orders()` - Orders where `is_invoiced=False`

**sales_delivery_dao:**
- `generate_delivery_number(workspace_id, year)` - Auto-generates "DEL-2025-001"
- `create_with_user(obj_in, workspace_id, user_id)` - Creates delivery with auto number
- `get_by_sales_order()`, `get_by_status()`, `get_by_date_range()`
- `get_pending_deliveries()` - Deliveries with status 'planned'

**sales_order_item_dao:**
- `get_by_sales_order()` - All items for an order
- `get_pending_items()` - Items where `quantity_delivered < quantity_ordered`

**sales_delivery_item_dao:**
- `get_by_delivery()` - All items in a delivery
- `get_by_sales_order_item()` - Delivery history for an order item
- `calculate_total_delivered()` - Sum delivered across all deliveries

#### API Endpoints

**Sales Orders:**
- `GET /api/v1/sales-orders` - List all sales orders
- `GET /api/v1/sales-orders/{order_id}` - Get specific order
- `POST /api/v1/sales-orders` - Create new sales order with items
- `PUT /api/v1/sales-orders/{order_id}` - Update sales order
- `GET /api/v1/sales-orders/{order_id}/items` - Get order items
- `GET /api/v1/sales-orders/{order_id}/deliveries` - Get deliveries for order

**Sales Deliveries:**
- `GET /api/v1/sales-deliveries` - List all deliveries (filter by status)
- `GET /api/v1/sales-deliveries/{delivery_id}` - Get specific delivery
- `POST /api/v1/sales-deliveries` - Create new delivery with items
- `POST /api/v1/sales-deliveries/{delivery_id}/complete` - Mark as delivered, update inventory
- `GET /api/v1/sales-deliveries/{delivery_id}/items` - Get delivery items

#### Integration Points

**With Inventory System:**
- When delivery completed → Creates `inventory_ledger` entry (transfer_out)
- Updates `inventory` snapshot (deducts quantity)

**With Financial System:**
- Links to `account_invoices` (type='receivable')
- Uses existing `invoice_payments` for payment tracking
- Customer accounts must have 'client' tag

**With Workflow System:**
- Uses existing `order_workflows` for status management
- ~~Tracks status changes in `status_tracker`~~ - Status tracking removed

### Financial System: Accounts & Invoices

The system uses a unified **Account-based financial model** for tracking both expenses (payables) and income (receivables).

#### Account Model

**Unified Entity Approach:**
- Single `accounts` table for ALL external entities (suppliers, clients, utilities, employees)
- No type flags (`is_vendor`, `is_customer`) - type determined by tags
- Flexible enough to handle hybrid accounts (e.g., supplier who is also a customer)

**Account Structure:**
```python
class Account:
    # Identity
    id, workspace_id, name, account_code

    # Contact Info
    primary_contact_person, primary_email, primary_phone

    # Address
    address_line1, address_line2, city, state, postal_code, country

    # Financial
    payment_terms, tax_id

    # Admin Controls
    allow_invoices: bool = True  # Admin can disable invoice creation
    invoices_disabled_reason: Optional[str]

    # Status & Audit
    is_active, is_deleted, created_by, updated_by, deleted_by
```

#### Account Tagging System

Accounts are categorized using **tags** (many-to-many):

**4 Default System Tags:**
1. **Supplier** (`supplier`) - Vendors and suppliers we purchase from
2. **Client** (`client`) - Customers and clients we sell to
3. **Utility** (`utility`) - Service providers (electricity, internet, etc.)
4. **Payroll** (`payroll`) - Employee salary accounts

**Benefits:**
- One account can have multiple tags (e.g., supplier + client)
- Workspaces can create custom tags beyond the 4 defaults
- System tags cannot be deleted/renamed (`is_system_tag=True`)
- Tag usage tracked with `usage_count`

#### Invoice Model

**Invoice Types:**
- **Payable** - Money we owe to the account (expense)
- **Receivable** - Money the account owes us (income)

**Invoice Structure:**
```python
class AccountInvoice:
    # Links
    account_id, order_id (optional)

    # Type
    invoice_type: 'payable' | 'receivable'

    # Amounts
    invoice_amount: Decimal  # Original invoiced amount
    paid_amount: Decimal = 0  # Amount paid so far
    # outstanding_amount = invoice_amount - paid_amount (CALCULATED, not stored)

    # Reference Numbers
    invoice_number  # Our internal number
    vendor_invoice_number  # Their invoice number (if payable)

    # Dates
    invoice_date, due_date

    # Status
    payment_status: 'unpaid' | 'partial' | 'paid' | 'overdue'

    # Admin Controls
    allow_payments: bool = True  # Admin can lock payments
    payment_locked_reason: Optional[str]
```

**Key Design Decisions:**
- `outstanding_amount` is **calculated** (not stored) to avoid data inconsistency
- `payment_status` auto-updates when payments are added (in DAO layer)
- Admin can disable invoice creation per account
- Admin can lock payments per invoice with a reason

#### Payment Tracking

**Individual Payment Transactions:**
```python
class InvoicePayment:
    invoice_id
    payment_amount: Decimal
    payment_date: Date
    payment_method: 'cash' | 'bank_transfer' | 'cheque' | 'card'
    payment_reference  # Cheque number, transaction ID
    bank_name, transaction_id
    notes
```

**Payment Flow:**
1. Create payment record in `invoice_payments`
2. DAO automatically updates `invoice.paid_amount`
3. DAO automatically updates `invoice.payment_status`:
   - `paid_amount >= invoice_amount` → `paid`
   - `paid_amount > 0 and < invoice_amount` → `partial`
   - `paid_amount == 0` → `unpaid`

#### Order-Invoice Integration

Orders can be linked to accounts and invoices:

```python
class Order:
    # ... existing fields
    account_id: Optional[int]  # Link to account
    is_invoiced: bool = False  # Has invoice been created?
    invoice_created_at: Optional[datetime]
```

**Workflow:**
1. User creates order (PFM, PFS, etc.)
2. At appropriate status, user selects account and creates invoice
3. Invoice tracks quoted amount and payments
4. Multiple invoices can link to same order (e.g., partial shipments)

#### Financial Queries (DAO Methods)

**Account Queries:**
- `search_by_name_in_workspace()` - Find accounts by name
- `get_by_account_code_in_workspace()` - Find by account code
- `get_accounts_with_invoices_enabled()` - Accounts where invoicing allowed

**Invoice Queries:**
- `get_by_account()` - All invoices for an account
- `get_by_order()` - Invoices linked to an order
- `get_by_status()` - Filter by payment status
- `get_by_type()` - Payables vs receivables
- `get_unpaid_invoices()` - Outstanding invoices
- `get_overdue_invoices()` - Past due date
- `update_paid_amount()` - Add payment and auto-update status

**Payment Queries:**
- `get_by_invoice()` - All payments for an invoice
- `get_by_date_range()` - Payments in date range
- `get_by_payment_method()` - Filter by payment method
- `get_total_paid_for_invoice()` - Sum all payments
- `get_recent_payments()` - Recent payments (last N days)

#### Default Data Seeding

When a workspace is created, seed default account tags:

```python
from app.db.seed_default_account_tags import seed_default_account_tags

# In workspace creation service:
seed_default_account_tags(db, workspace_id=new_workspace.id, created_by_user_id=owner.id)
```

This creates the 4 system tags (supplier, client, utility, payroll) automatically.

## Multi-Tenancy: Workspace Architecture

### Overview

The system implements **single-level workspace multi-tenancy** (similar to Slack):
- Users sign up → Create workspace → Become owner
- Users can belong to multiple workspaces
- **Complete data isolation** between workspaces
- Workspace owner pays for subscription

### Workspace Tables

**New Tables:**
1. `subscription_plans` - Plan definitions with limits and features
2. `workspaces` - Top-level tenant with FK to subscription plan
3. `workspace_members` - User-workspace membership with role
4. `workspace_invitations` - Pending invites
5. `permission_templates` - Default RBAC templates
6. `workspace_audit_logs` - Audit trail for workspace actions

**All existing business tables** have `workspace_id` FK:
- `orders`, `items`, `projects`, `factories`, `machines`
- `storage_items`, `machine_items`, `damaged_items`
- `order_items`
- `accounts`, `account_tags`, `account_tag_assignments`
- `account_invoices`, `invoice_payments`
- `item_tags`, `item_tag_assignments`, etc.

### Workspace Isolation Security (CRITICAL)

**The Golden Rule:** Users must NEVER access data from workspaces they don't belong to.

#### Multi-Layer Security Approach

**Layer 1: Database-Level (PostgreSQL Row-Level Security)**
- RLS policies on all workspace-scoped tables
- Safety net if application logic fails
- Set `app.current_workspace_id` session variable on every request

**Layer 2: DAO-Level (Primary Defense)**
- **NEVER** write queries without `workspace_id` filter
- All DAO methods MUST filter by `workspace_id`
- Use `get_by_workspace()` and `get_by_id_and_workspace()` patterns
- Remove generic `get_multi()` - too dangerous

```python
# CORRECT - Always filter by workspace
def get_by_workspace(self, db: Session, *, workspace_id: int, skip: int = 0, limit: int = 100):
    return db.query(self.model).filter(self.model.workspace_id == workspace_id).all()

# WRONG - Never query without workspace filter
def get_all(self, db: Session):
    return db.query(self.model).all()  # DANGEROUS!
```

**Layer 3: Service-Level**
- Services always pass `workspace_id` through to DAOs
- Validate workspace ownership before operations
- Don't leak information about other workspaces in error messages

**Layer 4: Endpoint-Level**
- **Every** protected endpoint uses `get_current_workspace()` dependency
- Validates user is active member of workspace
- Checks subscription status
- Passes workspace context to services via `workspace.id`

```python
@router.get("/{order_id}")
def get_order(
    order_id: int,
    workspace: Workspace = Depends(get_current_workspace),  # Validates access
    db: Session = Depends(get_db)
):
    # ALWAYS pass workspace_id to service
    order = order_service.get_order(db, order_id=order_id, workspace_id=workspace.id)
    return order
```

#### Workspace Context via Header

All API requests include workspace context:
```
X-Workspace-ID: 10
```

The `get_current_workspace()` dependency:
1. Extracts `workspace_id` from header
2. Verifies workspace exists
3. **Verifies user is active member** (most critical check)
4. Checks subscription status
5. Sets PostgreSQL session variable for RLS
6. Returns workspace object

#### Security Testing Requirements

Before production, ALL of these tests must pass:

- [ ] Users cannot access orders from other workspaces
- [ ] Users cannot access parts from other workspaces
- [ ] Users cannot access projects from other workspaces
- [ ] Users cannot manipulate `X-Workspace-ID` header to access other data
- [ ] SQL injection cannot bypass workspace isolation
- [ ] Error messages don't leak information about other workspaces
- [ ] Workspace deletion cascades to all related data
- [ ] Foreign key constraints prevent orphaned records
- [ ] All tables have NOT NULL constraint on `workspace_id`
- [ ] All queries include workspace filter (code audit)

#### Audit Logging

All workspace access attempts are logged:
- `workspace_audit_logs` table tracks all actions
- Log successful and failed access attempts
- Monitor for suspicious patterns (e.g., user trying many workspace IDs)
- Alert on anomalies

#### Database Constraints

All workspace-scoped tables MUST have:
```sql
ALTER TABLE {table_name} ADD COLUMN workspace_id INTEGER
    REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL;

CREATE INDEX idx_{table_name}_workspace ON {table_name}(workspace_id);
```

### Subscription Plans & Limits

Workspaces have subscription-based limits:
- `max_members` - Maximum team members
- `max_storage_mb` - Storage quota
- `max_orders_per_month` - Monthly order creation limit
- `max_factories`, `max_machines`, `max_projects` - Resource limits

Plans: `free`, `pro`, `enterprise`, or custom plans

Check limits before create operations:
```python
@router.post("/")
def create_order(
    workspace: Workspace = Depends(get_current_workspace),
    _: bool = Depends(check_workspace_limit('orders_per_month')),
    db: Session = Depends(get_db)
):
    # Create order...
```

### Workspace RBAC

Two-part permission system:

1. **workspace_members.role** - User's role in workspace
   - Roles: `owner`, `finance`, `ground-team`, `ground-team-manager`
   - One role per user per workspace
   - Can have different roles in different workspaces

2. **access_control** - Permissions per role (workspace-specific)
   - Each workspace can customize role permissions
   - Default permissions copied from `permission_templates` on workspace creation
   - Workspace owner can modify permissions

Permission checks:
```python
# Check specific permission
@router.post("/")
def create_order(
    workspace: Workspace = Depends(get_current_workspace),
    _: bool = Depends(require_permission('page', 'create_order')),
    db: Session = Depends(get_db)
):
    # Create order...
```

### Migration Strategy

1. Create new workspace tables
2. Seed default subscription plans
3. Create default workspace for existing data
4. Add all existing users to default workspace
5. Add `workspace_id` column to all business tables (nullable)
6. Set all existing records to default workspace
7. Make `workspace_id` NOT NULL
8. Add indexes and constraints
9. Enable PostgreSQL RLS policies

## Development Guidelines

### Code Style

**Frontend**:
- Use functional components with hooks (no class components)
- TypeScript for all code with strict typing
- Use `@/` path alias for imports from `src/`
- Async/await over `.then()` chains
- Component props must have explicit TypeScript interfaces
- Use RTK Query hooks for all API calls

**Backend**:
- Follow PEP 8 style guide
- Use type hints for all function signatures
- Pydantic schemas for request/response validation
- Keep business logic in service layer, not route handlers
- Use dependency injection for DB sessions and auth
- SQLAlchemy models must match database schema exactly

### Error Handling

**Frontend**:
- RTK Query automatically handles loading and error states
- Display user-friendly error messages via `react-hot-toast`
- Log errors to console in development

**Backend**:
- Raise `HTTPException` with appropriate status codes (400, 401, 403, 404, 500)
- Use custom exception handlers for common errors
- Return consistent error response format:
  ```json
  {
    "detail": "Error message"
  }
  ```

### Testing

**Frontend**:
- Unit tests for utilities and custom hooks
- Component tests with React Testing Library
- Mock RTK Query responses in tests

**Backend**:
- Unit tests for services and CRUD operations
- Integration tests for API endpoints using `TestClient`
- Use pytest fixtures for database and auth mocking

## Environment Variables

**Frontend** (`.env`):
```
VITE_API_URL=http://localhost:8000/api/v1
VITE_APP_NAME=ERP System
```

**Backend** (`.env`):
```
DATABASE_URL=postgresql://user:password@localhost:5432/erp_db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
ENVIRONMENT=development
BACKEND_CORS_ORIGINS=["http://localhost:5173"]
API_V1_STR=/api/v1
```

## API Documentation

When backend is running, FastAPI auto-generates interactive API docs:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`

## TODOs & Future Work

### Inventory Cost Calculation Strategy

**Status**: TODO - Needs design decision

The ledger system tracks `avg_price_before` and `avg_price_after` for each transaction, but we need to decide on the cost calculation method:

**Options:**
1. **FIFO (First-In, First-Out)** - Use cost of oldest inventory first
   - Pros: Matches physical flow for most inventory
   - Cons: More complex to track, requires queue of purchases

2. **LIFO (Last-In, First-Out)** - Use cost of newest inventory first
   - Pros: Tax advantages in some jurisdictions
   - Cons: Doesn't match physical flow, requires stack of purchases

3. **Weighted Average** - Calculate average cost across all inventory
   - Pros: Simple, smooths out price fluctuations
   - Cons: May not reflect actual costs accurately

4. **Moving Average** - Recalculate average on each purchase
   - Pros: Simple, real-time cost updates
   - Cons: Past transactions affect current calculations

**Current Implementation:**
- Ledger tables store `avg_price_before` and `avg_price_after` fields
- DAO methods calculate balance from latest ledger entry
- No specific cost method enforced yet

**Decision Required:**
- Choose cost calculation method per workspace (configurable?)
- Implement calculation logic in DAO/service layer
- Document method in workspace settings

### Instant Add Tables Deprecation

**Status**: ✅ COMPLETED (Nov 2025)

The instant add audit tables have been fully removed from the system.

**What Was Removed:**
- ✅ `instant_add_storage_item` table dropped from database
- ✅ `instant_add_machine_item` table dropped from database
- ✅ `instant_add_damaged_item` table dropped from database
- ✅ `InstantAddStorageItem`, `InstantAddMachineItem`, `InstantAddDamagedItem` models removed
- ✅ All instant add schemas, DAOs, API endpoints removed
- ✅ `/api/v1/instant-add-storage-parts` endpoint removed
- ✅ `/api/v1/instant-add-machine-parts` endpoint removed
- ✅ `/api/v1/instant-add-damaged-parts` endpoint removed
- ✅ `InventoryManager.instant_add_to_storage()` method removed

**Migration to Ledger System:**
Manual inventory additions should now be logged using ledger tables:
- Storage additions → `storage_item_ledger` with `source_type='manual'`
- Machine additions → `machine_item_ledger` with `source_type='manual'`
- Damaged additions → `damaged_item_ledger` with `source_type='manual'`

### Vendor Table Migration

**Status**: TODO - Migration needed

The `vendor` table still exists from the old system. Should migrate to new `accounts` system:

**Migration Steps:**
1. Create migration script to copy vendors to accounts table
2. Tag all migrated accounts with "supplier" tag
3. Update any foreign keys pointing to vendors table
4. Remove vendor model, schemas, DAOs
5. Drop vendor table in database migration

### Part to Item Migration

**Status**: ✅ COMPLETED (Nov 2025)

The system has fully migrated from "Part" terminology to "Item" terminology for better accuracy and consistency. "Item" is more appropriate as it encompasses raw materials, machine parts, consumables, tools, and finished goods.

**What Was Migrated:**

**Backend - ✅ Complete:**
- ✅ Models: `part.py` → `item.py` (deleted old, using new)
- ✅ Models: `storage_part.py` → `storage_item.py` (deleted old, using new)
- ✅ Models: `machine_part.py` → `machine_item.py` (deleted old, using new)
- ✅ Models: `damaged_part.py` → `damaged_item.py` (deleted old, using new)
- ✅ Models: `order_part.py` → `order_item.py` (deleted old, using new)
- ✅ Models: `project_component_part.py` → `project_component_item.py` (deleted old, using new)
- ✅ DAOs: All part DAOs replaced with item DAOs
- ✅ Schemas: All part schemas replaced with item schemas
- ✅ Ledgers: `storage_item_ledger`, `machine_item_ledger`, `damaged_item_ledger`, `project_component_item_ledger`
- ✅ API Endpoints: Renamed from `parts.py` → `items.py`, etc.
- ✅ API Routes: Updated from `/parts` → `/items`, `/storage-parts` → `/storage-items`, etc.
- ✅ Broken imports fixed in `db/base.py`

**API Breaking Changes:**
- ⚠️ `/api/v1/parts` → `/api/v1/items`
- ⚠️ `/api/v1/storage-parts` → `/api/v1/storage-items`
- ⚠️ `/api/v1/machine-parts` → `/api/v1/machine-items`
- ⚠️ `/api/v1/damaged-parts` → `/api/v1/damaged-items`
- ⚠️ `/api/v1/order-parts` → `/api/v1/order-items`
- ⚠️ `/api/v1/project-component-parts` → `/api/v1/project-component-items`

**Legacy Items (Updated for Compatibility):**
- ⚪ `order_part_log.py` - Legacy audit log (kept for historical data)
  - ✅ Updated foreign key: `order_parts.id` → `order_items.id`
  - ✅ Updated relationship: `OrderPart` → `OrderItem`
  - Table name still `order_parts_logs` (unchanged)

**Database Migration:**
- ⚠️ Database tables may still use old "part" names (e.g., `parts`, `storage_parts`, `machine_parts`)
- If tables need renaming, create separate migration when safe to do so
- Current models work with existing table names via SQLAlchemy `__tablename__` attribute

**Next Steps (If Needed):**
- If database tables use old names, create migration to rename them
- Update frontend to use new `/items` API endpoints
- Deprecate any remaining "part" references in comments or documentation

### Status Tracking System Redesign

**Status**: TODO - New implementation needed

**Background:**
The unified `status_tracker` table has been removed (Nov 2025) because it was insufficient for tracking status changes across different order types (purchase orders, transfer orders, expense orders, sales orders, production batches, etc.).

**Problem with Old System:**
- Single polymorphic table tried to track ALL order types
- Different order types have different status workflows and requirements
- No flexibility for order-type-specific status metadata
- Couldn't track different entities (orders vs deliveries vs batches)

**What Was Removed:**
- ✅ `status_tracker` table dropped from database
- ✅ `StatusTracker` model, schemas, DAO, API endpoints removed
- ✅ Status logging removed from `OrderManager` and `SalesManager`
- ✅ `/api/v1/status-tracker` endpoints removed

**What Still Exists:**
- ✅ `statuses` table - Master data for status definitions (kept)
- ✅ `order_workflows` table - Workflow definitions per order type (kept)
- ✅ Orders still have `current_status_id` field (kept)

**Requirements for New System:**
1. **Separate status tracking per order type:**
   - `purchase_order_status_history` - Track purchase order status changes
   - `transfer_order_status_history` - Track transfer order status changes
   - `expense_order_status_history` - Track expense order status changes
   - `sales_order_status_history` - Track sales order status changes
   - `sales_delivery_status_history` - Track delivery status changes
   - `production_batch_status_history` - Track production batch status changes

2. **Common fields across all status history tables:**
   - `id`, `workspace_id` (workspace isolation)
   - `[entity]_id` (e.g., `purchase_order_id`, `sales_delivery_id`)
   - `status_id` (FK to `statuses` table)
   - `changed_by_user_id` (who made the change)
   - `changed_at` (timestamp)
   - `notes` (optional comment on status change)

3. **Order-type-specific metadata:**
   - Purchase orders: approval stage, approver comments
   - Transfer orders: transfer completion percentage
   - Sales deliveries: delivery tracking info
   - Production batches: quality check results

**Implementation Tasks:**
- [ ] Design separate status history tables for each order type
- [ ] Create models, schemas, DAOs for new status history tables
- [ ] Create database migrations to add new tables
- [ ] Update managers to log status changes to appropriate tables
- [ ] Create API endpoints for retrieving status history per order type
- [ ] Update frontend to display status history

**Target Date:** TBD - Will implement when ready

## Common Tasks

### Adding a New API Endpoint

1. Define Pydantic schemas in `app/schemas/`
2. Create/update SQLAlchemy model in `app/models/`
3. Add CRUD operations in `app/crud/`
4. Add business logic in `app/services/`
5. Create endpoint in `app/api/v1/endpoints/`
6. Add endpoint to router in `app/api/v1/router.py`

### Adding a New RTK Query API

1. Create API slice in `src/features/{feature}/{feature}Api.ts`
2. Define TypeScript interfaces for request/response
3. Add API reducer to store configuration
4. Export hooks for use in components
5. Use hooks in components with proper error handling
