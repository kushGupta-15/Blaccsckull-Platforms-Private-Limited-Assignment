# Project Memory

This file tracks the current state of the project. Update it as tasks are completed and decisions are made.

---

## Current Status

**Phase:** Phase 1 complete — ready to begin Phase 2 (Auth Backend)
**Last Updated:** 2026-09-22

---

## Completed Tasks

- [x] `prd.md` — Product requirements defined
- [x] `architecture.md` — System architecture and tech stack defined
- [x] `rules.md` — Coding standards and principles documented
- [x] `design.md` — UI design system documented
- [x] `tasks.md` — Full task breakdown created
- [x] `project_memory.md` — This file created

### Phase 1 — Project Setup & Infrastructure ✅
- [x] T1.1 — Backend project initialized (Node.js + Express + TypeScript, strict mode)
- [x] T1.2 — Frontend project initialized (Expo + React Native + TypeScript, manually scaffolded)
- [x] T1.3 — MongoDB connection config (`/backend/src/config/database.ts`)
- [x] T1.4 — `.env` + `.env.example` for backend; `app.json extra` for frontend env
- [x] T1.5 — Express app with helmet, cors, morgan, json parsing, error handler, 404 handler, `/api/v1/health`
- [x] T1.6 — React Navigation stack with typed `RootStackParamList`, placeholder screens, auth-gated routing

---

## In Progress

_None_

---

## Decisions Made

| Date | Decision | Reason |
|------|----------|--------|
| 2026-09-22 | Use Expo (managed workflow) for React Native | Faster setup, easier cross-platform testing, good for internship assignment scope |
| 2026-09-22 | Use Zustand for global state | Lightweight, minimal boilerplate, no context provider nesting issues |
| 2026-09-22 | Use React Query for server state | Handles caching, loading/error states, background refetch out of the box |
| 2026-09-22 | Compute competition status dynamically | Simpler than a cron job, eliminates stale status bugs; recalculate at query time based on dates |
| 2026-09-22 | Atomic `findOneAndUpdate` for registration | Safely handles concurrent users without distributed locking complexity |
| 2026-09-22 | JWT in Authorization header (not cookies) | Standard for React Native apps, simpler CORS handling |
| 2026-09-22 | Manually scaffold frontend instead of create-expo-app | CLI timed out in the environment; manual scaffold is faster and gives full control |

---

## Known Issues / Blockers

_None currently_

---

## Architecture Notes

- The `registeredCount` field on competitions is the ground truth for spots; it is only modified atomically
- Competition status is derived at read time: if `endDate < now` → `ended`, if `startDate > now` → `upcoming`, if `registeredCount >= totalSpots` → `full`, otherwise → `active`
- The unique index on `{ userId, competitionId }` in registrations is the last-line-of-defense against duplicate registrations

---

## Future Improvements (Post-Submission)

- Admin panel for managing competitions
- WebSocket-based live spot count updates
- Push notifications for competition reminders
- Payment integration for paid competitions
- Leaderboard screen for ongoing competitions
- Social features (invite friends, share competition)
