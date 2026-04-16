# Phase 3: Frontend Shell & Dashboard - Research

**Researched:** 2026-04-16
**Domain:** React SPA shell (routing, layout, dashboard, dark mode, design system)
**Confidence:** HIGH

## Summary

This phase replaces the placeholder dashboard and simple pathname router with a full application shell (sidebar + header + content area) and a smart dashboard landing view. The primary technical work involves introducing TanStack Router for type-safe SPA routing, TanStack Query for server state management, Zustand for client-only UI state (theme, sidebar), building new UI components (Card, Badge, Modal, Sidebar, StatCard), and implementing dark mode with Tailwind CSS v4's `@custom-variant` directive.

The existing codebase has a solid foundation: three UI primitives (Button, Input, Toast), an auth client with `useSession()`, a working API layer at `/api/applications` with filtering/pagination, and a stone-palette aesthetic with Tailwind utility classes. The router replacement is the highest-risk work since it touches the app entry point and every existing page import. The dashboard data fetching is straightforward since Phase 2 already provides the list endpoint with status filtering.

**Primary recommendation:** Use TanStack Router file-based routing with the Vite plugin for auto-generated route tree and code splitting. Use a `_authenticated` layout route with `beforeLoad` guard to protect all app routes. Use TanStack Query for all API data fetching. Use Zustand with persist middleware for theme preference and sidebar state.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Sidebar + header layout. Fixed sidebar on left (collapsible on mobile), header bar at top with user info + notification bell placeholder.
- **D-02:** Sidebar contains navigation links: Dashboard (default), Kanban, Table, Calendar, Analytics, Contacts, Settings. Active link highlighted.
- **D-03:** Sidebar collapses to icon-only on smaller screens. Mobile: hamburger menu in header toggles sidebar overlay.
- **D-04:** Main content area fills remaining space. Scroll is on the content area, not the whole page.
- **D-05:** Top section: 4 summary stat cards in a responsive grid (total active, interviews this week, offer rate %, avg days in pipeline). Each card has label, value, and subtle trend indicator.
- **D-06:** Middle section: two columns -- "Stale Applications" (no update 7+ days, sorted by staleness) and "Upcoming Interviews" (sorted by date, nearest first).
- **D-07:** Bottom section: "Recent Activity" feed showing latest timeline events across all applications.
- **D-08:** Quick-add button in header or dashboard hero -- prominent, always accessible.
- **D-09:** Modal dialog for adding applications. Minimal required fields: company name, role title, status (default: "wishlist"). Optional fields expandable.
- **D-10:** Modal reusable for future forms (interview rounds, contacts, etc.).
- **D-11:** Upgrade from custom pathname router to TanStack Router for type-safe SPA routing.
- **D-12:** Auth guard: unauthenticated users redirect to /login. Authenticated users on /login redirect to /dashboard.
- **D-13:** Routes: /dashboard (default), /kanban, /table, /calendar, /analytics, /contacts, /settings, /app/:slug (detail -- Phase 4). Placeholder pages for routes not yet implemented.
- **D-14:** CSS variables for color tokens. Light mode: stone palette (already established). Dark mode: slate/zinc palette.
- **D-15:** System preference auto-detection on first visit via `prefers-color-scheme` media query.
- **D-16:** Manual toggle in header. Preference persisted to localStorage.
- **D-17:** `<html>` element gets `class="dark"` for Tailwind dark mode.
- **D-18:** Consistent status colors across all views: Wishlist gray-500, Applied blue-500, Screening violet-500, Interviewing amber-500, Offer green-500, Accepted emerald-500, Rejected red-500, Withdrawn slate-500.
- **D-19:** Colors defined as CSS variables and as a TypeScript constant map for programmatic use.
- **D-20:** Extend existing UI primitives (Button, Input, Toast) with: Card, Badge, Modal, Sidebar, StatCard.
- **D-21:** Stone palette for light mode (already established in Phase 1 components). Consistent rounded-lg corners, font-medium labels, ring-2 focus states.

