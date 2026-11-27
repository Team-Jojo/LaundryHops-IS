# LaundryHops — API Reference

**Audience:** backend integrators, QA, and reviewers of the initial build.
**Source of truth:** `backend/src/constants.js`, `backend/src/routes/`, and `backend/src/controllers/`.
**Executable collection:** [`postman/LaundryHops.postman_collection.json`](postman/LaundryHops.postman_collection.json).

---

## 1. Conventions

| Item | Value |
|---|---|
| Base URL (local) | `http://localhost:5000/api` |
| Content type | `application/json` |
| Authentication | `Authorization: Bearer <token>` on protected routes |
| Roles | `customer` (default) and `admin` |
| Token lifetime | `1d` (configurable via `JWT_EXPIRES_IN`) |
| Password hashing | `bcryptjs`, cost 10 |
| Error envelope | `{ "message": "..." }` |

Access labels used below:

- **public** — no token required
- **user** — any authenticated user
- **owner or admin** — the booking's customer or an admin
- **admin** — `requireAdmin` middleware; a customer token receives `403`

All list endpoints return a named array (`services`, `bookings`, `payments`, `users`), not a bare array. Booking and payment objects include their related records via Sequelize associations (`service`, `payment`, `customer` / `booking`).

---

## 2. Endpoints

### System

| Method | Path | Access | Response |
|---|---|---|---|
| `GET` | `/health` | public | `{ "status": "ok", "service": "LaundryHops API", "time": "<ISO timestamp>" }` |

### Auth

| Method | Path | Access | Request body | Success response |
|---|---|---|---|---|
| `POST` | `/auth/register` | public | `full_name`, `email`, `password`, `phone?`, `address?` | `201 { "message", "token", "user" }` |
| `POST` | `/auth/login` | public | `email`, `password` | `200 { "message": "Login successful.", "token", "user" }` |
| `GET` | `/auth/me` | user | — | `200 { "user" }` |

Notes:

- Registration always creates a `customer`; a supplied `role` is ignored.
- Emails are lower-cased on lookup and creation.
- `user` never includes `password_hash`. Shape: `{ id, full_name, email, phone, address, role }`.

### Services

| Method | Path | Access | Request | Success response |
|---|---|---|---|---|
| `GET` | `/services` | public | — | `{ "services": [...] }`, ordered by `name` ASC |
| `GET` | `/services/:id` | public | — | `{ "service": {...} }` |
| `POST` | `/services` | admin | `name`, `price`, `description?`, `unit?`, `is_available?` | `201 { "message": "Service created.", "service" }` |
| `PUT` | `/services/:id` | admin | any subset of the create fields | `{ "message": "Service updated.", "service" }` |
| `DELETE` | `/services/:id` | admin | — | `{ "message": "Service deleted." }` |

Field rules:

- `price` must be a finite number `>= 0` (send a JSON number, not a string).
- `unit` must be one of `per_kg`, `per_item`, `fixed` (default `per_kg`).
- `is_available` must be a JSON boolean; the string `"false"` is coerced to `true`.
- Deleting a service referenced by any booking returns `409`; set `is_available: false` instead.

### Bookings

| Method | Path | Access | Request | Success response |
|---|---|---|---|---|
| `GET` | `/bookings/slots?date=YYYY-MM-DD` | user | query `date` | `{ "date", "capacity": 5, "slots": [{ slot, booked, capacity, available }] }` |
| `POST` | `/bookings` | user | `service_id`, `quantity`, `delivery_date`, `time_slot`, `notes?` | `201 { "message", "booking" }` |
| `GET` | `/bookings` | user | — | `{ "bookings": [...] }`, newest first |
| `GET` | `/bookings/:id` | owner or admin | — | `{ "booking" }` |
| `PATCH` | `/bookings/:id/cancel` | owner or admin | — | `{ "message": "Booking cancelled.", "booking" }` |
| `PATCH` | `/bookings/:id/status` | admin | `{ "status": "<next status>" }` | `{ "message": "Booking marked as <status>.", "booking" }` |

Field rules:

- `time_slot` must be one of `09:00-11:00`, `13:00-15:00`, `16:00-18:00`.
- `delivery_date` must match `YYYY-MM-DD` and not be before the server's local today.
- `quantity` must be a finite number `>= 0.5`.
- `total_amount` is server-computed as `round(service.price * quantity, 2)`; client-supplied totals are ignored.
- Slot capacity is 5 per `date + slot`; cancelled bookings do not consume capacity. A full slot returns `409`.
- Creating a booking atomically creates one `cash` payment with `status: unpaid` and `amount = total_amount`.
- **Customer cancellation:** `PATCH /bookings/:id/cancel` works only while the booking is `pending` and removes the payment row.
- **Admin cancellation:** an admin can cancel a `pending` or `confirmed` booking through `PATCH /bookings/:id/status` with `{ "status": "cancelled" }`.

