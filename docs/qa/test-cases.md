# LaundryHops — Manual Test Cases

**Owner:** Cipreano Mellomida (QA) · **App:** LaundryHops · **API base:** `http://localhost:5000/api`

Legend — **Priority:** H = high (blocking), M = medium, L = low.
Test data: admin `admin@laundryhops.com / admin123`, customer `juan@example.com / juan123`.

---

## 1. Authentication & Access Control

| ID | Pri | Scenario | Steps | Expected result |
|---|---|---|---|---|
| TC-AUTH-01 | H | Register a new customer | POST `/auth/register` with full_name, email, password (≥6 chars), phone, address | `201`; returns JWT + user with `role: "customer"`; password never returned |
| TC-AUTH-02 | H | Register duplicated email | POST `/auth/register` twice with the same email | `409` "Email is already registered." |
| TC-AUTH-03 | M | Register missing fields | POST `/auth/register` with only email | `400` listing required fields |
| TC-AUTH-04 | M | Register short password | Password `123` | `400` "Password must be at least 6 characters." |
| TC-AUTH-05 | H | Login valid credentials | POST `/auth/login` as `juan@example.com / juan123` | `200`; JWT + user object |
| TC-AUTH-06 | H | Login wrong password | POST `/auth/login` with wrong password | `401` "Invalid email or password." |
| TC-AUTH-07 | H | Protected endpoint without token | GET `/auth/me` with no Authorization header | `401` |
| TC-AUTH-08 | H | Admin endpoint as customer | GET `/admin/stats` with Juan's token | `403` "Admin access required." |
| TC-AUTH-09 | M | Current profile | GET `/auth/me` with valid token | `200`; profile of token owner |
| TC-AUTH-10 | M | Invalid/expired token | GET `/auth/me` with garbage token | `401` "Invalid or expired token." |

## 2. Service Catalog

| ID | Pri | Scenario | Steps | Expected result |
|---|---|---|---|---|
| TC-SVC-01 | H | Public service list | GET `/services` (no token) | `200`; array of services with price + unit |
| TC-SVC-02 | M | Service detail | GET `/services/1` | `200`; single service |
| TC-SVC-03 | M | Unknown service | GET `/services/999999` | `404` "Service not found." |
| TC-SVC-04 | H | Admin creates service | POST `/services` with admin token + name/price/unit | `201`; service in DB |
| TC-SVC-05 | M | Duplicate service name | POST `/services` with an existing name | `400`; unique-name validation message |
| TC-SVC-06 | H | Customer cannot create service | POST `/services` with customer token | `403` |
| TC-SVC-07 | H | Admin updates price | PUT `/services/:id` `{ "price": 80 }` | `200`; new price returned |
| TC-SVC-08 | M | Delete unused service | DELETE a service with no bookings | `200` "Service deleted." |
| TC-SVC-09 | H | Delete service with bookings | DELETE a service that has bookings | `409`; message advises disabling it instead |
| TC-SVC-10 | M | Disable service | PUT `/services/:id` `{ "is_available": false }` | `200`; catalog shows it Unavailable; booking it fails |

## 3. Booking & Scheduling

| ID | Pri | Scenario | Steps | Expected result |
|---|---|---|---|---|
| TC-BOOK-01 | H | Slot availability | GET `/bookings/slots?date=<tomorrow>` with token | `200`; 3 slots, each with `booked`, `capacity` (5), `available` |
| TC-BOOK-02 | M | Slots for past date | `date=<yesterday>` | `400` "Date cannot be in the past." |
| TC-BOOK-03 | M | Slots bad date format | `date=12-11-2026` | `400` format message |
| TC-BOOK-04 | H | Create booking | POST `/bookings` `{service_id, quantity:3, delivery_date, time_slot:"13:00-15:00"}` | `201`; status `pending`; `total_amount = price × qty`; linked payment `unpaid` created |
| TC-BOOK-05 | H | Slot capacity limit | Book the same date+slot 5 times, then a 6th | `409` "…slot is full…"; cancelled bookings do not count |
| TC-BOOK-06 | M | Invalid time slot | `time_slot: "12:00-12:30"` | `400` listing allowed slots |
| TC-BOOK-07 | M | Booking past date | `delivery_date=<yesterday>` | `400` "cannot be in the past" |
| TC-BOOK-08 | M | Booking unavailable service | Service with `is_available:false` | `400` "currently unavailable" |
| TC-BOOK-09 | H | My bookings | GET `/bookings` as customer | `200`; only own bookings |
| TC-BOOK-10 | H | View other customer's booking | GET `/bookings/:id` of another user as customer | `403` |
| TC-BOOK-11 | M | Admin views any booking | Same request as admin | `200` |
| TC-BOOK-12 | H | Cancel own pending booking | PATCH `/bookings/:id/cancel` (status pending) | `200`; status `cancelled`; unpaid payment removed |
| TC-BOOK-13 | M | Cancel confirmed booking | Repeat after admin confirms | `409` "Only pending bookings can be cancelled" |
| TC-BOOK-14 | L | Cancel twice | Repeat cancel on cancelled booking | `409` |