### Claude's Discretion
- TanStack Router configuration details and file-based vs code-based routing
- Exact sidebar width and transition animations
- Loading skeleton designs for dashboard sections
- Empty state illustrations/messages
- Exact stat card layout proportions
- How to fetch dashboard data (SWR, TanStack Query, or simple fetch + useState)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| VIEW-01 | Smart dashboard as the default landing view with summary cards (total active, interviews this week, offer rate, avg days in pipeline) | TanStack Query fetching from GET /api/applications with status filters; computed stats from application list; StatCard component pattern |
| VIEW-02 | Dashboard shows stale application warnings (no update in 7+ days) and upcoming interviews | Filter applications where updatedAt < 7 days ago and status is active; interview data from future phases will need placeholder |
| VIEW-03 | Dashboard provides quick-add and quick-action buttons | Reusable Modal component (D-09, D-10); createApplicationSchema already exists in shared validators |
| UI-01 | Dark mode with system preference detection and manual toggle | Tailwind v4 @custom-variant dark class strategy; Zustand persist middleware for localStorage; prefers-color-scheme media query listener |
| UI-02 | Desktop-first responsive design; mobile-friendly for quick capture | Sidebar collapses to icons at md breakpoint; mobile hamburger overlay; CSS Grid/Flexbox responsive dashboard grid |
| UI-03 | Minimal-warm aesthetic: clean whitespace, rounded elements, sharp typography, soft pastel accents | Existing stone palette; extend with CSS custom properties for light/dark tokens; consistent rounded-lg, font-medium patterns |
| UI-04 | Consistent status color system across all views | STATUS_COLORS TypeScript constant map + CSS custom properties; colors from spec section 14 |

</phase_requirements>

## Project Constraints (from CLAUDE.md)

- Never add Co-Authored-By line for Claude in commit messages
- GSD workflow enforcement: use GSD commands for file-changing operations
- Stack is all-Cloudflare (Pages, Workers, D1, R2, KV)
- Frontend is React SPA on Cloudflare Pages
- $0/month hosting cost constraint
- Biome for linting/formatting (not ESLint)

## Standard Stack

### Core (New for Phase 3)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tanstack/react-router | ^1.168.22 | Type-safe SPA routing | Locked decision D-11. Superior type safety, file-based route generation, built-in code splitting. Purpose-built for SPAs. |
| @tanstack/react-query | ^5.99.0 | Server state management | De facto standard for async React state. Caching, deduplication, background refetch. Recommended in STACK.md. Discretion area: chosen over SWR or plain fetch for consistency with TanStack ecosystem. |
| zustand | ^5.0.12 | Client UI state | Theme preference, sidebar collapsed state. 1.1kB, persist middleware for localStorage. Recommended in STACK.md. |
| @tanstack/router-plugin | ^1.167.22 | Vite plugin for file-based routing | Auto-generates route tree, enables automatic code splitting. Required for file-based routing approach. |
| lucide-react | ^1.8.0 | Icon library | Consistent, tree-shakeable SVG icons for sidebar navigation, header actions, stat cards. De facto standard with shadcn/ui ecosystem. |
| clsx | ^2.1.1 | Conditional class names | Lightweight utility for composing Tailwind class strings conditionally. |
| tailwind-merge | ^3.5.0 | Merge Tailwind classes | Resolves conflicting Tailwind classes when composing component props. Standard companion to clsx. |

### Existing (Already Installed)

| Library | Version | Purpose |
|---------|---------|---------|
| react | ^19.2.4 | UI framework |
| react-dom | ^19.2.4 | DOM rendering |
| tailwindcss | ^4.2.0 | Styling |
| better-auth | ^1.6.5 | Auth (useSession hook) |
| zod | ^3.24.0 | Validation (createApplicationSchema) |
| vite | ^8.0.4 | Build tool |
| @cloudflare/vite-plugin | ^1.32.3 | Cloudflare integration |

### Dev Dependencies (New for Phase 3)

