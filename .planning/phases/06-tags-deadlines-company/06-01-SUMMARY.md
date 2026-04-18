---
phase: 06-tags-deadlines-company
plan: "01"
subsystem: database
tags: [drizzle, sqlite, d1, zod, schema, tags, deadlines, company]

requires:
  - phase: 05-interview-tracking-notes
    provides: interview schema pattern, test setup with inline migration SQL
provides:
  - tag and application_tag tables for user-defined color-coded labels
  - deadline table for per-application deadline tracking with type enum
  - company table for persisted company research notes with domain deduplication
  - Zod validators for tag, deadline, and company CRUD
  - DEADLINE_TYPES, TAG_COLORS, SALARY_CURRENCIES constants
affects: [06-tags-deadlines-company, 08-calendar-analytics]

tech-stack:
  added: []
  patterns: [join table for many-to-many tags, domain-based company deduplication]

key-files:
  created:
    - src/db/schema/tag.ts
    - src/db/schema/deadline.ts
    - src/db/schema/company.ts
    - src/shared/validators/tag.ts
    - src/shared/validators/deadline.ts
    - src/shared/validators/company.ts
    - src/db/migrations/0004_round_gauntlet.sql
  modified:
    - src/db/schema/index.ts
    - src/shared/constants.ts
    - tests/setup.ts

key-decisions:
  - "Tag-application relationship via join table (application_tag) for many-to-many"
  - "Company deduplication by unique index on (userId, domain) with nullable domain"
  - "18 tag colors matching Tailwind color palette for consistent UI mapping"
  - "Salary currencies limited to INR/USD/EUR/GBP per SAL-02 requirements"

patterns-established:
  - "Join table pattern: application_tag with unique constraint on (applicationId, tagId)"
  - "Domain dedup: nullable domain column with unique index allows companies without domains"

requirements-completed: [TAG-01, TAG-02, DEAD-01, COMP-01, SAL-01, SAL-02]

duration: 3min
completed: 2026-04-18
---

# Phase 6 Plan 1: DB Schema for Tags, Deadlines & Company Summary

**Drizzle schema, migration, constants, and Zod validators for tag/application_tag/deadline/company tables with 18 color palette and 4 deadline types**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-18T18:16:14Z
- **Completed:** 2026-04-18T18:19:15Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments
- Four new D1 tables (tag, application_tag, deadline, company) with proper indexes and foreign keys
- Shared constants: DEADLINE_TYPES (4 types), TAG_COLORS (18 Tailwind colors), SALARY_CURRENCIES (4 currencies)
- Zod validators for all new entity create/update operations
- Drizzle migration 0004 generated and test setup updated with inline DDL

## Task Commits

Each task was committed atomically:

1. **Task 1: Schema definitions, constants, and validators** - `a12a6bd` (feat)
2. **Task 2: Drizzle migration and test setup update** - `9dbaa64` (chore)

## Files Created/Modified
- `src/db/schema/tag.ts` - Tag and ApplicationTag Drizzle table definitions
- `src/db/schema/deadline.ts` - Deadline table with type enum and due date
- `src/db/schema/company.ts` - Company table with domain deduplication
- `src/db/schema/index.ts` - Re-exports new schemas
- `src/shared/constants.ts` - DEADLINE_TYPES, TAG_COLORS, SALARY_CURRENCIES constants with labels
- `src/shared/validators/tag.ts` - createTag, updateTag, assignTag Zod schemas
- `src/shared/validators/deadline.ts` - createDeadline, updateDeadline Zod schemas
- `src/shared/validators/company.ts` - createCompany, updateCompany Zod schemas
- `src/db/migrations/0004_round_gauntlet.sql` - Migration SQL for 4 tables + 7 indexes
- `src/db/migrations/meta/0004_snapshot.json` - Drizzle migration metadata
- `tests/setup.ts` - Inline DDL updated with new table definitions

## Decisions Made
- Tag-application many-to-many via application_tag join table with unique constraint preventing duplicate assignments
- Company domain column is nullable with unique index on (userId, domain) -- companies without known domains can still exist
- 18 tag colors map directly to Tailwind color names for seamless frontend integration
- Salary currencies scoped to INR, USD, EUR, GBP per requirements (existing salary fields already in application table)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## Known Stubs
None - this plan is schema/migration only with no UI or data rendering.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Schema foundation complete for Phase 6 Plans 2-3 (service layer, routes, frontend)
- Tag CRUD service + routes next
- Deadline and company service + routes next
- Frontend tag picker, deadline manager, company panel in later plans

---
*Phase: 06-tags-deadlines-company*
*Completed: 2026-04-18*
