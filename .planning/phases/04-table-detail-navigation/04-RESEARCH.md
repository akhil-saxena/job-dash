# Phase 4: Table, Detail & Navigation - Research

**Researched:** 2026-04-16
**Domain:** Interactive views (table, detail page), drag-and-drop, optimistic UI, client-side search
**Confidence:** HIGH

## Summary

Phase 4 adds three major capabilities to JobDash: (1) a table/list view with sortable columns and filter chips, (2) a full-page application detail with sticky hero and tabbed sections, and (3) drag-and-drop on the kanban board with optimistic UI. All required design system components (Badge, FilterChips, TabBar, Card, Input, SearchBar) already exist from Phase 3 and only need to be composed into page-level views.

The primary technical challenges are: integrating `@hello-pangea/dnd` v18.0.1 (which supports React 19) into the existing KanbanBoard, implementing TanStack Query optimistic update patterns with proper rollback, and adding a `getBySlug` API endpoint since the detail route uses `/app/:slug` but no slug-based lookup exists in the API.

**Primary recommendation:** Build mutations with optimistic updates as a shared hook layer (`useUpdateStatus`, `useTogglePin`, `useToggleArchive`) that both the kanban DnD and detail page consume. Add a `getBySlug` service function and API route before building the detail page. Use TanStack Router's `validateSearch` with Zod for type-safe filter/sort URL params on the list view.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Desktop: glass table with sortable columns (Company, Role, Status, Priority, Source, Applied, Days). Click column header to sort.
- **D-02:** Mobile (< 768px): table hidden, glass card list shown instead (company badge + name/role + status badge + days).
- **D-03:** Filter chips above table: tab-style chips for status filters (All, Applied, Interviewing, Offer, etc.) with counts.
- **D-04:** Client-side sorting and filtering on loaded application data. URL query params preserve filter state across navigation.
- **D-05:** Search bar filters applications by company name and role title (client-side text match).
- **D-06:** Full page (not sidebar), navigated via TanStack Router to `/app/:slug`.
- **D-07:** Sticky hero (Variant A -- Dropdowns + Info Pills): company name big, role below, status dropdown + priority dropdown right-aligned, info pills (location, salary, days) below.
- **D-08:** No tags, source, or applied date in hero -- those live in Overview tab.
- **D-09:** Tab bar (underline style): Overview, Interviews (count), JD, Docs (count), Timeline. Phase 4 implements Overview; other tabs are placeholders.
- **D-10:** Overview tab (O1): two-column grid -- editable fields left (URL, location, salary), notes textarea right (markdown, auto-save placeholder). Company research section full-width below.
- **D-11:** Back button returns to previous view (kanban or table).
- **D-12:** Route loads application data via slug in route params. Use TanStack Router loader for data prefetching.
- **D-13:** @hello-pangea/dnd for kanban drag-and-drop. Wrap columns as droppables, cards as draggables.
- **D-14:** Drag a card between columns = status change. Optimistic UI updates immediately, API confirms in background.
- **D-15:** On drag failure: rollback card to original column + show toast error.
- **D-16:** TanStack Query optimistic updates pattern for: status change (drag), pin/unpin, archive/unarchive.
- **D-17:** Mutate local cache immediately on user action, fire API call in background, rollback cache on error.
- **D-18:** Toast notification on error: "Failed to update. Reverted." (uses existing Toast component from Phase 1).
- **D-19:** Search bar in header is functional: filters applications client-side by company name and role title.
- **D-20:** Search is global -- works from any page, results navigate to the matching application or filter the list.
- **D-21:** Cmd+K shortcut focuses the search bar. Full command palette deferred to Phase 9.

