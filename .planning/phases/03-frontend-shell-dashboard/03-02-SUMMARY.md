---
phase: 03-frontend-shell-dashboard
plan: 02
subsystem: ui
tags: [tanstack-router, file-based-routing, auth-guard, responsive-layout, sidebar, bottom-tab-bar, header, app-shell]

# Dependency graph
requires:
  - phase: 03-01
    provides: Design system components (Badge, Button, Input, Card, SearchBar, etc.), design tokens, dark mode, useTheme hook
provides:
  - TanStack Router file-based routing with auth guards
  - AppShell layout (Sidebar + Header + BottomTabBar)
  - All authenticated route placeholders (board, list, calendar, analytics, settings, app/$slug)
  - Auth page migration (login, signup, reset-password) to new router
  - routeTree.gen.ts auto-generated route tree
affects: [03-03-kanban, 04-detail-page, all-future-frontend-phases]

# Tech tracking
tech-stack:
  added: []
  patterns: [TanStack Router file-based routing, _authenticated layout guard pattern, AppShell wrapper, RouterContext auth injection]

key-files:
  created:
    - src/client/routes/__root.tsx
    - src/client/routes/_authenticated.tsx
    - src/client/routes/_authenticated/board.tsx
    - src/client/routes/_authenticated/list.tsx
    - src/client/routes/_authenticated/calendar.tsx
    - src/client/routes/_authenticated/analytics.tsx
    - src/client/routes/_authenticated/settings.tsx
    - src/client/routes/_authenticated/app/$slug.tsx
    - src/client/routes/index.tsx
    - src/client/routes/login.tsx
    - src/client/routes/signup.tsx
    - src/client/routes/reset-password.tsx
    - src/client/components/layout/AppShell.tsx
    - src/client/components/layout/Sidebar.tsx
    - src/client/components/layout/BottomTabBar.tsx
    - src/client/components/layout/Header.tsx
  modified:
    - src/client/main.tsx
    - src/client/routeTree.gen.ts
    - src/client/components/auth/LoginForm.tsx

key-decisions:
  - "Lazy-load TanStack Router devtools to avoid importing in production"
  - "Use useMatches() for page title derivation from current route path"
  - "Avatar click triggers sign out directly (no popover menu for Phase 3)"
  - "LoginForm redirect updated from /dashboard to /board"

patterns-established:
  - "TanStack Router _authenticated layout pattern: beforeLoad checks context.auth.isAuthenticated, redirects to /login"
  - "Auth page redirect pattern: authenticated users on /login or /signup redirect to /board"
  - "AppShell wrapper: Sidebar (desktop) + Header + main content + BottomTabBar (mobile)"
  - "Session resolved before RouterProvider renders to prevent auth race condition"

requirements-completed: [UI-02]

# Metrics
duration: 6min
completed: 2026-04-17
---

# Phase 3 Plan 02: Router & App Shell Summary

**TanStack Router file-based routing with auth guards, 72px icon sidebar (desktop), 58px bottom tab bar (mobile), and header with search/add/theme/avatar**

## Performance

- **Duration:** 6 min
- **Started:** 2026-04-17T21:36:37Z
- **Completed:** 2026-04-17T21:42:48Z
- **Tasks:** 2
- **Files modified:** 20

## Accomplishments
- Complete TanStack Router setup with file-based routing, auth guards, and auto-generated route tree
- Responsive app shell layout: 72px icon sidebar on desktop with tooltips and active state, 58px bottom tab bar on mobile
- Header with page title, glass search bar (Cmd+K hint), "+ Add Application" button, dark mode toggle (light/dark/system cycle), and user avatar with sign-out
- Auth pages migrated to new router; old App.tsx custom router and dashboard.tsx deleted

## Task Commits

Each task was committed atomically:

1. **Task 1: TanStack Router setup with auth guards and route migration** - `e07a07a` (feat)
2. **Task 2: App shell layout -- Sidebar, Header, BottomTabBar** - `59b18ff` (feat)