| Library | Version | Purpose |
|---------|---------|---------|
| @tanstack/react-router-devtools | ^1.166.13 | Router debugging in dev mode |
| @tanstack/react-query-devtools | ^5.99.0 | Query cache inspection in dev mode |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| TanStack Query | SWR or plain fetch+useState | SWR is simpler but lacks mutation support and optimistic update patterns needed for Phase 4+ (kanban drag-drop). TanStack Query's QueryClient integrates with TanStack Router loaders. |
| File-based routing | Code-based routing | Code-based gives explicit control but loses auto code splitting and requires manual route tree. File-based is less boilerplate for 10+ routes. |
| lucide-react | heroicons or phosphor-icons | All viable. lucide-react is the default in shadcn/ui ecosystem and has the widest icon set (1600+). |
| Zustand persist | Plain localStorage + useState | Zustand persist handles SSR hydration, storage serialization, and version migration. Worth the 1.1kB for correctness. |

**Installation:**
```bash
npm install @tanstack/react-router @tanstack/react-query zustand lucide-react clsx tailwind-merge
npm install -D @tanstack/router-plugin @tanstack/react-router-devtools @tanstack/react-query-devtools
```

## Architecture Patterns

### Recommended File Structure for Phase 3

```
src/client/
  routes/                        # TanStack Router file-based routes
    __root.tsx                   # Root layout (QueryClientProvider, ToastProvider)
    _authenticated.tsx           # Auth guard layout (beforeLoad redirect)
    _authenticated/
      _app-shell.tsx             # App shell layout (Sidebar + Header + Outlet)
      _app-shell/
        dashboard.tsx            # /dashboard -- smart dashboard (VIEW-01, VIEW-02, VIEW-03)
        kanban.tsx               # /kanban -- placeholder
        table.tsx                # /table -- placeholder
        calendar.tsx             # /calendar -- placeholder
        analytics.tsx            # /analytics -- placeholder
        contacts.tsx             # /contacts -- placeholder
        settings.tsx             # /settings -- placeholder
      app/
        $slug.tsx                # /app/:slug -- placeholder for Phase 4
    login.tsx                    # /login -- existing LoginPage
    signup.tsx                   # /signup -- existing SignupPage
    reset-password.tsx           # /reset-password -- existing
    index.tsx                    # / -- redirect to /dashboard
  components/
    ui/                          # Primitives (existing + new)
      Button.tsx                 # Existing
      Input.tsx                  # Existing
      Toast.tsx                  # Existing
      Card.tsx                   # NEW: container card with variants
      Badge.tsx                  # NEW: status badge with color map
      Modal.tsx                  # NEW: dialog overlay (D-09, D-10)
      StatCard.tsx               # NEW: dashboard stat card
      Skeleton.tsx               # NEW: loading skeleton
    layout/
      AuthLayout.tsx             # Existing (auth pages)
      AppShell.tsx               # NEW: sidebar + header + content area
      Sidebar.tsx                # NEW: navigation sidebar (D-01, D-02, D-03)
      Header.tsx                 # NEW: top bar with user info + actions
      ThemeToggle.tsx            # NEW: dark mode toggle button
    dashboard/
      SummaryCards.tsx           # 4 stat cards grid
      StaleApplications.tsx      # "No update 7+ days" list
      UpcomingInterviews.tsx     # Sorted by date, nearest first
      RecentActivity.tsx         # Timeline events feed
      QuickAddModal.tsx          # Quick-add application modal
  hooks/
    useApplications.ts           # TanStack Query hook for GET /api/applications
    useDashboardStats.ts         # Computed stats from application data
    useCreateApplication.ts      # TanStack Query mutation for POST /api/applications
  stores/
    theme.ts                     # Zustand: theme preference (light/dark/system)
    sidebar.ts                   # Zustand: sidebar collapsed state
  lib/
    auth-client.ts               # Existing
    api.ts                       # NEW: fetch wrapper for API calls
    cn.ts                        # NEW: clsx + tailwind-merge utility
    status-colors.ts             # NEW: STATUS_COLORS constant map (D-18, D-19)
```

### Pattern 1: TanStack Router File-Based Routing with Auth Guard

**What:** File-based routing with `@tanstack/router-plugin/vite` auto-generates a route tree. A `_authenticated` layout route uses `beforeLoad` to check session and redirect unauthenticated users. An `_app-shell` layout route wraps authenticated pages in the sidebar + header shell.

**When to use:** All routes in this SPA.

**Configuration (vite.config.ts):**
```typescript
import { tanstackRouter } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    cloudflare(),
  ],
  // ...
});
```

