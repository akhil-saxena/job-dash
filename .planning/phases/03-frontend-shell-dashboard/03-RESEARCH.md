# Phase 3: Frontend Shell & Kanban - Research

**Researched:** 2026-04-16
**Domain:** React SPA shell, design system, routing, dark mode, kanban board
**Confidence:** HIGH

## Summary

Phase 3 builds the entire app foundation: a glass card design system, TanStack Router for type-safe SPA routing, Tailwind v4 dark mode, responsive layout with icon sidebar/bottom tab bar, and a kanban board as the home page. The existing App.tsx custom pathname router and dashboard placeholder are replaced entirely.

The project already has React 19, Tailwind v4, Vite 8, and a working API layer with application CRUD endpoints. The phase adds TanStack Router (~1.168), TanStack Query (~5.99), Lucide React (~1.8), and Zustand (~5.0) as new dependencies. All design tokens (colors, typography, spacing, radius, glass effects) are fully specified in the UI-SPEC and must be implemented as CSS custom properties via Tailwind v4's `@theme` directive.

The kanban board fetches from the existing `GET /api/applications` endpoint, groups by status, and renders cards with the BC2 design (company badge + name/role + days/tags, urgency tints, hint bars). Mobile uses collapsible status sections instead of columns. Dark mode uses Tailwind v4's `@custom-variant dark (&:where(.dark, .dark *))` with localStorage persistence and system preference detection.

**Primary recommendation:** Use TanStack Router file-based routing with the `_authenticated` layout pattern for auth guards, implement design tokens in `index.css` via `@theme`, and build all design system components as self-contained units before composing pages.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Icon sidebar (72px) on desktop with tooltips on hover. 5 nav items: Board (home), List, Calendar, Analytics, Settings.
- **D-02:** Bottom tab bar (58px) on mobile. Same 5 items.
- **D-03:** Header: page title, search bar (glass variant, Cmd+K hint), "+ Add" button, dark mode toggle, user avatar.
- **D-04:** Quick-add modal (glass card, centered desktop, bottom sheet mobile) for new applications. Minimal fields: company, role, status.
- **D-05:** TanStack Router for type-safe SPA routing. Replace the existing custom pathname router in App.tsx.
- **D-06:** Routes: /board (home/default), /list, /calendar, /analytics, /settings, /app/:slug (detail page). Placeholder pages for routes not yet implemented (list, calendar, analytics).
- **D-07:** Auth guard: unauthenticated -> /login, authenticated on /login -> /board.
- **D-08:** Build reusable components as the foundation. All subsequent phases import these.
- **D-09:** Components to build: Badge (filled/outlined/dot variants, color prop), Button (filled/outline/ghost), Input (glass/raised), Card (glass), ColumnHeader (filled/minimal), SearchBar (glass/raised), FilterChips (tab/outlined/underline), TabBar (underline/chip), Modal (glass, bottom sheet mobile).
- **D-10:** Design tokens as CSS custom properties: colors (status, surface, text), glass effect, spacing scale, radius scale, typography.
- **D-11:** Glass card aesthetic: rgba white bg with backdrop-filter blur on warm gradient body.
- **D-12:** Pure kanban board, no stats strip, no dashboard elements above.
- **D-13:** Columns: `display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr))`. Fill page width, no horizontal scroll.
- **D-14:** Column headers: filled variant (subtle bg, colored dot, name, count badge).
- **D-15:** Cards: BC2 style -- company badge (colored initial square) + name/role row + right-aligned days/tags.
- **D-16:** Urgency rendering via card background tint (amber=interview today, green=offer expiring, red=stale 7+d). NO redundant text labels -- tint IS the signal.
- **D-17:** Hint bar below card main row: only appears when actionable (clock SVG icon + interview time, alert SVG icon + deadline date). Muted for this-week, colored for today/tomorrow.
- **D-18:** Rejected column at 40% opacity.
- **D-19:** Mobile: collapsible status sections ordered by priority (Interviewing -> Offer -> Applied -> Screening -> Wishlist -> Rejected). Tap to expand/collapse.
- **D-20:** Tailwind v4 dark mode: `@custom-variant dark (&:where(.dark, .dark *))` in CSS.
- **D-21:** `class="dark"` on `<html>`. System preference auto-detection via `prefers-color-scheme`. Manual toggle in header. Preference persisted to localStorage.
- **D-22:** Dark surfaces: #18181b (dominant), #27272a (cards), #f4f4f5 (accent/text).
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

