# Loopr Admin Dashboard

A full-stack financial admin dashboard — React + TypeScript frontend, Node.js + Express + MongoDB backend.

---

## Project Structure

```
looper_ai_assignment/
├── client/                 # Vite + React + TypeScript frontend
│   └── src/
│       ├── api/            # axios instance + endpoint functions
│       ├── components/
│       │   ├── charts/     # KpiCard, RevenueChart, CategoryChart
│       │   ├── table/      # TransactionsTable (sort, filter, paginate)
│       │   ├── export/     # ExportModal (column selector + CSV preview)
│       │   └── common/     # Sidebar, Header, DashboardLayout, ActivityFeed, ProtectedRoute
│       ├── context/        # AuthContext (JWT + user state)
│       ├── hooks/          # useDashboardSummary, useTransactions
│       ├── pages/          # Login.tsx, Dashboard.tsx
│       └── types/          # Shared TypeScript interfaces
│
├── server/                 # Express + MongoDB backend (implement next)
│   └── src/
│       ├── config/         # db.ts — MongoDB connection
│       ├── controllers/    # auth, transactions, export
│       ├── middleware/     # auth.middleware, error.middleware
│       ├── models/         # Transaction.ts, User.ts
│       ├── routes/         # auth, transactions, export
│       └── utils/          # seedData.ts, csvBuilder.ts
│
└── transactions (1).json   # Source data
```

---

## Frontend Setup

```bash
cd client
npm install
npm run dev         # → http://localhost:5173
```

**Dev credentials (mock auth — no backend required):**
- `admin@loopr.com` / `admin123`
- `viewer@loopr.com` / `viewer123`

---

## Backend Setup (when ready)

```bash
cd server
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MONGODB_URI and JWT_SECRET

# Seed the database
npm run seed

# Start dev server
npm run dev         # → http://localhost:3001
```

---

## API Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/auth/login` | No | Login — returns JWT |
| POST | `/api/auth/logout` | No | Logout |
| GET  | `/api/auth/me` | Yes | Current user |
| GET  | `/api/transactions` | Yes | List with filters, sort, pagination |
| GET  | `/api/transactions/summary` | Yes | KPI aggregates |
| GET  | `/api/transactions/analytics` | Yes | Daily grouped data & top customers |
| POST | `/api/export` | Yes | Generate & download CSV |
| GET  | `/api/users` | Yes | (Admin) List all users |
| POST | `/api/users` | Yes | (Admin) Create a new user |
| PUT  | `/api/users/:id` | Yes | (Admin) Update user role/name |
| DELETE|`/api/users/:id` | Yes | (Admin) Delete a user |
| PUT  | `/api/auth/profile` | Yes | Update your own name/email |
| PUT  | `/api/auth/password` | Yes | Change your password |
| GET  | `/api/health` | No | Health check |
| GET  | `/*` | No | (Production Only) Serves the compiled React frontend |

> **Note on Security:** All `/api/*` endpoints are protected by a global rate limiter (max 200 requests per 15 minutes per IP) and `helmet` for secure HTTP headers. Query parameters are strictly validated and sanitized using Zod schemas to prevent NoSQL injection.

### GET `/api/transactions` query params

| Param | Type | Example |
|-------|------|---------|
| `search` | string | `user_001` |
| `category` | `Revenue\|Expense\|All` | `Revenue` |
| `status` | `Paid\|Pending\|Failed\|All` | `Paid` |
| `user` | string | `user_002` |
| `dateFrom` | ISO date | `2024-01-01` |
| `dateTo` | ISO date | `2024-06-30` |
| `amountMin` | number | `100` |
| `amountMax` | number | `5000` |
| `sortField` | string | `amount` |
| `sortDir` | `asc\|desc` | `desc` |
| `page` | number | `1` |
| `pageSize` | number | `10` |

### POST `/api/export` body

```json
{
  "columns": ["id", "date", "user_id", "category", "status", "amount"],
  "filters": { "category": "Revenue", "status": "Paid" }
}
```

### POST `/api/auth/login` body

```json
{
  "email": "admin@loopr.com",
  "password": "adminpassword"
}
```

### PUT `/api/auth/password` body

```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

### POST `/api/users` body (Admin only)

```json
{
  "email": "newuser@loopr.com",
  "name": "New User",
  "role": "viewer",
  "password": "optionalpassword"
}
```

---

## Features

- ✅ JWT authentication — login/logout, protected routes
- ✅ KPI cards — Total Revenue, Expenses, Users, Conversion Rate with trends
- ✅ Revenue vs Expenses area chart (monthly)
- ✅ Category breakdown donut chart
- ✅ Recent activity feed
- ✅ Transactions table — sortable columns, multi-field filter panel, pagination
- ✅ CSV export modal — column selector + live preview + auto-download
- ✅ Responsive layout — sidebar collapses on mobile
- ✅ CSS variable-based design system (no hardcoded hex values in components)
