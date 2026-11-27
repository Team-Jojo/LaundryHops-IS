# Initial Build — Release & PR Notes

**Project:** LaundryHops — Web-Based Laundry Shop Booking System
**Team:** Team Jojo capstone (2026)
**PR owner:** Christian Mark Baje
**Source branch:** `feature/initial-build` (based on the existing `feature/backend` initial upload)
**Target branch:** `main`

This document is the release note for the first complete, reviewable build of LaundryHops and is also the content used for the pull request into `main`.

---

## 1. What is included

| Area | Location | Highlights |
|---|---|---|
| REST API | `backend/src/` | Express 4 + Sequelize 6, JWT auth, bcryptjs hashing, role and ownership guards, central JSON error handling |
| Database | `backend/migrations/`, `backend/seeders/` | PostgreSQL schema for `users`, `services`, `bookings`, `payments`; 4 migrations, 2 seeders, demo accounts and 5 services |
| Business rules | `backend/src/constants.js` | 3 drop-off slots, capacity 5 per date/slot, stepwise status machine, payable statuses |
| Web UI | `frontend/src/` | React 18 + Vite 5 + React Router; customer catalog, booking, tracking, admin dashboard/bookings/services/payments |
| Testing assets | `backend/scripts/smoke-test.js`, `docs/postman/`, `docs/qa/` | 30-assertion API smoke suite, 30-request Postman collection, 61 manual test cases, bug template, regression checklist |
| Documentation | root `README.md`, `Plan.md`, `TEAM_FILES.md`, `docs/` | Setup, ERD, milestone reports, demo walkthrough, API reference, and these release notes |

The customer journey is: browse services → register/login → choose a date and slot → booking is created with an unpaid cash payment → track the status → pay when `ready`, `delivered`, or `claimed`. Admins confirm bookings, advance status one step at a time, manage services, and record payments.

---

## 2. Quick start

Prerequisites: Node.js 18+ (tested on v26.x with npm 12), PostgreSQL 14+ on `127.0.0.1:5432`, and Git.

```bash
# 1. Backend
cd backend
npm install
copy .env.example .env          # or: cp .env.example .env
# Edit .env: set DB_PASSWORD and a long random JWT_SECRET
npm run db:create && npm run db:migrate && npm run db:seed
npm run dev                     # http://localhost:5000

# 2. Frontend (second terminal)
cd frontend
npm install
copy .env.example .env          # VITE_API_URL=http://localhost:5000 (no /api suffix)
npm run dev                     # http://localhost:5173
```

Verify with `GET http://localhost:5000/api/health`. Full details are in [`../README.md`](../README.md).

**Demo accounts**

| Role | Email | Password |
|---|---|---|
| Admin | `admin@laundryhops.com` | `admin123` |
| Customer | `juan@example.com` | `juan123` |

**Seeded services:** Wash & Fold ₱60/kg, Wash & Iron ₱90/kg, Dry Cleaning ₱120/item, Comforters & Beddings ₱150/item, Express Service ₱100/kg.

---

## 3. Verification evidence

Checks performed while preparing this initial-build PR:

| Check | Command | Result |
|---|---|---|
| Frontend production build | `npm run build` (in `frontend/`) | ✅ 110 modules transformed; `dist/index.html`, `index-C6WlxSL2.css` (12.07 kB), `index-H2zpnx7Z.js` (259.11 kB); built in 4.31 s |
| Backend syntax | `node --check` on every `.js` file in `backend/src`, `migrations`, `seeders`, `scripts` | ✅ all files parsed successfully |
| Documentation review | Compared root docs, ERD, QA docs, Postman assets, and this API reference against routes/controllers/constants | ✅ contracts aligned; cancellation semantics clarified |

Included but **not executed in this session** because they require a running, seeded PostgreSQL/API stack:

- `cd backend && npm run smoke-test` — 30 runtime assertions.
- Postman collection runner using `docs/postman/LaundryHops.postman_collection.json` and the `LaundryHops Local` environment — 30 requests with token/ID capture.

Run `npm run db:reset` before repeated smoke/Postman runs: both suites create bookings for the next day and slot capacity is 5.

---

## 4. Documentation added or clarified

- [`api-reference.md`](api-reference.md) — endpoint table, request/response envelopes, error catalog, status transitions, and curl examples. Documents the `user_id` and `payments?status=` filters that were implemented but previously undocumented.
- [`initial-build.md`](initial-build.md) — this release/PR note.
- [`README.md`](../README.md) — links the new documents and clarifies that customer cancellation is `pending`-only while admins may cancel via the status endpoint.
- [`database/erd.md`](database/erd.md) — status-flow text distinguishes the customer cancel endpoint from the admin status transition.
- [`README.md` docs index](../docs/README.md) — links the new docs and the QA index, and removes a duplicate entry.

---

## 5. Known limitations (initial build)

These are intentional scope boundaries or follow-up items, not blockers for the initial build:

1. **Cash-only payments.** No online gateway; an admin records payment with `PATCH /payments/:id`.
2. **Local dates.** Delivery-date validation and dashboard "today" use the server's local date; the smoke test/Postman "tomorrow" uses UTC, so runs started near midnight may disagree.
3. **Slot capacity check is not transactional.** The count happens before the booking/payment transaction, so simultaneous requests can race. Capacity is enforced on the normal single-request path.
4. **JWT fallback secret.** `JWT_SECRET` must be set in every deployed environment; the code falls back to `dev-secret` for local convenience.
5. **Admin UI exposes one next step from `ready` (`delivered`).** `claimed` is available through the API and is shown in tracking, but the one-click UI does not offer it yet.
6. **No frontend E2E suite or lint script.** UI is covered by manual test cases; API has the smoke suite and Postman collection.
7. **External font CDN.** Inter, Poppins, and Material Symbols load from Google Fonts; offline demos use fallback fonts and icon names may appear as text.
8. **Repeated automated runs need a DB reset** because of slot capacity (see §3).

---

## 6. Pull request description (ready to paste)

```markdown
## Summary

Initial, reviewable build of LaundryHops: a React customer/admin SPA backed by an
Express + Sequelize REST API with PostgreSQL. Includes JWT auth with role checks,
service catalog management, slot-based booking, status tracking, cash payment
recording, seeded demo data, and QA/documentation assets.

## Changes

- API: 20 routes across auth, services, bookings, admin, users, payments, and health.
- Database: 4 migrations + 2 seeders; relationships and business constraints.
- UI: 10 routes/pages (customer + admin), shared auth context, toast notifications,
  slot picker, tracking timeline, and Solarized Dark theme.
- QA: 30-assertion smoke suite, 30-request Postman collection, 61 manual test cases.
- Docs: setup README, ERD, phase reports, demo walkthrough, new API reference,
  and these initial-build/release notes.

## Test plan

- [x] `npm run build` in `frontend/` — 110 modules, successful output.
- [x] `node --check` across all backend JS files — passed.
- [ ] `npm run smoke-test` against a running seeded API (30 assertions).
- [ ] Postman collection runner with `LaundryHops Local` environment.
- [ ] Manual customer + admin walkthrough from `docs/demo-walkthrough.md`.

## Notes for reviewers

- Customer cancellation is pending-only; admins can cancel pending/confirmed
  bookings via the status endpoint. This is now explicit in the docs.
- Demo accounts and seeded services are listed in the README.
- Known limitations and follow-ups are listed in `docs/initial-build.md`.
- Base for this PR is `main`; source is `feature/initial-build`.
```
