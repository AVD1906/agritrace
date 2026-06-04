# AgriTrace

A supply chain transparency platform for agricultural produce. Every batch gets a QR code — scan it to see the full journey from farm to table.

---

## What it does

Farmers log produce batches. Processors, distributors, and retailers add events as the batch moves through the supply chain. Each step is timestamped and stored. Anyone with the QR code can verify the full history of what they're eating.

- Batch tracking with QR codes at every stage
- Role-based access — Farmers, Processors, Distributors, Retailers, Admins see different views
- PDF certificates for verified batches
- Live dashboard updates over WebSockets
- Public trace page — no login required, just scan the QR

---

## Tech stack

| Layer | Stack |
|---|---|
| Frontend | React, Tailwind CSS, Recharts, Socket.io-client |
| Backend | Node.js, Express |
| Database | MySQL |
| Real-time | Socket.io |
| Auth | JWT |
| PDF generation | PDFKit |
| QR codes | qrcode |

---

## Project structure

```
agritrace/
├── backend/
│   ├── config/
│   │   └── db.js                  # MySQL connection pool
│   ├── controllers/               # Route handlers
│   │   ├── authController.js
│   │   ├── batchController.js
│   │   ├── productController.js
│   │   ├── logController.js
│   │   ├── locationController.js
│   │   ├── certificationController.js
│   │   ├── notificationController.js
│   │   ├── reportController.js
│   │   ├── analyticsController.js
│   │   ├── traceController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT verification
│   │   ├── checkRole.js           # RBAC enforcement
│   │   └── errorHandler.js
│   ├── models/                    # Raw SQL queries
│   ├── routes/                    # Express routers
│   ├── services/
│   │   └── certificateService.js  # PDFKit certificate generation
│   ├── utils/
│   ├── .env                       # Never committed
│   └── index.js                   # Entry point, Socket.io setup
│
└── frontend/
    └── src/
        ├── components/
        │   └── Layout.jsx         # Sidebar, topbar, notification dropdown
        ├── pages/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Dashboard.jsx      # Role-specific stats + live updates
        │   ├── Batches.jsx        # Create batches, generate QR codes
        │   ├── Products.jsx
        │   ├── Logs.jsx
        │   ├── Locations.jsx
        │   ├── Reports.jsx        # Charts, batch table, activity feed
        │   ├── Certificates.jsx
        │   ├── Audit.jsx
        │   ├── Notifications.jsx
        │   └── TracePage.jsx      # Public QR scan landing page
        └── services/
            ├── socket.js          # Socket.io client instance
            └── ...                # Per-feature API helpers
```

---

## How the data flows

```
QR Code scan / UI action
        ↓
React page (pages/)
        ↓
fetch / axios call
        ↓
Express route (routes/)
        ↓
authMiddleware → checkRole
        ↓
Controller (controllers/)
        ↓
Model — raw SQL via mysql2
        ↓
MySQL (agritrace DB)
        ↓
Response + optional Socket.io broadcast
        ↓
Dashboard updates live
```

---

## Database

12 tables — core ones:

| Table | Purpose |
|---|---|
| `users` | Accounts with role assignments |
| `roles` | Admin, Farmer, Processor, Distributor, Retailer |
| `products` | Products registered by farmers |
| `batches` | Individual harvest batches, each with a QR |
| `supplychainlogs` | Every movement event, timestamped |
| `locations` | Named farm/warehouse/retail locations |
| `certifications` | Organic, quality certs attached to batches |
| `notifications` | Per-user alert feed |
| `auditlogs` | Admin-visible system event trail |

Indexes on `batches.batch_id`, `batches.product_id`, `batches.status`, `supplychainlogs.batch_id`, `supplychainlogs.timestamp`.

---

## API — key endpoints

```
POST   /api/auth/login
POST   /api/auth/register

GET    /api/batches
POST   /api/batches
GET    /api/batches/:id/certificate     # PDF download

GET    /api/trace/:batchId              # Public — no auth required

GET    /api/reports/summary             # Complex JOIN across 4 tables
GET    /api/reports/activity

GET    /api/products
GET    /api/logs
GET    /api/locations
GET    /api/notifications
GET    /api/certifications
```

All routes except `/api/auth/*` and `/api/trace/*` require a JWT in the `Authorization: Bearer <token>` header. Role-restricted routes return `403` if the role doesn't match.

---

## Running locally

**Prerequisites** — Node.js, MySQL

```bash
# 1. Clone
git clone https://github.com/yourname/agritrace.git
cd agritrace

# 2. Backend
cd backend
npm install
cp .env.example .env       # fill in your DB credentials + JWT secret
node index.js              # runs on :5000

# 3. Frontend (new terminal)
cd frontend
npm install
npm start                  # runs on :3000
```

**.env keys needed:**
```
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
PORT=5000
JWT_SECRET=
FRONTEND_URL=http://localhost:3000
```

---

## Roles

| Role | What they can do |
|---|---|
| Admin | Full access, reports, audit logs, user management |
| Farmer | Create products and batches, generate QR codes |
| Processor | Log processing events, add certifications |
| Distributor | Log distribution events |
| Retailer | View batches, scan QR codes, log retail receipt |

---

## Deployment

- Backend → Render
- Database -> Hosted on [Aiven](https://aiven.io/) (managed MySQL cloud service).
- Frontend → Vercel (set `REACT_APP_API_URL` to Railway backend URL)