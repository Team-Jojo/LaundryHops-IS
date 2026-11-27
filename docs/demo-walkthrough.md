# LaundryHops — Demo Walkthrough

**Owner:** Regie Inding (Project Manager) · **Duration:** ~10 minutes · **Audience:** panel / instructor

Use this script for the capstone defense. It follows the customer journey first, then the admin side, and ends with the Postman/QA evidence.

## 0. Before the demo (5 minutes before)

```bash
# Terminal 1 — API
cd backend
npm run dev            # waits for "PostgreSQL connected" then "listening on :5000"

# Terminal 2 — UI
cd frontend
npm run dev            # http://localhost:5173
```

- [ ] `http://localhost:5000/api/health` returns `{ "status": "ok" }`
- [ ] `http://localhost:5173` loads the Solarized Dark catalog
- [ ] Browser zoom 100 %, one tab per role (use a private window for admin)
- [ ] Database freshly seeded: `npm run db:reset` if the data looks messy

Demo accounts:

| Role | Email | Password |
|---|---|---|
| Customer | `juan@example.com` | `juan123` |
| Admin | `admin@laundryhops.com` | `admin123` |

---

## 1. Introduction (30 s)

> "LaundryHops is a web-based laundry shop booking system. Customers book a laundry service, choose a drop-off date and time slot, then track their order until it is ready. Staff manage the queue and record cash payments on claim. React front end, Express/Sequelize back end, PostgreSQL, JWT auth — tested with Postman."

Show the stack slide / repository structure briefly.

## 2. Customer journey (4 min)

1. **Register** — `Register` page, fill name/email/password/phone/address → submit.
   Point out: JWT issued, password bcrypt-hashed, role forced to `customer`.
2. **Browse the catalog** — five seeded services with prices in ₱ and units (per kg / per item).
3. **Book a service** — click **Book now** on *Wash & Fold*:
   - quantity `3`
   - delivery date = tomorrow
   - slot `13:00–15:00` (show that full slots are disabled)
   - notes: "Separate whites"
   - **Place booking** → confirmation screen with date, slot, total (₱180), and the cash-on-claim reminder.
4. **Track the order** — **My Bookings → Track**. Show the timeline (current step highlighted) and the payment card marked **Unpaid**.
5. **Cancel a pending booking** — create a second booking and cancel it. Show the confirmation prompt and that the payment record disappears.

> Talking point: slot capacity is validated server-side (max 5 bookings per date + slot), not just in the UI.

## 3. Admin journey (3 min)

Log in as `admin@laundryhops.com / admin123` in a private window.

1. **Dashboard** — totals (customers, services, bookings, revenue, pending payments, today's bookings) and per-status counts.
2. **Bookings** — filter by status/date; locate Juan's new booking.
3. **Advance status step by step** — pending → confirmed → received → washing → ready. Point out the toast and the badge update.
   Try to skip a step (e.g. pending → washing) to show the `400` guard.
4. **Payments** — open **Payments**, find the unpaid row for the now-*ready* booking, click **Mark as paid**.
   Point out the `paid_at` timestamp and that the dashboard revenue increases.
   Try marking it paid twice → blocked (`409`).
5. **Services** — create a service, edit its price, disable it, then delete it. Show that a service with bookings cannot be deleted (use *Wash & Fold* to demonstrate the error toast).

## 4. API / QA evidence (2 min)

1. Open Postman → **LaundryHops API** collection with the **LaundryHops Local** environment.
2. Run the collection top-to-bottom (Collection Runner). Tokens and IDs are captured automatically; all requests green.
3. Show the automated smoke suite:

```bash
cd backend
npm run smoke-test     # 30 passed, 0 failed
```

4. Mention QA assets: `docs/qa/test-cases.md` (≈50 manual cases), `docs/qa/regression-checklist.md`, `docs/qa/bug-report-template.md`.

## 5. Architecture & documentation wrap-up (1 min)

- **MVC:** Sequelize models → Express controllers → React views; REST/JSON boundary tested by Postman.
- **Security:** bcrypt password hashing, JWT bearer auth, role guard middleware, no password in responses.
- **Data integrity:** FK constraints, unique email/service name/one-payment-per-booking, step-by-step status machine.
- **Docs:** `Plan.md`, `README.md`, `docs/database/erd.md` (ERD + data dictionary), `TEAM_FILES.md` (per-member ownership).

## 6. Likely panel questions

| Question | Answer |
|---|---|
| Why cash on claim only? | Scope decision: the shop collects payment at hand-over; no online payment gateway is integrated. Payment state is recorded by staff. |
| How is double-booking prevented? | Server checks `COUNT(bookings)` for the date+slot excluding cancelled ones against `SLOT_CAPACITY = 5`. |
| Where is authorization enforced? | `verifyToken` validates the JWT; `requireAdmin` gates admin routes; ownership checks in the booking controller. |
| What happens if two slots are full? | The UI disables the slot and labels it *Full*; the API still rejects with `409` as the source of truth. |
| What would you add next? | Online payment, SMS/email notifications, pickup courier assignment, sales reports export. |

## 7. Fallback plan

| Problem | Fix |
|---|---|
| API not running | `cd backend && npm run dev`; check `.env` DB password |
| DB connection error | Confirm PostgreSQL service is running; `npm run db:reset` |
| Frontend can't reach API | Check `frontend/.env` → `VITE_API_URL=http://localhost:5000` |
| Port 5173/5000 busy | Vite picks the next port; restart the API after stopping the old process |
| Bad demo data | `npm run db:reset` then log in again |
| Live demo fails | Show the Postman collection run and the smoke-test output as evidence |
