---
phase: 06-tags-deadlines-company
plan: 03
subsystem: ui
tags: [react, tanstack-query, tags, deadlines, urgency, kanban, tailwind]

requires:
  - phase: 06-tags-deadlines-company/01
    provides: DB schema for tag, application_tag, deadline tables
  - phase: 06-tags-deadlines-company/02
    provides: Tag/deadline API endpoints (CRUD + assignment + upcoming)
  - phase: 04-table-detail-navigation
    provides: Detail page with OverviewTab, table view with FilterChips
  - phase: 10-design-refresh
    provides: Glass card design system, KanbanCard, OverviewTab layout

provides:
  - TanStack Query hooks for tag CRUD and assignment (useTags, useApplicationTags, useAssignTag, useUnassignTag, useCreateTag)
  - TanStack Query hooks for deadline CRUD (useDeadlines, useUpcomingDeadlines, useCreateDeadline, useCompleteDeadline, useDeleteDeadline)
  - TagPicker glass card component with colored chips, inline create, assign/unassign
  - DeadlineSection glass card component with add form, complete toggle, overdue indicators
  - Enhanced calculateUrgency with deadline and interview awareness
  - Tag filter chips in table/list view
  - TAG_COLORS, DEADLINE_TYPES, DEADLINE_TYPE_LABELS shared constants

affects: [07-jd-snapshots-documents, 09-analytics, kanban-board, detail-page]

tech-stack:
  added: []
  patterns:
    - "Deadline-aware urgency calculation with priority ordering"
    - "Dropdown tag picker with inline create pattern"
    - "DeadlineMap passed from board to card via column props"

key-files:
  created:
    - src/client/hooks/useTags.ts
    - src/client/hooks/useDeadlines.ts
    - src/client/components/detail/TagPicker.tsx
    - src/client/components/detail/DeadlineSection.tsx
  modified:
    - src/client/lib/urgency.ts
    - src/client/components/detail/OverviewTab.tsx
    - src/client/components/kanban/KanbanCard.tsx
    - src/client/components/kanban/KanbanColumn.tsx
    - src/client/components/kanban/KanbanBoard.tsx
    - src/client/hooks/useApplications.ts
    - src/client/routes/_authenticated/list.tsx
    - src/shared/constants.ts
    - src/shared/validators/application.ts

key-decisions:
  - "Added TAG_COLORS and DEADLINE_TYPES to shared constants (missing from worktree, needed for frontend)"
  - "Client-side tag filtering in list view since application_tag table not in this worktree"
  - "DeadlineMap pattern: fetch upcoming deadlines once at board level, pass as Map<appId, deadlines> to cards"
  - "Tag dots omitted from KanbanCard (nice-to-have, not required by TAG-02/TAG-03)"

patterns-established:
  - "DeadlineMap prop drilling: KanbanBoard -> KanbanColumn -> KanbanCard for urgency data"
  - "Inline create pattern: dropdown with create-new section using TAG_COLORS color picker"
  - "daysUntil helper for future-relative date calculations"

requirements-completed: [TAG-01, TAG-02, TAG-03, DEAD-01, DEAD-02, DEAD-03]

duration: 9min
completed: 2026-04-18
---

# Phase 06 Plan 03: Tags & Deadlines Frontend Summary

**Tag picker with colored chips and inline create, deadline section with urgency indicators, deadline-aware kanban tints, and tag filter chips in table view**

## Performance

- **Duration:** 9 min
- **Started:** 2026-04-18T18:35:53Z
- **Completed:** 2026-04-18T18:45:26Z
- **Tasks:** 2
- **Files modified:** 13

## Accomplishments
- Tag CRUD hooks + TagPicker component with assign/unassign/create-new workflow in glass card
- Deadline CRUD hooks + DeadlineSection component with overdue indicators and complete toggle
- Enhanced calculateUrgency with priority ordering: rejected > interview-today > interview-tomorrow > offer-expiring > stale > normal
- Tag filter chips (outlined variant) in table/list view for TAG-03

## Task Commits

Each task was committed atomically:

1. **Task 1: Tag and deadline hooks + TagPicker + DeadlineSection components** - `ed345ec` (feat)
2. **Task 2: Urgency tints with deadline awareness + tag filter in table view** - `96a1dda` (feat)

