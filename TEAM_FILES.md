# Team Jojo — File Ownership & Submission Map

**LaundryHops** · School Capstone Project

This repository is the **single source of truth** — member work is separated by **area**, not duplicated in copies, so there is nothing to re-merge and no version drift. Each member commits only the files listed under their name.

---

## 1. Christian Mark Baje — Back End Developer

**Owns:** `backend/` (everything except `backend/scripts/smoke-test.js`, which is QA-owned)

| Area | Files |
|---|---|
| API entrypoint | `backend/src/server.js` |
| Config | `backend/src/config/config.js`, `backend/.sequelizerc`, `backend/.env.example` |
| Business rules | `backend/src/constants.js` |
| Models | `backend/src/models/index.js`, `user.js`, `service.js`, `booking.js`, `payment.js` |
| Controllers | `backend/src/controllers/authController.js`, `serviceController.js`, `bookingController.js`, `adminController.js`, `paymentController.js` |
| Routes | `backend/src/routes/index.js`, `authRoutes.js`, `serviceRoutes.js`, `bookingRoutes.js`, `adminRoutes.js`, `paymentRoutes.js`, `userRoutes.js` |
| Middleware | `backend/src/middleware/verifyToken.js`, `requireAdmin.js`, `errorHandler.js` |
| Utilities | `backend/src/utils/helpers.js` |
| Database | `backend/migrations/*.js`, `backend/seeders/*.js` |
| Package | `backend/package.json` |

**Commit:** `git add backend/src backend/migrations backend/seeders backend/package.json backend/package-lock.json backend/.env.example backend/.sequelizerc && git commit -m "backend: Express API, Sequelize models, JWT auth, bookings, payments"`

---

## 2. Bon Barry Brioso — Front End Developer

**Owns:** `frontend/` (everything)

| Area | Files |
|---|---|
| Entry / shell | `frontend/index.html`, `src/main.jsx`, `src/App.jsx` |
| Theme (Solarized Dark) | `src/theme.css` |
| Constants / helpers | `src/constants.js` |
| API layer | `src/services/api.js` |
| Auth context | `src/context/AuthContext.jsx` |
| Components | `src/components/Navbar.jsx`, `ServiceCard.jsx`, `BookingCard.jsx`, `StatusBadge.jsx`, `Toast.jsx` |
| Customer pages | `src/pages/Login.jsx`, `Register.jsx`, `Catalog.jsx`, `Booking.jsx`, `MyBookings.jsx`, `Tracking.jsx` |
| Admin pages | `src/pages/admin/AdminDashboard.jsx`, `AdminBookings.jsx`, `AdminServices.jsx`, `AdminPayments.jsx` |
| Config | `frontend/package.json`, `vite.config.js`, `.env.example` |

**Commit:** `git add frontend/ && git commit -m "frontend: React booking flow, tracking, admin dashboard, Solarized Dark theme"`

---

## 3. Cipreano Mellomida — QA Tester

**Owns:** test suites, test cases and bug reports

| Area | Files |
|---|---|
| Postman collection (API contract) | `docs/postman/LaundryHops.postman_collection.json` |
| Postman environment | `docs/postman/LaundryHops.postman_environment.json` |
| Manual test cases | `docs/qa/test-cases.md` |
| Bug report template | `docs/qa/bug-report-template.md` |
| Regression checklist | `docs/qa/regression-checklist.md` |
| QA overview | `docs/qa/README.md` |
| Automated API smoke suite | `backend/scripts/smoke-test.js` (runs with `npm run smoke-test`) |

**Commit:** `git add docs/qa/ docs/postman/ backend/scripts/ && git commit -m "qa: Postman collection, manual test cases, bug reports, regression checklist"`

> Coordinate with Christian: `backend/scripts/smoke-test.js` lives inside his folder but belongs to QA. If he commits `backend/` first, ask him to skip that file, or land this commit before his.

---

## 4. Regie Inding — Project Manager

**Owns:** project documentation and milestone reporting

| Area | Files |
|---|---|
| Project plan | `Plan.md` |
| Root README | `README.md` |
| File ownership map | `TEAM_FILES.md` |
| Docs index | `docs/README.md` |
| ERD + data dictionary | `docs/database/erd.md` |
| Demo walkthrough (defense script) | `docs/demo-walkthrough.md` |
| Milestone reports | `docs/milestones/phase-reports.md` |

**Commit:** `git add Plan.md README.md TEAM_FILES.md docs/README.md docs/database/ docs/milestones/ docs/demo-walkthrough.md && git commit -m "docs: project plan, README, ERD, milestone reports, demo walkthrough"`

---

## Recommended GitHub Workflow

**Option A — shared repo (recommended for capstone submission)**

Everyone commits only to their own area on `main` (or via short-lived branches):

```bash
git pull                        # always pull first
# ... edit files in your area ...
git add <your-area>/            # only your files (see commands above)
git commit -m "<area>: <what you did>"
git push
```

Suggested branches (optional, then open a PR):

| Member | Branch |
|---|---|
| Christian | `backend/christian` |
| Bon | `frontend/bon` |
| Cipreano | `qa/cipreano` |
| Regie | `docs/regie` |

**Option B — separate member repos (if required by the school)**

Because the areas are self-contained, each member can copy their folder into their own repo:

- Christian → copy `backend/`
- Bon → copy `frontend/`
- Cipreano → copy `docs/qa/`, `docs/postman/`, `backend/scripts/smoke-test.js`
- Regie → copy `Plan.md`, `README.md`, `TEAM_FILES.md`, `docs/README.md`, `docs/database/`, `docs/milestones/`, `docs/demo-walkthrough.md`

> Note: in Option B, Cipreano's smoke test needs `backend/` to run — copy just the `scripts/smoke-test.js` file for submission, or link to Christian's repo in the README.

---

## Shared Setup (all members)

```bash
# Backend
cd backend && npm install
npm run db:create && npm run db:migrate && npm run db:seed
npm run dev            # http://localhost:5000

# Frontend (separate terminal)
cd frontend && npm install
npm run dev            # http://localhost:5173
```

Demo accounts: `admin@laundryhops.com / admin123` · `juan@example.com / juan123`
