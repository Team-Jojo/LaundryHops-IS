# LaundryHops — Milestone Reports

**Owner:** Regie Inding (Project Manager) · **Team:** Team Jojo

Status legend: ✅ complete · 🟡 in progress · ⬜ not started

## Summary

| # | Phase | Owner(s) | Deliverable | Status | Date |
|---|---|---|---|---|---|
| 0 | Setup & planning | All | Repo, stack decision, plan, theme | ✅ | 2026-11-11 |
| 1 | Database & auth | Christian | Schema, migrations, seeders, JWT auth | ✅ | 2026-11-11 |
| 2 | Service catalog | Christian · Bon | Services API + catalog UI | ✅ | 2026-11-11 |
| 3 | Booking & scheduling | Christian · Bon | Slots, capacity, booking flow | ✅ | 2026-11-11 |
| 4 | Admin dashboard & tracking | Christian · Bon | Status flow, filters, dashboard | ✅ | 2026-11-11 |
| 5 | Payments | Christian · Bon | Cash-on-claim recording | ✅ | 2026-11-12 |
| 6 | QA & documentation | Cipreano · Regie | Postman, test cases, ERD, README, demo | ✅ | 2026-11-12 |

---

## Phase 0 — Setup & Planning ✅

**Owner:** Regie (planning) · All (stack)

- [x] Scope agreed: registration/login, catalog, booking with date + slot, tracking, cash-on-claim payments
- [x] Stack agreed: Node/Express + Sequelize + PostgreSQL, React/Vite, JWT, Postman
- [x] MVC single-repository structure defined
- [x] UI theme selected: **Solarized Dark** (documented in `Plan.md` §14)
- [x] Roles assigned (`Plan.md` §2)

**Output:** `Plan.md`, `TEAM_FILES.md`, `.gitignore`
**Sign-off:** Regie Inding — 2026-11-11

---

## Phase 1 — Database & Authentication ✅

**Owner:** Christian Mark Baje

- [x] `users`, `services`, `bookings`, `payments` migrations with FKs, enums and indexes
- [x] Sequelize models with associations and business validation
- [x] bcrypt password hashing (cost 10), JWT issuance and `verifyToken` middleware
- [x] Register / login / `me` endpoints; duplicate email and short password rejected
- [x] Seeder for demo admin, customer and five services
- [x] `db:create`, `db:migrate`, `db:seed`, `db:reset` scripts

**Verification:** `POST /auth/register` → 201; duplicate → 409; wrong password → 401; admin route as customer → 403.
**Sign-off:** Christian M. Baje — 2026-11-11

---

## Phase 2 — Service Catalog ✅

**Owner:** Christian (API) · Bon (UI)

- [x] Public `GET /services`, `GET /services/:id`
- [x] Admin create / update / delete with unique-name and price validation
- [x] Delete blocked with `409` when the service has bookings; disable via `is_available`
- [x] Catalog page with price, unit and availability; admin services page with inline forms

**Verification:** duplicate name → 400; delete with bookings → 409; disabled service cannot be booked.
**Sign-off:** Bon B. Brioso — 2026-11-11

---

## Phase 3 — Booking & Scheduling ✅

**Owner:** Christian (API) · Bon (UI)

- [x] Three time slots; `SLOT_CAPACITY = 5` enforced server-side
- [x] `GET /bookings/slots?date=` returns booked / capacity / available per slot
- [x] Past dates and invalid formats rejected; unavailable services rejected
- [x] `total_amount = price × quantity`; unpaid payment row created atomically
- [x] Customer list/detail with ownership checks; cancel allowed only while `pending`
- [x] Booking page with quantity, date picker, slot availability, confirmation screen

**Verification:** 6th booking in a slot → 409; cancelled booking frees capacity; other customer's booking → 403.
**Sign-off:** Christian M. Baje — 2026-11-11

---

## Phase 4 — Admin Dashboard & Status Tracking ✅

**Owner:** Christian (API) · Bon (UI)

- [x] Step-by-step status machine (`pending → confirmed → received → washing → ready → delivered/claimed`); cancel from pending/confirmed
- [x] Invalid transitions → 400 with allowed next statuses; changes from final states → 409
- [x] Admin bookings list with status/date filters, joined customer/service/payment
- [x] Dashboard stats: totals, revenue, pending payments, today's bookings, per-status counts
- [x] Customer list with booking counts
- [x] Tracking timeline page for customers; admin one-click status advance with toast

**Verification:** skipping a step rejected; status badges and dashboard numbers match the DB.
**Sign-off:** Bon B. Brioso — 2026-11-12

---

## Phase 5 — Payments (Cash on Claim) ✅

**Owner:** Christian (API) · Bon (UI)

- [x] One payment per booking (`UNIQUE booking_id`), method fixed to `cash`
- [x] Payment created `unpaid` with the booking, removed on cancellation
- [x] Mark-paid only when booking is `ready`, `delivered` or `claimed`; otherwise 409
- [x] Double payment rejected; `paid_at` timestamp set on success
- [x] Admin payments list + receipt view; revenue and pending payments in dashboard stats

**Verification:** mark paid before ready → 409; after ready → 200; twice → 409; customer → 403.
**Sign-off:** Christian M. Baje — 2026-11-12

---

## Phase 6 — QA, Documentation & Demo Readiness ✅

**Owner:** Cipreano Mellomida (QA) · Regie Inding (docs)

- [x] Automated API smoke suite — **30/30 passing** (`backend/scripts/smoke-test.js`)
- [x] Postman collection + environment with automatic token/ID capture (run order documented)
- [x] Manual test cases covering auth, catalog, bookings, admin, payments, UI
- [x] Bug report template and regression checklist
- [x] ERD + data dictionary (`docs/database/erd.md`)
- [x] Root README, docs index, per-member file ownership map
- [x] Demo walkthrough script with fallback plan
- [x] Production build verified: `npm run build` (110 modules)

**Verification:** Postman collection green top-to-bottom; smoke suite 30/30; `npm run build` succeeds.
**Sign-off:** Cipreano Mellomida (QA) · Regie Inding (PM) — 2026-11-12

---

## Open items / risks

| Item | Impact | Owner | Notes |
|---|---|---|---|
| Git is not installed on the build machine | Cannot initialize the repository or push from this workstation | Regie | Install Git, then follow `TEAM_FILES.md` |
| No online payment gateway | Payments are recorded manually | Regie | Explicit scope decision; documented in `Plan.md` |
| No automated UI (E2E) suite | UI regressions rely on manual checks | Cipreano | Covered by `docs/qa/regression-checklist.md`; Playwright is a future enhancement |
| Slot timezone handling | Server uses local dates | Christian | Acceptable for a single-shop local deployment |

## Next milestone (post-capstone backlog)

1. Online payment (GCash / card) with webhook reconciliation
2. SMS/email notifications on status changes
3. Pickup courier assignment and route scheduling
4. Sales report export (CSV/PDF)
5. Automated E2E tests with Playwright
