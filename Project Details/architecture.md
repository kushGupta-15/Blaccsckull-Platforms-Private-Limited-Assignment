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

### `submissions` Collection (Extension)
```json
{
  "_id": "ObjectId",
  "competitionId": "ObjectId (ref: competitions, indexed)",
  "userId": "ObjectId (ref: users, indexed)",
  "title": "string",
  "description": "string",
  "repositoryUrl": "string (url)",
  "demoUrl": "string (url, optional)",
  "mediaUrl": "string (url, optional)",
  "status": "enum: submitted | under_review | evaluated",
  "score": "number (0-100, optional)",
  "feedback": "string (optional)",
  "isWinner": "boolean (default: false)",
  "awardRank": "number (1 = 1st, 2 = 2nd, 3 = 3rd, optional)",
  "upvotes": ["ObjectId (ref: users)"],
  "upvoteCount": "number (default: 0, indexed)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```
> Compound unique index on `{ competitionId, userId }` ensures one submission per participant.

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Create new user |
| POST | `/api/v1/auth/login` | Login, returns JWT |
| GET | `/api/v1/users/me` | Get current user profile |

### Competitions & Host Management
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/competitions` | List all competitions (paginated, filters) |
| GET | `/api/v1/competitions/:id` | Get single competition details |
| POST | `/api/v1/competitions` | Create new competition (Host only) |
| PUT | `/api/v1/competitions/:id` | Update competition details (Host only) |
| GET | `/api/v1/competitions/hosted/me` | Get competitions hosted by current user |
| GET | `/api/v1/competitions/:id/participants` | Get participant roster |
| GET | `/api/v1/competitions/:id/admin-stats` | Get host dashboard stats & overview |
| POST | `/api/v1/competitions/:id/finalize-winners`| Finalize & announce winners |

### Registration
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/competitions/:id/register` | Register current user (concurrency safe) |
| DELETE | `/api/v1/competitions/:id/register` | Withdraw registration |
| GET | `/api/v1/competitions/:id/registration-status`| Get current user registration status |
| GET | `/api/v1/users/me/registrations` | Get current user's registered competitions |

### Submissions & Review Workflow
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/competitions/:id/submissions` | Create or update project submission |
| GET | `/api/v1/competitions/:id/submissions` | Get public submissions showcase |
| GET | `/api/v1/competitions/:id/submissions/mine`| Get current user's submission |
| POST | `/api/v1/submissions/:id/upvote` | Toggle upvote on submission |
| PUT | `/api/v1/submissions/:id/evaluate` | Grade/evaluate submission (Host only) |

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
