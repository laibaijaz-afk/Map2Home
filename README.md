# Map2Home

A full-stack construction cost estimation platform for Pakistan. Users upload or select floor plans, get accurate material and labor cost estimates, and view 3D visualizations of their home designs.

---

## What is Map2Home

Map2Home helps homeowners, builders, and architects estimate construction costs for residential projects in Pakistan. It:

- Provides live material prices scraped from costzone.org (cement, steel, bricks, tiles, etc.)
- Estimates grey structure and complete house costs based on area, location, and quality tier
- Lets users select from pre-made floor plans or draw custom JSON maps
- Renders DXF working drawings and 3D floor plan previews
- Supports admin management of users, materials, and maps

**Tech Stack:**
- **Backend:** Node.js, Express.js, MySQL, JWT auth, Nodemailer, Cheerio scraping, node-cron
- **Frontend:** Vue 3, Vite, Pinia, Vue Router, Tailwind CSS

---

## Installation & Setup

### Prerequisites

- Node.js v14+
- MySQL Server
- npm

### 1. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=map2home
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=7d
FRONTEND_URL=http://localhost:5173
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
NODE_ENV=development
```

Start the backend:

```bash
npm run dev      # development (nodemon auto-reload)
npm start        # production
```

The server starts on `http://localhost:5000`. The database schema is auto-initialized on first run.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on `http://localhost:5173`.

---

## How the System Works

### User Flow

1. **Register / Login** — Create an account with email verification, or log in with existing credentials.
2. **Browse Floor Plans** — View available pre-made maps filtered by room count, area, or type.
3. **Select or Draw a Plan** — Choose a floor plan from the library or use the JSON map editor to draw a custom layout.
4. **View Working Drawings** — DXF files are rendered in the browser using the built-in DXF viewer.
5. **3D Preview** — A Three.js-powered 3D view lets users visualize the floor plan spatially.
6. **Get Cost Estimate** — Enter area (marla/sqft), location (city), and quality tier (economy/standard/luxury) to calculate:
   - Grey structure cost
   - Complete house cost
   - Per-material breakdown with live scraped prices
7. **Save Estimates** — Logged-in users can save and revisit their cost estimates from their dashboard.
8. **Submit Feedback** — Users can leave feedback on the platform.

### Material Prices

Prices are scraped automatically from costzone.org every 5 minutes via a cron job and stored in the MySQL `materials` table. Fallback prices are used if scraping fails.

### Admin Panel

Admins can:
- View system stats and all users
- Manage material prices manually
- Manage the floor plan library
- Review all user feedback

---

## API Overview

| Group | Base Path | Key Endpoints |
|-------|-----------|---------------|
| Auth | `/api/auth` | register, login, verify-email, forgot-password, reset-password |
| User | `/api/user` | profile management |
| Cost | `/api/cost-estimation` | calculate, save, my-estimates |
| Maps | `/api/maps` | list, by-spec, generate-2d, my-maps, dxf |
| Materials | `/api/materials` | prices, scrape-prices (admin) |
| Admin | `/api/admin` | stats, users, role management |
| Feedback | `/api/feedback` | add, my-feedback, all (admin) |
| JSON Maps | `/api/json-maps` | custom map CRUD |
| 3D Plans | `/api/floorplan-3d` | 3D floor plan generation |

---

## Running Tests

Tests are in `backend/tests/` (integration) and `backend/tests/unit/` (unit tests), using Jest and Supertest.

```bash
cd backend
npm test                    # run all tests
npm test -- auth            # run only auth tests
npm test -- --coverage      # run with coverage report
```

**Test files:**
- `auth.test.js` — registration, login, email verification, password reset
- `maps.test.js` — floor plan listing and retrieval
- `cost.test.js` — cost estimation calculation
- `feedback.test.js` — feedback submission
- `materials.test.js` — material price endpoints
- `admin.test.js` — admin-only operations
- `unit/` — isolated unit tests for controllers, services, and utilities

> Tests require a running MySQL instance. Set `NODE_ENV=test` and ensure your `.env` has valid DB credentials before running.