### Claude's Discretion
- Exact TanStack Query cache update patterns
- Drag animation styling (@hello-pangea/dnd drag overlay)
- Table column width distribution
- How to handle empty search results
- Loading states for detail page
- Whether to use `useLoaderData` or `useQuery` for detail page data

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| VIEW-02 | Table view with sortable columns, filterable by status/source/priority/tags, full-text search. Mobile: glass card list | D-01 through D-05 lock the implementation. FilterChips component exists. Client-side sorting/filtering on cached data. TanStack Router search params for URL state. |
| VIEW-04 | Application detail as a full page with sticky hero + tabbed sections (Overview, Interviews, JD, Docs, Timeline) | D-06 through D-12 lock the implementation. TabBar component exists. **Gap: need `getBySlug` API endpoint.** Recommend `useQuery` over `useLoaderData` for detail page data. |
| UI-05 | Optimistic UI for drag-and-drop, status changes, pin/archive | D-13 through D-18 lock the implementation. TanStack Query v5 `onMutate`/`onError`/`onSettled` pattern. Toast component exists for error feedback. |
</phase_requirements>

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tanstack/react-query | ^5.99.0 | Server state, optimistic updates | Already installed. Provides `useMutation` with `onMutate`/`onError`/`onSettled` for optimistic cache updates with rollback. |
| @tanstack/react-router | ^1.161.3 | File-based routing, search params | Already installed. `validateSearch` with Zod for type-safe URL filter state. `Route.useParams()` for slug access. |
| zustand | ^5.0.12 | Client state (search term) | Already installed. Use for global search state so the header search bar can communicate with page-level filtering. |
| lucide-react | ^1.8.0 | Icons | Already installed. ArrowUpDown for sort indicators, ChevronLeft for back, MapPin/DollarSign/Clock for info pills. |

### New Dependencies
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @hello-pangea/dnd | 18.0.1 | Kanban drag-and-drop | Locked decision D-13. Maintained fork of react-beautiful-dnd. v18.0.1 supports React 19 (`peerDependencies: { react: "^18.0.0 \|\| ^19.0.0" }`). List-oriented DnD -- perfect for kanban columns. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @hello-pangea/dnd | @dnd-kit/core | dnd-kit is more flexible but more complex to configure for simple column-to-column moves. Decision D-13 locks @hello-pangea/dnd. |
| Hand-built table | @tanstack/react-table | Headless table library adds complexity for a table with only 7 columns and client-side data. A simple HTML table with sort state is sufficient for D-01. Defer react-table to if/when we need virtual scrolling or complex column management. |
| Route loader data | useQuery in component | D-12 says "use TanStack Router loader for data prefetching" but the existing codebase uses `useQuery` hooks (not loaders) throughout. Recommend `ensureQueryData` in the route loader for prefetching, then `useQuery` in the component for reactivity. See Architecture Patterns. |

**Installation:**
```bash
npm install @hello-pangea/dnd
```

**Version verification:**
- @hello-pangea/dnd: 18.0.1 (verified via `npm view`, published 2025-02-09, supports React 19)
- @tanstack/react-query: 5.99.0 (already installed)
- @tanstack/react-router: 1.161.3 (already installed)

## Architecture Patterns

### Recommended Project Structure (new/modified files)
```
src/
  client/
    components/
      table/
        ApplicationTable.tsx       # Desktop glass table with sortable headers
        ApplicationTableRow.tsx    # Single table row
        MobileCardList.tsx         # Mobile < 768px glass card list
        SortableHeader.tsx         # Column header with sort indicator
      detail/
        DetailPage.tsx             # Full-page detail orchestrator
        DetailHero.tsx             # Sticky hero with dropdowns + info pills
        OverviewTab.tsx            # Two-column editable fields + notes
        PlaceholderTab.tsx         # Placeholder for Interviews/JD/Docs/Timeline
      kanban/
        KanbanBoard.tsx            # MODIFIED: wrap with DragDropContext
        KanbanColumn.tsx           # MODIFIED: wrap with Droppable
        KanbanCard.tsx             # MODIFIED: wrap with Draggable
    hooks/
      useApplications.ts           # MODIFIED: add mutation hooks
      useApplicationDetail.ts      # New: single app query by slug
      useSearch.ts                 # New: Zustand store for global search
    routes/
      _authenticated/
        list.tsx                   # MODIFIED: replace placeholder with table
        app/
          $slug.tsx                # MODIFIED: replace placeholder with detail page
  server/
    routes/
      applications.ts             # MODIFIED: add GET by slug endpoint
    services/
      application.ts              # MODIFIED: add getBySlug function
```