**Root route (__root.tsx):**
```typescript
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => <Outlet />,
});
```

**Auth guard (_authenticated.tsx):**
```typescript
import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { authClient } from "@/client/lib/auth-client";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      throw redirect({ to: "/login" });
    }
  },
  component: () => <Outlet />,
});
```

**App shell layout (_authenticated/_app-shell.tsx):**
```typescript
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/client/components/layout/AppShell";

export const Route = createFileRoute("/_authenticated/_app-shell")({
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
```

**Important:** The `tanstackRouter` plugin MUST come before `react()` in the Vite plugins array. The plugin watches `src/client/routes/` and generates `src/client/routeTree.gen.ts`. Add `routeTree.gen.ts` to `.gitignore` and to Biome's ignore list.

### Pattern 2: TanStack Query for Dashboard Data

**What:** Use `useQuery` hooks to fetch application data from the existing API. Derive dashboard stats (total active, offer rate, stale apps) client-side from the full application list.

**When to use:** All API data fetching in the dashboard and throughout the app.

```typescript
// hooks/useApplications.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/client/lib/api";

export function useApplications(filters?: { status?: string; archived?: boolean }) {
  return useQuery({
    queryKey: ["applications", filters],
    queryFn: () => api.get("/api/applications", { params: filters }),
  });
}

// hooks/useDashboardStats.ts
export function useDashboardStats() {
  const { data, isLoading } = useApplications({ archived: false });
  const apps = data?.data ?? [];

  const totalActive = apps.filter(a =>
    !["rejected", "withdrawn", "accepted"].includes(a.status)
  ).length;

  const offerRate = apps.length > 0
    ? (apps.filter(a => ["offer", "accepted"].includes(a.status)).length / apps.length) * 100
    : 0;

  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const staleApps = apps.filter(a =>
    a.updatedAt * 1000 < sevenDaysAgo &&
    !["rejected", "withdrawn", "accepted"].includes(a.status)
  );

  return { totalActive, offerRate, staleApps, isLoading };
}
```

### Pattern 3: Dark Mode with Tailwind v4 + Zustand

**What:** Use Tailwind CSS v4's `@custom-variant` directive to enable class-based dark mode. Use a Zustand store with persist middleware to manage theme state (light/dark/system). Apply the `dark` class to `<html>` element.

**CSS setup (index.css):**
```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));

@theme {
  /* Light mode tokens (default) */
  --color-surface: var(--color-stone-50);
  --color-surface-card: var(--color-white);
  --color-surface-sidebar: var(--color-white);
  --color-text-primary: var(--color-stone-800);
  --color-text-secondary: var(--color-stone-500);
  --color-border: var(--color-stone-200);
}

/* Dark mode token overrides */
.dark {
  --color-surface: var(--color-zinc-900);
  --color-surface-card: var(--color-zinc-800);
  --color-surface-sidebar: var(--color-zinc-900);
  --color-text-primary: var(--color-zinc-100);
  --color-text-secondary: var(--color-zinc-400);
  --color-border: var(--color-zinc-700);
}
```

**Zustand theme store:**
```typescript
// stores/theme.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

type ThemeMode = "light" | "dark" | "system";

interface ThemeStore {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      mode: "system",
      setMode: (mode) => set({ mode }),
    }),
    { name: "jobdash-theme" }
  )
);
```

**Theme application (in root or __root.tsx):**
```typescript
function useApplyTheme() {
  const mode = useThemeStore((s) => s.mode);

  useEffect(() => {
    const root = document.documentElement;
    if (mode === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const apply = () => root.classList.toggle("dark", mq.matches);
      apply();
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
    root.classList.toggle("dark", mode === "dark");
  }, [mode]);
}
```

### Pattern 4: Reusable Modal Component

**What:** A generic Modal component using `<dialog>` element or a portal-based overlay. Handles open/close state, backdrop click to dismiss, escape key, focus trap, and body scroll lock.

**When to use:** Quick-add application modal (D-09), and all future modals (D-10).

```typescript
// components/ui/Modal.tsx
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-stone-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-800">
        <h2 className="text-lg font-semibold text-stone-800 dark:text-zinc-100">{title}</h2>
        {children}
      </div>
    </div>,
    document.body
  );
}
```

