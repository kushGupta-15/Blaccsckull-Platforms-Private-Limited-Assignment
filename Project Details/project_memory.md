# Project Memory

This file tracks the current state of the project. Update it as tasks are completed and decisions are made.

---

## Current Status

**Phase:** Phase 5 complete — ready to begin Phase 6 (Competitions List Screen)
**Last Updated:** 2026-09-22

---

## Completed Tasks

- [x] Planning documents
### Phase 1 ✅ | Phase 2 ✅ | Phase 3 ✅ | Phase 4 ✅

### Phase 5 — Competition Details Screen ✅
- [x] T5.1 — All interfaces in `types/index.ts` (`ICompetition`, `IRegistration`, etc.)
- [x] T5.2 — All API functions in `api/competitions.ts`
- [x] T5.3 — `useCompetition`, `useParticipants`, `useRegister`, `useWithdraw` hooks with React Query
- [x] T5.4 — `CompetitionBanner` — full-width image, gradient overlay, safe-area back button
- [x] T5.5 — `StatusBadge` — all 5 states color-coded with dot indicator
- [x] T5.6 — `StatsRow` — participants chip, time chip, entry fee chip
- [x] T5.7 — `SpotsProgressBar` — animated fill, color shifts warning/error when low/full
- [x] T5.8 — `CountdownTimer` — real-time DD:HH:MM:SS, interval cleaned up on unmount
- [x] T5.9 — `RegistrationButton` — all 5 states, loading spinner, auth-aware note
- [x] T5.10 — `ParticipantsPreview` — avatar stack with initials fallback + overflow count
- [x] T5.11 — `RulesSection` — collapsible accordion, shows first 3 then expand
- [x] T5.12 — `CompetitionDetailsScreen` — full assembly: banner → badge → title → host → dates → prize → stats → progress → timer → description → rules → participants → sticky button
- [x] T5.13 — Loading skeleton, error state with retry + back, pull-to-refresh
- [x] T5.14 — Register/withdraw wired with React Query mutations, toast on success/error, cache invalidation

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
