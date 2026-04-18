---
phase: 04-table-detail-navigation
plan: 02
subsystem: ui
tags: [react, tanstack-router, zustand, dnd, glass-table, filter-chips, search, cmd-k]

# Dependency graph
requires:
  - phase: 04-01
    provides: shared hooks (useApplications, useSearch, useUpdateStatus), @hello-pangea/dnd installed
  - phase: 03-frontend-shell-dashboard
    provides: design system components (Card, Badge, FilterChips, SearchBar, CompanyBadge), layout, kanban
provides:
  - Kanban drag-and-drop with optimistic status changes
  - Desktop glass table with 7 sortable columns
  - Mobile glass card list for sub-768px viewports
  - Tab-style filter chips with status counts
  - URL query param persistence for filter and sort state
  - Global search bar wired to Zustand store
  - Cmd+K keyboard shortcut to focus search
affects: [04-03-detail-page, 05-interviews, 06-companies]

# Tech tracking
tech-stack:
  added: [zod (search params validation)]
  patterns: [URL search param state via TanStack Router validateSearch, client-side sort/filter pipeline, Zustand global search integration]

key-files:
  created:
    - src/client/components/table/ApplicationTable.tsx
    - src/client/components/table/MobileCardList.tsx
    - src/client/components/table/SortableHeader.tsx
  modified:
    - src/client/routes/_authenticated/list.tsx
    - src/client/components/layout/Header.tsx
    - src/client/components/design-system/SearchBar.tsx
    - src/client/components/kanban/KanbanBoard.tsx
    - src/client/components/kanban/KanbanColumn.tsx
    - src/client/components/kanban/KanbanCard.tsx

key-decisions:
  - "Used Link-wrapping-tr pattern with colSpan for table row navigation instead of onClick handler"
  - "Sort toggle cycles asc -> desc -> clear for intuitive UX"
  - "Filter chip counts computed from unfiltered app list so counts remain stable during search"

patterns-established:
  - "URL search params: use Zod schema with validateSearch for type-safe URL state"
  - "Client-side filtering pipeline: status filter -> search query filter -> sort"
  - "Zustand global search: useSearch store shared between Header and list page"

requirements-completed: [VIEW-02, UI-05]

# Metrics
duration: 3min
completed: 2026-04-16
---

# Phase 4 Plan 2: Kanban DnD + Glass Table + Search Summary

**Kanban drag-and-drop with optimistic status changes, sortable glass table with filter chips, mobile card list, and Cmd+K global search**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-16T11:08:57Z
- **Completed:** 2026-04-16T11:11:40Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Kanban cards are draggable between columns with optimistic status change via useUpdateStatus mutation (Task 1, prior commit)
- Desktop glass table with 7 sortable columns (Company, Role, Status, Priority, Source, Applied, Days) inside a glass container
- Mobile card list with glass cards replaces table on viewports below 768px
- Tab-style filter chips above table with per-status counts, persisted in URL query params
- Global search bar wired to Zustand useSearch store, filters by company name and role title
- Cmd+K (Mac) / Ctrl+K (other) keyboard shortcut focuses the search input

## Task Commits

Each task was committed atomically:

1. **Task 1: Kanban drag-and-drop with optimistic status changes** - `faee21f` (feat)
2. **Task 2: Table/list view, filter chips, global search, and Cmd+K** - `2f4d367` (feat)

**Plan metadata:** pending (docs: complete plan)

## Files Created/Modified
- `src/client/components/kanban/KanbanBoard.tsx` - DragDropContext wrapping desktop grid, handleDragEnd for status changes
- `src/client/components/kanban/KanbanColumn.tsx` - Droppable wrapper with drag-over highlight
- `src/client/components/kanban/KanbanCard.tsx` - Draggable card with click-to-navigate, drag visual
- `src/client/components/table/ApplicationTable.tsx` - Desktop glass table with 7 sortable columns
- `src/client/components/table/MobileCardList.tsx` - Mobile glass card list with CompanyBadge + status Badge
- `src/client/components/table/SortableHeader.tsx` - Clickable column header with sort arrow icons
- `src/client/routes/_authenticated/list.tsx` - Full list page with filter chips, table/card toggle, search, URL params
- `src/client/components/layout/Header.tsx` - Wired SearchBar to useSearch store, added Cmd+K handler
- `src/client/components/design-system/SearchBar.tsx` - Added id="global-search" for keyboard shortcut targeting

## Decisions Made
- Used Link-wrapping-tr with colSpan for row-level navigation rather than per-cell links or onClick handlers -- simpler markup and accessible
- Sort toggle cycles through asc -> desc -> clear (remove params) for intuitive column sort behavior
- Filter chip counts use the full unfiltered list so status counts remain stable while user types in search
- Table rows use flex layout within a single colSpan cell for precise column width control without table-layout constraints

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-existing auth session test failure (404 on /api/auth/me) unrelated to this plan's changes -- not addressed

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Detail page route at /app/$slug ready for Plan 03 implementation
- useUpdateStatus, useTogglePin, useToggleArchive hooks available for detail page actions
- Search and navigation patterns established for reuse

---
*Phase: 04-table-detail-navigation*
*Completed: 2026-04-16*