### Pattern 5: cn() Utility for Class Merging

**What:** A utility function combining `clsx` and `tailwind-merge` for clean conditional class composition without conflicts.

```typescript
// lib/cn.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Anti-Patterns to Avoid

- **Fetching data in route components directly with fetch():** Always use TanStack Query hooks. Direct fetch() calls bypass caching, deduplication, and background refetch. Every API call goes through a `useQuery` or `useMutation`.
- **Storing server state in Zustand:** Zustand is for client-only UI state (theme, sidebar). Application data lives in TanStack Query cache. Mixing them creates stale data and duplicated state.
- **Using `window.location.href` for navigation:** The existing code does this (e.g., in dashboard.tsx redirect to /login). With TanStack Router, always use `<Link>`, `useNavigate()`, or `throw redirect()`. Direct location changes bypass the router and cause full page reloads.
- **Hardcoding color values in components:** Use the STATUS_COLORS constant map and CSS custom properties. Every status color reference should go through the centralized map, not be typed as a Tailwind class string in each component.
- **Building custom dialog/modal from scratch without focus trap:** Accessibility requires focus trapping inside modals. Use the HTML `<dialog>` element (native focus trap) or a tested pattern with `inert` attribute on background content. Do not hand-roll focus management.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Routing + code splitting | Custom pathname router (current) | TanStack Router + Vite plugin | Current router has no code splitting, no type safety, no nested layouts, no loader pattern |
| Server state caching | fetch + useState + manual cache | TanStack Query useQuery/useMutation | Handles stale-while-revalidate, deduplication, background refetch, optimistic updates |
| Theme persistence | Manual localStorage + useEffect | Zustand persist middleware | Handles hydration, serialization, version migration, SSR safety |
| Class name merging | String concatenation | cn() = clsx + tailwind-merge | Resolves Tailwind class conflicts (e.g., `p-4` vs `p-2` in variants) |
| Icons | Inline SVGs | lucide-react | 1600+ consistent icons, tree-shakeable, TypeScript typed |

**Key insight:** This phase introduces three major state domains (router state, server state, client state). Each has a battle-tested library purpose-built for it. Hand-rolling any of them would create a maintenance burden that compounds in later phases.

## Common Pitfalls

### Pitfall 1: TanStack Router Plugin Order in Vite Config
**What goes wrong:** Route tree file is not generated, or React Fast Refresh breaks.
**Why it happens:** The `tanstackRouter` plugin must come BEFORE `react()` in the Vite plugins array. If `react()` processes files first, the generated route tree may not be picked up correctly.
**How to avoid:** Always order plugins as: `tanstackRouter()`, `react()`, `tailwindcss()`, `cloudflare()`.
**Warning signs:** Build errors about missing `routeTree.gen.ts`, or HMR failing after route file changes.

### Pitfall 2: Tailwind v4 Dark Mode Not Applying
**What goes wrong:** `dark:` variant classes have no effect.
**Why it happens:** Tailwind CSS v4 defaults to `@media (prefers-color-scheme: dark)` for dark mode. Without the `@custom-variant dark (&:where(.dark, .dark *));` override in CSS, adding `class="dark"` to `<html>` does nothing.
**How to avoid:** Add the `@custom-variant` directive in `index.css` immediately after `@import "tailwindcss"`. This switches from media-query strategy to class-based strategy.
**Warning signs:** Dark mode toggle changes the Zustand store but UI stays in light mode.

### Pitfall 3: Auth Guard Race Condition with better-auth
**What goes wrong:** `beforeLoad` fires before the session cookie is validated, causing a flash of login page on refresh.
**Why it happens:** `authClient.getSession()` makes a network request to `/api/auth/get-session`. On slow connections, TanStack Router's `beforeLoad` may resolve before the session check completes, or the pending state is not handled.
**How to avoid:** Ensure `beforeLoad` is `async` and `await`s the session check. Handle the pending state in the root component with a loading skeleton. Consider caching the session result in the QueryClient so subsequent route transitions don't re-fetch.
**Warning signs:** Brief flash of login page on browser refresh when already authenticated.

### Pitfall 4: Generated routeTree.gen.ts Causing Lint/Format Errors
**What goes wrong:** Biome reports errors in the auto-generated route tree file.
**Why it happens:** The TanStack Router plugin generates `routeTree.gen.ts` with its own code style that may not match Biome's configuration.
**How to avoid:** Add `routeTree.gen.ts` to Biome's ignore list in `biome.json`. Also add it to `.gitignore` since it is generated from route files and should not be committed.
**Warning signs:** CI lint failures on a file you did not write.

### Pitfall 5: Sidebar Layout Scroll Behavior
**What goes wrong:** The entire page scrolls instead of just the content area, causing the sidebar and header to scroll out of view.
**Why it happens:** Not properly constraining the layout to viewport height with `h-screen` and `overflow-hidden` on the outer container, with `overflow-y-auto` only on the content area.
**How to avoid:** Use `h-screen` on the root app container, `flex` layout for sidebar + content, and only allow `overflow-y-auto` on the main content div. Per D-04: "Scroll is on the content area, not the whole page."
**Warning signs:** Sidebar disappears when scrolling down on a long dashboard.

### Pitfall 6: Dashboard Stats Calculation with Unix Timestamps
**What goes wrong:** Stale application detection or "interviews this week" calculation is wrong.
**Why it happens:** D1 stores timestamps as Unix seconds (via `unixepoch()`), but JavaScript `Date.now()` returns milliseconds. Comparing without converting results in incorrect date math.
**How to avoid:** Always multiply D1 timestamps by 1000 when comparing with JavaScript dates: `app.updatedAt * 1000 < sevenDaysAgoMs`.
**Warning signs:** All applications appear stale, or none do.

## Code Examples

### Status Color System (D-18, D-19)

```typescript
// lib/status-colors.ts
import type { ApplicationStatus } from "@/shared/constants";

