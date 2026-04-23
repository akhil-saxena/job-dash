---
phase: 08-calendar-analytics
plan: 01
subsystem: ui
tags: [calendar, date-fns, tanstack-query, tanstack-router, hono, drizzle, d1, vitest, recharts-excluded]

# Dependency graph
requires:
  - phase: 05-interview-tracking-notes
    provides: interview_round.scheduled_at (consumed by calendar events endpoint) + InterviewRoundCard UI (extended with datetime input)
  - phase: 06-tags-deadlines-company
    provides: deadline.due_date (consumed by calendar events endpoint)
  - phase: 04-table-detail-navigation
    provides: /app/$slug detail route + tab search param (calendar chip click-through target)
  - phase: 03-frontend-shell-dashboard
    provides: glass design system (Card, Modal, Button, Badge) + AppShell routing
provides:
  - GET /api/calendar/events?month=YYYY-MM (auth-gated, tenant-isolated, soft-delete-aware)
  - generateMonthGrid(anchor) utility returning the fixed 42-cell month window
  - 5 calendar UI components (CalendarMonthGrid, CalendarDayCell, EventChip, ThisWeekList, DayOverflowModal)
  - useCalendarMonth TanStack Query hook
  - Cross-hook calendar query invalidation on interview + deadline mutations
  - Null-safe interview.scheduledAt end-to-end (validator + service)
  - InterviewRoundCard datetime-local editor (Phase 5 polish gap folded in)
  - date-fns@^4.1.0 in dependencies (also consumed by 08-02)
affects: [08-02-analytics, 09-command-palette]

# Tech tracking
tech-stack:
  added:
    - date-fns@^4.1.0 (month grid math, This Week grouping, date formatting)
  patterns:
    - "Calendar query key shape: ['calendar', 'month', 'YYYY-MM'] — invalidated by pattern match ['calendar']"
    - "Pre-group events into Map<YYYY-MM-DD, Event[]> once per render (avoids quadratic isSameDay anti-pattern inside grid cells)"
    - "Route-level validateSearch for ?tab= param on /app/$slug so chip click-through lands on correct tab"
    - "refetchOnMount: 'always' on hooks whose data is mutated on a different page (break 60s global staleTime for user-expectation freshness)"
    - "Server-side inner join to application + isNull(deletedAt) on every read (Phase 2 D-03 soft-delete pattern reused)"

key-files:
  created:
    - src/shared/validators/calendar.ts
    - src/client/lib/monthGrid.ts
    - src/client/lib/monthGrid.test.ts
    - src/server/services/calendar.ts
    - src/server/routes/calendar.ts
    - src/client/hooks/useCalendarMonth.ts
    - src/client/components/calendar/EventChip.tsx
    - src/client/components/calendar/CalendarDayCell.tsx
    - src/client/components/calendar/CalendarMonthGrid.tsx
    - src/client/components/calendar/ThisWeekList.tsx
    - src/client/components/calendar/DayOverflowModal.tsx
    - src/client/components/calendar/normalize.ts
    - src/client/components/calendar/types.ts
    - src/client/components/calendar/index.ts
    - tests/calendar/events.test.ts
  modified:
    - package.json (date-fns@^4.1.0 added to dependencies)
    - package-lock.json
    - worker/index.ts (mount calendarRoutes after requireAuth)
    - src/client/routes/_authenticated/calendar.tsx (placeholder replaced)
    - src/client/routes/_authenticated/app/$slug.tsx (validateSearch for ?tab= param)
    - src/client/components/detail/DetailPage.tsx (accept initialTab prop)
    - src/client/components/detail/InterviewRoundCard.tsx (datetime-local input for scheduledAt)
    - src/client/hooks/useInterviews.ts (invalidate ['calendar'] on round mutations)
    - src/client/hooks/useDeadlines.ts (invalidate ['calendar'] on deadline mutations)
    - src/server/services/interview.ts (null-safe scheduledAt handling)
    - src/shared/validators/interview.ts (updateInterviewRoundSchema accepts null scheduledAt)
    - tests/setup.ts (08-01 no-DDL marker)