### Deferred Ideas (OUT OF SCOPE)
None -- scope is clean
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| VIEW-01 | Kanban board as home/landing page with columns per status, drag-and-drop, card preview (company badge, role, days, urgency tint) | TanStack Query for data fetching, CSS grid columns, BC2 card component, urgency tint system. Note: drag-and-drop is deferred to Phase 4 per STACK.md (@hello-pangea/dnd); this phase renders the board read-only. |
| UI-01 | Dark mode with system preference detection and manual toggle | Tailwind v4 @custom-variant dark pattern, localStorage persistence, prefers-color-scheme media query, head script to prevent FOUC |
| UI-02 | Desktop-first responsive design; mobile-friendly with bottom tab bar | 72px icon sidebar (desktop), 58px bottom tab bar (mobile), 768px breakpoint, CSS grid responsive columns |
| UI-03 | Glass card aesthetic: warm gradient bg, frosted glass surfaces, Apple system fonts | @theme design tokens, backdrop-filter blur, rgba surfaces, -apple-system font stack, -webkit-backdrop-filter for Safari |
| UI-04 | Consistent status color system across all views | Status color tokens in @theme, Badge component with color prop, ColumnHeader colored dot, card urgency tints |
| UI-06 | Reusable design system components (Badge, Button, Input, Card, etc.) | Component architecture: Badge, Button, Input, Card, ColumnHeader, SearchBar, FilterChips, TabBar, Modal -- all with variant props and dark mode support |
</phase_requirements>

## Standard Stack

### Core (New Dependencies for Phase 3)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tanstack/react-router | ^1.168.22 | Type-safe SPA routing | Locked decision D-05. Superior type safety for SPAs: typed path params, search params, loader data. File-based route generation. |
| @tanstack/router-plugin | ^1.167.22 | Vite plugin for file-based routing | Generates route tree from filesystem. Auto code-splitting. Must be placed before @vitejs/plugin-react in Vite config. |
| @tanstack/react-router-devtools | ^1.166.13 | Router debugging | Visual route tree inspector. Dev-only, tree-shaken in production. |
| @tanstack/react-query | ^5.99.0 | Server state management | De facto standard for async state. Caching, deduplication, background refetch. Kanban data fetching and mutations. |
| lucide-react | ^1.8.0 | SVG icons | Locked decision D-23. Tree-shakable, stroke-based, 1.8px default customizable. 1500+ icons. |
| zustand | ^5.0.12 | Client state (theme, sidebar) | Lightweight (1.1kB). Theme preference, sidebar state, mobile menu state. |

### Existing (Already Installed)
| Library | Version | Purpose |
|---------|---------|---------|
| react | ^19.2.4 | UI framework |
| react-dom | ^19.2.4 | DOM rendering |
| tailwindcss | ^4.2.0 | CSS framework with @theme tokens |
| @tailwindcss/vite | ^4.2.0 | Tailwind Vite integration |
| vite | ^8.0.4 | Build tool |
| @vitejs/plugin-react | ^6.0.1 | React Fast Refresh |
| @cloudflare/vite-plugin | ^1.32.3 | Workers dev integration |
| better-auth | ^1.6.5 | Auth (useSession hook) |
| zod | ^3.24.0 | Schema validation for quick-add form |
| typescript | ~6.0.2 | Type checking |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| TanStack Router file-based | TanStack Router code-based | Code-based is simpler for small apps but loses auto code-splitting. File-based recommended by TanStack. **Recommendation: file-based.** |
| TanStack Query | Simple fetch + useState | Loses caching, deduplication, loading/error states, background refetch. **Recommendation: TanStack Query -- worth the 13kB for kanban.** |
| Zustand | React Context | Context triggers full subtree re-renders on state change. Zustand is 1.1kB and selective. **Recommendation: Zustand for theme + UI state.** |
| Zustand | localStorage only (theme) | Theme toggle is simple enough for localStorage alone, but Zustand provides reactive updates across components. **Recommendation: Zustand wrapping localStorage.** |

**Installation:**
```bash
npm install @tanstack/react-router @tanstack/react-query lucide-react zustand
npm install -D @tanstack/router-plugin @tanstack/react-router-devtools
```

**Version verification:** All versions checked against npm registry on 2026-04-16.

## Architecture Patterns

### Recommended Project Structure
```
src/client/
  routes/
    __root.tsx              # Root layout: Outlet + devtools
    _authenticated.tsx      # Auth guard layout (beforeLoad redirect) + AppShell
    _authenticated/
      board.tsx             # Kanban board (home page)
      list.tsx              # Placeholder
      calendar.tsx          # Placeholder
      analytics.tsx         # Placeholder
      settings.tsx          # Placeholder
      app/
        $slug.tsx           # Application detail page (placeholder)
    index.tsx               # Redirects / -> /board
    login.tsx               # Login page (unauthenticated)
    signup.tsx              # Signup page (unauthenticated)
    reset-password.tsx      # Password reset (unauthenticated)
  components/
    design-system/          # Reusable UI primitives (D-09)
      Badge.tsx
      Button.tsx
      Input.tsx
      Card.tsx
      ColumnHeader.tsx
      SearchBar.tsx
      FilterChips.tsx
      TabBar.tsx
      Modal.tsx
    layout/
      AppShell.tsx          # Sidebar + header + content area
      Sidebar.tsx           # 72px icon rail (desktop)
      BottomTabBar.tsx      # 58px tab bar (mobile)
      Header.tsx            # Title + search + add + dark toggle + avatar
    kanban/
      KanbanBoard.tsx       # Grid layout + column mapping
      KanbanColumn.tsx      # Column header + card list
      KanbanCard.tsx        # BC2 card with urgency tints
      CompanyBadge.tsx      # Colored initial square
      MobileKanban.tsx      # Collapsible status sections
    modals/
      QuickAddModal.tsx     # Add application form
  hooks/
    useTheme.ts             # Zustand store: theme preference
    useApplications.ts      # TanStack Query: fetch/mutate applications
  lib/
    auth-client.ts          # Existing better-auth client
    api.ts                  # Fetch wrapper for API calls
    colors.ts               # Status color mappings
    urgency.ts              # Urgency calculation logic
  index.css                 # Tailwind + @theme tokens + @custom-variant dark
  main.tsx                  # RouterProvider entry point
  routeTree.gen.ts          # Auto-generated by @tanstack/router-plugin
```

