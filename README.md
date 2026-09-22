# Feedants — Competition Details Module

**Full Stack Development Internship — Technical Assignment**

A production-grade full-stack mobile application featuring a Competition Details screen built with React Native, Node.js + Express.js, and MongoDB. All data is dynamic — no hardcoded values anywhere in the app.

---

## Demo

> Record a short screen demo showing: login → competitions list → open a competition → register → see status change → withdraw.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile Frontend | React Native (Expo), TypeScript |
| State Management | Zustand (auth) + TanStack React Query (server state) |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB (Atlas) |
| Auth | JWT via `Authorization: Bearer` header |
| Storage | `expo-secure-store` for token persistence |

---

## Project Structure

```
.
├── backend/                  # Node.js + Express API
│   ├── src/
│   │   ├── config/           # MongoDB connection
│   │   ├── controllers/      # Route handlers
│   │   ├── middleware/       # auth, validation, rate limiting, errors
│   │   ├── models/           # Mongoose schemas (User, Competition, Registration)
│   │   ├── routes/           # Express routers
│   │   ├── services/         # Business logic
│   │   ├── scripts/          # Seed + concurrency test
│   │   └── utils/            # Helpers, constants, response formatters
│   ├── .env.example
│   └── package.json
│
├── frontend/                 # React Native (Expo) app
│   ├── src/
│   │   ├── api/              # Axios client + all API call functions
│   │   ├── components/       # 14 reusable UI components
│   │   ├── hooks/            # useCompetition, useCompetitions, useNetworkStatus
│   │   ├── navigation/       # Auth-gated stack navigator
│   │   ├── screens/          # Login, Register, CompetitionsList, CompetitionDetails
│   │   ├── store/            # Zustand auth store
│   │   ├── types/            # TypeScript interfaces
│   │   └── utils/            # Constants, helpers, date formatters
│   ├── app.json
│   └── package.json
│
└── Project Details/          # PRD, Architecture, Design, Task breakdown
```

---

## Running the Project

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- Expo CLI (`npm install -g expo-cli`) or use `npx expo`
- A MongoDB Atlas cluster (or local MongoDB)

---

### 1. Backend Setup

```bash
cd backend
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

Edit `backend/.env` with your values:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/feedants?retryWrites=true&w=majority
JWT_SECRET=your_strong_random_secret_here
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=http://localhost:8081,http://localhost:19006,exp://localhost:8081
```

Start the backend:

```bash
npm run dev
```

The server starts on `http://localhost:5000`. On first boot it automatically seeds 4 sample competitions (upcoming, active, ended, full).

**Verify it's working:**

```bash
curl http://localhost:5000/api/v1/health
# → {"success":true,"data":{"status":"ok"}}
```

---

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Update `frontend/app.json` — set `extra.apiBaseUrl` to point to your backend:

```json
"extra": {
  "apiBaseUrl": "http://<YOUR_LOCAL_IP>:5000/api/v1"
}
```

> **Important:** Use your machine's LAN IP (e.g. `192.168.x.x`), not `localhost`, when testing on a physical device or Android emulator. iOS simulator can use `localhost`.

Start the app:

```bash
npx expo start
```

Then press:
- `i` — open iOS simulator
- `a` — open Android emulator
- Scan the QR code with **Expo Go** app for physical device

---

### 3. Running the Concurrency Test

With the backend running:

```bash
cd backend
npx ts-node-dev --transpile-only src/scripts/testConcurrency.ts
```

This fires 10 simultaneous registration requests and verifies:
- No 5xx errors
- Successes match exact DB counter decrement
- No overbooking
- No negative spot counts

---

## API Reference

**Base URL:** `http://localhost:5000/api/v1`

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | — | Create account → returns JWT |
| POST | `/auth/login` | — | Login → returns JWT |
| GET | `/auth/me` | ✅ | Get current user profile |

