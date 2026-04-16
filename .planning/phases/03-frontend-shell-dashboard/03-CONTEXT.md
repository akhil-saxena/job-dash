# Phase 3: Frontend Shell & Dashboard - Context

**Gathered:** 2026-04-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace the placeholder dashboard with a full app shell (sidebar + header) and smart dashboard landing view. Implement dark mode, responsive design, and the minimal-warm aesthetic. This phase creates the layout shell that all subsequent frontend phases (kanban, table, detail panel) plug into.

</domain>

<decisions>
## Implementation Decisions

### App Shell Layout
- **D-01:** Sidebar + header layout. Fixed sidebar on left (collapsible on mobile), header bar at top with user info + notification bell placeholder.
- **D-02:** Sidebar contains navigation links: Dashboard (default), Kanban, Table, Calendar, Analytics, Contacts, Settings. Active link highlighted.
- **D-03:** Sidebar collapses to icon-only on smaller screens. Mobile: hamburger menu in header toggles sidebar overlay.
- **D-04:** Main content area fills remaining space. Scroll is on the content area, not the whole page.

### Dashboard Design
- **D-05:** Top section: 4 summary stat cards in a responsive grid (total active, interviews this week, offer rate %, avg days in pipeline). Each card has label, value, and subtle trend indicator.
- **D-06:** Middle section: two columns — "Stale Applications" (no update 7+ days, sorted by staleness) and "Upcoming Interviews" (sorted by date, nearest first).
- **D-07:** Bottom section: "Recent Activity" feed showing latest timeline events across all applications.
- **D-08:** Quick-add button in header or dashboard hero — prominent, always accessible.

### Quick-Add Flow
- **D-09:** Modal dialog for adding applications. Minimal required fields: company name, role title, status (default: "wishlist"). Optional fields expandable.
- **D-10:** Modal reusable for future forms (interview rounds, contacts, etc.).

### Routing
- **D-11:** Upgrade from custom pathname router to TanStack Router for type-safe SPA routing.
- **D-12:** Auth guard: unauthenticated users redirect to /login. Authenticated users on /login redirect to /dashboard.
- **D-13:** Routes: /dashboard (default), /kanban, /table, /calendar, /analytics, /contacts, /settings, /app/:slug (detail — Phase 4). Placeholder pages for routes not yet implemented.

### Dark Mode
- **D-14:** CSS variables for color tokens. Light mode: stone palette (already established). Dark mode: slate/zinc palette.
- **D-15:** System preference auto-detection on first visit via `prefers-color-scheme` media query.
- **D-16:** Manual toggle in header. Preference persisted to localStorage.
- **D-17:** `<html>` element gets `class="dark"` for Tailwind dark mode.

### Status Color System
- **D-18:** Consistent colors across all views (carried from PROJECT.md spec):
  - Wishlist: gray-500, Applied: blue-500, Screening: violet-500, Interviewing: amber-500
  - Offer: green-500, Accepted: emerald-500, Rejected: red-500, Withdrawn: slate-500
- **D-19:** Colors defined as CSS variables and as a TypeScript constant map for programmatic use.

### Design System
- **D-20:** Extend existing UI primitives (Button, Input, Toast) with: Card, Badge, Modal, Sidebar, StatCard.
- **D-21:** Stone palette for light mode (already established in Phase 1 components). Consistent rounded-lg corners, font-medium labels, ring-2 focus states.

### Claude's Discretion
- TanStack Router configuration details and file-based vs code-based routing
- Exact sidebar width and transition animations
- Loading skeleton designs for dashboard sections
- Empty state illustrations/messages
- Exact stat card layout proportions
- How to fetch dashboard data (SWR, TanStack Query, or simple fetch + useState)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Original Spec
- `job-tracker-spec.md` §7.1 — Kanban board spec (for sidebar nav context)
- `job-tracker-spec.md` §7.3 — Deadline widget design
- `job-tracker-spec.md` §11 — UX details (responsive design, optimistic UI)
- `job-tracker-spec.md` §14 — Status color system (hex codes, Tailwind classes)

### Research
- `.planning/research/STACK.md` — TanStack Router recommendation, UI library choices
- `.planning/research/FEATURES.md` — Dashboard-first is a differentiator vs competitors
- `.planning/research/ARCHITECTURE.md` — Frontend component boundaries

### Phase 1 Foundation (existing code patterns)
- `src/client/components/ui/Button.tsx` — Established Button variants/sizes pattern
- `src/client/components/ui/Input.tsx` — Input with label + error pattern
- `src/client/components/ui/Toast.tsx` — Toast provider pattern
- `src/client/components/layout/AuthLayout.tsx` — Layout wrapper pattern
- `src/client/App.tsx` — Current router (to be replaced with TanStack Router)
- `src/client/pages/dashboard.tsx` — Current placeholder (to be replaced)
- `src/client/index.css` — Tailwind entry point

### Phase 2 API (data sources for dashboard)
- `src/server/routes/applications.ts` — GET /api/applications (list endpoint for stat cards, stale apps)
- `src/shared/constants.ts` — APPLICATION_STATUSES, PRIORITIES (for status colors, filters)

### Project Context
- `.planning/PROJECT.md` — Core value: pipeline clarity at a glance
- `.planning/REQUIREMENTS.md` — VIEW-01, VIEW-02, VIEW-03, UI-01, UI-02, UI-03, UI-04

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Button` component — 4 variants (primary/secondary/outline/google), 3 sizes, loading state
- `Input` component — Label, error message, forwarded ref
- `Toast` + `ToastProvider` — Toast notifications system
- `AuthLayout` — Centered card wrapper (for auth pages, not app shell)
- `authClient.useSession()` — Session hook for auth guard

### Established Patterns
- Stone color palette: bg-stone-50, text-stone-800, border-stone-200, etc.
- Rounded-lg corners on all interactive elements
- Tailwind utility classes (no CSS modules, no styled-components)
- Component props with TypeScript interfaces
- forwardRef pattern on form elements

### Integration Points
- `App.tsx` router needs replacement with TanStack Router
- Dashboard page needs real data from Phase 2's `/api/applications` endpoint
- Sidebar nav links will route to placeholder pages for kanban/table/calendar/analytics
- Dark mode toggle wires into header component + localStorage + CSS variables

</code_context>

<specifics>
## Specific Ideas

- Dashboard should feel like a "command center" — the user opens it and immediately knows what needs attention
- Linear's sidebar for navigation reference — clean, minimal, icon + text labels
- Stat cards should use the pastel status colors as subtle accents (not overwhelming)
- The quick-add modal should be fast — minimal fields, expand for more

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-frontend-shell-dashboard*
*Context gathered: 2026-04-16*