### Pattern 1: TanStack Router File-Based Routing with Auth Guard

**What:** File-based routing with `_authenticated` prefix layout for auth protection.
**When to use:** All protected routes live under `_authenticated/` directory. Unauthenticated routes (login, signup, reset-password) live at the root level.

```typescript
// src/client/routes/__root.tsx
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

interface RouterContext {
  auth: {
    isAuthenticated: boolean
    user: { id: string; name: string; email: string } | null
  }
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <>
      <Outlet />
      {import.meta.env.DEV && <TanStackRouterDevtools position="bottom-right" />}
    </>
  ),
  notFoundComponent: () => <div>404 - Page not found</div>,
})
```

```typescript
// src/client/routes/_authenticated.tsx
import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { AppShell } from '../components/layout/AppShell'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: '/login' })
    }
  },
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
})
```

```typescript
// src/client/routes/_authenticated/board.tsx
import { createFileRoute } from '@tanstack/react-router'
import { KanbanBoard } from '../../components/kanban/KanbanBoard'

export const Route = createFileRoute('/_authenticated/board')({
  component: KanbanBoard,
})
```

```typescript
// src/client/routes/index.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({ to: '/board' })
  },
})
```

```typescript
// src/client/routes/login.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/login')({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: '/board' })
    }
  },
  component: LoginPage,
})
```

### Pattern 2: Vite Config with Router Plugin

**What:** TanStack Router plugin must come first in the Vite plugin array.
**When to use:** Always -- required for file-based routing and auto-generated route tree.

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    cloudflare(),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
```

### Pattern 3: Router + Query + Auth Integration in main.tsx

**What:** Wire up TanStack Router with TanStack Query and auth session.
**When to use:** App entry point -- replaces current App.tsx.

```typescript
// src/client/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routeTree } from './routeTree.gen'
import { authClient } from './lib/auth-client'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60, retry: 1 },
  },
})

