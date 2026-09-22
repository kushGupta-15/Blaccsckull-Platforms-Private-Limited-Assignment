# Project Memory

This file tracks the current state of the project. Update it as tasks are completed and decisions are made.

---

## Current Status

**Phase:** Phase 2 complete — ready to begin Phase 3 (Auth Frontend)
**Last Updated:** 2026-09-22

---

## Completed Tasks

- [x] Planning documents (prd, architecture, rules, design, tasks, memory)

### Phase 1 ✅
- [x] T1.1 — T1.6 (full backend + frontend scaffold, MongoDB Atlas connected)

### Phase 2 — Authentication Backend ✅
- [x] T2.1 — `User` Mongoose model (`name`, `email`, `passwordHash`, `avatar`), `passwordHash` excluded from all queries by default, `comparePassword()` instance method
- [x] T2.2 — `POST /api/v1/auth/register` — validates name/email/password, bcrypt hash (12 rounds), returns JWT + user (no hash)
- [x] T2.3 — `POST /api/v1/auth/login` — validates credentials, generic error message (prevents user enumeration), returns JWT
- [x] T2.4 — `GET /api/v1/auth/me` — protected, returns current user profile
- [x] T2.5 — `protect` + `optionalAuth` JWT middleware (already in Phase 1, fully wired)

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
