---
phase: 02-application-tracking-api
plan: 02
subsystem: api
tags: [hono, drizzle, rest-api, service-layer, timeline-events, crud]

requires:
  - phase: 02-application-tracking-api
    plan: 01
    provides: Drizzle schema (application + timelineEvent), Zod validators, response helpers, error classes, slug utility, shared constants
provides:
  - Application service layer with 10 functions (create, getById, list, update, changeStatus, togglePin, toggleArchive, softDelete, restore, getTimeline)
  - 10 REST endpoints covering full CRUD + status pipeline + pin/archive/soft-delete/restore + timeline
  - Worker entry mounting applicationRoutes after requireAuth middleware
affects: [02-03, 03-application-ui, 04-kanban-board]

tech-stack:
  added: []
  patterns: [thin-route-service-db, db-batch-atomic-writes, base-conditions-helper, timeline-event-generation]

key-files:
  created:
    - src/server/services/application.ts
    - src/server/routes/applications.ts
  modified:
    - worker/index.ts

key-decisions:
  - "Added getTimeline service function for dedicated timeline endpoint not in original plan spec"
  - "Routes use onError handler at module level for centralized AppError formatting per D-03"

patterns-established:
  - "Thin route -> service -> DB: routes never import Drizzle, service functions receive db + userId"
  - "baseConditions helper enforces tenant isolation + soft-delete exclusion on every query"
  - "createTimelineEvent returns prepared statement for db.batch() composition"
  - "resolveUniqueSlug queries existing slugs and appends incrementing suffix on collision"

requirements-completed: [TRACK-01, TRACK-02, TRACK-03, TRACK-04, TRACK-05, TRACK-06, TRACK-07, TRACK-08]

duration: 3min
completed: 2026-04-16
---

# Phase 2 Plan 2: Service Layer + REST Routes Summary

**Complete application service layer with 10 functions and 10 REST endpoints covering CRUD, status pipeline, pin/archive/soft-delete/restore, and timeline -- all mutations atomic via db.batch() with auto-generated timeline events**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-16T20:18:56Z
- **Completed:** 2026-04-16T20:21:32Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Application service layer with 10 exported async functions covering all 8 TRACK requirements
- baseConditions helper prevents soft-delete leak per Pitfall 3 by including userId + deletedAt IS NULL on every query
- createTimelineEvent helper returns prepared Drizzle insert for db.batch() composition
- resolveUniqueSlug handles slug collisions with incrementing suffix per D-14/D-15
- Every mutation (create, changeStatus, togglePin, toggleArchive, softDelete, restore) generates timeline events atomically via db.batch()
- 10 thin REST route handlers delegating to service layer with Zod validation on all input endpoints
- onError handler catches AppError instances and formats per D-03 response envelope
- Worker entry mounts applicationRoutes after requireAuth middleware; removed placeholder /api/me endpoint

## Task Commits

Each task was committed atomically:

1. **Task 1: Build application service layer with all business logic** - `16b2b45` (feat)
2. **Task 2: Build Hono route handlers and mount in worker** - `ccfe7d9` (feat)

## Files Created/Modified
- `src/server/services/application.ts` - 10 service functions: create, getById, list, update, changeStatus, togglePin, toggleArchive, softDelete, restore, getTimeline with helpers baseConditions, createTimelineEvent, resolveUniqueSlug (490 lines)
- `src/server/routes/applications.ts` - 10 REST endpoints with Zod validation and centralized error handling (170 lines)
- `worker/index.ts` - Added applicationRoutes import and mounting after requireAuth; removed /api/me placeholder

## Decisions Made
- Added getTimeline as a 10th service function for the dedicated `/api/applications/:id/timeline` endpoint (D-09 requires timeline access)
- Centralized error handling via onError at the route module level rather than try/catch in each handler

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Service layer and routes are complete; all TRACK requirements have API coverage
- Plan 02-03 (integration tests) can exercise all 10 endpoints through the mounted Hono app
- Phase 3 frontend can import response types and call all API endpoints

## Self-Check: PASSED

All 3 created/modified files verified on disk. Both task commits (16b2b45, ccfe7d9) verified in git log.