const router = createRouter({
  routeTree,
  context: { auth: { isAuthenticated: false, user: null } },
  defaultPreload: 'intent',
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function InnerApp() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    // Full-screen loading skeleton while session resolves
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  return (
    <RouterProvider
      router={router}
      context={{
        auth: {
          isAuthenticated: !!session?.user,
          user: session?.user ?? null,
        },
      }}
    />
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <InnerApp />
    </QueryClientProvider>
  </StrictMode>,
)
```

### Pattern 4: Design Tokens via Tailwind v4 @theme

**What:** All design tokens as CSS custom properties that auto-generate Tailwind utilities.
**When to use:** index.css -- the single source of truth for all design values.

```css
/* src/client/index.css */
@import "tailwindcss";

/* Dark mode: class-based with system preference fallback */
@custom-variant dark (&:where(.dark, .dark *));

@theme {
  /* Typography */
  --font-sans: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', system-ui, sans-serif;
  --font-mono: 'SF Mono', 'Menlo', 'Monaco', monospace;

  /* Status colors */
  --color-status-wishlist: #6b7280;
  --color-status-applied: #3b82f6;
  --color-status-screening: #8b5cf6;
  --color-status-interviewing: #f59e0b;
  --color-status-offer: #22c55e;
  --color-status-accepted: #10b981;
  --color-status-rejected: #ef4444;
  --color-status-withdrawn: #64748b;

  /* Surface colors */
  --color-surface-accent: #292524;

  /* Text colors */
  --color-text-primary: #1c1917;
  --color-text-secondary: #78716c;
  --color-text-muted: #a8a29e;

  /* Star rating */
  --color-star-filled: #f59e0b;
  --color-star-empty: #d6d3d1;

  /* Dark mode surfaces */
  --color-dark-dominant: #18181b;
  --color-dark-card: #27272a;
  --color-dark-accent: #f4f4f5;

  /* Radius scale */
  --radius-btn: 6px;
  --radius-card: 8px;
  --radius-input: 10px;
  --radius-card-mobile: 12px;
  --radius-modal: 14px;
  --radius-pill: 99px;
}

/* Glass effect utility classes */
@layer components {
  .glass {
    background: rgba(255, 255, 255, 0.55);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.5);
  }

  .glass-hover:hover {
    background: rgba(255, 255, 255, 0.8);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  }

  .dark .glass {
    background: rgba(39, 39, 42, 0.65);
    border-color: rgba(63, 63, 70, 0.5);
  }

  .dark .glass-hover:hover {
    background: rgba(39, 39, 42, 0.85);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }
}

/* Warm gradient body background */
body {
  background: linear-gradient(145deg, #f5f3f0, #ece8e3, #e8e4df);
  min-height: 100vh;
}

.dark body,
body:where(.dark *) {
  background: #18181b;
}
```

### Pattern 5: Zustand Theme Store with localStorage

**What:** Theme state management with system preference detection.
**When to use:** Theme toggle and initial detection.

```typescript
// src/client/hooks/useTheme.ts
import { create } from 'zustand'

type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeStore {
  mode: ThemeMode
  resolved: 'light' | 'dark'
  setMode: (mode: ThemeMode) => void
}

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  return mode === 'system' ? getSystemTheme() : mode
}

function applyTheme(resolved: 'light' | 'dark') {
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}

const stored = localStorage.getItem('theme') as ThemeMode | null
const initialMode = stored || 'system'
const initialResolved = resolveTheme(initialMode)
applyTheme(initialResolved)

export const useTheme = create<ThemeStore>((set) => ({
  mode: initialMode,
  resolved: initialResolved,
  setMode: (mode) => {
    const resolved = resolveTheme(mode)
    localStorage.setItem('theme', mode)
    applyTheme(resolved)
    set({ mode, resolved })
  },
}))
```

### Pattern 6: TanStack Query for Kanban Data

**What:** Fetch applications grouped by status for the kanban board.
**When to use:** KanbanBoard component data layer.

```typescript
// src/client/hooks/useApplications.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { APPLICATION_STATUSES } from '@/shared/constants'

interface Application {
  id: string
  companyName: string
  roleTitle: string
  status: string
  priority: string
  slug: string
  isPinned: boolean
  isArchived: boolean
  updatedAt: string
  createdAt: string
  appliedAt: string | null
  source: string | null
  locationType: string | null
  locationCity: string | null
  salaryMin: number | null
  salaryMax: number | null
  salaryCurrency: string
  notes: string | null
}

async function fetchApplications(): Promise<Application[]> {
  const res = await fetch('/api/applications?limit=100')
  if (!res.ok) throw new Error('Failed to fetch applications')
  const json = await res.json()
  return json.data.items
}

export function useApplications() {
  return useQuery({
    queryKey: ['applications'],
    queryFn: fetchApplications,
  })
}

export function useApplicationsByStatus() {
  const query = useApplications()
  const grouped = new Map<string, Application[]>()

  // Initialize all statuses (even empty ones) to prevent column collapse
  for (const status of APPLICATION_STATUSES) {
    grouped.set(status, [])
  }

  if (query.data) {
    for (const app of query.data) {
      const list = grouped.get(app.status) || []
      list.push(app)
      grouped.set(app.status, list)
    }
  }

  return { ...query, grouped }
}

export function useCreateApplication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { companyName: string; roleTitle: string; status?: string }) => {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) throw new Error('Failed to create application')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
    },
  })
}
```

### Pattern 7: Lucide Icons with Global 1.8px Stroke

**What:** Use Lucide icons with consistent 1.8px stroke throughout the app.
**When to use:** Every icon instance.

```typescript
// Option A: CSS global styling (simpler, recommended)
// In index.css:
// .lucide { stroke-width: 1.8px; }

// Option B: Direct usage with props
import { LayoutDashboard, List, Calendar, BarChart3, Settings } from 'lucide-react'

// Sidebar nav items
const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Board', to: '/board' },
  { icon: List, label: 'List', to: '/list' },
  { icon: Calendar, label: 'Calendar', to: '/calendar' },
  { icon: BarChart3, label: 'Analytics', to: '/analytics' },
  { icon: Settings, label: 'Settings', to: '/settings' },
] as const

// Usage
<LayoutDashboard size={20} strokeWidth={1.8} />
```

### Anti-Patterns to Avoid
- **Inline hex colors:** All colors must come from CSS custom properties / @theme tokens. Never hardcode `#f59e0b` in JSX -- use `text-status-interviewing` or `var(--color-status-interviewing)`.
- **Importing entire Lucide bundle:** Always use named imports like `import { Camera } from 'lucide-react'`. Never `import * as icons`.
- **Using emojis for status indicators:** D-23 forbids emojis. Use Lucide SVG icons only.
- **Adding redundant text labels for urgency:** D-16 explicitly states tint IS the signal. No "Stale" or "Interview Today" text badges.
- **Nested glass on glass:** Avoid stacking backdrop-filter elements. A glass card inside a glass container creates double blur -- only the leaf element should have the glass effect.
- **Large blur values on many elements:** Keep backdrop-filter to 3-5 concurrent glass elements per viewport. More than 10 causes lag on mid-range devices.
- **Horizontal scrolling kanban:** D-13 specifies `auto-fit` grid that fills page width. Never use `overflow-x: auto` with fixed-width columns.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SPA routing | Custom pathname router (current App.tsx) | TanStack Router | Type safety, auth guards, code splitting, devtools |
| Server state | useState + fetch + manual loading/error | TanStack Query | Caching, deduplication, background refetch, mutations |
| Theme persistence | Raw localStorage + manual DOM toggle | Zustand store wrapping localStorage | Reactive updates, system preference detection, FOUC prevention |
| SVG icons | Custom SVG components or icon fonts | Lucide React | 1500+ icons, tree-shakable, consistent stroke-based design |
| CSS dark mode | Manual CSS class toggling with JS | Tailwind v4 @custom-variant dark | Native dark: prefix in all Tailwind utilities |
| Design tokens | Separate JS constants or Sass variables | Tailwind v4 @theme | Auto-generates utility classes, CSS variables available everywhere |
| Form validation (quick-add) | Manual validation logic | Zod (already installed) | Shared schemas with API, type inference |

