# SkillBridge

A hybrid Fiverr + Upwork freelance marketplace, built as a learning project on the MERN stack (MongoDB, Express, React, Node.js) with Material UI. It supports both fixed-price gig listings (Fiverr-style) and open job postings with proposals (Upwork-style), backed by an escrow-based payment system and real-time chat/notifications.

## Tech Stack

- **Backend:** Node.js, Express 5, MongoDB/Mongoose, Passport.js (local + JWT strategies), Socket.io
- **Frontend:** React 19 (Vite), Redux Toolkit + RTK Query, React Router v6, Material UI, react-hook-form + yup
- **Auth:** Short-lived JWT access tokens (in memory only) + long-lived httpOnly refresh-token cookies with rotation
- **File uploads:** Multer (local disk storage)

## Project Structure

```
skillbridge/
├── server/           # Express API + Socket.io server
│   └── src/
│       ├── config/       # passport, permissions, multer, db connection
│       ├── controllers/  # thin request handlers
│       ├── services/     # business logic
│       ├── models/       # Mongoose schemas
│       ├── middleware/    # auth, rbac, validation, ownership, error handling
│       ├── validators/   # express-validator rule sets
│       ├── routes/       # Express routers
│       ├── sockets/      # Socket.io server + real-time event handlers
│       └── seed/         # idempotent seed scripts (categories, demo data)
└── client/           # React SPA
    └── src/
        ├── app/          # store, RTK Query base API, App.jsx (routes)
        ├── features/     # one folder per domain, each with an RTK Query api slice
        ├── pages/         # route-level page components
        ├── components/   # shared UI (Navbar, ChatBox, NotificationBell, ...)
        └── lib/           # socket.js client wrapper
```

## Core Features

- **Auth & RBAC** — register/login/refresh/logout, three roles (client, freelancer, admin) with a permission-map-driven authorization layer (`requireRole` / `requirePermission` middleware).
- **Gigs & Jobs** — freelancers publish fixed-price gigs with tiered packages (basic/standard/premium); clients post jobs that freelancers submit proposals against. Both support keyword search, filtering, and pagination.
- **Proposals & Contracts** — clients review/shortlist/accept proposals; accepting a proposal (or buying a gig) creates a Contract with one or more milestones.
- **Wallet & Escrow** — deposit/withdraw, fund a milestone (moves funds from available → escrow), submit delivery, approve & release (escrow → freelancer's available balance). All the guardrails from the PRD (insufficient balance, wrong milestone state, non-owning client, negative escrow) are enforced in `wallet.service.js`.
- **Real-time (Socket.io)** — JWT-authenticated socket handshake; live chat per contract (with typing indicators and read receipts), online/offline presence, and push notifications on key events (new proposal, hire, delivery submitted, payment released, dispute resolved).
- **Reviews & Disputes** — two-way reviews after a contract is completed, rolled into a running average on the user's (and gig's) rating; either party can raise a dispute on a funded milestone, which an admin resolves by refunding the client or releasing funds to the freelancer.
- **Admin** — user ban/unban, category CRUD, dispute resolution queue, and a basic analytics dashboard (user/gig/job counts, contracts by status, transaction volume by type).

## Known Simplifications (disclosed)

- **No cloud storage** — gig images are stored on local disk via Multer, not S3/Cloudinary. Swap in a cloud storage service later if needed.
- **No Mongoose multi-document transactions** — the deployment target is a standalone (non-replica-set) MongoDB instance, which doesn't support transactions. Wallet operations use sequential validated writes with the guardrails enforced in application code instead of a true atomic transaction.
- **Forgot/reset password is not implemented yet** — deferred until an email service (e.g. SendGrid) is wired up.

## Getting Started

### Prerequisites
- Node.js 18+
- A running MongoDB instance (local or Atlas)

### 1. Backend

```bash
cd server
npm install
cp .env.example .env   # fill in MONGO_URI and JWT secrets
npm run dev             # nodemon server.js — http://localhost:5000
```

### 2. Frontend

```bash
cd client
npm install
cp .env.example .env   # defaults already point at localhost:5000
npm run dev             # vite — http://localhost:5173
```

### 3. Seed data (optional, run from `server/`)

```bash
node src/seed/fullDemo.seed.js
```

This is the recommended one-command seed — it populates categories, users, gigs, jobs,
proposals, contracts in several different states, funded wallets with transaction history,
two-way reviews, notifications, and a sample chat conversation, all by driving the real
service layer (not raw inserts), so the data is exactly what clicking through the UI would
produce. It's safe to re-run — it clears out its own previously-seeded data first.

Demo accounts (password for all: `password123`):

| Role | Email | Notes |
|---|---|---|
| Freelancer | `demo.freelancer@skillbridge.test` | Aisha Khan — web dev, has a delivery awaiting your approval |
| Freelancer | `demo.designer@skillbridge.test` | Marcus Chen — design, has a funded contract in progress |
| Freelancer | `demo.writer@skillbridge.test` | Priya Nair — writing/marketing, has completed contracts + reviews + wallet balance |
| Client | `demo.client@skillbridge.test` | Rahul Verma — funded $3000 wallet, a hire pending funding |
| Client | `demo.client2@skillbridge.test` | Sophie Martin — funded $3000 wallet, open job with proposals |
| Admin | `admin@skillbridge.test` | roles: client + admin — use for the `/admin` dashboard |

Two smaller standalone scripts are also available if you just want the basics:

```bash
node src/seed/category.seed.js    # 6 baseline categories only
node src/seed/demoData.seed.js    # 1 demo freelancer + 1 demo client with sample gigs/jobs only
```

## Environment Variables

**server/.env**

| Variable | Description |
|---|---|
| `PORT` | API server port (default 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Signing secret for short-lived access tokens |
| `JWT_REFRESH_SECRET` | Signing secret for refresh tokens |
| `ACCESS_TOKEN_EXPIRY` | e.g. `15m` |
| `REFRESH_TOKEN_EXPIRY` | e.g. `7d` |
| `CLIENT_URL` | Frontend origin, used for CORS + Socket.io CORS |

**client/.env**

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | REST API base, e.g. `http://localhost:5000/api/v1` |
| `VITE_SOCKET_URL` | Socket.io server origin, e.g. `http://localhost:5000` |

## API Overview

All REST routes are mounted under `/api/v1` and return `{ success, data, message }`.

| Base path | Purpose |
|---|---|
| `/auth` | register, login, refresh, logout |
| `/users` | profile (me / public) |
| `/gigs`, `/categories`, `/jobs` | listings, search/filter/pagination |
| `/proposals` | submit / list / shortlist-reject-accept |
| `/contracts` | create, fetch, milestone submit/fund/approve |
| `/wallet` | balance + ledger, deposit, withdraw |
| `/conversations`, `/notifications` | chat history + notification inbox (live updates via Socket.io) |
| `/reviews` | post-completion two-way reviews |
| `/disputes` | raise (client/freelancer) and resolve (admin) |
| `/admin` | user ban/unban, category CRUD, analytics |

## Deployment Notes

- Build the frontend with `npm run build` inside `client/` (outputs to `client/dist/`); serve it from any static host or behind the same reverse proxy as the API.
- The API is a single Express + Socket.io process (`server/server.js`) — deploy it to any Node host (Render, Railway, a VPS, etc.) with the environment variables above set, and point `CLIENT_URL` at the deployed frontend origin.
- Uploaded gig images are written to `server/uploads/` and served via `/uploads` — on most PaaS platforms this is ephemeral storage, so for a persistent production deployment swap in a cloud storage service (see "Known Simplifications" above).
