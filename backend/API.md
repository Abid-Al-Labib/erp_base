# API Layer Documentation

This document outlines the API design patterns, best practices, and standards used in this ERP system.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Response Formats](#response-formats)
3. [Error Handling](#error-handling)
4. [Request/Response Flow](#requestresponse-flow)
5. [Security](#security)
6. [API Design Patterns](#api-design-patterns)
7. [Code Examples](#code-examples)
8. [Frontend Integration](#frontend-integration)

---

## Architecture Overview

### Backend-Heavy Approach

**Philosophy:** Backend performs all business logic; frontend only handles UI.

```
Frontend              Backend
   │                     │
   ├─ Send IDs ────────→ │
   │                     ├─ Validate permissions
   │                     ├─ Execute business logic
   │                     ├─ Update database (atomic)
   │                     ├─ Generate messages
   │                     └─ Return result + messages
   ├─ ←──── Response ────┤
   └─ Display messages   │
```

**Benefits:**
- ✅ **Security**: Business logic enforced server-side
- ✅ **Atomic transactions**: All-or-nothing operations
- ✅ **Single source of truth**: No logic duplication
- ✅ **Easy to add clients**: Mobile apps, CLI tools, etc.
- ✅ **Better testing**: Test business logic in one place

**Example:**
```python
# ❌ BAD - Frontend orchestrating multiple calls
POST /api/v1/sales-orders (create order)
POST /api/v1/inventory/reserve (reserve stock)
POST /api/v1/invoices (generate invoice)
POST /api/v1/notifications (send email)

# ✅ GOOD - Single backend endpoint does everything
POST /api/v1/sales-deliveries/{id}/complete
```

---

## Response Formats

### Standard Success Response (Direct)

Return data directly without wrapper. HTTP status code indicates success.

```json
{
  "id": 123,
  "sales_order_number": "SO-2025-001",
  "total_amount": 100000,
  "created_at": "2025-01-24T10:30:00Z"
}
```

**HTTP Status Codes:**
- `200 OK` - Successful GET, PUT
- `201 Created` - Successful POST (resource created)
- `204 No Content` - Successful DELETE

---

### Action Response (With Messages)

For complex operations, return data + messages about what happened.

```json
{
  "data": {
    "id": 123,
    "sales_order_number": "SO-2025-001",
    "is_fully_delivered": true
  },
  "messages": [
    {
      "type": "success",
      "message": "Delivery DEL-2025-001 marked as completed",
      "timestamp": "2025-01-24T10:30:00Z"
    },
    {
      "type": "info",
      "message": "Inventory updated: 3 items, 5000 units deducted",
      "timestamp": "2025-01-24T10:30:01Z",
      "details": {
        "item_count": 3,
        "total_quantity": 5000
      }
    },
    {
      "type": "success",
      "message": "Sales order SO-2025-001 is now fully delivered",
      "timestamp": "2025-01-24T10:30:02Z"
    },
    {
      "type": "warning",
      "message": "Customer notification failed - will retry automatically",
      "timestamp": "2025-01-24T10:30:03Z"
    }
  ],
  "request_id": "req_abc123xyz"
}
```

**Message Types:**
- `success` - Operation succeeded
- `info` - Additional information
- `warning` - Non-critical issue
- `error` - Partial failure

**When to use:**
- Multi-step operations (delivery completion, order processing)
- When you want to show users what happened behind the scenes
- Operations with side effects (inventory updates, notifications)

---

### Error Response (RFC 7807)

Standardized error format following **RFC 7807 Problem Details**.

```json
{
  "type": "https://api.yourdomain.com/errors/validation_error",
  "title": "Validation Error",
  "status": 400,
  "detail": "Sales order must have at least one item",
  "instance": "/api/v1/sales-orders",
  "request_id": "req_abc123xyz",
  "errors": [
    {
      "field": "items",
      "message": "At least one item is required",
      "code": "min_items"
    }
  ]
}
```

**Fields:**
- `type` - URL to error documentation (stable identifier)
- `title` - Short human-readable summary
- `status` - HTTP status code
- `detail` - Specific explanation for this occurrence
- `instance` - Request path that caused the error
- `request_id` - Unique ID for debugging
- `errors` - Array of field-level errors (for validation)

---

## Error Handling

### HTTP Status Codes

Use semantic, specific status codes:

**Success (2xx):**
- `200 OK` - GET, PUT succeeded
- `201 Created` - POST succeeded, resource created
- `204 No Content` - DELETE succeeded

**Client Errors (4xx):**
- `400 Bad Request` - Malformed request, invalid JSON
- `401 Unauthorized` - Not authenticated (missing/invalid token)
- `403 Forbidden` - Authenticated but no permission
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Resource conflict (duplicate entry)
- `422 Unprocessable Entity` - Valid format, business logic fails
- `429 Too Many Requests` - Rate limit exceeded

**Server Errors (5xx):**
- `500 Internal Server Error` - Unexpected error
- `503 Service Unavailable` - Database down, maintenance

---

### Custom Exception Classes

Use specific exceptions for different error types:

```python
from app.core.exceptions import (
    ValidationError,        # 400 - Request validation failed
    AuthenticationError,    # 401 - Auth required/failed
    PermissionDeniedError,  # 403 - No permission
    NotFoundError,          # 404 - Resource not found
    ConflictError,          # 409 - Resource conflict
    BusinessRuleError,      # 422 - Business rule violation
    RateLimitError,         # 429 - Rate limit exceeded
    InternalServerError,    # 500 - Unexpected error
)

# Example usage
if not order:
    raise NotFoundError(f"Sales order with ID {order_id} not found")

if not items:
    raise BusinessRuleError(
        "Sales order must have at least one item",
        errors=[{"field": "items", "message": "Required", "code": "min_items"}]
    )
```

---

### Error Sanitization

**NEVER expose internal errors to clients:**

```python
# ❌ BAD - Exposes database internals
{
  "detail": "sqlalchemy.exc.IntegrityError: duplicate key value..."
}

# ✅ GOOD - Sanitized, helpful message
{
  "type": "https://api.yourdomain.com/errors/conflict",
  "title": "Resource Conflict",
  "status": 409,
  "detail": "This resource already exists. Please use a different value.",
  "request_id": "req_abc123"
}
```

**Server-side logging:**
```python
# Log FULL error with stack trace server-side
logger.exception(
    "Unexpected error",
    extra={
        "request_id": request_id,
        "error": str(exc),
        "path": request.url.path
    }
)

# Return sanitized error to client
return {
    "detail": "An unexpected error occurred. Please contact support.",
    "request_id": request_id  # Give this to support
}
```

---

## Request/Response Flow

### Complete Request Lifecycle

```
1. Request arrives
   ↓
2. RequestContextMiddleware
   - Generate request_id
   - Start timing
   - Log request
   ↓
3. SecurityHeadersMiddleware
   - Add security headers
   ↓
4. CORS Middleware
   - Handle CORS
   ↓
5. Endpoint Handler
   - Validate auth (get_current_user)
   - Validate workspace (get_current_workspace)
   - Execute business logic
   ↓
6. Service Layer
   - Orchestrate managers
   - Handle transactions (commit/rollback)
   - Generate messages
   ↓
7. Manager Layer
   - Implement business rules
   - Coordinate DAOs
   ↓
8. DAO Layer
   - Database operations
   - Use flush() (no commit)
   ↓
9. Response
   - Add request_id to headers
   - Log response time
   - Return to client
```

---

### Request ID Tracking

Every request gets a unique ID for debugging.

**Response Headers:**
```http
HTTP/1.1 200 OK
X-Request-ID: req_abc123xyz789
Content-Type: application/json
```

**In Response Body:**
```json
{
  "request_id": "req_abc123xyz789",
  ...
}
```

**Why?**
- User reports error → Gives you request_id → You trace exact error in logs
- Essential for production debugging
- Industry standard (Stripe, AWS, GitHub all use this)

---

## Security

### Authentication & Authorization

**Header-based auth:**
```http
Authorization: Bearer <jwt_token>
X-Workspace-ID: 10
```

**Dependency injection:**
```python
@router.post("/sales-orders")
def create_order(
    workspace: Workspace = Depends(get_current_workspace),  # Validates workspace access
    current_user: Profile = Depends(get_current_active_user)  # Validates auth
):
    # User is authenticated and has workspace access
    pass
```

**Workspace isolation:**
- Every workspace-scoped query MUST filter by `workspace_id`
- Use `get_by_workspace()` and `get_by_id_and_workspace()` DAO methods
- NEVER use generic `get_multi()` without workspace filter

---

### Security Headers

Automatically added to all responses:

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
```

---

### Rate Limiting (Future)

For public APIs, add rate limiting headers:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1643234567
```

When exceeded (429 response):
```json
{
  "type": "https://api.yourdomain.com/errors/rate_limit",
  "title": "Rate Limit Exceeded",
  "status": 429,
  "detail": "You have exceeded the rate limit of 1000 requests per hour",
  "retry_after": 3600
}
```

---

## API Design Patterns

### 1. Simple CRUD Operations

Use direct responses:

```python
@router.get("/sales-orders/{order_id}", response_model=SalesOrderResponse)
def get_sales_order(
    order_id: int,
    db: Session = Depends(get_db),
    workspace: Workspace = Depends(get_current_workspace),
):
    order = sales_service.get_sales_order(db, order_id, workspace.id)
    return order  # Direct response
```

---

### 2. Complex Operations with Messages

Use `ActionResponse` for multi-step operations:

```python
@router.post(
    "/sales-deliveries/{id}/complete",
    response_model=ActionResponse[SalesOrderResponse]
)
def complete_delivery(delivery_id: int, ...):
    # Service returns (data, messages)
    sales_order, messages = sales_service.complete_delivery(...)

    return ActionResponse(
        data=sales_order,
        messages=messages
    )
```

---

### 3. Bulk Operations

Return array of action responses:

```python
@router.post("/sales-orders/bulk-approve")
def bulk_approve_orders(
    order_ids: List[int],
    ...
) -> List[ActionResponse[SalesOrderResponse]]:
    results = []
    for order_id in order_ids:
        try:
            order, messages = sales_service.approve_order(order_id)
            results.append(ActionResponse(data=order, messages=messages))
        except Exception as e:
            results.append(ActionResponse(
                data=None,
                messages=[error_message(str(e))]
            ))
    return results
```

---

### 4. Pagination

Use limit/offset or cursor-based:

```python
@router.get("/sales-orders")
def get_sales_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=100),
    ...
):
    orders = sales_service.get_sales_orders(
        db, workspace_id, skip=skip, limit=limit
    )
    return orders
```

**Future: Cursor-based pagination** (better for large datasets):
```python
@router.get("/sales-orders")
def get_sales_orders(
    limit: int = Query(100, le=100),
    starting_after: Optional[str] = None,  # Cursor
    ...
):
    orders = sales_service.get_sales_orders_cursor(...)
    return {
        "data": orders,
        "has_more": len(orders) == limit,
        "next_cursor": orders[-1].id if orders else None
    }
```

---

## Code Examples

### Complete Endpoint Example

```python
from fastapi import APIRouter, Depends, Query
from app.core.deps import get_db, get_current_workspace, get_current_active_user
from app.core.exceptions import NotFoundError, BusinessRuleError
from app.schemas.response import ActionResponse, success_message, info_message
from app.schemas.sales_order import SalesOrderResponse

router = APIRouter()

@router.post(
    "/sales-deliveries/{delivery_id}/complete",
    response_model=ActionResponse[SalesOrderResponse],
    status_code=200,
    summary="Complete delivery",
    description="""
    Complete delivery and perform all related backend actions:
    - Mark delivery as completed
    - Update inventory (deduct stock)
    - Update sales order delivery progress
    - Auto-generate invoice if order fully delivered

    Returns sales order with messages about what happened.
    """
)
def complete_delivery(
    delivery_id: int,
    db: Session = Depends(get_db),
    workspace: Workspace = Depends(get_current_workspace),
    current_user: Profile = Depends(get_current_active_user)
):
    # Service handles all logic
    sales_order, messages = sales_service.complete_delivery(
        db, delivery_id, workspace.id, current_user
    )

    return ActionResponse(
        data=sales_order,
        messages=messages
    )
```

---

### Service Layer Example

```python
from app.schemas.response import ActionMessage, success_message, info_message, warning_message
from app.core.exceptions import NotFoundError

class SalesService(BaseService):

    def complete_delivery(
        self, db, delivery_id, workspace_id, current_user
    ) -> Tuple[SalesOrder, List[ActionMessage]]:
        """Complete delivery and return action messages"""
        messages = []

        try:
            # Step 1: Validate
            delivery = self.sales_manager.sales_delivery_dao.get_by_id_and_workspace(
                db, id=delivery_id, workspace_id=workspace_id
            )
            if not delivery:
                raise NotFoundError(f"Delivery {delivery_id} not found")

            # Step 2: Complete delivery
            sales_order = self.sales_manager.complete_delivery(...)
            messages.append(success_message("Delivery completed"))

            # Step 3: Update inventory
            # ... (done in manager)
            messages.append(info_message(
                "Inventory updated: 3 items, 5000 units deducted",
                details={"item_count": 3, "total_quantity": 5000}
            ))

            # Step 4: Check if fully delivered
            if sales_order.is_fully_delivered:
                messages.append(success_message("Order fully delivered"))

            # Step 5: Send notification (non-critical)
            try:
                self._send_notification(...)
                messages.append(info_message("Notification sent"))
            except Exception as e:
                messages.append(warning_message(
                    "Notification failed - will retry",
                    details={"error": str(e)}
                ))

            self._commit_transaction(db)
            return sales_order, messages

        except Exception as e:
            self._rollback_transaction(db)
            raise
```

---

## Frontend Integration

### RTK Query API Setup

```typescript
// src/features/sales/salesApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface ActionMessage {
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
  details?: any;
}

export interface ActionResponse<T> {
  data: T;
  messages: ActionMessage[];
  request_id?: string;
}

export const salesApi = createApi({
  reducerPath: 'salesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const token = state.auth.token;
      const workspaceId = state.auth.workspaceId;

      if (token) headers.set('Authorization', `Bearer ${token}`);
      if (workspaceId) headers.set('X-Workspace-ID', workspaceId.toString());

      return headers;
    },
  }),
  endpoints: (builder) => ({
    completeDelivery: builder.mutation<ActionResponse<SalesOrder>, number>({
      query: (deliveryId) => ({
        url: `/sales-deliveries/${deliveryId}/complete`,
        method: 'POST',
      }),
    }),
  }),
});
```

---

### Component Usage

```typescript
import { useCompleteDeliveryMutation } from '@/features/sales/salesApi';
import { toast } from 'react-hot-toast';

function DeliveryCompleteButton({ deliveryId }: { deliveryId: number }) {
  const [completeDelivery, { isLoading }] = useCompleteDeliveryMutation();

  const handleComplete = async () => {
    try {
      const result = await completeDelivery(deliveryId).unwrap();

      // Show all messages to user
      result.messages.forEach(msg => {
        switch (msg.type) {
          case 'success':
            toast.success(msg.message);
            break;
          case 'info':
            toast(msg.message, { icon: 'ℹ️' });
            break;
          case 'warning':
            toast(msg.message, { icon: '⚠️' });
            break;
          case 'error':
            toast.error(msg.message);
            break;
        }
      });

    } catch (error: any) {
      // RTK Query automatically parses RFC 7807 error
      const errorMessage = error.data?.detail || 'An error occurred';
      const requestId = error.data?.request_id;

      toast.error(`${errorMessage} (Request ID: ${requestId})`);
    }
  };

  return (
    <button onClick={handleComplete} disabled={isLoading}>
      {isLoading ? 'Completing...' : 'Complete Delivery'}
    </button>
  );
}
```

---

### Error Utility

```typescript
// src/utils/errorHandler.ts
export function getErrorMessage(error: any): string {
  if (error.data?.detail) {
    return error.data.detail;
  }

  if (error.status) {
    switch (error.status) {
      case 400: return 'Invalid request. Please check your input.';
      case 401: return 'Please log in to continue.';
      case 403: return 'You do not have permission for this action.';
      case 404: return 'Resource not found.';
      case 422: return 'Unable to process due to business rules.';
      case 500: return 'Server error. Please try again later.';
      default: return 'An unexpected error occurred.';
    }
  }

  return 'An unexpected error occurred.';
}
```

---

## Best Practices Summary

### ✅ DO

- Use direct responses (no wrapper)
- Return messages for complex operations
- Use specific HTTP status codes
- Follow RFC 7807 for errors
- Add request IDs to all responses
- Sanitize errors (never expose internals)
- Perform business logic server-side
- Use structured logging
- Add security headers
- Document endpoints with OpenAPI

### ❌ DON'T

- Wrap responses with `{success: true, data: ...}`
- Return 200 with error in body
- Expose database errors to clients
- Perform business logic in frontend
- Skip error logging
- Use generic 400 for everything
- Allow frontend to orchestrate complex flows
- Return different error formats per endpoint

---

## Future Enhancements

- [ ] Rate limiting with Redis
- [ ] API versioning (/api/v2/)
- [ ] Cursor-based pagination
- [ ] WebSocket support for real-time updates
- [ ] GraphQL endpoint (optional)
- [ ] API key authentication (for third-party integrations)
- [ ] Webhooks for event notifications
- [ ] Request/response compression
- [ ] Response caching with ETags
- [ ] API analytics and monitoring