**Key insight:** The existing App.tsx router, Button, and Input components will be replaced (not extended). The new design system is fundamentally different in visual language (glass vs stone/solid). Reuse the TypeScript patterns (forwardRef, interface props) but rebuild the styles from scratch using the token system.

## Common Pitfalls

### Pitfall 1: Flash of Unstyled Content (FOUC) on Dark Mode
**What goes wrong:** Page loads in light mode, then flickers to dark after JavaScript executes.
**Why it happens:** Dark mode toggle runs after React hydrates -- there is a visible gap between HTML render and JS execution.
**How to avoid:** Add an inline `<script>` in `index.html` `<head>` (before any CSS loads) that reads `localStorage.theme` and toggles `document.documentElement.classList`. This runs synchronously before paint.
**Warning signs:** Visible white flash when navigating to the app with dark mode saved.

```html
<!-- index.html, inside <head>, before any other scripts -->
<script>
  document.documentElement.classList.toggle(
    "dark",
    localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
  );
</script>
```

### Pitfall 2: Safari backdrop-filter Prefix
**What goes wrong:** Glass effect does not render on Safari (macOS and iOS).
**Why it happens:** Safari versions before 17 require `-webkit-backdrop-filter` alongside `backdrop-filter`.
**How to avoid:** Always include both properties in the `.glass` utility class. Tailwind v4 `backdrop-blur-*` utilities handle this automatically, but custom CSS in `@layer components` must include it manually.
**Warning signs:** Cards appear as solid opaque rectangles on Safari, no frosted effect.

### Pitfall 3: TanStack Router Plugin Order in Vite
**What goes wrong:** Route tree file (`routeTree.gen.ts`) is not generated, TypeScript errors on import.
**Why it happens:** `tanstackRouter()` must be the FIRST plugin in the Vite config array, before `react()`.
**How to avoid:** Always place `tanstackRouter({ target: 'react', autoCodeSplitting: true })` first in the plugins array.
**Warning signs:** `routeTree.gen.ts` file not created or not updating when route files change.

### Pitfall 4: Auth Session Race Condition
**What goes wrong:** Router loads and `beforeLoad` fires before `authClient.useSession()` resolves, redirecting authenticated users to login.
**Why it happens:** TanStack Router evaluates `beforeLoad` synchronously, but session check is async.
**How to avoid:** Lift session loading ABOVE RouterProvider. Only render `<RouterProvider>` after session `isPending` is false. Pass resolved auth state via router context.
**Warning signs:** Authenticated users briefly see login page on refresh.

### Pitfall 5: Over-fetching for Kanban
**What goes wrong:** Kanban loads all applications with all fields when it only needs summary data.
**Why it happens:** Using the existing `GET /api/applications` endpoint which returns full records.
**How to avoid:** For Phase 3, the existing endpoint is fine (personal tracker, unlikely to have 100+ active apps). If performance becomes an issue in later phases, add a dedicated board endpoint with minimal fields.
**Warning signs:** Slow kanban load time, large network payloads.

### Pitfall 6: CSS Grid Column Collapse on Empty Status
**What goes wrong:** When a status has zero applications, the column disappears from the grid, shifting other columns.
**Why it happens:** `auto-fit` with `minmax()` collapses empty tracks to zero width.
**How to avoid:** Always render all status columns, even empty ones. Give each column a `min-height` so they remain visible. Pre-initialize the grouped map with all statuses.
**Warning signs:** Columns jump around as applications are added/removed from statuses.

### Pitfall 7: Tailwind v4 @theme vs Custom Properties Confusion
**What goes wrong:** Custom properties defined outside `@theme` are not available as Tailwind utilities.
**Why it happens:** Only properties inside `@theme { }` generate corresponding Tailwind utility classes. Raw `--custom-prop` in `:root` are just CSS variables.
**How to avoid:** Put ALL design tokens in `@theme`. Use `@layer components` for complex multi-property styles like `.glass` that combine multiple CSS properties.
**Warning signs:** `bg-status-applied` class does not apply any styles -- the token was defined outside @theme.

### Pitfall 8: Broken Import Paths After Route Migration
**What goes wrong:** Moving from `src/client/pages/` to `src/client/routes/` breaks relative imports in auth page components.
**Why it happens:** Route files move into a different directory hierarchy, but they import components using relative paths.
**How to avoid:** Use the `@/` path alias exclusively (`@/client/components/...`). The alias is already configured in tsconfig.app.json and vite.config.ts.
**Warning signs:** TypeScript compilation errors after restructuring routes.