export const STATUS_COLORS: Record<ApplicationStatus, {
  bg: string;
  text: string;
  dot: string;
  border: string;
}> = {
  wishlist:      { bg: "bg-gray-100 dark:bg-gray-900",     text: "text-gray-600 dark:text-gray-400",     dot: "bg-gray-500",    border: "border-gray-300 dark:border-gray-700" },
  applied:       { bg: "bg-blue-100 dark:bg-blue-900",     text: "text-blue-600 dark:text-blue-400",     dot: "bg-blue-500",    border: "border-blue-300 dark:border-blue-700" },
  screening:     { bg: "bg-violet-100 dark:bg-violet-900", text: "text-violet-600 dark:text-violet-400", dot: "bg-violet-500",  border: "border-violet-300 dark:border-violet-700" },
  interviewing:  { bg: "bg-amber-100 dark:bg-amber-900",   text: "text-amber-600 dark:text-amber-400",   dot: "bg-amber-500",   border: "border-amber-300 dark:border-amber-700" },
  offer:         { bg: "bg-green-100 dark:bg-green-900",   text: "text-green-600 dark:text-green-400",   dot: "bg-green-500",   border: "border-green-300 dark:border-green-700" },
  accepted:      { bg: "bg-emerald-100 dark:bg-emerald-900", text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500", border: "border-emerald-300 dark:border-emerald-700" },
  rejected:      { bg: "bg-red-100 dark:bg-red-900",       text: "text-red-600 dark:text-red-400",       dot: "bg-red-500",     border: "border-red-300 dark:border-red-700" },
  withdrawn:     { bg: "bg-slate-100 dark:bg-slate-800",   text: "text-slate-600 dark:text-slate-400",   dot: "bg-slate-500",   border: "border-slate-300 dark:border-slate-700" },
};

// CSS variable approach (index.css) for non-Tailwind contexts:
// :root { --status-wishlist: #6B7280; --status-applied: #3B82F6; ... }
```

### API Client Wrapper

```typescript
// lib/api.ts
const BASE = "";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: { page: number; limit: number; total: number };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  get: <T>(path: string, params?: Record<string, string>) => {
    const url = params ? `${path}?${new URLSearchParams(params)}` : path;
    return request<ApiResponse<T>>(url);
  },
  post: <T>(path: string, body: unknown) =>
    request<ApiResponse<T>>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<ApiResponse<T>>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) =>
    request<ApiResponse<T>>(path, { method: "DELETE" }),
};
```

### App Entry Point with Providers

```typescript
// main.tsx (updated)
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
});

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);
```

### TanStack Router Plugin Configuration

```typescript
// vite.config.ts (updated)
import { tanstackRouter } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      routesDirectory: "./src/client/routes",
      generatedRouteTree: "./src/client/routeTree.gen.ts",
    }),
    react(),
    tailwindcss(),
    cloudflare(),
  ],
  resolve: {
    alias: { "@": resolve(__dirname, "./src") },
  },
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `darkMode: "class"` in tailwind.config.js | `@custom-variant dark (&:where(.dark, .dark *));` in CSS | Tailwind v4 (Jan 2025) | No JS config file needed. CSS-first dark mode. The old config key no longer exists in v4. |
| React Router v6 `createBrowserRouter` | TanStack Router `createRouter` with file-based routes | TanStack Router stable 2024 | Type-safe params, auto code splitting, route context for dependency injection |
| `window.location.pathname` switch router | TanStack Router file-based routing | Phase 3 (replacing Phase 1 placeholder) | The current router was explicitly a temporary placeholder per Phase 1 decision |
| Manual fetch + useState for API calls | TanStack Query `useQuery`/`useMutation` | De facto since ~2022 | Caching, deduplication, background refetch, optimistic updates built-in |

