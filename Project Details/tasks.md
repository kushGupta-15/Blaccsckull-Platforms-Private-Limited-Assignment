# Task Breakdown

All tasks are organized by phase. Each task should be completed and verified before moving to the next within a phase. Tasks can be updated as the project evolves.

**Status key:** `[ ]` todo · `[~]` in progress · `[x]` done

---

## Phase 1 — Project Setup & Infrastructure

- [x] **T1.1** Initialize backend project (Node.js + Express + TypeScript)
  - `npm init`, tsconfig, eslint, prettier
  - Install all backend dependencies
- [x] **T1.2** Initialize frontend project (Expo + React Native + TypeScript)
  - Manually scaffolded (create-expo-app CLI timed out), full folder structure created
  - Configure tsconfig, eslint, babel — install all frontend dependencies
- [x] **T1.3** Setup MongoDB connection
  - Configure Mongoose in `/config/database.ts`
  - Connect using env variable `MONGODB_URI`
- [x] **T1.4** Setup environment config
  - Created `.env` and `.env.example` for backend
  - Configured Expo Constants for frontend env via `app.json extra`
- [x] **T1.5** Create base Express app with middleware
  - helmet, cors, morgan, express.json, body size limit
  - Global error handler + 404 handler middleware
  - `/api/v1/health` check endpoint
- [x] **T1.6** Setup React Navigation
  - Stack navigator with placeholder screens (Login, CompetitionsList, CompetitionDetails)
  - Full navigation types for TypeScript (`RootStackParamList`)

---

## Phase 2 — Authentication (Backend)

- [ ] **T2.1** Create `User` Mongoose model with schema
- [ ] **T2.2** Implement `POST /api/v1/auth/register` endpoint
  - Validate input (name, email, password)
  - Hash password with bcrypt
  - Return JWT token
- [ ] **T2.3** Implement `POST /api/v1/auth/login` endpoint
  - Validate credentials
  - Return JWT token
- [ ] **T2.4** Implement `GET /api/v1/auth/me` endpoint
  - Decode JWT, return user profile (no password hash)
- [ ] **T2.5** Create JWT auth middleware
  - Verify token, attach user to `req.user`
  - Return 401 if invalid/missing

---

## Phase 3 — Authentication (Frontend)

- [ ] **T3.1** Create auth Zustand store (token, user, login, logout)
- [ ] **T3.2** Build Login screen UI
- [ ] **T3.3** Build Register screen UI
- [ ] **T3.4** Wire auth screens to API (`/api/v1/auth/*`)
- [ ] **T3.5** Persist JWT token with `expo-secure-store`
- [ ] **T3.6** Setup auto-login on app launch (restore session from storage)
- [ ] **T3.7** Protected route logic (redirect to login if unauthenticated on register action)

---

## Phase 4 — Competition Backend

- [ ] **T4.1** Create `Competition` Mongoose model with full schema
  - Include indexes on `status`, `startDate`, `endDate`
- [ ] **T4.2** Create `Registration` Mongoose model
  - Compound unique index on `{ userId, competitionId }`
- [ ] **T4.3** Implement `GET /api/v1/competitions` (list, paginated)
  - Filter by status, search by title
- [ ] **T4.4** Implement `GET /api/v1/competitions/:id` (single competition)
  - Populate host info
  - Include `userRegistrationStatus` when auth token provided
- [ ] **T4.5** Implement `POST /api/v1/competitions/:id/register`
  - Auth required
  - Check competition status (must be `active`)
  - Atomic spot decrement using `findOneAndUpdate` with condition
  - Prevent duplicate registration (unique index + 409 response)
  - Handle race condition: return 409 if spots run out
- [ ] **T4.6** Implement `DELETE /api/v1/competitions/:id/register` (withdraw)
  - Auth required
  - Atomic spot increment on withdrawal
- [ ] **T4.7** Implement `GET /api/v1/competitions/:id/participants`
  - Paginated list of registered users