## 4. Admin Dashboard & Status Flow

| ID | Pri | Scenario | Steps | Expected result |
|---|---|---|---|---|
| TC-ADM-01 | H | All bookings list | GET `/admin/bookings` (admin) | `200`; every booking with customer/service/payment |
| TC-ADM-02 | M | Filter by status | GET `/admin/bookings?status=pending` | Only pending bookings |
| TC-ADM-03 | M | Filter by date | GET `/admin/bookings?date=<date>` | Only bookings for that drop-off date |
| TC-ADM-04 | H | Dashboard stats | GET `/admin/stats` | `200`; totals (customers, services, bookings, revenue, pendingPayments, todayBookings) + counts per status |
| TC-ADM-05 | M | Customer list | GET `/users` (admin) | `200`; customers with `booking_count` |
| TC-ADM-06 | H | Valid status chain | PATCH `/bookings/:id/status`: pending→confirmed→received→washing→ready→delivered | `200` at every step; status updates |
| TC-ADM-07 | H | Invalid transition | pending → washing directly | `400` naming allowed next statuses |
| TC-ADM-08 | M | Transition from final state | Change a delivered/claimed/cancelled booking | `409` "already in a final state" |
| TC-ADM-09 | M | Customer cannot change status | PATCH `/bookings/:id/status` as customer | `403` |

## 5. Payments (Cash on Claim)

| ID | Pri | Scenario | Steps | Expected result |
|---|---|---|---|---|
| TC-PAY-01 | H | Payments list | GET `/payments` (admin) | `200`; payments with booking, service, customer |
| TC-PAY-02 | M | Payment receipt | GET `/payments/:id` | `200`; receipt data (amount, method, status, booking) |
| TC-PAY-03 | H | Mark paid before ready | Booking still pending/confirmed → PATCH `/payments/:id` | `409`; only ready/delivered/claimed may be paid |
| TC-PAY-04 | H | Mark paid after ready | Advance booking to `ready` → PATCH `/payments/:id` | `200`; status `paid`, `paid_at` timestamped |
| TC-PAY-05 | H | Mark paid twice | Repeat PATCH | `409` "already marked as paid" |
| TC-PAY-06 | H | Customer cannot access payments | GET `/payments` with customer token | `403` |
| TC-PAY-07 | M | Revenue reflects paid payments | GET `/admin/stats` after TC-PAY-04 | `revenue` includes the paid amount; `pendingPayments` excludes it |

## 6. UI / End-to-End (browser)

| ID | Pri | Scenario | Steps | Expected result |
|---|---|---|---|---|
| TC-UI-01 | H | Customer login redirect | Login as Juan | Lands on **My Bookings**; navbar shows name |
| TC-UI-02 | H | Admin login redirect | Login as admin | Lands on **Admin Dashboard** |
| TC-UI-03 | H | Booking flow | Catalog → Book now → qty + date + slot → Place booking | Confirmation screen shows date, slot, total, instructions |
| TC-UI-04 | H | Booking tracking timeline | Open booking → Track | Timeline highlights current status; payment card shows unpaid |
| TC-UI-05 | M | Cancel from My Bookings | Cancel a pending booking | Confirmation prompt; card shows cancelled; cancel button disappears |
| TC-UI-06 | M | Slot availability UI | Change delivery date | Slots refresh; full slots are disabled and labelled "Full" |
| TC-UI-07 | H | Admin advances status | Admin → Bookings → click next status | Toast confirms; badge updates in table |
| TC-UI-08 | H | Admin marks payment paid | Admin → Payments → Mark as paid | Toast confirms; status becomes paid; controls disable |
| TC-UI-09 | M | Admin manages services | Create → edit price → disable → delete | Catalog reflects changes; delete with bookings shows an error toast |
| TC-UI-10 | L | Protected routes | Visit `/admin` as customer / `/my-bookings` logged out | Redirected (to `/` or `/login`) |
| TC-UI-11 | L | Theme/contrast | Browse all pages | Solarized Dark palette (teal bg, off-white headings) with readable contrast |
