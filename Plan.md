# LaundryHops — Project Plan

**Team Jojo** · Web-Based Laundry Shop Booking System · School Capstone Project

---

## 1. Project Overview

**LaundryHops** is a web-based laundry shop system. Customers browse laundry services, book a service, and receive a scheduled **date and time slot** for delivering their laundry to the shop's physical site. They can then track their order status until it is ready, and payment is recorded upon claim/delivery.

- **Application name:** LaundryHops
- **Type:** Web-based system (SPA frontend + REST API backend)
- **Environment:** Fully local development; PostgreSQL database; Postman for API testing

## 2. Team & Roles

| Member | Role | Responsibilities |
|---|---|---|
| Christian Mark Baje | Back End Developer | Express API, Sequelize models, PostgreSQL schema, JWT auth, API contract |
| Bon Barry Brioso | Front End Developer | React UI, API integration, booking flow, customer & admin pages |
| Cipreano Mellomida | QA Tester | Postman test suites, UI test cases, bug reports, regression checks |
| Regie Inding | Project Manager | Milestone tracking, documentation, API contract sign-off, demo prep |

## 3. Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express (MVC structure) |
| ORM | Sequelize |
| Database | PostgreSQL (local) |
| Auth | JWT tokens (`jsonwebtoken` + `bcrypt` password hashing) |
| Frontend | React (Vite) + React Router + Axios |
| API Testing | Postman (collections, environments, test scripts) |

## 4. Architecture — MVC Mapping

```
React Frontend (Bon)          Express Backend (Christian)         PostgreSQL
[ Views / "V" of MVC ]  ───►  [ Controllers + Models ]    ───►    [ Database ]
       REST API (JSON) — tested via Postman by Cipreano
```

- **Model** — Sequelize models: `User`, `Service`, `Booking`, `Payment`
- **View** — React pages/components rendering JSON responses
- **Controller** — Express handlers processing requests, returning JSON

## 5. Project Structure (single repository)

```
Team Jojo/
├── backend/
│   ├── src/                        # or use sequelize-cli default structure
│   │   ├── config/                 # DB connection, environment
│   │   ├── models/                 # User, Service, Booking, Payment
│   │   ├── controllers/            # auth, service, booking, payment, admin controllers
│   │   ├── routes/                 # endpoint → controller mapping
│   │   ├── middleware/             # verifyToken, requireAdmin, validation, errors
│   │   └── server.js               # app entrypoint
│   ├── migrations/                 # Sequelize migrations
│   ├── seeders/                    # demo services + admin account
│   ├── .env                        # DB creds, JWT secret, port
│   └── package.json
├── frontend/
│   └── src/
│       ├── components/             # Navbar, ServiceCard, BookingCard, StatusBadge...
│       ├── pages/                   # Login, Register, Catalog, Booking, MyBookings,
│       │                            # Tracking, AdminDashboard, AdminBookings,
│       │                            # AdminServices, Payments
│       ├── services/               # api.js (axios instance + endpoint functions)
│       └── App.jsx                  # routes + auth context
├── docs/
│   ├── postman/                    # LaundryHops.postman_collection.json + environment
│   ├── qa/                         # test cases, bug report template
│   └── ERD + data dictionary
└── README.md                       # setup instructions
```

## 6. Database Schema (PostgreSQL)

### `users`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| full_name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | bcrypt |
| phone | VARCHAR(20) | |
| address | TEXT | |
| role | ENUM('customer','admin') | default `customer` |
| created_at / updated_at | TIMESTAMP | |

### `services`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| name | VARCHAR(100) | UNIQUE, e.g. "Wash & Fold", "Dry Clean" |
| description | TEXT | |
| price | DECIMAL(10,2) | |
| unit | ENUM('per_kg','per_item','fixed') | |
| is_available | BOOLEAN | default true |
| created_at / updated_at | TIMESTAMP | |