### Pitfall 9: tsconfig.app.json include Scope
**What goes wrong:** New route files under `src/client/routes/` are not type-checked by TypeScript.
**Why it happens:** The current tsconfig.app.json includes `src/client/**/*.ts` and `src/client/**/*.tsx`, which should cover new routes. But if routeTree.gen.ts is generated at the project root, it may fall outside the include scope.
**How to avoid:** Verify that `routeTree.gen.ts` is generated inside `src/client/` (TanStack Router plugin defaults to `./src/routeTree.gen.ts`). Configure the plugin's `generatedRouteTree` option to point to `./src/client/routeTree.gen.ts`.
**Warning signs:** Type errors or missing types in the generated route tree file.

## Code Examples

### Company Badge Component
```typescript
// src/client/components/kanban/CompanyBadge.tsx
// Source: Design system spec D-15

interface CompanyBadgeProps {
  companyName: string
  size?: 'sm' | 'lg'  // sm=24px (desktop), lg=36px (mobile)
}

// Deterministic color from company name
function getCompanyColor(name: string): string {
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16',
    '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
    '#6366f1', '#8b5cf6', '#a855f7', '#ec4899',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export function CompanyBadge({ companyName, size = 'sm' }: CompanyBadgeProps) {
  const px = size === 'sm' ? 24 : 36
  const color = getCompanyColor(companyName)
  const initial = companyName.charAt(0).toUpperCase()

  return (
    <div
      className="flex items-center justify-center rounded-md font-semibold text-white"
      style={{
        width: px,
        height: px,
        backgroundColor: color,
        fontSize: px * 0.5,
      }}
    >
      {initial}
    </div>
  )
}
```

### Urgency Calculation Utility
```typescript
// src/client/lib/urgency.ts
// Source: D-16, D-17 -- kanban card urgency tints

export type UrgencyLevel =
  | 'interview-today'
  | 'interview-tomorrow'
  | 'interview-week'
  | 'offer-expiring'
  | 'stale'
  | 'rejected'
  | 'normal'

interface UrgencyInput {
  status: string
  updatedAt: string  // ISO timestamp or unix epoch
  // Future phases will add interviewDate, deadlineDate
}

export function calculateUrgency(app: UrgencyInput): UrgencyLevel {
  if (app.status === 'rejected') return 'rejected'

  const now = Date.now()
  const updated = new Date(app.updatedAt).getTime()
  const daysSinceUpdate = Math.floor((now - updated) / (1000 * 60 * 60 * 24))

  // Stale: no update in 7+ days (not rejected/withdrawn/accepted)
  if (daysSinceUpdate >= 7 && !['rejected', 'withdrawn', 'accepted'].includes(app.status)) {
    return 'stale'
  }

  // Interview and offer urgency will be added in Phase 5/6 when
  // interview dates and deadlines are available
  return 'normal'
}

// CSS classes for urgency tints (applied to card wrapper)
export const URGENCY_STYLES: Record<UrgencyLevel, string> = {
  'interview-today': 'bg-[rgba(245,158,11,0.06)] border border-[rgba(245,158,11,0.15)]',
  'interview-tomorrow': 'bg-[rgba(245,158,11,0.06)] border border-[rgba(245,158,11,0.15)]',
  'interview-week': '',
  'offer-expiring': 'bg-[rgba(34,197,94,0.06)] border border-[rgba(34,197,94,0.15)]',
  'stale': 'bg-[rgba(239,68,68,0.05)] border border-[rgba(239,68,68,0.12)]',
  'rejected': 'opacity-40',
  'normal': '',
}
```

### Dark Mode Toggle
```typescript
// Part of the Header component
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'

export function ThemeToggle() {
  const { mode, setMode } = useTheme()

  const next: Record<string, 'light' | 'dark' | 'system'> = {
    light: 'dark',
    dark: 'system',
    system: 'light',
  }
  const icons = { light: Sun, dark: Moon, system: Monitor }
  const Icon = icons[mode]

  return (
    <button
      type="button"
      onClick={() => setMode(next[mode])}
      className="flex h-8 w-8 items-center justify-center rounded-md
        hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
      aria-label={`Switch to ${next[mode]} mode`}
    >
      <Icon size={18} strokeWidth={1.8} />
    </button>
  )
}
```

### Quick-Add Modal Structure
```typescript
// src/client/components/modals/QuickAddModal.tsx
// Glass card centered on desktop, bottom sheet on mobile (D-04)

interface QuickAddModalProps {
  open: boolean
  onClose: () => void
}

export function QuickAddModal({ open, onClose }: QuickAddModalProps) {
  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4
        max-md:items-end max-md:p-0">
        <div className="glass w-full max-w-md rounded-[14px] p-6
          max-md:rounded-b-none max-md:rounded-t-[14px] max-md:pb-8">
          {/* Mobile grab handle */}
          <div className="mx-auto mb-4 h-1 w-8 rounded-full bg-black/10
            dark:bg-white/20 md:hidden" />

          <h2 className="text-lg font-semibold text-text-primary dark:text-dark-accent">
            Add Application
          </h2>
          {/* Form: company (Input glass), role (Input glass), status (select) */}
          {/* Actions: "Add Application" (Button filled), "Discard" (Button ghost) */}
        </div>
      </div>
    </>
  )
}
```