key-decisions:
  - "Always render the month grid even when empty (UI-SPEC deviation — empty-state card hid month nav and confused smoke-test user)"
  - "Folded Phase 5 datetime-input gap into 08-01 — without it VIEW-03 couldn't be verified end-to-end"
  - "Cross-hook calendar invalidation in useInterviews + useDeadlines (Pitfall 4 from 08-RESEARCH)"
  - "refetchOnMount: 'always' on useCalendarMonth — defeats stale-empty-cache hangovers from earlier failed loads and ensures chip freshness after edits on the detail page"
  - "Made scheduledAt null-safe across validator + service to allow clearing the date without hitting new Date(null) → 1970 silent bug"

patterns-established:
  - "Calendar events endpoint: single endpoint returning {interviews, deadlines} for the fixed 42-cell window (one round-trip per month view)"
  - "Chip click-through: TanStack Router <Link> with search={{tab: '...'}} and route-level validateSearch on the target"
  - "Day-keyed event grouping: format(date, 'yyyy-MM-dd') as Map key, bucket once per render pass"

requirements-completed: [VIEW-03]

# Metrics
duration: 59min
completed: 2026-04-23
---

# Phase 08 Plan 01: Calendar View Summary

**Read-only `/calendar` with month grid + This Week list, interview + deadline chips, click-through to application detail, month nav + keyboard shortcuts, and a glass overflow modal — backed by a single auth-gated `GET /api/calendar/events` endpoint.**

## Performance

- **Duration:** ~59 min (including 4 follow-up fixes after smoke test)
- **Started:** 2026-04-23T21:25:00+05:30 (commit 624e013)
- **Completed:** 2026-04-23T22:25:00+05:30 (commit 1e42c34)
- **Tasks:** 4 (3 auto + 1 human-verify checkpoint)
- **Files modified:** 27 unique files across 7 commits (15 created, 12 modified)

## Accomplishments

- `GET /api/calendar/events?month=YYYY-MM` — auth-gated, tenant-isolated, soft-delete-aware, returns `{ interviews, deadlines }` inline-joined with `application.slug / companyName / roleTitle` for a single-round-trip month view
- `generateMonthGrid(anchor)` utility — returns exactly 42 Date cells (`startOfWeek(startOfMonth(anchor), {weekStartsOn:0}) + 42 days`), proven correct by 5 unit tests covering leap years + DST boundary + Wednesday-starting months
- 5 calendar UI components (`EventChip`, `CalendarDayCell`, `CalendarMonthGrid`, `ThisWeekList`, `DayOverflowModal`) + supporting `normalize.ts` / `types.ts` / `index.ts` barrel
- `useCalendarMonth` TanStack Query hook keyed by `['calendar', 'month', 'yyyy-MM']` with `refetchOnMount: 'always'`
- Cross-hook calendar query invalidation in `useInterviews` + `useDeadlines` mutations (chip appears/disappears immediately after edit)
- `/calendar` route fully wired: month nav (`‹ Today ›`), keyboard shortcuts (`← → T` with input-focus guard), glass overflow modal, first-visit hint persisted to localStorage, loading / error / empty states
- Chip click-through lands on the correct tab: interview → `/app/$slug?tab=interviews`, deadline → `/app/$slug?tab=overview` (route-level `validateSearch` added to `/app/$slug`)
- Phase 5 gap fix: `InterviewRoundCard` now has an editable `datetime-local` input for `scheduledAt` — VIEW-03 couldn't be verified without it
- `scheduledAt` made null-safe end-to-end (validator accepts null, service handles null explicitly) — prevents `new Date(null) → 1970-01-01` silent data bug when clearing the date

## Task Commits

All task commits atomic, authored as `akhil-saxena <saxena.akhil42@gmail.com>`:

1. **Task 1 (Wave 0): date-fns install + stubs** — `624e013` (test)
2. **Task 2 (Wave 1): month-grid utility + calendar API + integration tests** — `0f3b864` (feat, 11/11 tests green)
3. **Task 3 (Wave 2): 5 calendar UI components + `/calendar` route** — `5b5531c` (feat)
4. **Task 4 (checkpoint): manual smoke test** — user-approved after 4 follow-up fixes:
   - `5e68fd1` (fix) — always render month grid, drop empty-state card (UI-SPEC deviation, see below)
   - `dad10f7` (fix) — Phase 5 gap: datetime input for interview scheduledAt (blocker for VIEW-03 verification)
   - `3856154` (fix) — invalidate `['calendar']` on interview + deadline mutations (Pitfall 4)
   - `1e42c34` (fix) — `refetchOnMount: 'always'` on useCalendarMonth + null-safe scheduledAt (validator + service)

**Plan metadata commit:** this SUMMARY + STATE.md + ROADMAP.md + REQUIREMENTS.md updates land in a single `docs(08-01)` commit after this file is written.

## Files Created/Modified

### Created (15)

- `src/shared/validators/calendar.ts` — `calendarMonthSchema` (regex `YYYY-MM`, MM in 01..12)
- `src/client/lib/monthGrid.ts` — `generateMonthGrid(anchor) → Date[42]`
- `src/client/lib/monthGrid.test.ts` — 5 unit tests (42-cell, week-start, last-cell offset, DST, leap year)
- `src/server/services/calendar.ts` — `getMonthEvents(db, userId, anchor)`, two range queries inner-joined to application
- `src/server/routes/calendar.ts` — `GET /api/calendar/events` with zValidator query param + onError handler
- `src/client/hooks/useCalendarMonth.ts` — TanStack Query hook with `refetchOnMount: 'always'`
- `src/client/components/calendar/EventChip.tsx` — TanStack Router Link with color palette per event type, past-event opacity rule, past-deadline red override, aria-describedby focus-visible ring
- `src/client/components/calendar/CalendarDayCell.tsx` — `role="gridcell"`, responsive min-heights, today-circle, max-chip stack + overflow button
- `src/client/components/calendar/CalendarMonthGrid.tsx` — `role="grid"`, weekday strip (3-letter md+ / 1-letter mobile), pre-grouped Map<dayKey, Event[]>, responsive maxChips via useMediaQuery
- `src/client/components/calendar/ThisWeekList.tsx` — 7-day grouped list with Today/Tomorrow/EEE labels, empty-week "Clear week ahead" card, row-level Link navigation
- `src/client/components/calendar/DayOverflowModal.tsx` — glass design-system Modal listing all events for a day
- `src/client/components/calendar/normalize.ts` — accepts both unix-seconds numbers and ISO strings from API, derives `isPast` from `startOfDay(now)`, maps code → UI label
- `src/client/components/calendar/types.ts` — shared `CalendarEvent` type
- `src/client/components/calendar/index.ts` — barrel export
- `tests/calendar/events.test.ts` — 6 integration tests: shape, range filter, tenant isolation, soft-delete exclusion, inline slug/company/role, 400 on malformed query

### Modified (12)

- `package.json` / `package-lock.json` — `date-fns@^4.1.0` added
- `worker/index.ts` — mount `calendarRoutes` after `requireAuth`
- `src/client/routes/_authenticated/calendar.tsx` — placeholder replaced with fully-wired page (nav, keyboard, states, modal, localStorage hint)
- `src/client/routes/_authenticated/app/$slug.tsx` — `validateSearch` for `?tab=` param (overview | interviews | jd | docs | timeline)
- `src/client/components/detail/DetailPage.tsx` — accept `initialTab` prop from route search
- `src/client/components/detail/InterviewRoundCard.tsx` — datetime-local input for `scheduledAt` with local-time ⇄ UTC-ISO conversion
- `src/client/hooks/useInterviews.ts` — invalidate `['calendar']` on create/update/delete round
- `src/client/hooks/useDeadlines.ts` — invalidate `['calendar']` on create/complete/delete deadline
- `src/server/services/interview.ts` — null-safe scheduledAt (avoid `new Date(null) → 1970`)
- `src/shared/validators/interview.ts` — `updateInterviewRoundSchema` accepts `null` for `scheduledAt` (previously only optional)
- `tests/setup.ts` — 08-01 no-DDL comment marker (08-02 adds user_settings)