### Pattern 1: Optimistic Mutation with Rollback
**What:** Shared mutation hooks that update the TanStack Query cache immediately, fire the API call in background, and rollback on error.
**When to use:** Every user action that modifies application state (status change, pin, archive).
**Example:**
```typescript
// Source: TanStack Query v5 docs - Optimistic Updates
// https://tanstack.com/query/v5/docs/react/guides/optimistic-updates

export function useUpdateStatus() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ApplicationStatus }) => {
      const res = await fetch(`/api/applications/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onMutate: async ({ id, status }) => {
      // 1. Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["applications"] });

      // 2. Snapshot previous value
      const previousApps = queryClient.getQueryData<Application[]>(["applications"]);

      // 3. Optimistically update cache
      queryClient.setQueryData<Application[]>(["applications"], (old) =>
        old?.map((app) =>
          app.id === id ? { ...app, status, updatedAt: Math.floor(Date.now() / 1000) } : app
        )
      );

      // 4. Return context for rollback
      return { previousApps };
    },
    onError: (_err, _vars, context) => {
      // Rollback to snapshot
      if (context?.previousApps) {
        queryClient.setQueryData(["applications"], context.previousApps);
      }
      showToast("Failed to update. Reverted.", "error");
    },
    onSettled: () => {
      // Refetch to ensure server state consistency
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });
}
```

### Pattern 2: DragDropContext Integration with KanbanBoard
**What:** Wrap existing KanbanBoard with `DragDropContext`, columns with `Droppable`, cards with `Draggable`.
**When to use:** The kanban board (and only the kanban board).
**Example:**
```typescript
// Source: @hello-pangea/dnd docs
// https://github.com/hello-pangea/dnd/blob/main/docs/api/drag-drop-context.md

import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";

function KanbanBoard() {
  const { grouped, isLoading } = useApplicationsByStatus();
  const updateStatus = useUpdateStatus();

  function handleDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;
    // No destination = dropped outside
    if (!destination) return;
    // Same column, same index = no change
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    // Different column = status change
    if (destination.droppableId !== source.droppableId) {
      updateStatus.mutate({
        id: draggableId,
        status: destination.droppableId as ApplicationStatus,
      });
    }
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-2">
        {APPLICATION_STATUSES.map((status) => (
          <KanbanColumn key={status} status={status} apps={grouped.get(status) ?? []} />
        ))}
      </div>
    </DragDropContext>
  );
}
```

### Pattern 3: TanStack Router Search Params for Filter State
**What:** Use `validateSearch` on the list route to persist filter/sort state in URL query params.
**When to use:** The list/table view (D-04).
**Example:**
```typescript
// Source: TanStack Router docs - Search Params
// https://tanstack.com/router/latest/docs/guide/search-params

import { z } from "zod";

