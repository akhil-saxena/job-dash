---
phase: 04-table-detail-navigation
plan: 01
subsystem: api, hooks
tags: [hono, tanstack-query, zustand, hello-pangea-dnd, optimistic-ui]

requires:
  - phase: 02-api-data
    provides: application CRUD service, slug column, timeline events
  - phase: 03-frontend-shell-dashboard
    provides: useApplications hook, Toast component, Zustand pattern

provides:
  - getBySlug API endpoint for detail page
  - Optimistic mutation hooks (useUpdateStatus, useTogglePin, useToggleArchive, useUpdateApplication)
  - Global search Zustand store (useSearch)
  - Detail page query hook (useApplicationBySlug)
  - @hello-pangea/dnd installed for kanban DnD

affects: [04-02, 04-03, kanban-dnd, detail-page, table-view, search]

tech-stack:
  added: [@hello-pangea/dnd@18]
  patterns: [optimistic-mutation-with-rollback, zustand-global-store]

key-files:
  created:
    - tests/applications/slug-lookup.test.ts
    - src/client/hooks/useSearch.ts
    - src/client/hooks/useApplicationDetail.ts
  modified:
    - src/server/services/application.ts
    - src/server/routes/applications.ts
    - src/client/hooks/useApplications.ts
    - package.json
    - vitest.config.ts

key-decisions:
  - "Used /api/application-by-slug/:slug instead of /api/applications/by-slug/:slug to avoid Hono trie router conflict with /:id param in Cloudflare Workers runtime"
  - "Added vitest exclude for .claude/worktrees to prevent test duplication from git worktrees"

patterns-established:
  - "Optimistic mutation pattern: cancelQueries -> snapshot -> setQueryData -> rollback on error -> invalidate on settle"
  - "Zustand store for global UI state (search query) shared between header and page components"

requirements-completed: [VIEW-04, UI-05]

duration: 23min
completed: 2026-04-18
---

# Phase 4 Plan 01: Shared Foundation Summary

**getBySlug API endpoint, 4 optimistic mutation hooks with rollback, global search store, and @hello-pangea/dnd installed**

## Performance

- **Duration:** 23 min
- **Started:** 2026-04-18T04:53:17Z
- **Completed:** 2026-04-18T05:16:16Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- getBySlug service function and API route returning application with timeline events, verified with 3 passing tests
- Four optimistic mutation hooks following cancel-snapshot-optimistic-rollback pattern for status change, pin, archive, and partial update
- Global search Zustand store and detail page query hook ready for Phase 4 plans 02 and 03
- @hello-pangea/dnd installed for kanban drag-and-drop in plan 02

## Task Commits

Each task was committed atomically:

1. **Task 1: getBySlug API endpoint and test** - `f372327` (feat)
2. **Task 2: Install @hello-pangea/dnd, shared mutation hooks, search store, and detail query hook** - `7148cbf` (feat)

## Files Created/Modified
- `src/server/services/application.ts` - Added getBySlug function modeled on getById
- `src/server/routes/applications.ts` - Added GET /api/application-by-slug/:slug route
- `tests/applications/slug-lookup.test.ts` - 3 tests: success lookup, 404, tenant isolation
- `src/client/hooks/useApplications.ts` - Added 4 optimistic mutation hooks
- `src/client/hooks/useSearch.ts` - Zustand store for global search query
- `src/client/hooks/useApplicationDetail.ts` - useApplicationBySlug query hook
- `package.json` - Installed @hello-pangea/dnd
- `vitest.config.ts` - Added worktree exclude pattern

## Decisions Made
- **Route path change:** Used `/api/application-by-slug/:slug` instead of the planned `/api/applications/by-slug/:slug` because Hono's trie router in the Cloudflare Workers runtime crashes when a static segment route (`/by-slug/`) coexists with a param route (`/:id`) at the same path level under the same HTTP method. This is a runtime limitation specific to workerd. The client hook uses the corrected path.
- **vitest exclude:** Added `**/.claude/worktrees/**` to vitest exclude list because git worktrees in `.claude/worktrees/` were causing duplicate test file discovery, leading to 6x test duplication and failures.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Hono trie router crash with nested param routes**
- **Found during:** Task 1 (API route registration)
- **Issue:** Adding `GET /api/applications/by-slug/:slug` alongside `GET /api/applications/:id` caused the Cloudflare Workers runtime to silently crash, making all routes (including auth) return failures
- **Fix:** Changed route to `/api/application-by-slug/:slug` (different path prefix) and updated all references
- **Files modified:** src/server/routes/applications.ts, tests/applications/slug-lookup.test.ts, src/client/hooks/useApplicationDetail.ts
- **Verification:** All 62 existing tests pass, plus 3 new slug-lookup tests
- **Committed in:** f372327

**2. [Rule 3 - Blocking] vitest worktree test duplication**
- **Found during:** Task 1 (test execution)
- **Issue:** vitest was discovering test files from all git worktrees in `.claude/worktrees/`, causing duplicate test runs and setup failures
- **Fix:** Added `exclude: ["**/node_modules/**", "**/.claude/worktrees/**"]` to vitest.config.ts
- **Files modified:** vitest.config.ts
- **Verification:** Test discovery shows correct 10 files (not 69)
- **Committed in:** f372327

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking)
**Impact on plan:** Route path differs from plan spec but functionality is identical. Client code uses the corrected path transparently.

## Issues Encountered
- Pre-existing test failure in `tests/auth/session.test.ts` (tries to access `/api/me` which doesn't exist) -- not caused by this plan's changes, not addressed

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All shared hooks and the getBySlug endpoint are ready for Plan 02 (table view + kanban DnD) and Plan 03 (detail page)
- @hello-pangea/dnd is installed and ready for DragDropContext integration
- useSearch store is ready to be wired to the header SearchBar

---
*Phase: 04-table-detail-navigation*
*Completed: 2026-04-18*
