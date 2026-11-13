# LaundryHops

**Web-Based Laundry Shop Booking System** — Team Jojo school capstone project.

Customers browse laundry services, book a drop-off date and time slot, then track their order from *pending* to *claimed*. Staff confirm bookings, move orders through the wash flow, and record cash payments on claim.

| | |
|---|---|
| **App name** | LaundryHops |
| **Team** | Team Jojo |
| **Stack** | React 18 + Vite 5 · Node.js + Express · Sequelize · PostgreSQL · JWT |
| **Theme** | Solarized Dark |
| **API testing** | Postman collection + automated smoke suite |

---

## Team & ownership

| Member | Role | Area |
|---|---|---|
| Christian Mark Baje | Back End Developer | `backend/` — API, models, migrations, auth |
| Bon Barry Brioso | Front End Developer | `frontend/` — React UI, booking & admin pages |
| Cipreano Mellomida | QA Tester | `docs/qa/`, `docs/postman/`, `backend/scripts/smoke-test.js` |
| Regie Inding | Project Manager | `Plan.md`, `README.md`, `TEAM_FILES.md`, `docs/database/`, `docs/milestones/`, `docs/demo-walkthrough.md` |

See [`TEAM_FILES.md`](TEAM_FILES.md) for the exact file list each member commits.

---

## Features

**Customer**
- Register / login with JWT authentication
- Browse the service catalog with prices (₱) and units (per kg / per item)
- Book a service: quantity, drop-off date, and one of three time slots
- Slot availability with a server-enforced capacity of 5 per date + slot
- Order tracking timeline; cancel while still `pending`
- Cash-on-claim instructions and payment status

**Admin**
- Dashboard: customers, services, bookings, revenue, pending payments, today's bookings, per-status counts
- Booking queue with status and date filters
- Step-by-step status flow: `pending → confirmed → received → washing → ready → delivered/claimed`
- Service management: create, edit price, disable, delete (blocked when bookings exist)
- Payment recording (cash) once the order is ready/delivered/claimed
- Customer list with booking counts

---

## Project structure

```text
Team Jojo/
├── backend/
│   ├── src/
│   │   ├── config/config.js          # Sequelize connection
│   │   ├── models/                   # User, Service, Booking, Payment
│   │   ├── controllers/              # auth, service, booking, admin, payment
│   │   ├── routes/                   # /api route table
│   │   ├── middleware/               # verifyToken, requireAdmin, errorHandler
│   │   ├── utils/helpers.js          # date/format helpers
│   │   ├── constants.js              # slots, capacity, status machine
│   │   └── server.js                 # Express entrypoint
│   ├── migrations/                   # 4 Sequelize migrations
│   ├── seeders/                      # demo users + 5 services
│   ├── scripts/smoke-test.js         # 30-assertion API suite (QA)
│   └── .env.example
├── frontend/
│   └── src/
│       ├── components/               # Navbar, cards, badges, toast
│       ├── context/AuthContext.jsx
│       ├── pages/                    # customer + admin pages
│       ├── services/api.js           # axios client + endpoints
│       ├── constants.js              # status maps, formatting
│       ├── theme.css                 # Solarized Dark design system
│       └── App.jsx
├── docs/
│   ├── postman/                      # collection + environment (API contract)
│   ├── qa/                           # test cases, bug template, regression
│   ├── database/erd.md               # ERD + data dictionary
│   ├── milestones/                   # phase reports & sign-offs
│   ├── demo-walkthrough.md           # defense script
│   └── README.md                     # documentation index
├── Plan.md                           # approved project plan
├── TEAM_FILES.md                     # per-member file ownership
└── README.md
```

---

## Prerequisites

| Tool | Version used | Notes |
|---|---|---|
| Node.js | v26.x | v18+ works |
| npm | 12.x | ships with Node |
| PostgreSQL | 14+ | local server on `127.0.0.1:5432` |
| Postman | 11.x | optional, for the API collection |
| Git | any | required to clone/push the repo |

---

## Setup

### 1. Database

Create a PostgreSQL database (the scripts can do it for you) and note the `postgres` password.

```sql
CREATE DATABASE laundryhops;
```

### 2. Backend

```bash
cd backend
npm install
copy .env.example .env      # Windows — or: cp .env.example .env
```

Edit `backend/.env`:

```ini
DB_NAME=laundryhops
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=127.0.0.1
DB_PORT=5432

PORT=5000
NODE_ENV=development
JWT_SECRET=change-this-to-a-long-random-string
JWT_EXPIRES_IN=1d
SQL_LOG=false
```

Then create the schema and seed demo data:

```bash
npm run db:create
npm run db:migrate
npm run db:seed
npm run dev            # http://localhost:5000
```

Health check: `GET http://localhost:5000/api/health` → `{ "status": "ok", ... }`

### 3. Frontend

```bash
cd frontend
npm install
copy .env.example .env      # VITE_API_URL=http://localhost:5000
npm run dev                 # http://localhost:5173
```

Open **http://localhost:5173**.

> **npm 12 note:** if the frontend crashes with an `esbuild` binary error, run `node node_modules/esbuild/install.js` and start again. npm 12 blocks dependency install scripts by default.

---

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@laundryhops.com` | `admin123` |
| Customer | `juan@example.com` | `juan123` |

Seeded services: Wash & Fold ₱60/kg · Wash & Iron ₱90/kg · Dry Cleaning ₱120/item · Comforters & Beddings ₱150/item · Express Service ₱100/kg.

---

## Useful scripts

### Backend (`backend/`)

| Command | Purpose |
|---|---|
| `npm run dev` | Start the API with nodemon |
| `npm start` | Start the API without watch mode |
| `npm run db:create` | Create the database |
| `npm run db:migrate` | Run migrations |
| `npm run db:seed` | Insert demo data |
| `npm run db:reset` | Drop, recreate, migrate and seed |
| `npm run smoke-test` | Run the 30-assertion API suite |

### Frontend (`frontend/`)

| Command | Purpose |
|---|---|
| `npm run dev` | Vite dev server (port 5173) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |

---

## API overview

Base URL: `http://localhost:5000/api`
Auth: `Authorization: Bearer <token>` for protected routes. `A` = admin only.

