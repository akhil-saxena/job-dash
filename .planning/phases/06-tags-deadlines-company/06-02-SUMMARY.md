---
phase: 06-tags-deadlines-company
plan: "02"
subsystem: api
tags: [hono, drizzle, crud, tags, deadlines, company, service-layer]

requires:
  - phase: 06-tags-deadlines-company
    provides: tag, deadline, company Drizzle schemas and Zod validators
provides:
  - Tag CRUD service with assign/unassign for application-tag many-to-many
  - Deadline CRUD service with upcoming list for urgency tracking
  - Company CRUD service with domain-based deduplication via findOrCreate
  - Hono API routes for all three entities mounted in worker
  - Integration tests covering 36 scenarios
affects: [06-tags-deadlines-company, frontend-tag-picker, frontend-deadline-manager, frontend-company-panel]

tech-stack:
  added: []
  patterns: [service-layer CRUD pattern, flat Hono route paths for trie router, findOrCreate domain dedup]

key-files:
  created:
    - src/server/services/tag.ts
    - src/server/services/deadline.ts
    - src/server/services/company.ts
    - src/server/routes/tags.ts
    - src/server/routes/deadlines.ts
    - src/server/routes/companies.ts
    - tests/tags/crud.test.ts
    - tests/deadlines/crud.test.ts
    - tests/companies/crud.test.ts
  modified:
    - worker/index.ts

key-decisions:
  - "Company findOrCreate returns { company, created } to let frontend differentiate new vs existing"
  - "Flat route paths for deadlines (/api/deadlines/:deadlineId) per Phase 4 Hono trie router decision"
  - "Tag assignment silently ignores duplicates instead of erroring (idempotent)"
  - "Upcoming deadlines filtered by isCompleted=false AND dueDate >= now"

patterns-established:
  - "findOrCreate pattern: check by domain first, create if not found, return created flag"
  - "Tag assignment idempotency: check existing before insert, return existing row on duplicate"

requirements-completed: [TAG-01, TAG-02, TAG-03, DEAD-01, COMP-01, COMP-02, COMP-03]

duration: 4min
completed: 2026-04-18
---

# Phase 6 Plan 2: Service Layer & API Routes for Tags, Deadlines, Companies Summary

**Full CRUD services and Hono routes for tags (with assign/unassign), deadlines (with upcoming list), and companies (with domain dedup findOrCreate), backed by 36 integration tests**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-18T18:24:22Z
- **Completed:** 2026-04-18T18:29:13Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- Three service files implementing full CRUD with tenant isolation for tags, deadlines, and companies
- Tag service supports assign/unassign/getTagsForApplication for many-to-many relationship
- Deadline service includes listUpcoming for cross-application urgency tracking
- Company service implements findOrCreate with domain-based deduplication (COMP-01)
- Three Hono route files with zValidator integration for request body validation
- Worker index updated to mount tagRoutes, deadlineRoutes, companyRoutes after requireAuth
- 36 integration tests covering CRUD, assignment, dedup, tenant isolation, and error cases

## Task Commits

Each task was committed atomically:

1. **Task 1: Service layer for tags, deadlines, companies** - `aff4e94` (feat)
2. **Task 2: Hono routes, worker mount, integration tests** - `5ab84d3` (feat)

## Files Created/Modified
- `src/server/services/tag.ts` - Tag CRUD + assign/unassign service (8 exported functions)
- `src/server/services/deadline.ts` - Deadline CRUD + upcoming service (6 exported functions)
- `src/server/services/company.ts` - Company CRUD + findOrCreate + getByDomain (6 exported functions)
- `src/server/routes/tags.ts` - Hono routes for /api/tags and /api/applications/:appId/tags
- `src/server/routes/deadlines.ts` - Hono routes for /api/deadlines and /api/applications/:appId/deadlines
- `src/server/routes/companies.ts` - Hono routes for /api/companies
- `worker/index.ts` - Added imports and route mounts for tagRoutes, deadlineRoutes, companyRoutes
- `tests/tags/crud.test.ts` - 15 tests: CRUD, duplicate rejection, assignment, unassignment, tenant isolation
- `tests/deadlines/crud.test.ts` - 11 tests: CRUD, upcoming list, completion, tenant isolation
- `tests/companies/crud.test.ts` - 11 tests: findOrCreate, domain dedup, notes persistence, tenant isolation

## Decisions Made
- Company findOrCreate returns `{ company, created }` object to let the frontend differentiate between newly created and existing companies
- Used flat route paths for deadlines (`/api/deadlines/:deadlineId`) per Phase 4 decision on Hono trie router compatibility
- Tag assignment is idempotent: assigning an already-assigned tag silently returns the existing record
- Upcoming deadlines are filtered by `isCompleted=false AND dueDate >= now`, ordered by dueDate ASC

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## Known Stubs
None - all service functions and routes are fully implemented with working data access.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- API layer complete for Phase 6 Plans 3-4 (frontend tag picker, deadline manager, company panel)
- All endpoints protected by requireAuth middleware via worker mount
- Tag assignment endpoints ready for kanban card tag management
- Upcoming deadlines endpoint ready for urgency tinting on dashboard

## Self-Check: PASSED

All 9 created files verified on disk. Both commit hashes (aff4e94, 5ab84d3) found in git log. 36 integration tests pass.

---
*Phase: 06-tags-deadlines-company*
*Completed: 2026-04-18*
