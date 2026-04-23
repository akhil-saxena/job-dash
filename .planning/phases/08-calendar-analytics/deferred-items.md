# Phase 08 — Deferred Items

Pre-existing issues discovered during 08-01 execution but unrelated to the Calendar view. Logged here per GSD scope-boundary rule; do NOT fix inside 08-01.

## tests/auth/session.test.ts — session cookie returns 404 instead of 200

- **File:** `tests/auth/session.test.ts:52`
- **Expected:** Session cookie from sign-in allows access to protected endpoints (200 on `/api/me` or equivalent).
- **Actual:** 404 on the protected endpoint — likely the `/api/me` or `/api/auth/me` route that the test targets no longer exists, or was renamed in a prior phase.
- **Confirmed pre-existing:** Reproduced on commit `624e013` before any Task 2 changes were staged (via `git stash && npx vitest run tests/auth/session.test.ts`).
- **Out of scope:** Not caused by 08-01 work (no changes to auth routes, middleware, or session plumbing). Track as a separate repair task.
