# Project Memory

This file tracks the current state of the project. Update it as tasks are completed and decisions are made.

---

## Current Status

**Phase:** Phase 3 complete — ready to begin Phase 4 (Competition Backend)
**Last Updated:** 2026-09-22

---

## Completed Tasks

- [x] Planning documents (prd, architecture, rules, design, tasks, memory)

### Phase 1 ✅
- [x] T1.1 — T1.6 (full backend + frontend scaffold, MongoDB Atlas connected)

### Phase 2 ✅
- [x] T2.1 — T2.5 (User model, register, login, /me, JWT middleware)

### Phase 3 — Authentication Frontend ✅
- [x] T3.1 — Zustand `authStore` with `setAuth`, `logout`, `restoreSession` (done in Phase 1)
- [x] T3.2 — `LoginScreen` — email/password form, client-side validation, error alerts, gradient button
- [x] T3.3 — `RegisterScreen` — name/email/password/confirm form, focus chain via refs, all validations
- [x] T3.4 — Both screens wired to `/api/v1/auth/register` and `/api/v1/auth/login`
- [x] T3.5 — JWT persisted via `expo-secure-store` in `authStore.setAuth()`
- [x] T3.6 — `App.tsx` calls `restoreSession()` on mount; spinner shown while loading
- [x] T3.7 — Auth-gated navigator: unauthenticated → Login/Register stack; Axios 401 interceptor triggers auto-logout

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
