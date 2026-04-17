# Phase 3: Frontend Shell & Kanban - Context

**Gathered:** 2026-04-16
**Updated:** 2026-04-18 after design exploration
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the React SPA shell with design system components, TanStack Router, dark mode, responsive layout, and kanban board as the home page. This phase creates the app foundation that all subsequent frontend phases plug into. No separate dashboard — kanban IS the home.

</domain>

<decisions>
## Implementation Decisions

### App Shell
- **D-01:** Icon sidebar (72px) on desktop with tooltips on hover. 5 nav items: Board (home), List, Calendar, Analytics, Settings.
- **D-02:** Bottom tab bar (58px) on mobile. Same 5 items.
- **D-03:** Header: page title, search bar (glass variant, Cmd+K hint), "+ Add" button, dark mode toggle, user avatar.
- **D-04:** Quick-add modal (glass card, centered desktop, bottom sheet mobile) for new applications. Minimal fields: company, role, status.

### Routing
- **D-05:** TanStack Router for type-safe SPA routing. Replace the existing custom pathname router in App.tsx.
- **D-06:** Routes: /board (home/default), /list, /calendar, /analytics, /settings, /app/:slug (detail page). Placeholder pages for routes not yet implemented (list, calendar, analytics).
- **D-07:** Auth guard: unauthenticated → /login, authenticated on /login → /board.

### Design System
- **D-08:** Build reusable components as the foundation. All subsequent phases import these.
- **D-09:** Components to build: Badge (filled/outlined/dot variants, color prop), Button (filled/outline/ghost), Input (glass/raised), Card (glass), ColumnHeader (filled/minimal), SearchBar (glass/raised), FilterChips (tab/outlined/underline), TabBar (underline/chip), Modal (glass, bottom sheet mobile).
- **D-10:** Design tokens as CSS custom properties: colors (status, surface, text), glass effect, spacing scale, radius scale, typography.
- **D-11:** Glass card aesthetic: rgba white bg with backdrop-filter blur on warm gradient body.

### Kanban (home page)
- **D-12:** Pure kanban board, no stats strip, no dashboard elements above.
- **D-13:** Columns: `display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr))`. Fill page width, no horizontal scroll.
- **D-14:** Column headers: filled variant (subtle bg, colored dot, name, count badge).
- **D-15:** Cards: BC2 style — company badge (colored initial square) + name/role row + right-aligned days/tags.
- **D-16:** Urgency rendering via card background tint (amber=interview today, green=offer expiring, red=stale 7+d). NO redundant text labels — tint IS the signal.
- **D-17:** Hint bar below card main row: only appears when actionable (clock SVG icon + interview time, alert SVG icon + deadline date). Muted for this-week, colored for today/tomorrow.
- **D-18:** Rejected column at 40% opacity.
- **D-19:** Mobile: collapsible status sections ordered by priority (Interviewing → Offer → Applied → Screening → Wishlist → Rejected). Tap to expand/collapse.

### Dark Mode
- **D-20:** Tailwind v4 dark mode: `@custom-variant dark (&:where(.dark, .dark *))` in CSS.
- **D-21:** `class="dark"` on `<html>`. System preference auto-detection via `prefers-color-scheme`. Manual toggle in header. Preference persisted to localStorage.
- **D-22:** Dark surfaces: #18181b (dominant), #27272a (cards), #f4f4f5 (accent/text).

### Icons
- **D-23:** Lucide React for all icons. SVG, stroke-based, 1.8px stroke width. No emojis anywhere.
- **D-24:** Star ratings: filled/empty SVG star polygons (#f59e0b filled, #d6d3d1 outlined).

### Claude's Discretion
- TanStack Router file structure (file-based vs code-based routing)
- Exact Tailwind v4 configuration approach
- State management for theme (Zustand vs context vs localStorage only)
- Data fetching for kanban (TanStack Query vs simple fetch)
- How to structure the design system components directory
- Loading skeleton designs
- Empty state messages and layout

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### UI Design
- `.planning/phases/03-frontend-shell-dashboard/03-UI-SPEC.md` — Complete UI design contract with all tokens, components, layouts
- `.planning/phases/03-frontend-shell-dashboard/design-system.md` — Component decisions and token values
- `.planning/phases/03-frontend-shell-dashboard/page-decisions.md` — All page layout choices
- `.planning/phases/03-frontend-shell-dashboard/design-decisions.md` — Design exploration history

### Research
- `.planning/phases/03-frontend-shell-dashboard/03-RESEARCH.md` — TanStack Router, Tailwind v4 dark mode, query patterns
- `.planning/research/STACK.md` — Full tech stack
- `.planning/research/ARCHITECTURE.md` — System architecture

### Phase 1-2 Foundation (existing code)
- `src/client/App.tsx` — Current router (to be replaced)
- `src/client/components/ui/Button.tsx` — Existing component patterns
- `src/client/components/layout/AuthLayout.tsx` — Layout wrapper pattern
- `src/client/lib/auth-client.ts` — Auth client (session hook)
- `src/client/pages/dashboard.tsx` — Current placeholder (to be replaced with kanban)
- `worker/index.ts` — Worker entry, API route patterns
- `src/server/routes/applications.ts` — API endpoints kanban will call

### Project
- `.planning/PROJECT.md` — Vision, constraints, core value
- `.planning/REQUIREMENTS.md` — VIEW-01, UI-01 through UI-06

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Button` component (4 variants, 3 sizes) — will be rebuilt to match design system but pattern is established
- `Input` component (label + error) — same, rebuild
- `Toast` + `ToastProvider` — keep
- `authClient.useSession()` — auth guard hook
- Application API at `/api/applications` — kanban data source

### Established Patterns
- Stone color palette in existing components → will change to glass aesthetic with CSS variables
- Tailwind utility classes (no CSS modules)
- Component props with TypeScript interfaces
- Hono route modules in `src/server/routes/`

### Integration Points
- App.tsx router → replace with TanStack Router
- Dashboard page → replace with Kanban page
- Auth pages (login, signup, reset) → keep, wrap in new routing
- `/api/applications` → fetch for kanban column data
- `/api/timeline` → needed for activity (later phases)

</code_context>

<specifics>
## Specific Ideas

- Glass card aesthetic is THE visual identity — every surface is frosted glass on warm gradient
- Kanban card urgency is communicated through background TINT, never text labels. The tint IS the label.
- Company badge (colored initial square) carries identity from kanban cards to table to detail page — consistent visual anchor
- Upload zone is a button by default, expands to drop zone only when dragging a file over — compact when idle
- Apple system fonts, not Inter or other web fonts
- All icons are Lucide SVGs with 1.8px stroke — no emojis, no icon fonts

</specifics>

<deferred>
## Deferred Ideas

None — scope is clean

</deferred>

---

*Phase: 03-frontend-shell-kanban*
*Context gathered: 2026-04-16, updated 2026-04-18 after design exploration*