- [ ] **T4.8** Seed database with sample competition data
  - At least 3 competitions in different states (upcoming, active, ended)
- [ ] **T4.9** Competition status auto-update logic
  - Service/cron that transitions `upcoming → active → ended` based on dates
  - OR compute status dynamically at query time

---

## Phase 5 — Competition Details Screen (Frontend)

- [ ] **T5.1** Create `ICompetition` and `IRegistration` TypeScript interfaces
- [ ] **T5.2** Create API service functions
  - `getCompetition(id)`, `registerForCompetition(id)`, `withdrawFromCompetition(id)`
  - `getCompetitionParticipants(id)`
- [ ] **T5.3** Setup React Query for competition data fetching
  - `useCompetition(id)` hook with loading/error states
  - Auto-refetch on window focus
- [ ] **T5.4** Build `CompetitionBanner` component
  - Full-width image, gradient overlay, back button
- [ ] **T5.5** Build `StatusBadge` component
  - Color-coded, all status states
- [ ] **T5.6** Build `StatsRow` component
  - Participants count, time remaining, entry fee chips
- [ ] **T5.7** Build `SpotsProgressBar` component
  - Animated fill, warning color when low
- [ ] **T5.8** Build `CountdownTimer` component
  - Real-time countdown with `setInterval`, days/hours/minutes/seconds
  - Cleans up interval on unmount
- [ ] **T5.9** Build `RegistrationButton` component
  - All 5 states: register, registered, full, ended, upcoming
  - Loading state during API call
  - Haptic feedback
- [ ] **T5.10** Build `ParticipantsPreview` component
  - Avatar stack + overflow count
- [ ] **T5.11** Build `RulesSection` component
  - Collapsible accordion list
- [ ] **T5.12** Assemble `CompetitionDetailsScreen`
  - Compose all sub-components
  - ScrollView layout matching design reference
  - Sticky registration button at bottom
- [ ] **T5.13** Handle all UI states
  - Loading skeleton
  - Error state with retry button
  - Empty/not found state
- [ ] **T5.14** Wire registration action
  - Call API on button press
  - Optimistic UI update
  - Show toast on success/error
  - Invalidate React Query cache on success

---

## Phase 6 — Competitions List Screen (Frontend)

- [ ] **T6.1** Build `CompetitionCard` component (summary view)
- [ ] **T6.2** Build `CompetitionsListScreen`
  - FlatList with pagination (infinite scroll or load more)
  - Pull-to-refresh
- [ ] **T6.3** Connect list screen → detail screen navigation with competition ID

---

## Phase 7 — Polish & Edge Cases

- [ ] **T7.1** Handle token expiry — auto logout on 401 response (Axios interceptor)
- [ ] **T7.2** Offline / no network state handling
- [ ] **T7.3** Validate all form inputs client-side
- [ ] **T7.4** Test concurrent registration scenario (manual or automated)
- [ ] **T7.5** Add rate limiting to registration endpoint (prevent spam)
- [ ] **T7.6** Ensure no sensitive data (password hash) in any API response
- [ ] **T7.7** Review and fix accessibility (labels, contrast, touch targets)
- [ ] **T7.8** Test on both iOS and Android simulators

---

## Phase 8 — Documentation & Submission

- [ ] **T8.1** Write `README.md`
  - Setup instructions (backend + frontend)
  - Environment variables list
  - Assumptions made
  - Key technical decisions
  - Trade-offs
  - Future improvements
- [ ] **T8.2** Record screen demo video (working registration flow, state changes)
- [ ] **T8.3** Push final code to GitHub repository
- [ ] **T8.4** Final review of all submission requirements

---

## Task Notes

- Tasks T4.5 and T5.14 are the most critical — concurrent registration handling is a key evaluation criterion
- T5.8 (countdown timer) should be tested for memory leaks (interval cleanup)
- T4.9 (status auto-update) can be done via a simple computed field approach first, then upgraded to a cron job if time permits