## Decisions Made

Five substantive deviations from the original plan, all fixes or additions driven by smoke-test feedback or cross-phase gaps:

1. **Grid always rendered.** UI-SPEC called for replacing the grid with a `CalendarEmptyState` card when no events exist anywhere. Implemented once, then removed in `5e68fd1` — the empty-state card hid month nav and confused the smoke-test user ("no grid" feedback). Grid-with-no-chips + `ThisWeekList` "Clear week ahead" is strictly better UX.
2. **Interview datetime input** (`dad10f7`). `InterviewRoundCard` displayed `scheduledAt` in the header but never exposed it as an editable field — a Phase 5 polish gap. Folded into 08-01 because VIEW-03 can't be verified without a way to schedule an interview from the UI.
3. **Cross-hook calendar invalidation** (`3856154`). Pitfall 4 from `08-RESEARCH`: editing an interview or deadline on the detail page would not update the calendar until the 60s global `staleTime` expired. Now `useInterviews` (create/update/delete round) and `useDeadlines` (create/complete/delete deadline) both invalidate `['calendar']`.
4. **`refetchOnMount: 'always'`** (`1e42c34`). Global `staleTime` is 60s (right for kanban/list), but calendar events are edited on a different page and users expect fresh data on every return. Also defeats stale-empty-cache hangovers from earlier failed loads (e.g. the local-D1 migration issue — see Issues Encountered).
5. **Null-safe `scheduledAt`** (`1e42c34`). `updateInterviewRoundSchema` now accepts `null` so a user can clear the date; `interview` service handles `null` explicitly instead of passing through `new Date(null)` which yields `1970-01-01` — a silent data bug that would have populated the calendar with ghost chips in 1970.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Calendar chip didn't appear after scheduling interview**
- **Found during:** Task 4 (manual smoke test)
- **Issue:** Creating an interview with a `scheduledAt` in the current month did not surface the blue chip on the calendar, even after manual page refresh.
- **Root cause:** Three compounding issues — (a) `useInterviews` mutations didn't invalidate `['calendar']`, (b) global 60s `staleTime` served cached data on navigation back, (c) validator + service had a null-handling hole that turned cleared dates into 1970-01-01.
- **Fix:** Three commits (`3856154`, `1e42c34`, `1e42c34`) — see Decisions #3, #4, #5.
- **Files modified:** `src/client/hooks/useInterviews.ts`, `src/client/hooks/useDeadlines.ts`, `src/client/hooks/useCalendarMonth.ts`, `src/server/services/interview.ts`, `src/shared/validators/interview.ts`
- **Verification:** User confirmed the interview chip appeared on April 24 after all three fixes landed. 11/11 automated tests still green.

