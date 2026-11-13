# Regression Checklist — LaundryHops

**Owner:** Cipreano Mellomida (QA) · Run before **every** phase sign-off / demo.

## Setup

- [ ] Backend running (`npm run dev` in `backend/`) — console shows `PostgreSQL connected`
- [ ] Frontend running (`npm run dev` in `frontend/`)
- [ ] DB migrated + seeded (`npm run db:reset` for a clean slate)
- [ ] Automated smoke suite passes: `npm run smoke-test` → **30 passed, 0 failed**
- [ ] Postman collection passes top-to-bottom with the **LaundryHops Local** environment

## 1. Authentication

- [ ] Register new account → 201, auto-login works
- [ ] Duplicate email → 409
- [ ] Login wrong password → 401
- [ ] `/auth/me` without token → 401
- [ ] Customer hitting admin endpoints → 403
- [ ] Logout clears session; protected pages redirect to `/login`

## 2. Catalog

- [ ] Public services list loads without token
- [ ] Service detail returns one service; unknown id → 404
- [ ] Admin can create / edit / disable / delete services
- [ ] Duplicate name rejected
- [ ] Delete with existing bookings → 409 (not a crash)
- [ ] Disabled service cannot be booked

## 3. Booking & Scheduling

- [ ] Slots endpoint returns 3 slots with capacity/availability
- [ ] Past date rejected on slots and on booking create
- [ ] Booking create computes `total_amount = price × quantity` correctly
- [ ] Payment row (`unpaid`) is created with the booking
- [ ] 6th booking in the same date+slot → 409
- [ ] Cancelled bookings free up slot capacity
- [ ] Only own bookings appear in "My Bookings"
- [ ] Other customer's booking → 403; admin → 200
- [ ] Cancel pending works; cancel confirmed → 409; cancel twice → 409

## 4. Admin & Status Flow

- [ ] Admin bookings list loads with customer/service/payment
- [ ] Status and date filters work
- [ ] Full chain works: pending → confirmed → received → washing → ready → delivered/claimed
- [ ] Skipping a step → 400 with allowed list
- [ ] Any change from a final state → 409
- [ ] Dashboard stats and per-status counts match the DB
- [ ] Customer list shows booking counts

## 5. Payments

- [ ] Payment list and receipt data correct (booking + service + customer)
- [ ] Mark paid before `ready` → 409
- [ ] Mark paid when `ready` / `delivered` / `claimed` → 200 with `paid_at`
- [ ] Mark paid twice → 409
- [ ] Customer blocked from payment endpoints → 403
- [ ] Dashboard revenue includes paid, excludes unpaid

## 6. UI / Demo Readiness

- [ ] Solarized Dark theme consistent on all pages
- [ ] No console errors in the browser dev tools
- [ ] Mobile width (≤640px) still readable
- [ ] Toasts appear for success/error actions
- [ ] Demo accounts work: `admin@laundryhops.com / admin123`, `juan@example.com / juan123`

## Sign-off

| Phase | Date | Checked by | Result |
|---|---|---|---|
| 0 — Setup | | | ☐ Pass ☐ Fail |
| 1 — Auth | | | ☐ Pass ☐ Fail |
| 2 — Catalog | | | ☐ Pass ☐ Fail |
| 3 — Booking & Scheduling | | | ☐ Pass ☐ Fail |
| 4 — Admin Dashboard | | | ☐ Pass ☐ Fail |
| 5 — Payments | | | ☐ Pass ☐ Fail |
| 6 — QA & Polish | | | ☐ Pass ☐ Fail |