**Deprecated/outdated:**
- `tailwind.config.js` `darkMode: "class"` -- does not exist in Tailwind v4. Must use `@custom-variant`.
- `@tanstack/router-vite-plugin` -- deprecated in favor of `@tanstack/router-plugin/vite` (same package, different import path).

## Open Questions

1. **Interview data for VIEW-02 "Upcoming Interviews"**
   - What we know: Phase 2 built application CRUD and timeline events. Interview rounds are Phase 5 (INTV-01 through INTV-04). There is no interview data model yet.
   - What's unclear: How to populate "Upcoming Interviews" on the dashboard when no interview table exists.
   - Recommendation: Show an empty state with a message like "Interview tracking coming soon" or "No interviews scheduled." The dashboard section should be built with the interface ready to accept interview data once Phase 5 adds it. Use a placeholder hook that returns an empty array.

2. **Route tree generation with `routesDirectory` pointing to `src/client/routes/`**
   - What we know: The TanStack Router plugin defaults to `./src/routes/`. This project uses `./src/client/routes/`.
   - What's unclear: Whether the generated route tree import paths will work correctly with the `@/` path alias.
   - Recommendation: Configure `routesDirectory: "./src/client/routes"` and `generatedRouteTree: "./src/client/routeTree.gen.ts"` explicitly in the plugin options. Test early that imports resolve correctly.

3. **"Recent Activity" feed data source (D-07)**
   - What we know: Timeline events exist in D1 (created by Phase 2 on status changes). The API has `GET /api/applications/:id/timeline` per-application.
   - What's unclear: There is no cross-application timeline endpoint. D-07 wants "latest timeline events across all applications."
   - Recommendation: Add a new API endpoint `GET /api/timeline` that returns recent timeline events across all of a user's applications (most recent N events, sorted by `occurred_at` desc). This is a small server addition that unblocks the dashboard activity feed.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build + dev server | Checked via .nvmrc | 20.19.0 (pinned) | -- |
| npm | Package install | Available with Node | -- | -- |
| Vite | Build tool | Already installed | ^8.0.4 | -- |
| Tailwind CSS | Styling | Already installed | ^4.2.0 | -- |

