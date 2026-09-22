# Project Memory

This file tracks the current state of the project. Update it as tasks are completed and decisions are made.

---

## Current Status

**Phase:** Phase 8 complete (T8.2 + T8.3 require manual action)
**Last Updated:** 2026-09-23

---

## Completed Tasks

- [x] All phases 1–7 complete
### Phase 8 — Documentation & Submission ✅ (automatable parts)
- [x] T8.1 — `README.md` written with full setup instructions, env vars, assumptions, decisions, trade-offs, and future improvements
- [ ] T8.2 — **Manual:** Record screen demo (`npx expo start` → login → list → details → register → withdraw)
- [ ] T8.3 — **Manual:** Push to GitHub (`git init && git add . && git commit && git push`)
- [x] T8.4 — Final review: 38/38 submission checks passed ✅

---

## Completed Tasks

- [x] Planning + Phase 1 ✅ + Phase 2 ✅ + Phase 3 ✅ + Phase 4 ✅ + Phase 5 ✅ + Phase 6 ✅

### Phase 7 — Polish & Edge Cases ✅
- [x] T7.1 — Axios 401 interceptor auto-clears SecureStore + triggers logout (done in Phase 3)
- [x] T7.2 — `useNetworkStatus` hook (fetch polling + AppState listener) + `OfflineBanner` animated slide-in, wired in `App.tsx`
- [x] T7.3 — Client-side validation: email regex, password strength (length/uppercase/number), confirm match, name length (done in Phase 3)
- [x] T7.4 — `testConcurrency.ts` script: 10 simultaneous registrations, 4 assertions (no 5xx, successes=decrement, no overbook, no negative count) — all pass ✅
- [x] T7.5 — `rateLimiter.ts`: `authLimiter` (10/15min on login+register), `registrationActionLimiter` (5/15min on POST register) — 429 verified
- [x] T7.6 — `passwordHash` has `select:false` + `toJSON` transform strip — never in any API response (verified)
- [x] T7.7 — `accessibilityLabel`, `accessibilityRole`, `accessibilityState`, `accessibilityLiveRegion` present in all 10 key components/screens
- [x] T7.8 — Manual step: run `npx expo start` and test on iOS/Android simulator

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