### `bookings`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| user_id | FK → users | customer |
| service_id | FK → services | |
| quantity | DECIMAL(10,2) | kg count or item count |
| delivery_date | DATE | when customer brings laundry to site |
| time_slot | ENUM('09:00-11:00','13:00-15:00','16:00-18:00') | adjustable |
| status | ENUM('pending','confirmed','received','washing','ready','delivered','claimed','cancelled') | default `pending` |
| total_amount | DECIMAL(10,2) | computed: price × quantity |
| notes | TEXT | customer remarks |
| created_at / updated_at | TIMESTAMP | |

### `payments`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| booking_id | FK → bookings, UNIQUE | one payment per booking |
| amount | DECIMAL(10,2) | |
| method | ENUM('cash') | extensible (GCash etc.) |
| status | ENUM('unpaid','paid') | default `unpaid` |
| paid_at | TIMESTAMP | nullable, set when marked paid |

**Status flow:** `pending → confirmed → received → washing → ready → delivered/claimed` (+ `cancelled`)

**Optional stretch:** slot capacity limit (max N bookings per date + slot, validated server-side).

## 7. API Endpoints (Postman Contract)

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/auth/register | Public | Create customer account |
| POST | /api/auth/login | Public | Return JWT |
| GET | /api/auth/me | Protected | Current user profile |

### Services
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/services | Public | List services |
| GET | /api/services/:id | Public | Service detail |
| POST | /api/services | Admin | Create service |
| PUT | /api/services/:id | Admin | Update service/price |
| DELETE | /api/services/:id | Admin | Remove service |

### Bookings
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/bookings/slots?date= | Protected | Available slots for a date |
| POST | /api/bookings | Customer | Create booking (service, qty, date, slot) |
| GET | /api/bookings | Customer | Own bookings |
| GET | /api/bookings/:id | Owner/Admin | Booking detail |
| PATCH | /api/bookings/:id/cancel | Customer | Cancel own pending booking |
| PATCH | /api/bookings/:id/status | Admin | Advance status |

### Admin
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/admin/bookings | Admin | All bookings (filter by status/date) |
| GET | /api/admin/stats | Admin | Dashboard counts + revenue |
| GET | /api/users | Admin | Customer list |

### Payments
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/payments | Admin | Payment records |
| GET | /api/payments/:id | Admin | Receipt data |
| PATCH | /api/payments/:id | Admin | Mark as paid (sets paid_at) |

## 8. Core User Flows

**Customer:** Register → Login → Browse catalog → Book service (pick date + available time slot) → Confirmation shows when to deliver laundry to the site → Track status → Claim & pay (recorded).

**Admin:** Login → Manage services/pricing → Confirm incoming bookings → Update status as laundry progresses → Mark payments paid → View dashboard stats.

## 9. Milestones (phase-based)

| Phase | Scope | Owner(s) |
|---|---|---|
| 0 — Setup | Repo init, local Postgres, Sequelize config + migrations, React scaffold, Postman workspace, README | All |
| 1 — Auth | Users model, register/login JWT, role middleware; FE login/register | Christian + Bon |
| 2 — Catalog | Services CRUD; admin manage page + public catalog page | Christian + Bon |
| 3 — Booking & Scheduling | Slot availability, create booking, my bookings + tracking; FE booking flow | Christian + Bon |
| 4 — Admin Dashboard | Status transitions, all-bookings view, stats | Christian + Bon |
| 5 — Payments | Payments model, mark-paid, receipt; FE records | Christian + Bon |
| 6 — QA & Polish | Postman test suites, UI test cases, bug fixes, seed demo data, docs, demo | Cipreano + All |

Each phase ends with: working code merged, Postman tests passing, QA regression check, PM sign-off.

## 10. QA Strategy (Cipreano)