## Files Created/Modified
- `src/client/routes/__root.tsx` - Root route with context typing, devtools, and 404 page
- `src/client/routes/_authenticated.tsx` - Auth guard layout wrapping AppShell
- `src/client/routes/_authenticated/board.tsx` - Board placeholder (kanban in Plan 03)
- `src/client/routes/_authenticated/list.tsx` - List placeholder (Phase 4)
- `src/client/routes/_authenticated/calendar.tsx` - Calendar placeholder (Phase 8)
- `src/client/routes/_authenticated/analytics.tsx` - Analytics placeholder (Phase 8)
- `src/client/routes/_authenticated/settings.tsx` - Settings placeholder (Phase 9)
- `src/client/routes/_authenticated/app/$slug.tsx` - App detail placeholder (Phase 4)
- `src/client/routes/index.tsx` - Redirects / to /board
- `src/client/routes/login.tsx` - Login with auth redirect to /board
- `src/client/routes/signup.tsx` - Signup with auth redirect to /board
- `src/client/routes/reset-password.tsx` - Reset password page
- `src/client/components/layout/AppShell.tsx` - Sidebar + Header + content wrapper
- `src/client/components/layout/Sidebar.tsx` - 72px icon rail with 5 nav items and tooltips
- `src/client/components/layout/BottomTabBar.tsx` - 58px mobile tab bar with 5 items
- `src/client/components/layout/Header.tsx` - Page title, search, add, theme toggle, avatar
- `src/client/main.tsx` - Rewired with RouterProvider, QueryClientProvider, auth context
- `src/client/routeTree.gen.ts` - Auto-generated route tree with all 12 routes
- `src/client/components/auth/LoginForm.tsx` - Updated redirect from /dashboard to /board

## Decisions Made
- Lazy-loaded TanStack Router devtools via React.lazy to avoid importing in production builds
- Used useMatches() to derive page title from the current route path rather than a prop-drilling approach
- Avatar click directly triggers sign out (no popover menu for Phase 3 simplicity)
- Updated LoginForm redirect from /dashboard to /board (Rule 1 bug fix -- old route no longer exists)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated LoginForm redirect from /dashboard to /board**
- **Found during:** Task 1 (Route migration)
- **Issue:** LoginForm.tsx had `window.location.href = "/dashboard"` but /dashboard no longer exists after removing the old router
- **Fix:** Changed redirect target to `/board`
- **Files modified:** src/client/components/auth/LoginForm.tsx
- **Verification:** Build passes, redirect target matches new route structure
- **Committed in:** e07a07a (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug fix)
**Impact on plan:** Essential fix -- old /dashboard route removed, login redirect must point to /board.

## Issues Encountered
- Pre-existing test failure in tests/auth/session.test.ts (404 on /api/auth/session/me) -- not caused by this plan's changes, confirmed by running tests before and after. Out of scope.

## Known Stubs
- **Search bar (Header):** Display-only -- SearchBar component renders but search input does nothing. Will be wired in Phase 4+ when command palette is built.
- **+ Add Application button (Header):** Button renders but has no onClick handler. Will open QuickAddModal in Plan 03.
- **Placeholder pages:** board, list, calendar, analytics, settings, app/$slug all render placeholder text. Board will be replaced in Plan 03; others in later phases.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- App shell is complete and wrapping all authenticated routes
- Board placeholder at /board is ready to be replaced with KanbanBoard in Plan 03
- Header "+ Add" button stub ready for QuickAddModal integration in Plan 03
- All design system components available for kanban card composition

## Self-Check: PASSED

- All 16 created files verified on disk
- Both task commits (e07a07a, 59b18ff) verified in git log
- Deleted files (App.tsx, dashboard.tsx) confirmed absent
- Production build succeeds

---
*Phase: 03-frontend-shell-dashboard*
*Completed: 2026-04-17*