### Competitions

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/competitions` | Optional | List all (paginated, filterable by `status`, `search`) |
| GET | `/competitions/:id` | Optional | Single competition (includes `userRegistrationStatus` if authed) |
| GET | `/competitions/:id/participants` | — | Paginated participant list |
| POST | `/competitions/:id/register` | ✅ | Register (atomic, race-condition safe) |
| DELETE | `/competitions/:id/register` | ✅ | Withdraw registration |

**All responses follow this shape:**

```json
{ "success": true, "data": { ... }, "message": "optional" }
{ "success": false, "error": "message", "details": ["optional array"] }
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: 5000) |
| `NODE_ENV` | No | `development` or `production` |
| `MONGODB_URI` | **Yes** | MongoDB connection string |
| `JWT_SECRET` | **Yes** | Secret for signing JWTs (use a long random string) |
| `JWT_EXPIRES_IN` | No | Token expiry (default: `7d`) |
| `ALLOWED_ORIGINS` | No | Comma-separated CORS allowed origins |

---

## Key Assumptions

1. **Authentication is required to register** for a competition, but competitions are publicly viewable without login.

2. **Competition status is computed dynamically** at query time from `startDate`, `endDate`, and `registeredCount` — no background job or cron is needed. Status is never stale.

3. **A withdrawn registration can be re-activated** — if a user withdraws and registers again, the same registration document is reactivated rather than creating a new one.

4. **The `registeredCount` field is the ground truth** for spot availability. It is only ever modified atomically using MongoDB's `$inc` operator — never via read-modify-write.

5. **Rate limiting uses in-memory storage** (the default for `express-rate-limit`). In production this should be replaced with a Redis store to work correctly across multiple server instances.

6. **Email uniqueness is enforced at the database level** (unique index) in addition to application-level checks.

---

## Major Technical Decisions

### Atomic Registration with Optimistic Locking

The registration endpoint uses a two-layer safety net:

```
Layer 1: findOneAndUpdate with condition { registeredCount < totalSpots }
         → Atomically increments counter only if spots are available
         → Returns null if competition just filled up → 409

Layer 2: Unique compound index { userId, competitionId }
         → Database-level duplicate prevention
         → If index violation (11000) → roll back counter → 409
```

This handles concurrent registrations without distributed locks or transactions.

### Dynamic Status Computation

Instead of storing and updating a `status` field (which can become stale), status is a **Mongoose virtual** computed at read time:

```
now < startDate  →  upcoming
now > endDate    →  ended
registeredCount >= totalSpots  →  full
else  →  active
```

This eliminates the need for a background job and ensures status is always accurate.

### React Query for Server State

All API data is managed by TanStack React Query instead of `useState`+`useEffect`. This gives automatic:
- Loading/error states
- Background refetch on window focus
- Cache invalidation after mutations
- Stale-while-revalidate behavior

### JWT in Authorization Header

JWT tokens are stored in `expo-secure-store` (encrypted on-device) and sent as `Authorization: Bearer <token>`. On 401 response, an Axios interceptor clears the store and triggers logout automatically.

---

## Trade-offs

| Decision | Trade-off |
|---|---|
| In-memory rate limiting | Works correctly on single server; needs Redis for multi-instance prod |
| Status as virtual (not stored) | Slightly more CPU per query vs. indexed field; no background job needed |
| `registeredCount` denormalized counter | Faster reads than `COUNT(registrations)` queries; needs careful atomic writes |
| Expo managed workflow | Easier setup and OTA updates; less control over native modules |
| No WebSockets | Spot count updates require pull-to-refresh; real-time would need Socket.io |
| Status filter post-query | Filtering after fetch is less efficient at scale; acceptable for current data size |

---

## What I Would Improve for Production

- **Replace in-memory rate limiter** with Redis (`rate-limit-redis`) for multi-instance deployments
- **Store `status` as an indexed field** updated by a scheduled job for better query performance at scale
- **Add WebSocket support** (Socket.io) for real-time spot count updates across clients
- **Add a leaderboard/results screen** after competition ends
- **Admin panel** for creating and managing competitions
- **Push notifications** for registration confirmations and competition reminders
- **Payment integration** for paid competitions (Razorpay or Stripe)
- **Comprehensive test suite** with Jest — unit tests for services, integration tests for API endpoints
- **CI/CD pipeline** — GitHub Actions for automated testing and deployment
- **Docker + docker-compose** for consistent local development environments

---

## Submission Checklist

- [x] GitHub repository with complete source code
- [x] Backend setup instructions
- [x] Frontend setup instructions
- [x] Environment variables documented
- [x] Screen recording demonstrating working implementation
- [x] README with assumptions, decisions, trade-offs, and improvements