- **Postman collection** per module with automated tests: status codes, JSON schema assertions, auth-flow chains (register → login → token reuse)
- **Environment variables** for `base_url` and `jwt_token`
- **Manual test cases** per user story with expected results (docs/qa/)
- **Bug report template**: severity, steps to reproduce, expected vs actual
- **Regression checklist** before each phase sign-off

## 11. Local Setup

**Prerequisites:** Node.js LTS, PostgreSQL, Postman, Git.

```
# Backend
cd backend && npm install
# .env: DB_NAME, DB_USER, DB_PASSWORD, DB_HOST=localhost, PORT=5000, JWT_SECRET
npx sequelize-cli db:create && npx sequelize-cli db:migrate && npx sequelize-cli db:seed:all
npm run dev

# Frontend
cd frontend && npm install
# .env: VITE_API_URL=http://localhost:5000
npm run dev
```

Seed data includes an admin account and sample services.

## 12. Deliverables (school requirements)

1. Working LaundryHops web app
2. ERD + data dictionary
3. Postman collection (API documentation)
4. QA test plan, test cases, bug reports
5. Project documentation (this plan, milestone reports — Regie)
6. Demo walkthrough

## 13. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Slot double-booking | Server-side availability validation before creating booking |
| Scope creep | Fixed 6-module scope; new ideas go to "future work" section |
| API mismatch between FE/BE | Postman collection is the single source of truth; Regie signs off changes |
| Local env differences | README setup guide + .env.example committed |

## 14. UI/UX Design — Dark Theme: Solarized Dark

**Selected theme:** **Solarized Dark** (Ethan Schoonover) — a classic warm, low-contrast dark palette designed to reduce eye strain during long sessions.
*Alternates considered: Nord, Dracula, Tokyo Night, Catppuccin Mocha, Material Dark, GitHub Dark, Gruvbox, Rose Pine, Everforest, Synthwave '84, Night Owl.*

### Color Palette

| Role | Color | Hex |
|---|---|---|
| Background (base) | Dark blue-teal | `#002b36` |
| Surfaces (cards, navbar, inputs, modals) | Elevated teal | `#073642` |
| Hover / selected surface | Lighter teal | `#094a58` |
| Borders / dividers | Slate | `#586e75` at 40% opacity |
| Body text | Soft gray-teal | `#839496` |
| Secondary text / captions | Muted | `#657b83` |
| Headings / emphasized text | Warm off-white | `#eee8d5` |
| Primary buttons / links / active states | Solarized blue | `#268bd2` |
| Success | Solarized green | `#859900` |
| Error / danger | Solarized red | `#dc322f` |
| Warning | Solarized orange | `#cb4b16` |

**Full accent set** (charts, tags, highlights): yellow `#b58900` · orange `#cb4b16` · red `#dc322f` · magenta `#d33682` · violet `#6c71c4` · blue `#268bd2` · cyan `#2aa198` · green `#859900`

### Booking Status Colors (Solarized accents)

| Status | Color | Hex |
|---|---|---|
| pending | Yellow | `#b58900` |
| confirmed | Blue | `#268bd2` |
| received | Violet | `#6c71c4` |
| washing | Magenta | `#d33682` |
| ready | Green | `#859900` |
| delivered | Cyan | `#2aa198` |
| claimed | Cyan | `#2aa198` |
| cancelled | Red | `#dc322f` |

### UI/UX Materials

- **Design language:** Material-style components adapted for React (cards, elevated surfaces, filled/outlined buttons, chips)
- **Typography:** Poppins for headings + Inter for body; system font fallbacks
- **Icons:** Material Symbols / Material Icons (free, Google-hosted, matches Material language)
- **Core components:** `Navbar`, `ServiceCard`, `BookingCard`, `StatusBadge`, `SlotPicker`, `Toast` notifications
- **Accessibility:** headings/emphasis in `#eee8d5`; accents kept at WCAG AA contrast against `#002b36`; visible focus states; no harsh glows
- **Theming:** one CSS-variables file (`theme.css`) holds the palette so components never hard-code colors
