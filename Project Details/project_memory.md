# Project Memory

This file tracks the current state of the project. Update it as tasks are completed and decisions are made.

---

## Current Status

**Phase:** Phase 9 (Host Dashboard & Competition Creation) & Phase 10 (Project Submission & Community Upvoting) & Phase 11 (Winners Showcase & Host Evaluation) completed and fully verified! 🚀🏆
**Last Updated:** 2026-10-06

---

## Decisions Made

| Date | Decision | Reason |
|---|---|---|
| 2026-09-22 | Use Expo (managed workflow) for React Native | Faster setup, easier cross-platform testing, good for internship assignment scope |
| 2026-09-22 | Use Zustand for global state | Lightweight, minimal boilerplate, no context provider nesting issues |
| 2026-09-22 | Use React Query for server state | Handles caching, loading/error states, background refetch out of the box |
| 2026-09-22 | Compute competition status dynamically | Simpler than a cron job, eliminates stale status bugs; recalculate at query time based on dates |
| 2026-09-22 | Atomic `findOneAndUpdate` for registration | Safely handles concurrent users without distributed locking complexity |
| 2026-09-22 | JWT in Authorization header (not cookies) | Standard for React Native apps, simpler CORS handling |
| 2026-10-06 | Universal appStorage adapter (SecureStore + localStorage) | Enables seamless deployment across Native iOS/Android and Web browsers |
| 2026-10-06 | Implement Project Submissions & Review (Option 1) | Completes full hackathon lifecycle: register -> submit project -> peer upvote -> host grade -> winners |
| 2026-10-06 | Implement Host / Organizer Dashboard & Creator (Option 3) | Allows users to create events and manage participants & winners |

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
