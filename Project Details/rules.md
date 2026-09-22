# Project Rules & Standards

## General Principles

1. **Dynamic over static** — No hardcoded competition data anywhere in the app. All data comes from the API.
2. **Separation of concerns** — UI logic stays in components/screens, business logic stays in services/controllers.
3. **Type safety everywhere** — Use TypeScript strictly. No `any` types unless absolutely unavoidable (document why).
4. **Fail gracefully** — Every API call must handle loading, error, and empty states in the UI.
5. **Security by default** — Sanitize all inputs, validate on both client and server, never trust client data.
6. **Scalability mindset** — Design DB queries and API responses as if 10,000 users are online simultaneously.
7. **DRY (Don't Repeat Yourself)** — Extract repeated logic into reusable hooks, utilities, and components.
8. **KISS (Keep It Simple)** — Don't over-engineer. Add complexity only when the problem demands it.

---

## Technology & Coding Standards

### TypeScript
- Enable `strict: true` in `tsconfig.json`
- Define interfaces/types in `/types` folder
- Use `interface` for object shapes, `type` for unions/intersections
- Name interfaces with a prefix `I` (e.g., `ICompetition`, `IUser`)

### React Native (Frontend)
- Use functional components only — no class components
- Use custom hooks to encapsulate data-fetching and business logic
- Use React Query for all server state (not `useState` + `useEffect` for API calls)
- Keep screens thin — screens compose components, they don't contain raw JSX logic
- Use `StyleSheet.create()` for all styles — no inline style objects in JSX
- All images must have `accessibilityLabel`
- Use `KeyboardAvoidingView` on forms
- Handle both Android and iOS differences explicitly where they exist

### Node.js / Express (Backend)
- Use async/await — no raw Promise chains or callbacks
- All routes must go through auth middleware where applicable
- All request bodies must be validated with `express-validator` before reaching the controller
- Controllers only call services — no DB logic in controllers
- Services contain all business logic and DB interactions
- Always return consistent JSON response shape:
  ```json
  { "success": true, "data": {}, "message": "optional" }
  { "success": false, "error": "message", "details": [] }
  ```
- HTTP status codes must be semantically correct (200, 201, 400, 401, 403, 404, 409, 500)

### MongoDB / Mongoose
- Define all schemas with explicit types and validators
- Use `timestamps: true` on all schemas
- Index frequently queried fields (email, competitionId, userId)
- Use compound unique index on `{ userId, competitionId }` in registrations
- Atomic operations (`$inc`, `findOneAndUpdate`) for counters — never read-modify-write
- Never return password hash in any API response (use `.select('-passwordHash')`)

### API Design
- RESTful conventions: nouns not verbs, plural resources
- Versioning via URL: `/api/v1/...` (start with v1)
- Pagination on list endpoints: `?page=1&limit=20`
- Use ISO 8601 dates everywhere
- JWT tokens in `Authorization: Bearer <token>` header

### Environment & Config
- All secrets and config in `.env` files — never commit `.env`
- Provide a `.env.example` with all required keys (no values)
- Use `dotenv` on the backend, Expo's `Constants.expoConfig.extra` on the frontend

---

## Project Structure Rules

- One component per file
- File names match the component/function they export (PascalCase for components, camelCase for utils)
- Group by feature, not by type where it makes sense in screens
- Keep `/components` for generic, reusable UI elements only
- Screen-specific sub-components live inside the screen's folder
- All API call functions live in `/api` — never call axios directly from a component

---

## Git & Collaboration
- Commit messages follow Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
- One logical change per commit
- Feature branches: `feat/competition-details`, `feat/auth`, etc.

---

## Error Handling
- Frontend: Every React Query hook must define `onError` or display error UI
- Backend: Use a centralized error handler middleware
- Log errors server-side with enough context to debug
- Never expose stack traces or internal errors to the client in production

---

## Performance Guidelines
- Paginate all list endpoints
- Use lean queries (`.lean()`) in Mongoose for read-only operations
- Cache competition data where appropriate (React Query's staleTime)
- Avoid N+1 queries — use `populate()` or aggregation pipelines