### Mobile Kanban Collapsible Sections
```typescript
// src/client/components/kanban/MobileKanban.tsx
// D-19: collapsible status sections ordered by priority

const MOBILE_STATUS_ORDER = [
  'interviewing', 'offer', 'applied', 'screening', 'wishlist', 'rejected',
] as const

interface CollapsibleSectionProps {
  status: string
  apps: Application[]
  defaultOpen?: boolean
}

function CollapsibleSection({ status, apps, defaultOpen = false }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-3"
      >
        <ColumnHeader status={status} count={apps.length} variant="filled" />
        <ChevronDown
          size={16}
          strokeWidth={1.8}
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="space-y-2 pb-4">
          {apps.map((app) => <KanbanCard key={app.id} app={app} />)}
          {apps.length === 0 && (
            <p className="py-4 text-center text-sm text-text-muted">
              No applications
            </p>
          )}
        </div>
      )}
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| tailwind.config.js darkMode: 'class' | @custom-variant dark in CSS | Tailwind v4 (Jan 2025) | No JS config file needed. CSS-first. |
| tailwind.config.js theme.extend | @theme { } in CSS | Tailwind v4 (Jan 2025) | Tokens are CSS variables. Auto-generate utilities. |
| React Router v6 createBrowserRouter | TanStack Router file-based | TanStack Router v1 (2024) | Full type safety, auto code-splitting, built-in devtools. |
| useState + useEffect + fetch | TanStack Query useQuery | TanStack Query v5 (2024) | Declarative, cached, deduped, background refetch. |
| Custom pathname router (current) | TanStack Router | Phase 3 migration | From 10-line pushState to typed, guarded, code-split routing. |

**Deprecated/outdated:**
- The current `App.tsx` pathname router must be fully replaced.
- The current `Button.tsx` and `Input.tsx` use stone color palette hardcoded in Tailwind classes -- these will be rebuilt to use design system tokens.
- `DashboardPage` placeholder is deleted entirely -- kanban replaces it at `/board`.

## Open Questions

1. **Drag-and-drop scope for Phase 3**
   - What we know: VIEW-01 mentions "drag-and-drop" but STACK.md assigns `@hello-pangea/dnd`. The state blockers note "Fractional indexing for kanban needs investigation in Phase 4 planning." UI-05 (optimistic UI for drag-and-drop) is mapped to Phase 4.
   - What's unclear: Whether Phase 3 should include basic DnD or defer entirely to Phase 4.
   - Recommendation: Phase 3 renders the board read-only. DnD is Phase 4 scope (along with UI-05 optimistic UI). The kanban in Phase 3 displays cards with correct urgency tints and layouts but does not support column-to-column dragging.

2. **TanStack Router + Cloudflare SPA fallback**
   - What we know: Current app uses pathname-based routing with Cloudflare SPA mode (all paths serve index.html). TanStack Router uses browser history API.
   - What's unclear: Whether TanStack Router needs special configuration for Cloudflare Pages SPA mode.
   - Recommendation: No special config needed. Cloudflare Pages SPA mode returns index.html for all unmatched paths. TanStack Router then handles client-side routing. Verify `_redirects` file exists with `/* /index.html 200` if needed.

3. **Board route as index vs named route**
   - What we know: D-06 says "/board (home/default)". File-based routing uses `index.tsx` for `/` and named files for paths.
   - What's unclear: Should `/` redirect to `/board`, or should the board live at `/`?
   - Recommendation: Use `/board` as the named route. Add an `index.tsx` that redirects to `/board`. This keeps routes clean and matches D-06.

4. **routeTree.gen.ts output location**
   - What we know: TanStack Router plugin default generates `./src/routeTree.gen.ts`. The tsconfig.app.json includes `src/client/**/*.ts`.
   - What's unclear: Whether the generated file must be in `src/client/` to be type-checked.
   - Recommendation: Configure the plugin with `generatedRouteTree: './src/client/routeTree.gen.ts'` and `routesDirectory: './src/client/routes'` to keep it within the client include scope.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build tools, dev server | Yes | 20.19.0 (pinned .nvmrc) | -- |
| npm | Package install | Yes | Bundled with Node | -- |
| Vite 8 | Dev server, build | Yes | ^8.0.4 | -- |
| Tailwind CSS v4 | Styling | Yes | ^4.2.0 | -- |
| Wrangler | Local dev, deploy | Yes | ^4.83.0 | -- |

No new external tools or services required. All new dependencies are npm packages.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.4 + @cloudflare/vitest-pool-workers 0.14.7 |
| Config file | vitest.config.ts (Workers pool -- API-side only) |
| Quick run command | `npm test` |
| Full suite command | `npm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| VIEW-01 | Kanban board renders columns per status with correct cards | manual-only | Visual inspection in browser | N/A |
| UI-01 | Dark mode toggles between light/dark/system | manual-only | Visual inspection + localStorage check | N/A |
| UI-02 | Responsive layout: sidebar on desktop, tab bar on mobile | manual-only | Browser resize / DevTools device mode | N/A |
| UI-03 | Glass card aesthetic with correct tokens | manual-only | Visual inspection | N/A |
| UI-04 | Status colors consistent across badge, column header, card | manual-only | Visual inspection | N/A |
| UI-06 | Design system components render with correct variants | manual-only | Visual inspection | N/A |