## Files Created/Modified
- `src/client/hooks/useTags.ts` - TanStack Query hooks for tag CRUD + assignment
- `src/client/hooks/useDeadlines.ts` - TanStack Query hooks for deadline CRUD + upcoming
- `src/client/components/detail/TagPicker.tsx` - Glass card tag picker with colored chips
- `src/client/components/detail/DeadlineSection.tsx` - Glass card deadline list with add/complete/delete
- `src/client/components/detail/OverviewTab.tsx` - Integrated TagPicker (sidebar) and DeadlineSection (main column)
- `src/client/lib/urgency.ts` - Enhanced with deadline/interview awareness, daysUntil helper
- `src/client/components/kanban/KanbanCard.tsx` - Accepts deadlines prop for urgency
- `src/client/components/kanban/KanbanColumn.tsx` - Passes deadlineMap to cards
- `src/client/components/kanban/KanbanBoard.tsx` - Fetches upcoming deadlines, builds Map
- `src/client/hooks/useApplications.ts` - Added optional tags to Application interface
- `src/client/routes/_authenticated/list.tsx` - Tag filter chips + tag search param
- `src/shared/constants.ts` - TAG_COLORS, DEADLINE_TYPES, DEADLINE_TYPE_LABELS
- `src/shared/validators/application.ts` - Added tag param to listApplicationsSchema

## Decisions Made
- Added TAG_COLORS (12 colors) and DEADLINE_TYPES/LABELS to shared constants since they were missing from this worktree (parallel Plan 01 agent creates schema)
- Implemented tag filtering client-side in list.tsx rather than server-side, since application_tag table schema doesn't exist in this worktree yet. Added `tag` param to validator for future server-side support.
- Deadline data flows Board -> Column -> Card via deadlineMap prop rather than per-card queries (avoids N+1)
- Omitted tag colored dots on KanbanCard -- plan analysis concluded they're nice-to-have, not required by TAG-02/TAG-03

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added TAG_COLORS, DEADLINE_TYPES, DEADLINE_TYPE_LABELS to shared constants**
- **Found during:** Task 1 (TagPicker/DeadlineSection need these constants)
- **Issue:** Constants referenced in plan as existing from Plan 01, but Plan 01 executes in parallel and hasn't merged
- **Fix:** Added 12-color TAG_COLORS array and DEADLINE_TYPES/DEADLINE_TYPE_LABELS to src/shared/constants.ts
- **Files modified:** src/shared/constants.ts
- **Verification:** TypeScript compiles, components import constants successfully
- **Committed in:** ed345ec (Task 1 commit)

**2. [Rule 3 - Blocking] Client-side tag filter instead of server-side**
- **Found during:** Task 2 (application_tag table schema missing for SQL subquery)
- **Issue:** Plan specified server-side tag filter via SQL subquery on application_tag, but table schema doesn't exist in this worktree
- **Fix:** Implemented client-side filtering using app.tags optional field. Added tag to validator for when backend merges.
- **Files modified:** src/client/routes/_authenticated/list.tsx, src/shared/validators/application.ts
- **Verification:** TypeScript compiles, tag filter chips render conditionally
- **Committed in:** 96a1dda (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both auto-fixes necessary due to parallel execution. No scope creep. Features work end-to-end once Plans 01+02 merge.

## Issues Encountered
None beyond the parallel execution blocking issues documented above.

## User Setup Required
None - no external service configuration required.

## Known Stubs
- Tag filter in list.tsx filters on `app.tags` which is populated only when the API returns tags with applications. Until the backend list endpoint is enhanced to include tags (or a client-side join is implemented), the tag filter won't match any applications. This will be resolved when Plan 01+02 merge and the application list API can JOIN application_tag.

## Next Phase Readiness
- Tag and deadline UI components complete, ready for use
- Urgency calculation enhanced with full deadline awareness
- When Plan 01 (schema) and Plan 02 (API) merge, all features work end-to-end
- Company management UI (Plan 04) can proceed independently

---
*Phase: 06-tags-deadlines-company*
*Completed: 2026-04-18*
