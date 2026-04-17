# Phase 4: Table, Detail & Navigation - Context

**Gathered:** 2026-04-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Add the table/list view, full-page application detail with hero + tabs, drag-and-drop on kanban, optimistic UI, and global search. This phase makes the app interactive — users can drag cards, edit applications, and navigate between views.

</domain>

<decisions>
## Implementation Decisions

### Table/List View
- **D-01:** Desktop: glass table with sortable columns (Company, Role, Status, Priority, Source, Applied, Days). Click column header to sort.
- **D-02:** Mobile (< 768px): table hidden, glass card list shown instead (company badge + name/role + status badge + days).
- **D-03:** Filter chips above table: tab-style chips for status filters (All, Applied, Interviewing, Offer, etc.) with counts.
- **D-04:** Client-side sorting and filtering on loaded application data. URL query params preserve filter state across navigation.
- **D-05:** Search bar filters applications by company name and role title (client-side text match).

### Application Detail Page
- **D-06:** Full page (not sidebar), navigated via TanStack Router to `/app/:slug`.
- **D-07:** Sticky hero (Variant A — Dropdowns + Info Pills): company name big, role below, status dropdown + priority dropdown right-aligned, info pills (location, salary, days) below.
- **D-08:** No tags, source, or applied date in hero — those live in Overview tab.
- **D-09:** Tab bar (underline style): Overview, Interviews (count), JD, Docs (count), Timeline. Phase 4 implements Overview; other tabs are placeholders.
- **D-10:** Overview tab (O1): two-column grid — editable fields left (URL, location, salary), notes textarea right (markdown, auto-save placeholder). Company research section full-width below.
- **D-11:** Back button returns to previous view (kanban or table).
- **D-12:** Route loads application data via slug in route params. Use TanStack Router loader for data prefetching.

### Drag-and-Drop
- **D-13:** @hello-pangea/dnd for kanban drag-and-drop. Wrap columns as droppables, cards as draggables.
- **D-14:** Drag a card between columns = status change. Optimistic UI updates immediately, API confirms in background.
- **D-15:** On drag failure: rollback card to original column + show toast error.

### Optimistic UI
- **D-16:** TanStack Query optimistic updates pattern for: status change (drag), pin/unpin, archive/unarchive.
- **D-17:** Mutate local cache immediately on user action, fire API call in background, rollback cache on error.
- **D-18:** Toast notification on error: "Failed to update. Reverted." (uses existing Toast component from Phase 1).

### Search
- **D-19:** Search bar in header is functional: filters applications client-side by company name and role title.
- **D-20:** Search is global — works from any page, results navigate to the matching application or filter the list.
- **D-21:** Cmd+K shortcut focuses the search bar. Full command palette deferred to Phase 9.

### Claude's Discretion
- Exact TanStack Query cache update patterns
- Drag animation styling (@hello-pangea/dnd drag overlay)
- Table column width distribution
- How to handle empty search results
- Loading states for detail page
- Whether to use `useLoaderData` or `useQuery` for detail page data

</decisions>

<canonical_refs>
## Canonical References

### UI Design
- `.planning/phases/03-frontend-shell-dashboard/03-UI-SPEC.md` — Design system tokens, component specs, page layouts
- `.planning/phases/03-frontend-shell-dashboard/page-decisions.md` — L1 Glass Table, D1 Hero+Tabs, all detail section choices
- `.planning/phases/03-frontend-shell-dashboard/design-system.md` — Component variants and props

### Phase 3 Code (to extend)
- `src/client/components/design-system/` — All 9 reusable components
- `src/client/components/kanban/KanbanBoard.tsx` — Kanban to add DnD to
- `src/client/components/kanban/KanbanCard.tsx` — Cards become draggable
- `src/client/hooks/useApplications.ts` — Data hooks to add mutations
- `src/client/lib/urgency.ts` — Urgency calculation (reuse in table)
- `src/client/lib/colors.ts` — STATUS_COLORS map (reuse in table badges)
- `src/client/components/layout/Header.tsx` — Search bar to make functional
- `src/client/routes/_authenticated/list.tsx` — Placeholder to replace
- `src/client/routes/_authenticated/app/$slug.tsx` — Detail route exists but empty

### API
- `src/server/routes/applications.ts` — GET list, GET by id, PATCH update, PATCH status
- `src/server/services/application.ts` — Service functions for all operations
- `src/shared/constants.ts` — APPLICATION_STATUSES, PRIORITIES
- `src/shared/validators/application.ts` — Zod schemas for API validation

### Project
- `.planning/REQUIREMENTS.md` — VIEW-02, VIEW-04, UI-05
- `.planning/ROADMAP.md` — Phase 4 success criteria

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Badge` component (filled/outlined/dot) — for status badges in table
- `FilterChips` component (tab/outlined/underline) — for table filters
- `TabBar` component (underline/chip) — for detail page tabs
- `Card` component (glass) — for glass table container
- `Input` component (glass/raised) — for detail page fields
- `Modal` component — for any confirmation dialogs
- `SearchBar` component — already in header, needs to become functional
- `Button` component — for detail page actions
- `CompanyBadge` — reuse in table rows and detail page
- `useApplications` hook — base query, extend with mutations
- `useQuickAdd` Zustand store — pattern for other global stores

### Established Patterns
- Glass card aesthetic with CSS custom properties
- TanStack Router file-based routes with auth guard layout
- TanStack Query for data fetching
- Zustand for client-side state (theme, quick-add modal)
- Lucide SVG icons throughout
- Responsive: desktop components hidden on mobile, mobile components hidden on desktop

### Integration Points
- `list.tsx` placeholder route → replace with table component
- `app/$slug.tsx` route → replace with detail page component
- `KanbanBoard.tsx` → wrap with DnD provider, make cards draggable
- `Header.tsx` → make search bar functional
- `useApplications.ts` → add update/status/pin/archive mutations with optimistic updates

</code_context>

<specifics>
## Specific Ideas

- Table should use the same glass aesthetic as kanban cards — not a traditional HTML table feel
- Detail page hero should feel connected to the card you clicked — same company badge, same status color
- Drag-and-drop should feel smooth — card lifts slightly on grab, ghost in original position
- Search should be instant (client-side filtering), not a server round-trip

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-table-detail-navigation*
*Context gathered: 2026-04-18*