Allowed status transitions (`backend/src/constants.js`):

```text
pending   → confirmed | cancelled
confirmed → received  | cancelled
received  → washing
washing   → ready
ready     → delivered | claimed
delivered → (final)
claimed   → (final)
cancelled → (final)
```

Skipping a step returns `400` with the allowed values; changing a final state returns `409`.

### Admin

| Method | Path | Access | Query | Success response |
|---|---|---|---|---|
| `GET` | `/admin/bookings` | admin | `status?`, `date?`, `user_id?` | `{ "bookings": [...] }` |
| `GET` | `/admin/stats` | admin | — | `{ "totals": {...}, "byStatus": {...} }` |
| `GET` | `/users` | admin | — | `{ "users": [...] }` |

`totals` contains `customers`, `services`, `bookings`, `revenue`, `pendingPayments`, and `todayBookings`. `byStatus` has a count for every value in `BOOKING_STATUSES`, including zeros. `/users` returns customers only, each with an added `booking_count`.

### Payments

| Method | Path | Access | Query | Success response |
|---|---|---|---|---|
| `GET` | `/payments` | admin | `status?` (`unpaid` / `paid`) | `{ "payments": [...] }` |
| `GET` | `/payments/:id` | admin | — | `{ "payment" }` (booking + service + customer) |
| `PATCH` | `/payments/:id` | admin | no body | `{ "message": "Payment recorded.", "payment" }` |

A payment can be marked paid only when the booking is `ready`, `delivered`, or `claimed`. A second `PATCH` returns `409`. Payments are cash-only; there is no online gateway.

---

## 3. Error catalog

| Status | Typical cause | Example message |
|---|---|---|
| `400` | Missing/invalid body or query fields | `full_name, email and password are required.` |
| `400` | Invalid enum / format / business rule | `time_slot must be one of: 09:00-11:00, 13:00-15:00, 16:00-18:00.` |
| `400` | Invalid status transition | `Cannot move from "washing" to "delivered". Allowed: ready.` |
| `400` | Malformed JSON body | `Request body is not valid JSON.` |
| `401` | Bad credentials | `Invalid email or password.` |
| `401` | Missing, invalid, or expired token | `Invalid or expired token. Please log in again.` |
| `403` | Non-admin on admin route | `Admin access required.` |
| `403` | Other customer's booking | `You can only view your own bookings.` |
| `404` | Unknown record | `Service not found.`, `Booking not found.`, `Payment not found.` |
| `409` | Duplicate email | `Email is already registered.` |
| `409` | Slot is full | `The 09:00-11:00 slot is full on <date>. Please pick another slot.` |
| `409` | Service has bookings | `Service has N booking(s). Set it unavailable instead of deleting it.` |
| `409` | Cancel a non-pending booking | `Only pending bookings can be cancelled (current status: ...).` |
| `409` | Payment already paid | `Payment is already marked as paid.` |
| `409` | Pay before booking is payable | `Payment can only be recorded once the booking is ready, delivered or claimed ...` |
| `409` | Status is final | `Booking is already in a final state (<status>).` |
| `500` | Unexpected server/database error | `{ "message": "<error message>" }` |

All other unmatched routes return `404 { "message": "Route not found: <METHOD> <path>" }`.

---

## 4. Quick examples

```bash
BASE=http://localhost:5000/api

# Health
curl $BASE/health

# Customer login — capture the token
curl -X POST $BASE/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"juan@example.com","password":"juan123"}'

# Slot availability for tomorrow (replace the date)
curl $BASE/bookings/slots?date=2026-11-28 \
  -H 'Authorization: Bearer <token>'

# Admin creates a service
curl -X POST $BASE/services \
  -H 'Authorization: Bearer <admin-token>' \
  -H 'Content-Type: application/json' \
  -d '{"name":"Wash & Fold","price":60,"unit":"per_kg"}'
```

---

## 5. Related documents

- [`README.md`](../README.md) — setup, demo accounts, scripts
- [`initial-build.md`](initial-build.md) — release/PR notes and verification evidence
- [`database/erd.md`](database/erd.md) — schema and data dictionary
- [`qa/test-cases.md`](qa/test-cases.md) — manual API and UI cases