**Justification for manual-only:** Phase 3 is entirely frontend UI rendering. The existing test infrastructure uses `@cloudflare/vitest-pool-workers` which runs in the Workers runtime -- it cannot test React component rendering. Setting up a browser-based component testing framework (jsdom/happy-dom or Playwright) is out of scope for this phase.

### Sampling Rate
- **Per task commit:** Visual inspection in dev server (run `npm run dev`)
- **Per wave merge:** Run `npm test` to ensure existing API tests pass (no regressions from vite.config.ts changes)
- **Phase gate:** Full test suite green + visual verification of all 6 requirements across light/dark mode + desktop/mobile viewports

### Wave 0 Gaps
None -- no automated frontend tests are established or required for this phase. The existing API test suite serves as a regression guard.

## Project Constraints (from CLAUDE.md)

- **Git commits:** Never add a Co-Authored-By line for Claude in commit messages. Commits should only attribute the user.
- **Stack:** All Cloudflare -- Pages (frontend), Workers (API), D1 (database), R2 (storage), KV (sessions/cache).
- **Frontend:** React SPA on Cloudflare Pages.
- **Design:** Glass card aesthetic (supersedes "minimal-warm" from PROJECT.md per CONTEXT.md decisions).
- **Cost:** $0/month -- Cloudflare free tiers only.
- **GSD Workflow:** Do not make direct repo edits outside a GSD workflow unless the user explicitly asks.

## Sources

### Primary (HIGH confidence)
- [Tailwind CSS v4 Dark Mode docs](https://tailwindcss.com/docs/dark-mode) -- @custom-variant dark pattern, class-based toggle, JS FOUC prevention script
- [Tailwind CSS v4 Custom Styles docs](https://tailwindcss.com/docs/adding-custom-styles) -- @theme directive for design tokens, utility generation
- [Lucide React Getting Started](https://lucide.dev/guide/react/getting-started) -- Installation, props: size (default 24), color (currentColor), strokeWidth (default 2)
- [Lucide React Global Styling](https://lucide.dev/guide/react/advanced/global-styling) -- LucideProvider and .lucide CSS class method
- npm registry (April 2026) -- All package versions verified: @tanstack/react-router@1.168.22, @tanstack/react-query@5.99.0, lucide-react@1.8.0, zustand@5.0.12

### Secondary (MEDIUM confidence)
- [TanStack Router: Installation with Vite](https://tanstack.com/router/v1/docs/framework/react/installation/with-vite) -- tanstackRouter plugin before react plugin, default config
- [TanStack Router: Authenticated Routes](https://tanstack.com/router/v1/docs/framework/react/guide/authenticated-routes) -- beforeLoad, redirect(), createRootRouteWithContext
- [TanStack Router: Setup Authentication](https://tanstack.com/router/v1/docs/framework/react/how-to/setup-authentication) -- Complete auth setup pattern
- [TanStack Router: Router Context](https://tanstack.com/router/v1/docs/framework/react/guide/router-context) -- createRootRouteWithContext type constraint
- [TanStack Query: Integration with Router](https://tanstack.com/router/latest/docs/integrations/query) -- QueryClientProvider wrapping pattern
- [DEV.to: TanStack Router auth guard](https://dev.to/this-is-learning/tanstack-router-how-to-protect-routes-with-an-authentication-guard-1laj) -- _authenticated layout folder pattern
- [DEV.to: TanStack Router SaaS setup 2026](https://dev.to/kiran_ravi_092a2cfcf60389/tanstack-router-setup-in-our-react-saas-template-2026-4b67) -- Practical file-based routing with devtools

### Tertiary (LOW confidence)
- [Glassmorphism Implementation Guide](https://playground.halfaccessible.com/blog/glassmorphism-design-trend-implementation-guide) -- Performance: 3-5 glass elements safe, 10+ causes lag on mid-range phones
- WebSearch results for CSS backdrop-filter Safari compatibility -- -webkit-backdrop-filter required for Safari < 17

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all packages verified via npm registry, versions are current stable releases
- Architecture: HIGH -- file-based routing pattern well-documented in official TanStack docs, auth guard pattern established
- Design system: HIGH -- UI-SPEC provides complete token values with exact hex codes, rgba values, and pixel dimensions
- Pitfalls: HIGH -- dark mode FOUC prevention, Safari prefix, plugin order are all documented in official sources

**Research date:** 2026-04-16
**Valid until:** 2026-05-16 (stable -- Tailwind v4 and TanStack Router v1 are both post-1.0 mature releases)
