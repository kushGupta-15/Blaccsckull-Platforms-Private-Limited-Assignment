# Project Memory

This file tracks the current state of the project. Update it as tasks are completed and decisions are made.

---

## Current Status

**Phase:** Phase 4 complete — ready to begin Phase 5 (Competition Details Screen)
**Last Updated:** 2026-09-22

---

## Completed Tasks

- [x] Planning documents
### Phase 1 ✅ | Phase 2 ✅ | Phase 3 ✅

### Phase 4 — Competition Backend ✅
- [x] T4.1 — `Competition` model with `computedStatus` virtual (derived from dates + capacity, never stale)
- [x] T4.2 — `Registration` model with compound unique index `{ userId, competitionId }`
- [x] T4.3 — `GET /competitions` — paginated, status filter, text search
- [x] T4.4 — `GET /competitions/:id` — populated host, injects `userRegistrationStatus` when authed
- [x] T4.5 — `POST /competitions/:id/register` — atomic `findOneAndUpdate` spot decrement, duplicate + race condition safe
- [x] T4.6 — `DELETE /competitions/:id/register` — atomic counter increment on withdrawal
- [x] T4.7 — `GET /competitions/:id/participants` — paginated active registrations
- [x] T4.8 — 4 seed competitions (upcoming, active, ended, full) auto-seeded on first boot
- [x] T4.9 — Status computed dynamically via Mongoose virtual (no cron needed)

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
