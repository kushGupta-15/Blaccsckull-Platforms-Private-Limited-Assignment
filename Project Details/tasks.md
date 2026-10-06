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

- [x] **T2.1** Create `User` Mongoose model with schema
- [x] **T2.2** Implement `POST /api/v1/auth/register` endpoint
  - Validate input (name, email, password)
  - Hash password with bcrypt
  - Return JWT token
- [x] **T2.3** Implement `POST /api/v1/auth/login` endpoint
  - Validate credentials
  - Return JWT token
- [x] **T2.4** Implement `GET /api/v1/auth/me` endpoint
  - Decode JWT, return user profile (no password hash)
- [x] **T2.5** Create JWT auth middleware
  - Verify token, attach user to `req.user`
  - Return 401 if invalid/missing

---

## Phase 3 — Authentication (Frontend)

- [x] **T3.1** Create auth Zustand store (token, user, login, logout)
- [x] **T3.2** Build Login screen UI
- [x] **T3.3** Build Register screen UI
- [x] **T3.4** Wire auth screens to API (`/api/v1/auth/*`)
- [x] **T3.5** Persist JWT token with `expo-secure-store`
- [x] **T3.6** Setup auto-login on app launch (restore session from storage)
- [x] **T3.7** Protected route logic (redirect to login if unauthenticated on register action)

---

## Phase 4 — Competition Backend

- [x] **T4.1** Create `Competition` Mongoose model with full schema
  - Include indexes on `status`, `startDate`, `endDate`
- [x] **T4.2** Create `Registration` Mongoose model
  - Compound unique index on `{ userId, competitionId }`
- [x] **T4.3** Implement `GET /api/v1/competitions` (list, paginated)
  - Filter by status, search by title
- [x] **T4.4** Implement `GET /api/v1/competitions/:id` (single competition)
  - Populate host info
  - Include `userRegistrationStatus` when auth token provided
- [x] **T4.5** Implement `POST /api/v1/competitions/:id/register`
  - Auth required
  - Check competition status (must be `active`)
  - Atomic spot decrement using `findOneAndUpdate` with condition
  - Prevent duplicate registration (unique index + 409 response)
  - Handle race condition: return 409 if spots run out
- [x] **T4.6** Implement `DELETE /api/v1/competitions/:id/register` (withdraw)
  - Auth required
  - Atomic spot increment on withdrawal
- [x] **T4.7** Implement `GET /api/v1/competitions/:id/participants`
  - Paginated list of registered users
- [x] **T4.8** Seed database with sample competition data
  - At least 3 competitions in different states (upcoming, active, ended)
- [x] **T4.9** Competition status auto-update logic
  - Computed dynamically via virtual field at query time (no stale data)

---

## Phase 5 — Competition Details Screen (Frontend)

- [x] **T5.1** Create `ICompetition` and `IRegistration` TypeScript interfaces
- [x] **T5.2** Create API service functions
  - `getCompetition(id)`, `registerForCompetition(id)`, `withdrawFromCompetition(id)`
  - `getCompetitionParticipants(id)`
- [x] **T5.3** Setup React Query for competition data fetching
  - `useCompetition(id)` hook with loading/error states
  - Auto-refetch on window focus
- [x] **T5.4** Build `CompetitionBanner` component
  - Full-width image, gradient overlay, back button
- [x] **T5.5** Build `StatusBadge` component
  - Color-coded, all status states
- [x] **T5.6** Build `StatsRow` component
  - Participants count, time remaining, entry fee chips
- [x] **T5.7** Build `SpotsProgressBar` component
  - Animated fill, warning color when low
- [x] **T5.8** Build `CountdownTimer` component
  - Real-time countdown with `setInterval`, days/hours/minutes/seconds
  - Cleans up interval on unmount
- [x] **T5.9** Build `RegistrationButton` component
  - All 5 states: register, registered, full, ended, upcoming
  - Loading state during API call
  - Haptic feedback
- [x] **T5.10** Build `ParticipantsPreview` component
  - Avatar stack + overflow count
- [x] **T5.11** Build `RulesSection` component
  - Collapsible accordion list
- [x] **T5.12** Assemble `CompetitionDetailsScreen`
  - Compose all sub-components
  - ScrollView layout matching design reference
  - Sticky registration button at bottom
- [x] **T5.13** Handle all UI states
  - Loading skeleton
  - Error state with retry button
  - Empty/not found state
- [x] **T5.14** Wire registration action
  - Call API on button press
  - Optimistic UI update
  - Show toast on success/error
  - Invalidate React Query cache on success

---

## Phase 6 — Competitions List Screen (Frontend)

- [x] **T6.1** Build `CompetitionCard` component (summary view)
- [x] **T6.2** Build `CompetitionsListScreen`
  - FlatList with pagination (infinite scroll or load more)
  - Pull-to-refresh
- [x] **T6.3** Connect list screen → detail screen navigation with competition ID

---

## Phase 7 — Polish & Edge Cases

- [x] **T7.1** Handle token expiry — auto logout on 401 response (Axios interceptor)
- [x] **T7.2** Offline / no network state handling
- [x] **T7.3** Validate all form inputs client-side
- [x] **T7.4** Test concurrent registration scenario (manual or automated)
- [x] **T7.5** Add rate limiting to registration endpoint (prevent spam)
- [x] **T7.6** Ensure no sensitive data (password hash) in any API response
- [x] **T7.7** Review and fix accessibility (labels, contrast, touch targets)
- [x] **T7.8** Test on both iOS and Android simulators

