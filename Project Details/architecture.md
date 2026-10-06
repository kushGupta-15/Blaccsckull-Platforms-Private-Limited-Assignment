# Architecture Document

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Native App                      │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │   Screens   │  │  Components  │  │  State (Zustand│  │
│  │             │  │  (Reusable)  │  │   / Context)  │  │
│  └──────┬──────┘  └──────────────┘  └───────────────┘  │
│         │                API Calls (Axios)               │
└─────────┼───────────────────────────────────────────────┘
          │ HTTPS / REST
┌─────────▼───────────────────────────────────────────────┐
│                Node.js + Express.js API                  │
│  ┌──────────┐  ┌───────────┐  ┌──────────────────────┐  │
│  │  Routes  │  │Controllers│  │  Middleware           │  │
│  │          │  │           │  │  (auth, validation,   │  │
│  └──────────┘  └─────┬─────┘  │   error handling)    │  │
│                      │        └──────────────────────┘  │
│               ┌──────▼──────┐                           │
│               │   Services  │                           │
│               │  (business  │                           │
│               │   logic)    │                           │
│               └──────┬──────┘                           │
└──────────────────────┼──────────────────────────────────┘
                       │ Mongoose ODM
┌──────────────────────▼──────────────────────────────────┐
│                     MongoDB                              │
│   Collections: users, competitions, registrations        │
└─────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
| Tool | Purpose |
|------|---------|
| React Native (Expo) | Cross-platform mobile UI |
| TypeScript | Type safety |
| Axios | HTTP client |
| React Navigation | Screen navigation |
| Zustand | Lightweight global state management |
| React Query (TanStack) | Server state, caching, background refetch |
| dayjs | Date/time formatting and countdowns |
| react-native-reanimated | Smooth animations |
| expo-linear-gradient | Gradient UI elements |

### Backend
| Tool | Purpose |
|------|---------|
| Node.js | Runtime |
| Express.js | HTTP framework |
| TypeScript | Type safety |
| Mongoose | MongoDB ODM |
| JWT (jsonwebtoken) | Authentication tokens |
| bcryptjs | Password hashing |
| express-validator | Input validation |
| helmet | Security headers |
| cors | Cross-origin resource sharing |
| morgan | HTTP request logging |
| dotenv | Environment config |

### Database
| Tool | Purpose |
|------|---------|
| MongoDB | Primary data store |
| MongoDB Atlas | Cloud hosting (production) |

### Dev & Tooling
| Tool | Purpose |
|------|---------|
| ESLint + Prettier | Code quality |
| Jest | Unit & integration tests |
| Postman / Thunder Client | API testing |

---

## MongoDB Data Models

### `users` Collection
```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string (unique, indexed)",
  "passwordHash": "string",
  "avatar": "string (url)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### `competitions` Collection
```json
{
  "_id": "ObjectId",
  "title": "string",
  "description": "string",
  "bannerImage": "string (url)",
  "category": "string",
  "status": "enum: upcoming | active | full | ended | cancelled",
  "startDate": "Date",
  "endDate": "Date",
  "totalSpots": "number",
  "registeredCount": "number (atomic counter)",
  "entryFee": "number (0 = free)",
  "prizePool": "string",
  "rules": ["string"],
  "hostId": "ObjectId (ref: users)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### `registrations` Collection
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: users, indexed)",
  "competitionId": "ObjectId (ref: competitions, indexed)",
  "registeredAt": "Date",
  "status": "enum: active | withdrawn"
}
```
> Compound unique index on `{ userId, competitionId }` to prevent duplicates.

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user profile |

### Competitions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/competitions` | List all competitions (paginated) |
| GET | `/api/competitions/:id` | Get single competition details |
| GET | `/api/competitions/:id/participants` | Get participant list |

### Registration
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/competitions/:id/register` | Register current user |
| DELETE | `/api/competitions/:id/register` | Withdraw registration |
| GET | `/api/competitions/:id/status` | Get user's registration status |

---

## Concurrency Strategy

To safely handle simultaneous registrations:
- Use MongoDB `findOneAndUpdate` with `$inc` and conditional filter (`registeredCount < totalSpots`)
- The unique compound index on `registrations` prevents duplicate entries even under concurrent load
- `registeredCount` is updated atomically — never via read-modify-write in application code

---

## Folder Structure

```
project-root/
├── backend/
│   ├── src/
│   │   ├── config/           # DB connection, env config
│   │   ├── controllers/      # Route handler logic
│   │   ├── middleware/       # auth, error handler, validator
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # Express route definitions
│   │   ├── services/         # Business logic layer
│   │   ├── utils/            # Helpers, constants
│   │   └── app.ts            # Express app setup
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── api/              # Axios instances, API calls
│   │   ├── components/       # Reusable UI components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── navigation/       # React Navigation setup
│   │   ├── screens/          # Full screen components
│   │   │   └── CompetitionDetails/
│   │   ├── store/            # Zustand stores
│   │   ├── types/            # TypeScript interfaces
│   │   └── utils/            # Formatters, constants
│   ├── app.json
│   ├── App.tsx
│   ├── package.json
│   └── tsconfig.json
│
├── Project Details/          # Planning documents
└── README.md
```