**2. [Rule 2 - Missing Critical] Phase 5 InterviewRoundCard had no datetime-local input**
- **Found during:** Task 4 (manual smoke test — couldn't create a scheduled interview from the UI)
- **Issue:** InterviewRoundCard displayed `scheduledAt` in the header but exposed no way to set it. Would have been a VIEW-03 verification blocker if deferred.
- **Fix:** Added `datetime-local` input as first field in the edit row; bidirectional conversion between user local time and UTC ISO (the API's `z.string().datetime()` requirement).
- **Files modified:** `src/client/components/detail/InterviewRoundCard.tsx`
- **Committed in:** `dad10f7` (prefix `fix(phase-5)` to keep Phase 5 traceability correct).

**3. [Rule 1 - Bug] Empty-month state hid the grid and broke smoke-test flow**
- **Found during:** Task 4 (manual smoke test, before any events seeded)
- **Issue:** The plan implemented the UI-SPEC's `CalendarEmptyState` card that replaced the grid when `events.length === 0`. This hid month navigation and gave "no grid at all" visual feedback on first visit — confusing and off-spec intent.
- **Fix:** Removed the early-return empty state; the grid always renders and `ThisWeekList` handles the "Clear week ahead" empty copy below.
- **Files modified:** `src/client/routes/_authenticated/calendar.tsx`
- **Committed in:** `5e68fd1`
- **UI-SPEC status:** formal deviation; documented here so 08-02's empty-state pattern for analytics does not copy 08-01's original (discarded) approach.

---

**Total deviations:** 3 auto-fixed (2 bugs, 1 missing-critical feature from Phase 5). All three surfaced during human-verify smoke test (Task 4) and were resolved in 4 follow-up commits before user approval.

**Impact on plan:** No scope creep. All deviations were required for VIEW-03 to actually work end-to-end. The Phase 5 datetime-input fix is a small scope-crossing but unavoidable — and commit prefix `fix(phase-5)` keeps Phase 5 traceability honest.

## Issues Encountered

**Local D1 database missing migrations 0003-0005 (environment issue, not code)** — during smoke test, fetching `/api/calendar/events` returned empty results even after seeding interviews. Root cause: the local D1 had only applied migrations 0000-0002; 0003 (interview_round), 0004 (deadline), 0005 (document) had never been run against the local dev DB. Resolved by `npm run db:migrate`. Saved as a persistent memory (`project_d1_migrations_local.md`) so the next phase that adds migrations remembers to run this. No commit needed — environment-only.

## User Setup Required

None — no external service configuration required for calendar view. No OAuth scope changes (D-09 honored: no Google Calendar sync). No R2 or new secrets.

## Known Stubs

None — calendar view is fully data-driven. Every UI path (loading, error, empty, populated, overflow modal) wires to live data from `GET /api/calendar/events`. The "Google Calendar sync" concept is explicitly out-of-scope per D-09 (not a stub — a decision).

## Deferred Items (from execution)

1. **`tests/auth/session.test.ts` returns 404 instead of 200** — pre-existing, confirmed reproducible on commit `624e013` before any 08-01 changes. Logged in `.planning/phases/08-calendar-analytics/deferred-items.md`. Unrelated to Phase 8; scope-boundary rule honored. Candidate for a standalone debug pass.
2. **Remaining smoke-test cosmetic checks** — user approved with partial smoke test (chip appearance verified end-to-end). Deferred: keyboard nav (` ← → T`), dark mode visual pass, mobile width resize, deadline chip render, "+N more" overflow modal, error state (Retry button). User will validate in full-app testing later. None of these are blockers.

## Next Phase Readiness

**Ready for 08-02 (Analytics dashboard + Settings thresholds):**

- `date-fns@^4.1.0` already installed — 08-02 skips `npm install date-fns`.
- Calendar events endpoint pattern (route → service → D1 with tenant isolation + soft-delete + Zod query validator) is the template for analytics endpoints.
- Glass `Modal` + `Card` + `Button` primitives all still compatible; no design system changes needed.
- `validateSearch` pattern on `/app/$slug` gives 08-02 precedent for `/analytics?range=...` shareable filter state (D-15 / D-17).
- No blockers, no open architectural questions.

**Watch-outs for 08-02:**

- Global query `staleTime` is 60s — analytics queries should match the calendar pattern and invalidate each other when a mutation would affect them (none expected, analytics is fully read-only, but worth the one-line check).
- Local D1 migration issue surfaced here — 08-02 adds `user_settings` table; remember to `npm run db:migrate` after `drizzle-kit generate` (memory saved).

## Self-Check: PASSED

- All 15 created files exist on disk (verified via `ls`).
- All 7 commit hashes present in `git log` (`624e013`, `0f3b864`, `5b5531c`, `5e68fd1`, `dad10f7`, `3856154`, `1e42c34`).
- 11/11 automated tests green (`npx vitest run tests/calendar/events.test.ts src/client/lib/monthGrid.test.ts`).
- `npm run build` clean (TypeScript errors: 0).
- `GET /api/calendar/events` returns 401 without auth — route is live and gated.
- User approved manual smoke test on 2026-04-23 after chip-appearance verification.

---
*Phase: 08-calendar-analytics*
*Completed: 2026-04-23*