---

## Phase 8 — Documentation & Submission

- [x] **T8.1** Write `README.md`
  - Setup instructions (backend + frontend)
  - Environment variables list
  - Assumptions made
  - Key technical decisions
  - Trade-offs
  - Future improvements
- [ ] **T8.2** Record screen demo video (working registration flow, state changes)
  - Run `npx expo start`, open on simulator, record: login → list → tap card → register → see status change → withdraw
- [ ] **T8.3** Push final code to GitHub repository
  - `git init` → `git add .` → commit → push to new GitHub repo
  - Ensure `.env` is NOT committed (covered by .gitignore)
- [x] **T8.4** Final review of all submission requirements — 38/38 checks passed ✅

---

## Phase 9 — Competition Creation & Host Management (Option 3) ✅

- [x] **T9.1** (Backend) Implement `POST /api/v1/competitions`
  - Auth required; automatically set `hostId: req.user._id`
  - Input validation: title, description, category, dates, spots, rules
- [x] **T9.2** (Backend) Implement `PUT /api/v1/competitions/:id`
  - Verify current user is the host
  - Allow updating rules, dates, capacity, banner image, and status
- [x] **T9.3** (Backend) Implement `GET /api/v1/competitions/hosted/me` & `GET /api/v1/competitions/:id/admin-stats`
  - Return all competitions created by logged-in host
  - Aggregate statistics: registered users count, submissions count, spots filled
- [x] **T9.4** (Frontend) Build `CreateCompetitionScreen`
  - Multi-input form: title, category, description, banner URL, dates, spots, prize pool
  - Dynamic rules builder (add / remove rule items)
  - Validation and submission to `POST /api/v1/competitions`
- [x] **T9.5** (Frontend) Build `OrganizerDashboardScreen`
  - View all events hosted by current user
  - Metric chips: total participants, submissions received, competition status
  - Fast actions: manage event, review submissions
- [x] **T9.6** (Frontend) Navigation wiring
  - Add "Host Event" and "Organizer Dashboard" routes to `RootStackParamList`
  - Entry points from Competitions List header and Settings screen

---

## Phase 10 — Project Submission & Review System (Option 1) ✅

- [x] **T10.1** (Backend) Create `Submission` Mongoose model & schema
  - Fields: competitionId, userId, title, description, repositoryUrl, demoUrl, mediaUrl, status, score, feedback, isWinner, awardRank, upvotes, upvoteCount
  - Compound unique index on `{ competitionId, userId }` (one submission per participant)
- [x] **T10.2** (Backend) Implement `POST /api/v1/competitions/:id/submissions`
  - Auth required; verify user has an active registration
  - Validate repository URL, title, description
  - Create or update submission before deadline
- [x] **T10.3** (Backend) Implement `GET /api/v1/competitions/:id/submissions` & `GET /api/v1/competitions/:id/submissions/mine`
  - Paginated list of submissions with author details and upvote counts
  - Endpoint for participant to view their own submission status
- [x] **T10.4** (Backend) Implement `POST /api/v1/submissions/:id/upvote`
  - Atomic upvote toggle (`$addToSet` / `$pull` + `$inc` upvoteCount)
- [x] **T10.5** (Backend) Implement `PUT /api/v1/submissions/:id/evaluate` & `POST /api/v1/competitions/:id/finalize-winners`
  - Host authorization check
  - Grade submissions (score 0–100, feedback, assign winner podium rank)
- [x] **T10.6** (Frontend) Build `SubmitProjectModal` / `SubmitProjectScreen`
  - Form: title, description, GitHub repository URL, live demo link, media URL
  - Client-side URL validation & instant feedback
- [x] **T10.7** (Frontend) Build `SubmissionCard` component
  - Author avatar & name, project title, summary, GitHub & demo links, upvote button with count, winner badge
- [x] **T10.8** (Frontend) Integrate Submissions into `CompetitionDetailsScreen`
  - Segmented control / Tab bar: "Overview" vs "Submissions"
  - "Submit Project" action button for registered participants

---

## Phase 11 — Winners Showcase, Host Evaluation & Final Polish ✅

- [x] **T11.1** (Frontend) Build `WinnersPodium` component
  - Celebratory podium display (🥇 1st, 🥈 2nd, 🥉 3rd) on competition details when winners are declared
- [x] **T11.2** (Frontend) Build Host Evaluation interface in Organizer Dashboard
  - Host can review each submission, enter a score/feedback, and select podium winners
- [x] **T11.3** End-to-end verification across Mobile and Web
  - Test complete lifecycle: Create Competition → Register → Submit Project → Upvote → Host Evaluation → Winner Celebration
  - Verify TypeScript compilation and responsive UI on mobile and web

---

## Task Notes

- Tasks T4.5 and T5.14 are the most critical — concurrent registration handling is a key evaluation criterion
- T5.8 (countdown timer) should be tested for memory leaks (interval cleanup)
- T4.9 (status auto-update) can be done via a simple computed field approach first, then upgraded to a cron job if time permits
- Phase 9 & 10 transform Feedants into a complete end-to-end hackathon/competition ecosystem.