const listSearchSchema = z.object({
  status: z.string().optional(),
  sort: z.enum(["company", "role", "status", "priority", "source", "applied", "days"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
  q: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/list")({
  validateSearch: listSearchSchema,
  component: ListPage,
});

function ListPage() {
  const { status, sort, order, q } = Route.useSearch();
  const navigate = Route.useNavigate();
  // Update search params without full navigation:
  navigate({ search: (prev) => ({ ...prev, status: "applied" }) });
}
```

### Pattern 4: Detail Page Data Loading
**What:** Use `ensureQueryData` in route loader for prefetch, `useQuery` in component for reactivity.
**When to use:** The detail page at `/app/:slug`.
**Example:**
```typescript
// Route file: app/$slug.tsx
export const Route = createFileRoute("/_authenticated/app/$slug")({
  component: DetailPage,
});

// In the component, use useQuery for the single application
function DetailPage() {
  const { slug } = Route.useParams();
  const { data: app, isLoading } = useApplicationBySlug(slug);
  // ...
}

// Hook: useApplicationDetail.ts
export function useApplicationBySlug(slug: string) {
  return useQuery({
    queryKey: ["application", slug],
    queryFn: async () => {
      const res = await fetch(`/api/applications/by-slug/${slug}`);
      if (!res.ok) throw new Error("Application not found");
      const json = await res.json();
      return json.data;
    },
  });
}
```

**Rationale for useQuery over useLoaderData:** The existing codebase establishes `useQuery` as the data-loading pattern everywhere. Route loaders are not used in any existing route. Introducing loaders just for the detail page would create an inconsistent pattern. Instead, use `useQuery` in the component -- TanStack Query's cache means the second visit to the same app loads instantly. If the planner wants prefetching, `ensureQueryData` can be added later without changing the component code.

### Pattern 5: Global Search State
**What:** Zustand store to hold search term, shared between Header SearchBar and page-level filtering.
**When to use:** Global search (D-19, D-20, D-21).
**Example:**
```typescript
// useSearch.ts
import { create } from "zustand";

interface SearchStore {
  query: string;
  setQuery: (q: string) => void;
}

export const useSearch = create<SearchStore>((set) => ({
  query: "",
  setQuery: (query) => set({ query }),
}));
```

### Anti-Patterns to Avoid
- **Server-side filtering for table:** D-04 explicitly says "client-side sorting and filtering on loaded application data." Do NOT add new API query params for table filtering -- use the existing cached data from `useApplications`.
- **Separate DnD state management:** Do NOT create a separate state layer for drag-and-drop positions. The `onDragEnd` handler should directly call the optimistic mutation, which updates the TanStack Query cache. No intermediate state.
- **Duplicating mutation logic:** Create shared mutation hooks (useUpdateStatus, useTogglePin, useToggleArchive) that both kanban and detail page consume. Do not write the same `onMutate`/`onError` pattern twice.
- **Using `useLoaderData` without `useQuery`:** If you use a route loader to prefetch, the component MUST still use `useQuery` to subscribe to cache updates. `useLoaderData` alone is a snapshot -- it won't reflect optimistic updates.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Drag-and-drop | Custom pointer event DnD | @hello-pangea/dnd | Keyboard accessibility, touch support, screen reader announcements. D-13 locks this. |
| Cache invalidation after mutation | Manual refetch + setState | TanStack Query `onMutate`/`onSettled` | Race conditions, stale data, memory leaks. The library handles all edge cases. |
| URL search param sync | Manual `window.location` parsing | TanStack Router `validateSearch` | Type-safe, Zod-validated, auto-synced with navigation. |
| Debounced search input | Custom setTimeout/clearTimeout | A simple Zustand store + useDeferredValue or short inline debounce | React 19 `useDeferredValue` handles priority scheduling for free. |

**Key insight:** Every "interactive" feature in this phase (DnD, optimistic updates, URL state) has a library-level solution already in the project's dependency tree. The work is composition, not invention.

## Common Pitfalls

### Pitfall 1: @hello-pangea/dnd Breaks in StrictMode Double-Render
**What goes wrong:** In React StrictMode (which this project uses), effects run twice in dev mode. Older versions of react-beautiful-dnd would break.
**Why it happens:** The library relies on refs and measurements that can get confused by double-mounting.
**How to avoid:** Use @hello-pangea/dnd v18.0.1 (NOT the original react-beautiful-dnd). This version explicitly fixes StrictMode support. Already confirmed compatible.
**Warning signs:** "Unable to find draggable" errors in console during dev.

### Pitfall 2: Optimistic Update Race Condition
**What goes wrong:** User drags card A to "Interviewing", then immediately drags card B. The `onSettled` invalidation from card A's mutation overwrites card B's optimistic update.
**Why it happens:** `invalidateQueries` triggers a refetch that can overwrite in-flight optimistic updates.
**How to avoid:** Always call `cancelQueries` at the start of `onMutate`. This cancels any in-flight refetches before applying the optimistic update. The `onSettled` invalidation will then fetch the latest state after all mutations complete.
**Warning signs:** Cards "jumping back" to wrong columns briefly after rapid consecutive drags.

### Pitfall 3: Missing getBySlug API Endpoint
**What goes wrong:** The detail page route is `/app/:slug` and D-12 says "Route loads application data via slug in route params." But the current API only has `GET /api/applications/:id` which expects a nanoid, not a slug.
**Why it happens:** Phase 2 created the slug column and unique index but only used it for URL-friendly links, not as an API lookup key.
**How to avoid:** Add a `getBySlug` service function and `GET /api/applications/by-slug/:slug` route in Phase 4. The service function should query by `userId + slug` using the existing unique index `idx_application_user_slug`.
**Warning signs:** 404 errors on the detail page when clicking a kanban card.

### Pitfall 4: Droppable ID Must Match Status String
**What goes wrong:** The `droppableId` on columns and the logic in `onDragEnd` must use the exact status string values from `APPLICATION_STATUSES` (e.g., "interviewing", not "Interviewing").
**Why it happens:** Mismatch between display labels and internal values.
**How to avoid:** Use the status value (lowercase) as `droppableId`, and `app.id` as `draggableId`. In `onDragEnd`, cast `destination.droppableId` to `ApplicationStatus`.
**Warning signs:** Drops that do nothing, or wrong status applied.

### Pitfall 5: Forgetting to Cancel Queries Before Optimistic Update
**What goes wrong:** An in-flight `GET /api/applications` response arrives AFTER you optimistically update the cache, overwriting your update with stale data.
**Why it happens:** TanStack Query refetches in the background by default (staleTime: 60s in this project).
**How to avoid:** Always `await queryClient.cancelQueries({ queryKey: ["applications"] })` as the FIRST line in every `onMutate`.
**Warning signs:** Optimistic update appears for a split second then reverts, even when the API succeeds.

### Pitfall 6: Search Bar Focus Cmd+K Conflicts
**What goes wrong:** Cmd+K is intercepted by the browser (e.g., Safari uses it for search bar focus) or other browser extensions.
**Why it happens:** Browser-level shortcuts take priority.
**How to avoid:** Use `event.preventDefault()` in the keydown handler. Register the listener on `document` level. Check `event.metaKey` (Mac) and `event.ctrlKey` (Windows/Linux).
**Warning signs:** Cmd+K doesn't focus the search bar on certain browsers.

### Pitfall 7: Draggable Link Wrapper Conflict
**What goes wrong:** The current `KanbanCard` is wrapped in a `<Link>` component. When you add `<Draggable>`, the drag gesture conflicts with the click-to-navigate behavior.
**Why it happens:** @hello-pangea/dnd differentiates drag from click by checking mouse movement distance and duration. But the `<Link>` may still intercept the click.
**How to avoid:** Move the `<Link>` inside the card content (on a click handler or inner wrapper) rather than wrapping the entire Draggable. Or use `onClick` with `router.navigate` instead of `<Link>`, and only navigate if the drag didn't happen (check `provided.dragHandleProps`).
**Warning signs:** Clicking a card navigates AND drags, or clicking doesn't navigate at all.

## Code Examples

### getBySlug Service Function (New API Endpoint)
```typescript
// Source: project pattern from existing getById
// File: src/server/services/application.ts

export async function getBySlug(db: Database, userId: string, slug: string) {
  const app = await db
    .select()
    .from(application)
    .where(and(eq(application.slug, slug), ...baseConditions(userId)))
    .get();

  if (!app) throw new NotFoundError("Application not found");

  const events = await db
    .select()
    .from(timelineEvent)
    .where(eq(timelineEvent.applicationId, app.id))
    .orderBy(desc(timelineEvent.occurredAt))
    .all();

  return { ...app, timeline: events };
}
```

### Droppable Column Wrapper
```typescript
// Source: @hello-pangea/dnd Droppable API
// https://github.com/hello-pangea/dnd/blob/main/docs/api/droppable.md

import { Droppable, Draggable } from "@hello-pangea/dnd";

export function KanbanColumn({ status, apps }: KanbanColumnProps) {
  return (
    <div className="flex min-h-[200px] flex-col gap-2">
      <ColumnHeader status={status} count={apps.length} variant="filled" />
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex flex-1 flex-col gap-2 rounded-lg p-1 transition-colors ${
              snapshot.isDraggingOver ? "bg-black/[0.03] dark:bg-white/[0.04]" : ""
            }`}
          >
            {apps.map((app, index) => (
              <Draggable key={app.id} draggableId={app.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={snapshot.isDragging ? "opacity-90 shadow-lg" : ""}
                  >
                    <KanbanCard app={app} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
```

### Glass Table Row
```typescript
// Source: project design system (03-UI-SPEC.md)

function ApplicationTableRow({ app }: { app: Application }) {
  const days = getDaysSinceUpdate(app.updatedAt);
  return (
    <Link
      to="/app/$slug"
      params={{ slug: app.slug }}
      className="flex items-center gap-4 border-b border-black/[0.04] px-4 py-3 transition-colors hover:bg-white/40 dark:border-white/[0.04] dark:hover:bg-white/[0.04]"
    >
      <CompanyBadge companyName={app.companyName} size="sm" />
      <span className="flex-1 truncate text-sm font-medium text-text-primary dark:text-dark-accent">
        {app.companyName}
      </span>
      <span className="w-32 truncate text-sm text-text-secondary dark:text-dark-accent/60">
        {app.roleTitle}
      </span>
      <Badge variant="filled" color={app.status} size="sm">
        {STATUS_LABELS[app.status]}
      </Badge>
      {/* ... more columns */}
      <span className="w-12 text-right text-xs text-text-muted">{days}d</span>
    </Link>
  );
}
```

### Sticky Hero with Dropdowns
```typescript
// Source: project design system (03-UI-SPEC.md) - D-07

function DetailHero({ app }: { app: Application }) {
  const updateStatus = useUpdateStatus();
  const togglePin = useTogglePin();

  return (
    <div className="sticky top-0 z-10 glass border-b border-white/30 px-6 py-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-text-primary dark:text-dark-accent">
            {app.companyName}
          </h1>
          <p className="text-sm text-text-secondary dark:text-dark-accent/60">
            {app.roleTitle}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Status dropdown, Priority dropdown, Pin star, Archive button */}
        </div>
      </div>
      {/* Info pills row: location, salary, days */}
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-beautiful-dnd | @hello-pangea/dnd v18 | 2023 (fork), Feb 2025 (React 19 support) | Drop-in replacement with React 19 + StrictMode support |
| TanStack Query v4 `onMutate` returns context only | TanStack Query v5 same pattern, improved types | Dec 2023 | Fourth generic on useMutation types the context, making rollback type-safe |
| Manual URL param parsing | TanStack Router `validateSearch` + Zod | TanStack Router v1 | Type-safe search params validated at route level |
| react-beautiful-dnd peer dep: react@^16.8 \|\| ^17 \|\| ^18 | @hello-pangea/dnd peer dep: react@^18.0.0 \|\| ^19.0.0 | v18.0.0 (Feb 2025) | Unblocks React 19 projects |

**Deprecated/outdated:**
- `react-beautiful-dnd`: Archived by Atlassian. Use `@hello-pangea/dnd` (the CLAUDE.md stack doc explicitly says this).
- TanStack Query v4 syntax (e.g., `onSuccess` on `useQuery`): Removed in v5. Use `select` or `onSettled` on mutations.

## Open Questions

1. **Fractional Indexing for Within-Column Ordering**
   - What we know: STATE.md flags "fractional indexing for kanban needs investigation in Phase 4 planning." But CONTEXT.md D-14 only specifies drag between columns = status change. No within-column reordering is mentioned.
   - What's unclear: Whether users will want to reorder cards within a column in the future.
   - Recommendation: Do NOT implement fractional indexing in Phase 4. The locked decisions only call for cross-column status changes. If within-column ordering is needed later, it would require a DB schema change (new `position` column) and is better as a separate phase.

2. **Global Search Navigation (D-20)**
   - What we know: D-20 says "results navigate to the matching application or filter the list." D-19 says "filters applications client-side."
   - What's unclear: When on the kanban board, should typing in search filter the kanban cards, or switch to the list view? When clicking a single result, should it navigate to `/app/:slug`?
   - Recommendation: On any page, typing in the search bar filters the visible applications client-side. If the user is on kanban, filter kanban cards. If on list, filter table rows. Pressing Enter or clicking a specific result navigates to `/app/:slug`. This keeps the behavior simple and predictable.

3. **Detail Page Update Hook**
   - What we know: The detail page needs to update individual fields (D-10: URL, location, salary, notes). The existing `PATCH /api/applications/:id` endpoint accepts partial updates.
   - What's unclear: Whether to use a single `useUpdateApplication` mutation for all field changes or separate mutations per field.
   - Recommendation: Single `useUpdateApplication` mutation that accepts a partial update payload. Debounce for text fields (notes). Immediate submit for dropdowns/selects.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 4.1.4 (Workers pool) |
| Config file | vitest.config.ts |
| Quick run command | `npm test -- --reporter=verbose` |
| Full suite command | `npm test` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| VIEW-02 | Table view renders, sorting works, filtering works | manual-only | N/A (client-side UI, no component test infra) | N/A |
| VIEW-04 | Detail page loads by slug, shows hero + tabs | unit (API) | `npm test -- tests/applications/slug-lookup.test.ts -x` | Wave 0 |
| UI-05 | Status change API, pin toggle API, archive toggle API | unit (API) | `npm test -- tests/applications/status.test.ts tests/applications/archive-pin.test.ts -x` | Existing |

### Sampling Rate
- **Per task commit:** `npm test`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/applications/slug-lookup.test.ts` -- covers VIEW-04 (new `getBySlug` endpoint)
- No client-side component test infrastructure exists. All VIEW-02 and UI-05 client behaviors are manual-only verification. The existing test suite covers API correctness (status changes, pin, archive) which is the server-side half of UI-05.

## Environment Availability

Step 2.6: SKIPPED (no external dependencies identified). Phase 4 is purely client-side code + minor API additions. All dependencies are npm packages already in the project or to be installed.

## Sources

### Primary (HIGH confidence)
- [@hello-pangea/dnd npm registry](https://www.npmjs.com/package/@hello-pangea/dnd) - version 18.0.1, peer deps verified React 19 support
- [@hello-pangea/dnd CHANGELOG](https://github.com/hello-pangea/dnd/blob/main/CHANGELOG.md) - React 19 support confirmed in v18.0.0-beta.0 (Jan 2025), released v18.0.1 (Feb 2025)
- [@hello-pangea/dnd GitHub](https://github.com/hello-pangea/dnd) - DragDropContext, Droppable, Draggable API
- [TanStack Query v5 Optimistic Updates](https://tanstack.com/query/v5/docs/react/guides/optimistic-updates) - onMutate/onError/onSettled pattern
- [TanStack Router Search Params](https://tanstack.com/router/latest/docs/guide/search-params) - validateSearch with Zod
- [TanStack Router + Query Integration](https://tanstack.com/router/latest/docs/integrations/query) - ensureQueryData in route loaders

### Secondary (MEDIUM confidence)
- [Kanban Board with @hello-pangea/dnd and Shadcn (Jan 2026)](https://marmelab.com/blog/2026/01/15/building-a-kanban-board-with-shadcn.html) - verified patterns for DnD + optimistic updates
- [TanStack Query v5 Mutations Guide](https://tanstack.com/query/v5/docs/react/guides/mutations) - useMutation API reference

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries verified via npm, peer deps confirmed, versions current
- Architecture: HIGH - all patterns match existing codebase conventions (useQuery, Zustand stores, file-based routes)
- Pitfalls: HIGH - React 19 + StrictMode compat verified, DnD + Link conflict identified from direct code inspection, getBySlug gap confirmed from codebase grep

**Research date:** 2026-04-16
**Valid until:** 2026-05-16 (stable libraries, locked decisions)

## Project Constraints (from CLAUDE.md)

- **Cost:** $0/month -- must stay within Cloudflare free tiers
- **Stack:** All Cloudflare -- D1 database, R2 storage, Workers API
- **Auth:** Google OAuth + email/password via better-auth
- **Frontend:** React SPA on Cloudflare Pages
- **Design:** Minimal-warm aesthetic, glass card aesthetic, dark mode support
- **DnD library:** Use @hello-pangea/dnd NOT react-beautiful-dnd (CLAUDE.md "What NOT to Use" section)
- **No Co-Authored-By lines** in git commits (user's global CLAUDE.md)