No external services, databases, or CLI tools beyond what is already in the project are required for this phase. All dependencies are npm packages.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | vitest 4.1.4 with @cloudflare/vitest-pool-workers |
| Config file | vitest.config.ts |
| Quick run command | `npm test` |
| Full suite command | `npm test` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| VIEW-01 | Dashboard stat cards compute correct values | unit | `npx vitest run tests/dashboard/stats.test.ts -x` | No -- Wave 0 |
| VIEW-02 | Stale app detection flags apps with no update >7 days | unit | `npx vitest run tests/dashboard/stale.test.ts -x` | No -- Wave 0 |
| VIEW-03 | Quick-add form creates application via API | integration | `npx vitest run tests/dashboard/quick-add.test.ts -x` | No -- Wave 0 |
| UI-01 | Dark mode toggle applies/removes .dark class | unit | Manual visual verification + unit test of Zustand store | No -- Wave 0 |
| UI-02 | Responsive layout collapses sidebar at breakpoint | manual-only | Visual verification at different viewport sizes | N/A |
| UI-03 | Stone palette consistent across components | manual-only | Visual verification, style audit | N/A |
| UI-04 | Status colors match spec for all 8 statuses | unit | `npx vitest run tests/dashboard/status-colors.test.ts -x` | No -- Wave 0 |

**Note:** Frontend component rendering tests are limited because the existing vitest config uses `@cloudflare/vitest-pool-workers` (Workers runtime), which cannot render React components. For true component tests, a separate vitest config with jsdom/happy-dom environment would be needed. However, pure logic tests (stat computation, stale detection, status color mapping) can run in the Workers pool or a separate config.

### Sampling Rate
- **Per task commit:** `npm test` (existing backend tests should not regress)
- **Per wave merge:** `npm test` + manual visual review
- **Phase gate:** Full suite green + visual verification of all 5 success criteria

### Wave 0 Gaps
- [ ] Consider a separate vitest config for client-side unit tests (jsdom environment) -- covers VIEW-01, VIEW-02, UI-01, UI-04
- [ ] `tests/dashboard/stats.test.ts` -- stat computation logic
- [ ] `tests/dashboard/stale.test.ts` -- stale detection logic with Unix timestamp handling
- [ ] `tests/dashboard/status-colors.test.ts` -- all 8 statuses have correct color mappings

## Sources

### Primary (HIGH confidence)
- [TanStack Router Quick Start](https://tanstack.com/router/latest/docs/framework/react/quick-start) -- file-based routing setup, Vite plugin configuration
- [TanStack Router Authenticated Routes](https://tanstack.com/router/latest/docs/framework/react/guide/authenticated-routes) -- beforeLoad guard pattern, _authenticated layout
- [TanStack Router Code-Based Routing](https://tanstack.com/router/latest/docs/framework/react/routing/code-based-routing) -- createRootRoute, createRoute patterns
- [TanStack Router Installation with Vite](https://tanstack.com/router/latest/docs/installation/with-vite) -- plugin configuration, default settings
- [Tailwind CSS v4 Dark Mode](https://tailwindcss.com/docs/dark-mode) -- @custom-variant directive, class-based strategy
- [Tailwind CSS v4 Theme Variables](https://tailwindcss.com/docs/theme) -- @theme directive, CSS custom properties
- [shadcn/ui Vite Installation](https://ui.shadcn.com/docs/installation/vite) -- setup with Tailwind v4
- npm registry -- version verification for all packages (April 2026)

### Secondary (MEDIUM confidence)
- [TanStack Router SaaS Template Setup (DEV Community)](https://dev.to/kiran_ravi_092a2cfcf60389/tanstack-router-setup-in-our-react-saas-template-2026-4b67) -- practical SPA setup patterns
- [Zustand Dark Mode with Tailwind (Medium)](https://medium.com/nerd-for-tech/implement-dark-mode-with-zustand-and-tailwind-css-in-react-da3299e6e824) -- persist middleware theme store pattern
- [Tailwind v4 Dark Mode Fix (Sujalvanjare)](https://www.sujalvanjare.com/blog/fix-dark-class-not-applying-tailwind-css-v4) -- @custom-variant gotcha documentation

### Tertiary (LOW confidence)
- None -- all findings verified with official docs or npm registry

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all packages verified via npm registry, versions confirmed current as of April 2026
- Architecture: HIGH -- patterns from official TanStack Router/Query docs, Tailwind v4 docs, and established project conventions
- Pitfalls: HIGH -- dark mode @custom-variant pitfall verified via official Tailwind v4 docs and community reports; plugin ordering from official TanStack Router docs

**Research date:** 2026-04-16
**Valid until:** 2026-05-16 (30 days -- stack is stable, no imminent breaking changes expected)
