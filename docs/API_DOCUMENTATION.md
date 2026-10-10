# HandyConnect — REST API Specification

All REST APIs use the `/api/v1` base URL prefix. All responses follow a consistent `ApiResponse<T>` envelope:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2026-10-10T14:15:00Z"
}
```

Interactive OpenAPI Swagger UI is available at:
`http://localhost:8080/swagger-ui.html` (JSON specification at `/api-docs`).

---

## 1. Authentication & Registration (`/api/v1/auth`)

### `POST /api/v1/auth/login`
- **Description:** Authenticates user credentials and returns a signed JWT token and user profile.
- **Request Body:**
  ```json
  {
    "email": "customer@handyconnect.local",
    "password": "Password123!"
  }
  ```
- **Response:** Returns JWT token string and user object with role.

### `POST /api/v1/auth/register`
- **Description:** Registers a new Customer or Handyman account.
- **Request Body (Customer):**
  ```json
  {
    "role": "ROLE_CUSTOMER",
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "password": "SecurePassword123!",
    "phone": "+1-555-0199",
    "streetLine": "123 Elm Street",
    "city": "Metropolis",
    "state": "State",
    "postalCode": "10001"
  }
  ```
- **Request Body (Handyman):**
  ```json
  {
    "role": "ROLE_HANDYMAN",
    "fullName": "Alex Rivera",
    "email": "alex@example.com",
    "password": "SecurePassword123!",
    "phone": "+1-555-0200",
    "experienceYears": 6,
    "hourlyRate": 48.0,
    "serviceAreas": "Downtown, Metro North",
    "bio": "Licensed master electrician with industrial certifications."
  }
  ```

### `GET /api/v1/auth/me`
- **Headers:** `Authorization: Bearer <token>`
- **Description:** Retrieves the authenticated user profile and roles.

---

## 2. Service Catalog (`/api/v1`)

### `GET /api/v1/categories`
- **Description:** Returns all active service categories.

### `GET /api/v1/services`
- **Description:** Returns all service offerings with indicative base labor prices and pre-configured bill-of-materials.

### `GET /api/v1/services/{id}`
- **Description:** Returns full details of a specific service offering.

### `POST /api/v1/admin/services` *(Admin only)*
- **Description:** Creates a new service offering in the catalog.

### `PUT /api/v1/admin/services/{id}` *(Admin only)*
- **Description:** Updates an existing service offering.

---

## 3. Booking & Job Lifecycle (`/api/v1/bookings`)

### `POST /api/v1/bookings`
- **Description:** Customer creates a new service booking.
- **Request Body:**
  ```json
  {
    "serviceId": 1,
    "addressId": 1,
    "scheduledDate": "2026-10-15",
    "scheduledTimeSlot": "10:00 - 12:00",
    "problemDescription": "Circuit breaker trips immediately when electric oven is switched on.",
    "photoUrl": "https://example.com/photo.jpg"
  }
  ```

### `GET /api/v1/bookings`
- **Description:** Role-filtered bookings list (customers see their bookings, handymen see assigned jobs, admins see all).

### `GET /api/v1/bookings/{id}`
- **Description:** Returns full booking details, status progression, and assigned technician.

### `GET /api/v1/bookings/{id}/readiness`
- **Description:** Evaluates the Job Readiness and Material Coordination Engine for a booking. Returns readiness level (`READY`, `PARTIALLY_READY`, `AT_RISK`, `BLOCKED`), stock allocation by warehouse, and explainable recommendations.

### `POST /api/v1/bookings/{id}/assign` *(Admin only)*
- **Description:** Assigns an eligible verified technician to the booking.
- **Request Body:** `{ "handymanId": 1 }`

### `POST /api/v1/bookings/{id}/respond` *(Handyman only)*
- **Description:** Handyman accepts or declines the dispatch assignment.
- **Request Body:** `{ "accept": true, "rejectionReason": "" }`

### `PATCH /api/v1/bookings/{id}/status`
- **Description:** Advances state transitions (`ON_THE_WAY`, `ARRIVED`, `IN_PROGRESS`, `WAITING_FOR_MATERIALS`, `CANCELLED`).
- **Request Body:** `{ "status": "ON_THE_WAY", "notes": "Departing from central warehouse" }`

### `POST /api/v1/bookings/{id}/complete` *(Handyman only)*
- **Description:** Records consumed material costs, completion notes, and photographic evidence, generating the final bill.
- **Request Body:**
  ```json
  {
    "materialsAmount": 28.50,
    "completionNotes": "Replaced burnt breaker switch. Tested voltage across circuits.",
    "completionPhotoUrl": "https://example.com/finished.jpg"
  }
  ```

---

## 4. Inventory & Warehouse Logistics (`/api/v1/inventory`)

### `GET /api/v1/inventory/items`
- **Description:** Returns all inventory materials and SKUs.

### `GET /api/v1/inventory/balances`
- **Description:** Returns real-time stock balances across all regional fulfillment warehouses.

### `GET /api/v1/inventory/alerts/low-stock`
- **Description:** Returns items whose Available Stock is below their Reorder Point (ROP).

### `GET /api/v1/inventory/movements`
- **Description:** Returns the immutable audit ledger of all inventory transactions.

### `POST /api/v1/inventory/goods-receipt`
- **Description:** Records received vendor shipments and increments on-hand stock with audit trail.
- **Request Body:**
  ```json
  {
    "itemId": 1,
    "locationId": 1,
    "quantity": 50,
    "referenceId": "GR-2026-001",
    "reason": "Supplier shipment received"
  }
  ```

### `POST /api/v1/inventory/adjust`
- **Description:** Audited stock balance adjustment with mandatory reason.
- **Request Body:**
  ```json
  {
    "itemId": 1,
    "locationId": 1,
    "adjustmentType": "CYCLE_COUNT_CORRECTION",
    "quantityChange": -2,
    "reason": "Discrepancy observed during physical stock audit"
  }
  ```

---

## 5. Replenishment & Procurement (`/api/v1/procurement`)

### `GET /api/v1/procurement/reorder-recommendations`
- **Description:** Algorithmic calculation using formula `ROP = Demand * LeadTime + SafetyStock`. Evaluates inter-warehouse transfer vs external purchase trade-offs.

### `POST /api/v1/procurement/requisitions`
- **Description:** Generates internal purchase requisition for review.

### `POST /api/v1/procurement/orders`
- **Description:** Issues contractual purchase order to supplier vendor.

### `POST /api/v1/procurement/transfers`
- **Description:** Requests inter-warehouse transfer to balance regional inventories.

### `POST /api/v1/procurement/transfers/{id}/execute` *(Admin/Manager only)*
- **Description:** Executes and confirms receipt of inter-warehouse stock transfer.

---

## 6. Billing, Payments & Reviews

### `POST /api/v1/payments/process`
- **Description:** Processes simulated customer payment with idempotency key.
- **Request Body:**
  ```json
  {
    "bookingId": 1,
    "amount": 93.50,
    "paymentMethod": "SIMULATED_CARD",
    "idempotencyKey": "PAY-BK-001-987"
  }
  ```

### `GET /api/v1/invoices/my-invoices`
- **Description:** Returns customer invoices.

### `POST /api/v1/reviews`
- **Description:** Customer rating (1-5 stars) and review for completed job.

### `POST /api/v1/complaints`
- **Description:** Customer files a grievance ticket.

### `GET /api/v1/analytics/overview` *(Admin only)*
- **Description:** Returns executive KPIs, revenue trends, and category consumption.