### System
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/health` | public | Health check |

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | public | Create customer account, returns JWT |
| POST | `/auth/login` | public | Authenticate, returns JWT |
| GET | `/auth/me` | user | Current profile |

### Services
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/services` | public | Catalog |
| GET | `/services/:id` | public | Service detail |
| POST | `/services` | A | Create service |
| PUT | `/services/:id` | A | Update service (price, availability, …) |
| DELETE | `/services/:id` | A | Delete (409 if bookings exist) |

### Bookings
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/bookings/slots?date=YYYY-MM-DD` | user | Slot availability for a date |
| POST | `/bookings` | user | Create booking (+ unpaid payment) |
| GET | `/bookings` | user | Own bookings |
| GET | `/bookings/:id` | owner or A | Booking detail |
| PATCH | `/bookings/:id/cancel` | owner | Cancel while `pending` |
| PATCH | `/bookings/:id/status` | A | Advance status (step-by-step) |

### Admin
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/admin/bookings?status=&date=` | A | All bookings with filters |
| GET | `/admin/stats` | A | Dashboard totals + per-status counts |
| GET | `/users` | A | Customers with booking counts |

### Payments
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/payments` | A | Payment list |
| GET | `/payments/:id` | A | Receipt (booking + service + customer) |
| PATCH | `/payments/:id` | A | Mark paid (only when booking is ready/delivered/claimed) |

Full request/response examples and automated tests: [`docs/postman/LaundryHops.postman_collection.json`](docs/postman/LaundryHops.postman_collection.json).

---

## Business rules

- **Slots:** `09:00-11:00`, `13:00-15:00`, `16:00-18:00`; max **5** bookings per date + slot; cancelled bookings free capacity.
- **Dates:** delivery date cannot be in the past.
- **Pricing:** `total_amount = service.price × quantity` (quantity may be fractional, ≥ 0.5).
- **Status flow:** `pending → confirmed → received → washing → ready → delivered | claimed`; `cancelled` allowed only from `pending`/`confirmed`. Skipping a step → `400`; changing a final state → `409`.
- **Payments:** one per booking, method `cash`, created `unpaid`, deleted on cancellation; payable only when the booking is `ready`, `delivered`, or `claimed`; paying twice → `409`.
- **Security:** bcrypt (cost 10) password hashing, JWT expiry `1d`, `verifyToken` + `requireAdmin` guards, ownership checks on bookings, passwords never serialized.

---

## Testing

```bash
# API regression suite (backend must be running and seeded)
cd backend
npm run smoke-test
# → 30 passed, 0 failed
```

Postman: import the collection and environment from `docs/postman/`, select **LaundryHops Local**, then run the collection top-to-bottom.

Manual QA: [`docs/qa/test-cases.md`](docs/qa/test-cases.md) · regression: [`docs/qa/regression-checklist.md`](docs/qa/regression-checklist.md) · bugs: [`docs/qa/bug-report-template.md`](docs/qa/bug-report-template.md).

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `ECONNREFUSED 127.0.0.1:5432` | Start the PostgreSQL service; verify `DB_HOST`/`DB_PORT` |
| `password authentication failed for user "postgres"` | Correct `DB_PASSWORD` in `backend/.env` |
| `database "laundryhops" does not exist` | `npm run db:create && npm run db:migrate && npm run db:seed` |
| `no schema has been selected to create in` | The database has no `public` schema. Connect as `postgres` and run `CREATE SCHEMA public;`, then `npm run db:migrate && npm run db:seed` |
| `relation "users" does not exist` | Migrations not run — `npm run db:migrate` |
| Frontend shows network errors | Check `frontend/.env` → `VITE_API_URL=http://localhost:5000`; restart Vite |
| Vite starts but the page is blank / esbuild error | `node node_modules/esbuild/install.js` then `npm run dev` |
| `EADDRINUSE :5000` | Stop the old process or change `PORT` in `backend/.env` |
| Login fails after reseeding | Use the seeded demo accounts above; old tokens are invalid — log in again |
| `Invalid or expired token` | Token lifetime is 1 day; log in again |

---

## Documentation index

| Document | Owner |
|---|---|
| [`Plan.md`](Plan.md) — scope, schema, API contract, phases, theme | Regie |
| [`TEAM_FILES.md`](TEAM_FILES.md) — per-member file ownership & GitHub workflow | Regie |
| [`docs/README.md`](docs/README.md) — documentation index | Regie |
| [`docs/database/erd.md`](docs/database/erd.md) — ERD + data dictionary | Regie / Christian |
| [`docs/milestones/phase-reports.md`](docs/milestones/phase-reports.md) — milestone sign-offs | Regie |
| [`docs/demo-walkthrough.md`](docs/demo-walkthrough.md) — defense script | Regie |
| [`docs/postman/`](docs/postman/) — API collection + environment | Cipreano |
| [`docs/qa/`](docs/qa/) — test cases, bug template, regression checklist | Cipreano |

---

## Git workflow

```bash
git pull
# edit only the files in your area (see TEAM_FILES.md)
git add <your-area>/ 
git commit -m "<area>: <what changed>"
git push
```

Suggested branches: `backend/christian`, `frontend/bon`, `qa/cipreano`, `docs/regie`.

> `.env` files and `node_modules/` are git-ignored. Commit `.env.example` only.
