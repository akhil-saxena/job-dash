# Phase 8: Calendar & Analytics - Research

**Researched:** 2026-04-23
**Domain:** Read-only calendar (month grid + "This Week"), analytics dashboard (funnel, sources, response-time, stat cards) + global date-range filter + Settings > Analytics threshold editor
**Confidence:** HIGH

## Summary

Phase 8 ships two read-only views plus a Settings addition, all backed by data that already exists in D1 (`application`, `timeline_event`, `interview_round`, `deadline`). No new user-facing data entry, no sync. The work is heavy on aggregation SQL for analytics and on two new view components (month grid + analytics dashboard). The core stack is already locked in CLAUDE.md and CONTEXT.md: Recharts 3.8.1, date-fns 4.1.0, Drizzle + D1, Hono, TanStack Query + Router. Two new tables are needed for threshold preferences (`user_settings`).

**Primary recommendation:** Slice as CONTEXT.md D-20 prescribes — 08-01 Calendar (no DB changes, read-only aggregation on existing tables), 08-02 Analytics + Settings thresholds (adds `user_settings` table, five new aggregation endpoints, threshold UI). Push funnel + response-time aggregation to **SQL on the server** (not client-side math) using a single Drizzle query per panel backed by GROUP BY on `timeline_event`. Use SQLite's `LAG()` window function for the response-time-by-transition computation — it is cleanest and is supported by D1. Use a **URL search-param** for the global date range filter to stay consistent with the Phase 4 filter pattern, hydrate initial value from `localStorage`.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Pipeline Funnel (ANLY-01)**
- **D-01:** Model = flow from timeline events. Count every application that has ever reached a stage (derived from `timeline_event` rows with `event_type = "status_change"`), not the snapshot of apps currently in that status. This enables real drop-off rates and feeds response-time-by-transition too.
- **D-02:** Stages = Applied → Screening → Interviewing → Offer (4 horizontal bars, top to bottom). Wishlist is excluded (not applied yet). Terminal outcomes (accepted/rejected/withdrawn) are NOT funnel bars — they live in stat cards and the source-chart stack.
- **D-03:** Each bar displays count + conversion % from previous stage, e.g. "Screening: 18 (43% of Applied)".
- **D-04:** Screening stays a distinct stage (not collapsed into Interviewing).

**Calendar (VIEW-03)**
- **D-05:** Events shown = interviews + deadlines, both layers always on, distinguished by chip color. Interviews from `interview_round.scheduled_at`, deadlines from `deadline.due_date`. No layer toggles in Phase 8.
- **D-06:** Click an event chip → navigate to the application detail page with the relevant tab pre-selected (interview → Interviews tab, deadline → Overview tab). Reuses TanStack Router; no popover/side panel.
- **D-07:** View = month-only grid + "This Week" list below. No week-view toggle, no day view.
- **D-08:** Same-day stacking = up to 3 chips, then "+N more" overflow.
- **D-09:** No Google Calendar sync. No OAuth scope expansion. No refresh token storage.

**Analytics — Source Effectiveness (ANLY-02)**
- **D-10:** Chart type = stacked horizontal bars, one per source, stacked by final outcome. Segments: Offer, Interviewing, Rejected, Ghosted, Withdrawn. Top N sources by volume.
- **D-11:** `source` is a free-text column, not an enum. Groups by exact match (planner's call on case-sensitive; recommend case-insensitive).

**Analytics — Response Time Table (ANLY-03)**
- **D-12:** Granularity = by stage transition. Rows = applied→screening, screening→interviewing, interviewing→offer.
- **D-13:** Color cells green/amber/red based on per-transition thresholds read from user settings.

**Analytics — Summary Stat Cards (ANLY-04)**
- **D-14:** Four cards: Total Apps, Currently Active, Offers Received, Rejection Rate.

**Analytics — Date Range Filter (ANLY-05)**
- **D-15:** Preset chips (30d / 90d / YTD / All time) + Custom chip that opens a date picker.
- **D-16:** Scope = global. Single filter bar controls every card/chart/table.
- **D-17:** Default = All time on first load. Persist last-used in localStorage.

**Settings additions (VIEW-05 extension)**
- **D-18:** "Analytics" section on `/settings` with three threshold rows, one per stage transition. Green-below and amber-below cutoffs in days.
- **D-19:** Defaults: applied→screening green<7 amber<14; screening→interviewing green<5 amber<10; interviewing→offer green<3 amber<7. Suggestions — planner may tune.

**Phase slicing**
- **D-20:** Two plans. 08-01 Calendar. 08-02 Analytics + Settings thresholds (atomic delivery).

### Claude's Discretion
- Exact component library choices within the locked stack (Recharts, date-fns expected)
- Whether "+N more" opens a popover vs scrolls to "This Week" list
- Exact layout within stat cards (icon placement, size)
- Whether response-time thresholds live in a new `user_settings` table or extend existing
- Exact default threshold values (D-19 suggestions can be revised)
- localStorage key naming for filter persistence

### Deferred Ideas (OUT OF SCOPE)

**Moved out of Phase 8**
- Google Calendar sync (was in VIEW-03; dropped by user). Would require OAuth scope expansion (calendar.events), refresh token storage, per-event vs dedicated-calendar decision, conflict resolution, sync trigger choice. Candidate for future standalone phase.

**Not requested, belong elsewhere**
- Analytics export (CSV/PDF) — potential Phase 9 polish
- Saved filter presets / custom date ranges as favorites — polish item
- Per-card date filters — rejected in favor of global filter (D-16)
- Week/day calendar views — rejected in favor of month-only + This Week (D-07)
- Per-company response time — rejected in favor of by-stage-transition (D-12)
- Heatmap / Sankey / advanced charts — out of scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| VIEW-03 | Calendar view showing scheduled interviews and deadlines in month layout with "This Week" list below (Google Calendar sync explicitly dropped) | Sections 4 (date-fns) + 5 (month grid) + 10 ("+N more" modal); calendar API in "Proposed API Endpoints" |
| VIEW-05 | Analytics page with pipeline funnel, source effectiveness, response time table, summary stats | Sections 1, 2, 6, 7 (aggregation SQL); Section 3 (Recharts setup) |
| ANLY-01 | Pipeline funnel chart showing flow from Applied through each stage | Section 1 (funnel SQL); Section 3 (Recharts horizontal bar) |
| ANLY-02 | Source effectiveness chart showing response rate by source | Section 7 (source SQL w/ ghosted derivation); Section 3 (Recharts stacked horizontal) |
| ANLY-03 | Response time table showing avg days by stage transition with color coding | Section 2 (LAG window function SQL); Section 8 (threshold storage) |
| ANLY-04 | Summary stat cards (total, active, offers, rejection rate) | Section 6 (stat card SQL, single endpoint) |
| ANLY-05 | Date range filter on all analytics | Section 9 (URL search params + localStorage); all aggregation endpoints accept `from`/`to` |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

**Cost & stack (non-negotiable):**
- $0/month — Cloudflare free tier only (D1 5GB, R2 10GB, KV, Workers 100K req/day, 10ms CPU/req)
- Recharts **^3.8** locked as chart library (no alternatives — note CLAUDE.md has a clause about falling back to @nivo/sankey specifically for Sankey, but Phase 8 has no Sankey)
- date-fns locked as date library (no Moment, no day.js)
- Drizzle ORM ^0.45 with D1
- Hono ^4.12 for Workers routes
- TanStack Query ^5.99 for server state, TanStack Router ^1.168 for navigation, Zustand ^5 ONLY for client-only UI state (NOT date range filter — URL param preferred)
- Tailwind v4 (no tailwind.config.js — CSS-first)
- Zod ^4 (note: repo currently on Zod 3.24 per package.json; continue with current 3.x — project already on 3.x)
- TypeScript ^5.7 (repo on ~6.0.2 per package.json — above the floor)
- Biome for lint/format (no ESLint/Prettier)

**Forbidden:**
- Moment.js, Chakra/MUI, Redux, Create React App, Express, react-beautiful-dnd (unmaintained), bcrypt/argon2 JS (Workers CPU limit)
- Per-card date filters (would require N independent fetches; D-16 locks global filter)
- Any Google Calendar API integration, OAuth scope expansion for calendar.events, refresh token storage for calendar scope (D-09)

**Testing / workflow:**
- Nyquist validation IS enabled (config.json `workflow.nyquist_validation: true`) — Validation Architecture section included below
- Workers test pool via `@cloudflare/vitest-pool-workers`; setup inlines migration SQL (not generated)
- `commit_docs: true` — commit RESEARCH.md after writing

## Standard Stack

### Core (already in dependencies — NO new install)

| Library | Version (in repo) | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | ^19.2.4 | UI framework | Phase 3 baseline |
| @tanstack/react-router | ^1.161.3 | Routing, search params | URL-shareable date range filter (D-16/17) |
| @tanstack/react-query | ^5.99.0 | Server state | Cached + re-fetchable analytics/calendar queries |
| zustand | ^5.0.12 | Client-only UI state | Out-of-scope for Phase 8 (filter goes to URL) |
| drizzle-orm | ^0.45.2 | DB ORM | Already used everywhere; supports raw `sql` for LAG() window function |
| hono | ^4.12.14 | Workers router | Already mounted in `worker/index.ts` |
| @hono/zod-validator | ^0.5.0 | Request validation | Existing pattern for query validators |
| zod | ^3.24.0 | Schemas | Stay on v3 (project-wide); no v4 migration in this phase |
| lucide-react | ^1.8.0 | Icons (UI-SPEC calls for `CalendarDays`, `CalendarCheck`, `BarChart3`, `Filter`, `AlertCircle`, `ChevronRight`) | Phase 3 D-23 |

### Supporting (NEW — install in 08-01 or 08-02)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| recharts | **3.8.1** (latest as of 2026-03-25, npm verified) | Funnel, source, stat visuals | 08-02 only. Peer dep accepts `react ^19.0.0`. |
| date-fns | **4.1.0** (latest as of 2025-08-03, npm verified) | Month grid math, "This Week", range presets, formatting | 08-01 and 08-02. ESM-first in v4. |

**Version verification performed 2026-04-23:**
- `npm view recharts version` → `3.8.1` (published 2026-03-25)
- `npm view recharts peerDependencies` → `react: '^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0'` — **React 19 officially supported**
- `npm view date-fns version` → `4.1.0` (published 2025-08-03)

**Note on UI-SPEC version pin:** UI-SPEC line 24 says `date-fns ^3`. The current major is **v4.1.0**, released Sept 2024. v4 is ESM-first with first-class time-zone support via the optional `@date-fns/tz` plugin, and has no breaking API changes for the functions this phase uses (`startOfMonth`, `endOfMonth`, `startOfWeek`, `addDays`, `format`, `isSameDay`, `isToday`, `isWithinInterval`, `subDays`, `startOfDay`, `endOfDay`, `startOfYear`). The planner SHOULD install **`date-fns@^4.1.0`** and note the UI-SPEC deviation in the 08-01 plan header — the UI-SPEC spec is not invalidated; only the version bump is updated. (LOW risk: if a regression surfaces, v3 is a drop-in downgrade.)

### Alternatives Considered (NOT recommended)

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Recharts 3.8 | visx, Nivo | CLAUDE.md explicitly locks Recharts. Nivo has Sankey (not needed in Phase 8). Not adopting. |
| date-fns | day.js | Lighter but less comprehensive; date-fns is locked in CLAUDE.md and the ecosystem uses it. Not adopting. |
| TanStack Router search params | Zustand store for filter state | URL search params match Phase 4 D-04 pattern AND let users share/bookmark a filtered view. Zustand would need a separate rehydrate-from-localStorage dance. Decision: **search params + localStorage for last-used**. |
| LAG() window function | Self-join `timeline_event` aliased to itself on (applicationId, fromStatus, toStatus) | LAG() is cleaner, returns NULL for the first row (no synthetic rows), and SQLite has supported it since 3.25 (2018). D1 runs modern SQLite. Also matches the "one row per transition" shape we want. |

**Installation command (08-02 Wave 0 or task 1):**
```bash
npm install recharts@^3.8.1 date-fns@^4.1.0
```
08-01 installs only date-fns; 08-02 installs recharts. If 08-01 and 08-02 may run in parallel, install both in 08-01 Wave 0 and let 08-02 just import.

## Architecture Patterns

### Recommended Directory Structure Additions

```
src/
├── client/
│   ├── components/
│   │   ├── calendar/                    # NEW — 08-01
│   │   │   ├── CalendarMonthGrid.tsx
│   │   │   ├── CalendarDayCell.tsx
│   │   │   ├── EventChip.tsx
│   │   │   ├── ThisWeekList.tsx
│   │   │   ├── DayOverflowModal.tsx     # the "+N more" glass modal
│   │   │   └── index.ts
│   │   ├── analytics/                   # NEW — 08-02
│   │   │   ├── AnalyticsDateRangeBar.tsx
│   │   │   ├── CustomRangeModal.tsx
│   │   │   ├── StatCard.tsx
│   │   │   ├── PipelineFunnelChart.tsx
│   │   │   ├── SourceEffectivenessChart.tsx
│   │   │   ├── ResponseTimeTable.tsx
│   │   │   └── index.ts
│   │   └── settings/                    # NEW — 08-02
│   │       ├── AnalyticsThresholdsSection.tsx
│   │       └── ThresholdRow.tsx
│   ├── hooks/
│   │   ├── useCalendarMonth.ts          # NEW — 08-01 (fetches interviews + deadlines for a month)
│   │   ├── useAnalytics.ts              # NEW — 08-02 (wraps 4 analytics endpoints)
│   │   └── useAnalyticsThresholds.ts    # NEW — 08-02 (GET/PATCH user_settings.analyticsThresholds)
│   ├── lib/
│   │   ├── dateRange.ts                 # NEW — 08-02 (preset → {from,to} mapping)
│   │   ├── responseTimeColor.ts         # NEW — 08-02 (threshold → green/amber/red zone)
│   │   └── monthGrid.ts                 # NEW — 08-01 (generate 42-cell grid from a month)
│   └── routes/_authenticated/
│       ├── calendar.tsx                 # MODIFY — 08-01
│       ├── analytics.tsx                # MODIFY — 08-02
│       └── settings.tsx                 # MODIFY — 08-02 (add Analytics section)
├── db/
│   ├── migrations/0006_*.sql            # NEW — 08-02 (user_settings table)
│   └── schema/
│       └── userSettings.ts              # NEW — 08-02
├── server/
│   ├── services/
│   │   ├── calendar.ts                  # NEW — 08-01 (range queries on interview + deadline)
│   │   ├── analytics.ts                 # NEW — 08-02 (aggregation SQL)
│   │   └── userSettings.ts              # NEW — 08-02 (thresholds get/update)
│   └── routes/
│       ├── calendar.ts                  # NEW — 08-01
│       ├── analytics.ts                 # NEW — 08-02
│       └── userSettings.ts              # NEW — 08-02
├── shared/
│   └── validators/
│       ├── calendar.ts                  # NEW — 08-01 (month range query)
│       ├── analytics.ts                 # NEW — 08-02 (dateRange query; ANALYTICS_THRESHOLD_DEFAULTS)
│       └── userSettings.ts              # NEW — 08-02
└── worker/
    └── index.ts                         # MODIFY — both plans add route mounts
```

### Pattern 1: Thin route → service → DB

**Established Phase 2 pattern, honor exactly.** Routes never import Drizzle directly. Service functions accept `(db, userId, ...)`. All queries go through a `baseConditions(userId)` helper that filters by userId AND `deletedAt IS NULL`.

**Example (from `src/server/services/application.ts`):**
```ts
function baseConditions(userId: string) {
    return [eq(application.userId, userId), isNull(application.deletedAt)] as const;
}
```
Every analytics query below must apply `baseConditions` either directly on `application` or via an inner join so deleted applications cannot leak into aggregates.

### Pattern 2: Timeline-event-sourced funnel

Per D-01, the funnel reads **transitions** (timeline events), not current status. A single application may have contributed to multiple stages over time. Query counts **DISTINCT applicationId** per target stage within date range.

**Example (Drizzle with raw SQL):**
```ts
// Source: derived from Phase 2 service patterns + SQLite aggregate
import { sql, and, eq, isNull, gte, lte } from "drizzle-orm";
import { application, timelineEvent } from "@/db/schema";

export async function getFunnelCounts(
    db: Database,
    userId: string,
    range: { from: Date; to: Date },
) {
    const rows = await db
        .select({
            stage: sql<string>`json_extract(${timelineEvent.metadata}, '$.to')`.as("stage"),
            count: sql<number>`count(distinct ${timelineEvent.applicationId})`,
        })
        .from(timelineEvent)
        .innerJoin(application, eq(application.id, timelineEvent.applicationId))
        .where(and(
            eq(timelineEvent.userId, userId),
            eq(timelineEvent.eventType, "status_change"),
            isNull(application.deletedAt),
            gte(timelineEvent.occurredAt, range.from),
            lte(timelineEvent.occurredAt, range.to),
            sql`json_extract(${timelineEvent.metadata}, '$.to') in ('applied','screening','interviewing','offer')`,
        ))
        .groupBy(sql`json_extract(${timelineEvent.metadata}, '$.to')`)
        .all();
    // Map to { applied, screening, interviewing, offer } + compute conversion client-side or in JS
    return rows;
}
```

**Key assumption verified via Phase 2 summary + source:** `timeline_event.metadata` is stored as JSON `text` (see `src/db/schema/application.ts` line 77). For `status_change` events, metadata is `JSON.stringify({ from, to })` (confirmed by reading `createTimelineEvent` in `src/server/services/application.ts` line 19–36 and the tests in `tests/applications/status.test.ts` which assert `from` and `to` keys).

**Sub-pattern — verify metadata shape:** The planner MUST confirm in the first analytics task that the currently-in-production `status_change` event metadata has keys `{from, to}` matching the SQLite `json_extract` paths used above. If any phase has written a different shape, a data migration is needed. Based on all Phase 2 tests and service code read, the shape is stable and consistent.

### Pattern 3: Response-time-by-transition via LAG()

SQLite's `LAG()` window function returns the preceding row in an ordered partition. Partition by `applicationId`, order by `occurredAt` — the LAG of `(to, occurredAt)` for each `status_change` row gives the previous stage and time. Compute the transition and diff in one pass.

**Example (Drizzle raw sql):**
```ts
// Source: SQLite docs — window functions supported since SQLite 3.25 (2018); D1 runs modern SQLite
// https://sqlite.org/windowfunctions.html
// https://www.sqlitetutorial.net/sqlite-window-functions/sqlite-lag/
export async function getResponseTimeAverages(
    db: Database,
    userId: string,
    range: { from: Date; to: Date },
) {
    // Subquery: every status_change with its prior status_change for the same application
    const query = sql`
        WITH transitions AS (
            SELECT
                te.application_id,
                json_extract(te.metadata, '$.to') AS to_stage,
                LAG(json_extract(te.metadata, '$.to')) OVER (
                    PARTITION BY te.application_id
                    ORDER BY te.occurred_at
                ) AS from_stage,
                te.occurred_at AS to_at,
                LAG(te.occurred_at) OVER (
                    PARTITION BY te.application_id
                    ORDER BY te.occurred_at
                ) AS from_at
            FROM timeline_event te
            INNER JOIN application a ON a.id = te.application_id
            WHERE te.user_id = ${userId}
              AND te.event_type = 'status_change'
              AND a.deleted_at IS NULL
        )
        SELECT
            from_stage || '→' || to_stage AS transition,
            AVG((to_at - from_at) / 86400.0) AS avg_days,
            COUNT(*) AS sample_count
        FROM transitions
        WHERE from_stage IS NOT NULL
          AND to_at >= ${Math.floor(range.from.getTime() / 1000)}
          AND to_at <= ${Math.floor(range.to.getTime() / 1000)}
          AND (
            (from_stage = 'applied'      AND to_stage = 'screening') OR
            (from_stage = 'screening'    AND to_stage = 'interviewing') OR
            (from_stage = 'interviewing' AND to_stage = 'offer')
          )
        GROUP BY from_stage, to_stage
    `;
    const result = await db.all(query);
    return result;
}
```

**Why LAG over self-join:** (1) cleaner single SQL statement, (2) correctly orders transitions per application, (3) a direct self-join would over-match — e.g. Applied→Interviewing and Applied→Screening both on same app would cross-multiply.

**Edge case — status skips:** If a user drags from `applied` → `interviewing` (skipping `screening`), LAG produces only the row `applied→interviewing`. The WHERE filter above keeps only the three canonical adjacent transitions, so the skipped case correctly contributes NO rows to screening→interviewing or applied→screening averages. Per D-12 this is the right behavior — response time is "avg days between these specific adjacent stages."

**Timestamp arithmetic:** `timeline_event.occurred_at` is `integer ("timestamp")` mode in Drizzle — stored as unix epoch **seconds** (via `unixepoch()` default). Subtraction yields seconds; divide by 86400 for days.

### Pattern 4: URL-based filter state (Phase 4 D-04 reuse)

TanStack Router supports typed search params via `validateSearch` on a route definition. Use this for the date-range filter so the URL is shareable and the back button works.

**Example:**
```tsx
// src/client/routes/_authenticated/analytics.tsx
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const analyticsSearchSchema = z.object({
    preset: z.enum(["30d", "90d", "ytd", "all", "custom"]).optional().default("all"),
    from: z.string().optional(),  // ISO YYYY-MM-DD
    to: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/analytics")({
    validateSearch: analyticsSearchSchema.parse,
    component: AnalyticsPage,
});
```

On first mount: if URL has no `preset`, read `localStorage["jobdash:analytics:dateRange"]`; if absent, default to `"all"`. On filter change: `navigate({ search: { preset, from, to } })` + write to localStorage.

### Anti-Patterns to Avoid

- **Aggregating analytics client-side from `GET /api/applications`.** The list endpoint returns at most `limit=100` applications and was not designed for full-timeline analytics. Always hit dedicated aggregation endpoints.
- **Computing response time with JS after fetching all timeline events.** Scales poorly once a user has hundreds of events; makes tests flaky. Do it in SQL.
- **Subqueries per funnel stage.** Tempting but runs 4 queries; one GROUP BY is always cheaper.
- **Iterating date cells and running `isSameDay` against every event inside the render.** 42 cells × N events = quadratic. Pre-group events into a `Map<YYYY-MM-DD, Event[]>` once, then cell lookup is O(1).
- **Passing raw `Date` objects through TanStack Router search params.** Use ISO date strings (`YYYY-MM-DD`) — they serialize cleanly and survive URL round-trips.
- **Hard-coding threshold defaults in component code.** Put them in `src/shared/validators/analytics.ts` as `ANALYTICS_THRESHOLD_DEFAULTS` so the seed row on first visit matches the frontend fallback.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 42-cell month grid | Manual `for` loop over 42 with `new Date()` arithmetic | `startOfMonth` → `startOfWeek(..., { weekStartsOn: 0 })` → `addDays` loop of 42 via date-fns | Handles DST, leap years, month-end, locale week start |
| "This Week" next 7 days | Raw `Date.now() + i*86400000` | `addDays(startOfDay(new Date()), i)` | DST boundary bugs in the raw form |
| Date range presets | `new Date(Date.now() - 30*86400000)` | `subDays(startOfDay(now), 30)` for 30d, `startOfYear(now)` for YTD | Same DST issue; YTD is non-trivial without `startOfYear` |
| "Is this event today/tomorrow" | Manual `Date.getDay()` math | `isToday(d)` / `isTomorrow(d)` / `isSameDay(a, b)` | Timezone trap: two Dates in the same day but different UTC offsets will fail naive equality |
| Horizontal stacked bar | SVG rects by hand | Recharts `<BarChart layout="vertical">` with multiple `<Bar stackId="outcome">` | Legend, tooltip, responsive, a11y labels all come free |
| Funnel conversion math | Custom Sankey | Recharts horizontal `<BarChart>` + `<LabelList position="right">` with formatted `{pct}%` | D-02/D-03 specify 4 bars with conversion — a real funnel chart is overkill; Nivo Sankey is the fallback only if a Sankey is ever requested (not Phase 8) |
| Green/amber/red zone math | Inline ternaries in JSX | Central `getResponseTimeZone(days, thresholds) -> "green"|"amber"|"red"` in `src/client/lib/responseTimeColor.ts` | Three places need the function (the table cell, the Settings preview dots, and the `aria-label`) — duplication risks drift |
| Ghosted outcome derivation | Client-side loop | SQL `CASE WHEN status='applied' AND NOT EXISTS(...) AND updated_at < now-30d THEN 'ghosted' ...` | Keeps single aggregate per source in one query; consistent with all other analytics |

**Key insight:** This phase is mostly an aggregation + presentation layer on top of already-complete schemas. The only genuine "build" is the calendar grid (date-fns + minimal CSS grid) and the Recharts wiring. Everything else is SQL.

## Runtime State Inventory

Phase 8 is greenfield additions — the entire phase builds new views + one new table (`user_settings`). There is **no rename, refactor, or migration of existing data**. Runtime State Inventory is **not applicable** and this section is intentionally omitted.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | dev, tests, build | ✓ (pinned via .nvmrc) | 20.19.0 (from Phase 01 summary) | — |
| npm | package install | ✓ | bundled with Node 20 | — |
| Wrangler | `db:migrate` (local), deploy | ✓ | ^4.83.0 (in devDependencies) | — |
| Cloudflare D1 (local Miniflare) | tests + dev | ✓ via `@cloudflare/vitest-pool-workers@^0.14.7` | — | — |
| Recharts | analytics charts (08-02) | ✗ (NOT installed) | — | **Install required**, no fallback |
| date-fns | calendar + range math (both plans) | ✗ (NOT installed) | — | **Install required**, no fallback |
| Biome | lint/format | ✓ | ^1.9.4 | — |

**Missing dependencies with no fallback:** none — the two missing packages ARE the expected installs.

**Missing dependencies with fallback:** none.

**Note:** No external service needed (no OAuth expansion, no third-party API). The phase is entirely self-contained within existing Cloudflare bindings.

---

## Section 1 — Pipeline Funnel (ANLY-01, D-01..D-04)

**Approach:** Single GROUP BY query on `timeline_event` joined to `application` (for soft-delete filter). Counts DISTINCT applications that reached each of the 4 funnel stages within the date range.

**SQL strategy:**
- Filter: `event_type = 'status_change'` AND `user_id = :userId` AND `application.deleted_at IS NULL`
- Filter (date range): `timeline_event.occurred_at BETWEEN :from AND :to`
- Filter (stage whitelist): `json_extract(metadata, '$.to') IN ('applied', 'screening', 'interviewing', 'offer')`
- Aggregate: `COUNT(DISTINCT application_id)` per `json_extract(metadata, '$.to')`
- Output: `{ applied: number, screening: number, interviewing: number, offer: number }`
- Conversion %: computed in TypeScript after the query (avoids division-by-zero noise in SQL). `screening / applied * 100` rounded to nearest int. Top bar always shows `100%`.

**Indices to verify/add:** Existing index `idx_timeline_event_app` is on `(application_id, occurred_at)`. For user-scoped analytics we benefit from **`idx_timeline_event_user_occurred` on `(user_id, occurred_at)`** — NOT CURRENTLY PRESENT. Recommend adding in the 08-02 migration to keep funnel queries fast as data grows. Migration shape:
```sql
CREATE INDEX IF NOT EXISTS `idx_timeline_event_user_occurred`
    ON `timeline_event` (`user_id`, `occurred_at`);
```
Also update `tests/setup.ts` with the new `CREATE INDEX` statement.

**Expected output (endpoint returns):**
```json
{
  "data": {
    "applied":      { "count": 42, "conversionPct": 100 },
    "screening":    { "count": 18, "conversionPct": 43 },
    "interviewing": { "count":  9, "conversionPct": 50 },
    "offer":        { "count":  3, "conversionPct": 33 }
  }
}
```

**Empty states:** UI-SPEC handles via panel-local copy when no rows. If ALL counts are 0 (first-ever analytics visit with no apps), whole analytics page shows "Not enough data yet" state — we can check `data.applied.count === 0` client-side.

## Section 2 — Response-Time-by-Stage-Transition (ANLY-03, D-12/D-13)

**Approach:** LAG() window function over timeline_event partitioned by application_id, filter down to the three canonical adjacent transitions, aggregate AVG + COUNT.

**SQL verified:** See "Pattern 3" above. Critical correctness note: the WHERE clause filters to ONLY adjacent-stage transitions. A user who dragged `applied` → `interviewing` (skipping screening) correctly contributes zero rows to both `applied→screening` and `screening→interviewing` averages. This is consistent with D-12 semantics.

**Timestamp math:** `occurred_at` is integer seconds (unix epoch). `(to_at - from_at) / 86400.0` yields fractional days; AVG yields fractional-day average. Round to 1 decimal on output: `{ avgDays: 4.2 }` — matches UI-SPEC copy `4.2d avg`.

**Output shape:**
```json
{
  "data": {
    "applied_screening":       { "avgDays": 4.2, "sampleCount": 14 },
    "screening_interviewing":  { "avgDays": 7.8, "sampleCount": 11 },
    "interviewing_offer":      { "avgDays": 3.1, "sampleCount":  4 }
  }
}
```
If a transition has zero samples: omit (or set to `null`) — client renders em-dash cell with the UI-SPEC "No applications have moved through this transition yet" tooltip.

**Color decision (D-13):** The client receives the `avgDays` and combines with user thresholds (from `user_settings`) to pick green/amber/red. Do NOT color on the server — thresholds can change between requests and the user expects instant UI response when editing them in Settings.

**Index reuse:** Same `idx_timeline_event_user_occurred` recommended in Section 1 supports this query too.

## Section 3 — Recharts Setup for Cloudflare Pages + Vite 8

**Bundle size:** Recharts 3.8.1 is ~290KB min (~ 80-90KB gzipped). This lands ONLY on the `/analytics` route code-split chunk — it does not affect the main bundle if the route is lazy-loaded by TanStack Router (default file-route behavior). Calendar route does NOT import Recharts and is unaffected.

**SSR concerns:** N/A — this is a Cloudflare **Pages SPA** (not Pages Functions with SSR). Recharts renders entirely on the client. No hydration concerns.

**Dark mode strategy:** Recharts `<Bar fill="...">` accepts color strings, not CSS vars directly. Approach:
1. Read `document.documentElement.classList.contains("dark")` inside the chart component on mount + subscribe via `MutationObserver` OR pass a `mode` prop from a parent that reads the existing `useTheme` hook (`src/client/hooks/useTheme.ts` is already established in Phase 3).
2. Pick color from a `CHART_PALETTE` record keyed by `mode`. UI-SPEC already declares all needed hex values (both light and dark); pass them directly.

**Horizontal BarChart pattern (funnel — 4 bars):**
```tsx
// Source: recharts.github.io BarChart docs + UI-SPEC Section "Chart Visual Contracts"
<ResponsiveContainer width="100%" height={280}>
    <BarChart
        data={[
            { stage: "Applied",      count: 42, fill: "#3b82f6" },
            { stage: "Screening",    count: 18, fill: "#8b5cf6" },
            { stage: "Interviewing", count:  9, fill: "#f59e0b" },
            { stage: "Offer",        count:  3, fill: "#22c55e" },
        ]}
        layout="vertical"   // horizontal bars
        barCategoryGap={16}
        margin={{ top: 0, right: 60, bottom: 0, left: 0 }}
    >
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="stage" hide />
        <Tooltip cursor={false} />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} isAnimationActive={false}>
            <LabelList position="insideLeft" content={CustomStageLabel} fill="#ffffff" />
            <LabelList position="right" content={ConversionLabel} fill="currentColor" />
            {/* per-bar fill overridden via Cell */}
            {funnelRows.map((r, i) => <Cell key={r.stage} fill={r.fill} />)}
        </Bar>
    </BarChart>
</ResponsiveContainer>
```

**Stacked horizontal BarChart pattern (source effectiveness):**
```tsx
// Source: recharts.github.io stacked BarChart + docs on stackId
<ResponsiveContainer width="100%" height={352}>
    <BarChart
        data={sourceRows}   // [{ source: "LinkedIn", offer: 3, interviewing: 5, rejected: 8, ghosted: 2, withdrawn: 1 }, ...]
        layout="vertical"
        barCategoryGap={12}
    >
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="source" width={120} />
        <Tooltip content={<GlassTooltip />} />
        <Legend align="left" verticalAlign="bottom" />
        <Bar dataKey="offer"        stackId="outcome" fill="#22c55e" />
        <Bar dataKey="interviewing" stackId="outcome" fill="#f59e0b" />
        <Bar dataKey="rejected"     stackId="outcome" fill="#ef4444" />
        <Bar dataKey="ghosted"      stackId="outcome" fill="#a8a29e" />
        <Bar dataKey="withdrawn"    stackId="outcome" fill="#64748b" />
    </BarChart>
</ResponsiveContainer>
```
Same `stackId` on all 5 bars → Recharts stacks them.

**ResponsiveContainer gotchas (verified via Recharts docs):** The component uses `ResizeObserver` and needs a parent with a **defined height** (not `height: auto`). Wrap the chart in a `div` with explicit height OR give `ResponsiveContainer` a fixed `height` prop like `280`. UI-SPEC already specifies `height=280` for funnel and `height=352` for sources — follow those exactly.

**`isAnimationActive={false}` recommendation:** Recharts animation can flash at nonsense sizes during mount. Setting false removes the transition and is visually cleaner, especially paired with TanStack Query's initial skeleton state.

## Section 4 — date-fns Integration

**Version:** `^4.1.0`. v4 is ESM-first; Vite 8 + Rolldown handles ESM natively. No Babel config needed.

**Tree-shaking:** date-fns is designed for it. Named imports are mandatory:
```ts
import { startOfMonth, endOfMonth, startOfWeek, addDays, format } from "date-fns";
```
NEVER import the default export or use `import * as dateFns` — bundler can't tree-shake.

**Submodules needed:**

| Use case | Import |
|----------|--------|
| Month grid generation (42 cells) | `startOfMonth`, `endOfMonth`, `startOfWeek` (`{ weekStartsOn: 0 }` for Sun start per UI-SPEC), `addDays`, `isSameMonth` |
| "This Week" list (next 7 days) | `startOfDay`, `addDays`, `format` |
| Date range presets | `subDays`, `startOfYear`, `startOfDay`, `endOfDay` |
| Event matching to cell | `isSameDay` |
| "Today" ring highlight | `isToday` |
| Event chip past-tense opacity | `isBefore(eventDate, startOfDay(new Date()))` |
| "Today · Thu", "Tomorrow · Fri" labels | `isToday`, `isTomorrow`, `format(d, "EEE, MMM d")` |
| Month title "April 2026" | `format(d, "LLLL yyyy")` |
| Weekday headers "Sun Mon Tue..." | `format(addDays(startOfWeek(now), i), "EEE")` then `.toUpperCase()` |

**Locale behavior:** date-fns functions without a `locale` option default to English short forms (`"Sun"`, `"Mon"`, etc.). This matches UI-SPEC copy exactly. **Recommendation:** do not pass `locale` in Phase 8 — keep hardcoded English. If i18n is ever added, it becomes a central concern, not a calendar-specific one.

**Time-zone behavior:** All dates in the system are stored as unix epoch seconds (UTC). date-fns v4 without `@date-fns/tz` treats Date objects in the user's local time zone — which is what the user expects. **Do not** install `@date-fns/tz` for Phase 8; the added complexity is unwarranted (no multi-TZ requirement in REQUIREMENTS.md).

## Section 5 — Calendar Month Grid Implementation

**42-cell grid generation:**
```ts
// src/client/lib/monthGrid.ts
import { startOfMonth, startOfWeek, addDays } from "date-fns";

export function generateMonthGrid(anchor: Date): Date[] {
    const gridStart = startOfWeek(startOfMonth(anchor), { weekStartsOn: 0 });
    return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}
```
Returns exactly 42 Date objects, always — matches UI-SPEC "always shows 6 rows for consistent height."

**Out-of-month cells:** The consumer checks `isSameMonth(cell, anchor)` and applies `opacity-40` when false (UI-SPEC line 196). Events can still appear on these spillover cells (some days belong to the adjacent month but the user's event IS on that date).

**Event → cell mapping (O(N) grouping):**
```ts
const byDay = new Map<string, CalendarEvent[]>();
for (const evt of events) {
    const key = format(evt.date, "yyyy-MM-dd");
    (byDay.get(key) ?? byDay.set(key, []).get(key)!).push(evt);
}
// per cell: const events = byDay.get(format(cell, "yyyy-MM-dd")) ?? [];
```
Grouping once at the top of render avoids the O(42×N) trap.

**Keyboard navigation (per UI-SPEC accessibility):**
- Grid is a **list of event chips**, NOT a spatial grid. Chips are `<button>` elements; Tab moves through them in DOM reading order (left-to-right, top-to-bottom).
- Month nav arrows: `←` prev month, `→` next month, `T` today (global keydown on the calendar page container).
- First-visit hint bar: `localStorage.getItem("jobdash:calendar:hintDismissed")` — render hint until user clicks anywhere on the calendar; then set the flag.
- ARIA: `role="grid" aria-label="Calendar for {Month Year}"` on the grid container. Each day cell: `role="gridcell" aria-label="{weekday}, {formatted date}, {N} events"`. Past-event chips get a visually-hidden `aria-describedby` span "Past event".

**Same-day stacking + "+N more" overflow:**
- Pre-compute: each day's events are `events.slice(0, 3)` visible, rest are `events.slice(3)`.
- On desktop: if `events.length > 3`, render 3 chips + `+{N} more` button.
- On mobile (`< 640px`): per UI-SPEC, `events.slice(0, 2)` visible + overflow.
- Clicking `+N more` opens a glass `Modal` listing that day's events in the same row shape as `ThisWeekList` (recommended — simpler than a popover and matches UI-SPEC D-08 note "planner's call"). The Modal uses the existing `src/client/components/design-system/Modal.tsx`.

## Section 6 — Stat Card Computations (ANLY-04, D-14)

**Single aggregated endpoint** returns all four numbers in one request — minimize Workers invocations.

```ts
// src/server/services/analytics.ts (excerpt)
export async function getStatCards(
    db: Database,
    userId: string,
    range: { from: Date; to: Date },
) {
    // Single query with conditional COUNTs via SUM(CASE ...)
    const row = await db
        .select({
            totalApps: sql<number>`count(*)`.as("totalApps"),
            active: sql<number>`sum(case when status in ('applied','screening','interviewing','offer') then 1 else 0 end)`,
            offers: sql<number>`sum(case when status in ('offer','accepted') then 1 else 0 end)`,
            rejected: sql<number>`sum(case when status = 'rejected' then 1 else 0 end)`,
            accepted: sql<number>`sum(case when status = 'accepted' then 1 else 0 end)`,
            withdrawn: sql<number>`sum(case when status = 'withdrawn' then 1 else 0 end)`,
        })
        .from(application)
        .where(and(
            eq(application.userId, userId),
            isNull(application.deletedAt),
            gte(application.createdAt, range.from),
            lte(application.createdAt, range.to),
        ))
        .get();

    const terminal = (row?.rejected ?? 0) + (row?.accepted ?? 0) + (row?.withdrawn ?? 0);
    const rejectionRate = terminal > 0
        ? Math.round((row!.rejected / terminal) * 100)
        : null;
    return {
        totalApps: row?.totalApps ?? 0,
        active:    row?.active ?? 0,
        offers:    row?.offers ?? 0,
        rejectionRate,              // null when no terminal state
        rejectionRateDenominator: terminal,  // for "12 of 27 terminal" caption
        rejectionRateNumerator: row?.rejected ?? 0,
    };
}
```

**Date range semantics:** "Total Apps within date range" = apps whose `createdAt` falls in range. `active`, `offers`, `rejected` all count from that same filtered set (i.e. "of apps created in this range, how many are currently in an active state?"). This matches the intuitive reading. Document this in the endpoint.

**"Rejection Rate" denominator (D-14):** `rejected ÷ (accepted + rejected + withdrawn)`. If denominator is 0, return `null` → client renders `—` with caption "No outcomes yet" per UI-SPEC.

## Section 7 — Source Effectiveness (ANLY-02, D-10/D-11)

**Case-insensitivity:** `source` is free-text. Normalize with `LOWER()` in SQL, return the most-common casing as the display name. Recommend: GROUP BY LOWER(source), SELECT any source (e.g. via `max(source)`) for display. Users who typed `LinkedIn` and `linkedin` get grouped as one row; the display shows whichever is seen first alphabetically via MAX — this is a benign choice and users who care will normalize their own inputs.

**Top-N handling (N=8):** Per UI-SPEC. `ORDER BY total_count DESC LIMIT 8`. If user has < 8 distinct sources, render whatever exists.

**Ghosted derivation (from UI-SPEC):** `status = 'applied'` AND no status_change to a later stage AND `updated_at < now - 30d` AND no interview_round. In SQL:
```sql
ghosted = status = 'applied'
       AND updated_at < :thirtyDaysAgo
       AND id NOT IN (SELECT application_id FROM timeline_event WHERE event_type='status_change' AND json_extract(metadata, '$.from')='applied')
       AND id NOT IN (SELECT application_id FROM interview_round)
```

**Full source query (one GROUP BY):**
```ts
// src/server/services/analytics.ts (excerpt)
const thirtyDaysAgoSec = Math.floor(Date.now() / 1000) - 30 * 86400;
const rows = await db.all(sql`
    SELECT
        LOWER(COALESCE(source, '(none)')) AS source_key,
        MAX(COALESCE(source, '(none)')) AS source_display,
        COUNT(*) AS total,
        SUM(CASE WHEN status IN ('offer', 'accepted') THEN 1 ELSE 0 END) AS offer,
        SUM(CASE WHEN status IN ('screening', 'interviewing') THEN 1 ELSE 0 END) AS interviewing,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected,
        SUM(CASE WHEN status = 'withdrawn' THEN 1 ELSE 0 END) AS withdrawn,
        SUM(CASE
            WHEN status = 'applied'
              AND updated_at < ${thirtyDaysAgoSec}
              AND NOT EXISTS (
                SELECT 1 FROM timeline_event te
                WHERE te.application_id = application.id
                  AND te.event_type = 'status_change'
                  AND json_extract(te.metadata, '$.from') = 'applied'
              )
              AND NOT EXISTS (
                SELECT 1 FROM interview_round ir WHERE ir.application_id = application.id
              )
            THEN 1 ELSE 0
        END) AS ghosted
    FROM application
    WHERE user_id = ${userId}
      AND deleted_at IS NULL
      AND created_at >= ${Math.floor(range.from.getTime() / 1000)}
      AND created_at <= ${Math.floor(range.to.getTime() / 1000)}
    GROUP BY source_key
    ORDER BY total DESC
    LIMIT 8
`);
```

**Performance note:** The two `NOT EXISTS` subqueries are well-indexed (timeline_event has `idx_timeline_event_app`, interview_round has `idx_interview_round_app`). Expected to stay under 10ms on D1 for any reasonable dataset.

**Output shape:**
```json
{
  "data": [
    { "source": "LinkedIn", "offer": 3, "interviewing": 5, "rejected": 8, "ghosted": 2, "withdrawn": 1, "total": 19 },
    { "source": "Referral", "offer": 1, "interviewing": 2, "rejected": 3, "ghosted": 0, "withdrawn": 0, "total":  6 }
  ]
}
```

## Section 8 — User-Configurable Thresholds Storage

**Decision: create a new `user_settings` table.**

**Why not extend better-auth `user` table?** better-auth manages its own schema; extending it risks conflicts on future better-auth upgrades. We'd also need to teach the auth library about the new columns. Avoid.

**Why not KV?** KV has a 1K writes/day free tier; every threshold edit (debounced, but still frequent during tuning) would burn through it. D1 has 100K writes/day — much safer. Also KV is eventually-consistent — settings are read immediately after write on the Analytics page, which would be an annoying UX with KV consistency lag.

**Why not a JSON blob column on `user`?** Same better-auth concern. And loses the type-system benefit of Drizzle columns.

**Schema (new):**
```ts
// src/db/schema/userSettings.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { user } from "./auth";

export const userSettings = sqliteTable("user_settings", {
    userId: text("user_id")
        .primaryKey()
        .references(() => user.id, { onDelete: "cascade" }),
    // Analytics thresholds: JSON-encoded { appliedScreening: {greenBelow, amberBelow}, ... }
    analyticsThresholds: text("analytics_thresholds"),
    createdAt: integer("created_at", { mode: "timestamp" })
        .notNull().default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
        .notNull().default(sql`(unixepoch())`),
});
```

**Why a JSON blob rather than six integer columns?**
- Future thresholds (e.g. deadline urgency, stale days) can land without a migration.
- Current values are a self-contained group — no need to query individual numbers.
- D1 cost is negligible for a JSON column < 200 bytes.
- Validation lives in Zod (`analyticsThresholdsSchema`), not DDL.

**Defaults (D-19 — ship as-is; planner may tune based on data):**
```ts
// src/shared/validators/analytics.ts
export const ANALYTICS_THRESHOLD_DEFAULTS = {
    appliedScreening:       { greenBelow:  7, amberBelow: 14 },
    screeningInterviewing:  { greenBelow:  5, amberBelow: 10 },
    interviewingOffer:      { greenBelow:  3, amberBelow:  7 },
} as const;

export const analyticsThresholdsSchema = z.object({
    appliedScreening:      z.object({ greenBelow: z.number().int().min(0).max(365), amberBelow: z.number().int().min(0).max(365) }),
    screeningInterviewing: z.object({ greenBelow: z.number().int().min(0).max(365), amberBelow: z.number().int().min(0).max(365) }),
    interviewingOffer:     z.object({ greenBelow: z.number().int().min(0).max(365), amberBelow: z.number().int().min(0).max(365) }),
}).refine(
    (t) => t.appliedScreening.greenBelow      < t.appliedScreening.amberBelow
        && t.screeningInterviewing.greenBelow < t.screeningInterviewing.amberBelow
        && t.interviewingOffer.greenBelow     < t.interviewingOffer.amberBelow,
    { message: "green-below must be less than amber-below" },
);
```

**API contract:**
- `GET /api/settings/analytics-thresholds` → returns stored thresholds, or defaults if row doesn't exist.
- `PATCH /api/settings/analytics-thresholds` → upserts (INSERT OR REPLACE) with validated JSON payload.
- `POST /api/settings/analytics-thresholds/reset` → delete the row so GET falls back to defaults. (The UI-SPEC `Reset defaults` button hits this.)

**Seeding:** Do NOT seed on user creation (no row = defaults); first PATCH creates the row via upsert. This keeps the auth flow untouched.

## Section 9 — Global Date Range Filter (ANLY-05, D-15..D-17)

**State management:** TanStack Router search params (URL) + localStorage for last-used persistence.

**Why URL over Zustand:**
- Shareable/bookmarkable URLs (user wants to send "my last 90 days" to themselves).
- Back-button semantics come free.
- Matches Phase 4 D-04 precedent (filter chips in URL).

**Why layer localStorage on top:**
- First visit to `/analytics` after the URL has been stripped (e.g. navigating from sidebar) should restore the last filter.
- Per D-17: default is "All time" on first load; persist last-used in localStorage.
- localStorage key: `jobdash:analytics:dateRange` (UI-SPEC line 429 confirms).

**Preset → {from, to} mapping:**
```ts
// src/client/lib/dateRange.ts
import { subDays, startOfDay, endOfDay, startOfYear } from "date-fns";

export type DateRangePreset = "30d" | "90d" | "ytd" | "all" | "custom";
export type DateRange = { from: Date; to: Date };

export function presetToRange(
    preset: DateRangePreset,
    now: Date = new Date(),
    custom?: { from: string; to: string },
): DateRange {
    const today = endOfDay(now);
    switch (preset) {
        case "30d":    return { from: startOfDay(subDays(now, 30)),  to: today };
        case "90d":    return { from: startOfDay(subDays(now, 90)),  to: today };
        case "ytd":    return { from: startOfYear(now),              to: today };
        case "all":    return { from: new Date(0),                   to: today };
        case "custom": return {
            from: startOfDay(new Date(custom!.from + "T00:00:00Z")),
            to:   endOfDay(new Date(custom!.to   + "T00:00:00Z")),
        };
    }
}
```

**Custom range modal:** Uses existing design-system `Modal.tsx`. Two native `<input type="date">` fields (browser-native picker, zero-dependency, keyboard accessible). Native inputs return `YYYY-MM-DD` strings — match URL param shape.

**Applied-range caption (UI-SPEC line 215):** Display computed from the preset:
- Preset is not `custom`: `"Showing: Last 30 days"` / `"Last 90 days"` / `"Year to date"` / `"All time"`.
- Preset IS `custom`: `"Showing: Apr 1 – Apr 23"` (use `format(from, "MMM d")`).

**Server transport:** Send as query params `?from=YYYY-MM-DD&to=YYYY-MM-DD`. Zod validator:
```ts
// src/shared/validators/analytics.ts
export const analyticsRangeSchema = z.object({
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),  // ISO date
    to:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
```

## Section 10 — "+N more" Modal Pattern

Reuse `src/client/components/design-system/Modal.tsx` (verified exists, supports `open/onClose/title/children`). Per UI-SPEC D-08 note: "planner's call" between popover-in-place vs scrolling to This Week.

**Recommendation: glass Modal (as spec describes in its Interaction Contracts > Calendar Interactions section).**
- Title: `"{formatted day} · {N} events"` (e.g. `"Thursday, April 23 · 5 events"`).
- Body: the same row shape as ThisWeekList — color dot + time + company badge + role title + chevron.
- Row click: closes modal + navigates (same as chip click).
- Closes on: Esc (already wired in Modal.tsx), backdrop click (already wired), row click (navigation triggers unmount), X-button if added in Modal component.

This is simpler than a popover (no positioning math) and is consistent with the rest of the design system.

## Section 11 — Proposed DB Migrations

### Migration 0006: `user_settings` table + `idx_timeline_event_user_occurred` index

```sql
-- src/db/migrations/0006_analytics_settings.sql (name will vary per Drizzle snapshot)

CREATE TABLE IF NOT EXISTS `user_settings` (
    `user_id` text PRIMARY KEY NOT NULL,
    `analytics_thresholds` text,
    `created_at` integer DEFAULT (unixepoch()) NOT NULL,
    `updated_at` integer DEFAULT (unixepoch()) NOT NULL,
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX IF NOT EXISTS `idx_timeline_event_user_occurred`
    ON `timeline_event` (`user_id`, `occurred_at`);
```

**Generation:** Run `npm run db:generate` after adding the schema file. Drizzle will name the migration (e.g. `0006_<random-word>.sql`) and create a snapshot JSON.

**Test setup update:** Append both statements to the `migrationSQL` string in `tests/setup.ts` so integration tests can seed fresh DBs with the new schema.

**Runtime note:** No existing data needs migrating (user_settings is new; the index is additive). The migration is safe to apply to remote D1 in production without downtime.

## Section 12 — Proposed API Endpoints

All new endpoints mount behind `requireAuth` in `worker/index.ts` (matches Phase 2-7 pattern).

### Plan 08-01 — Calendar
| Method | Path | Purpose | Query Params |
|--------|------|---------|--------------|
| GET | `/api/calendar/events` | Interviews + deadlines for a month | `month=YYYY-MM` (required). Server returns events for that month's 42-cell grid range (startOfWeek(startOfMonth) → +42d). |

**Response shape:**
```json
{
  "data": {
    "interviews": [
      { "id": "...", "applicationId": "...", "applicationSlug": "meta-swe", "companyName": "Meta", "roleTitle": "Software Engineer", "roundType": "technical", "scheduledAt": 1713878400, "status": "scheduled" }
    ],
    "deadlines": [
      { "id": "...", "applicationId": "...", "applicationSlug": "meta-swe", "companyName": "Meta", "roleTitle": "Software Engineer", "deadlineType": "offer_expiry", "label": null, "dueDate": 1713878400, "isCompleted": false }
    ]
  }
}
```

**Query (Drizzle):**
- Interviews: `INNER JOIN application ON ... WHERE interview_round.user_id = :userId AND application.deleted_at IS NULL AND interview_round.scheduled_at BETWEEN :from AND :to`.
- Deadlines: same shape on `deadline` table.
- Both joined with application to pull `companyName`, `roleTitle`, `slug` in a single round-trip per list.

### Plan 08-02 — Analytics + Settings

| Method | Path | Purpose | Query / Body |
|--------|------|---------|--------------|
| GET | `/api/analytics/funnel` | Funnel counts + conversion | `from=YYYY-MM-DD&to=YYYY-MM-DD` |
| GET | `/api/analytics/response-times` | 3 transition averages | `from=YYYY-MM-DD&to=YYYY-MM-DD` |
| GET | `/api/analytics/sources` | Top 8 sources stacked by outcome | `from=YYYY-MM-DD&to=YYYY-MM-DD` |
| GET | `/api/analytics/stats` | 4 stat-card values | `from=YYYY-MM-DD&to=YYYY-MM-DD` |
| GET | `/api/settings/analytics-thresholds` | Read user's thresholds (or defaults) | — |
| PATCH | `/api/settings/analytics-thresholds` | Upsert thresholds | JSON body: `{ appliedScreening: { greenBelow, amberBelow }, ... }` |
| POST | `/api/settings/analytics-thresholds/reset` | Delete row → fall back to defaults | — |

**Error handling:** All routes use the existing `onError` handler pattern (Phase 2 service pattern). AppError instances → formatted 4xx JSON; unhandled → 500 generic.

**Analytics endpoints return**: `success(data)` envelope from `src/server/lib/response.ts`.

## Section 13 — Dependency Graph: 08-01 and 08-02

### 08-01 Calendar Plan — Wave structure

**Wave 0 (sequential — sets foundation):**
- Task: install `date-fns@^4.1.0`; add to package.json dependencies.

**Wave 1 (parallelizable):**
- Task A: Add calendar Zod validator (`src/shared/validators/calendar.ts`) — `calendarMonthSchema` for `?month=YYYY-MM` param.
- Task B: Create `src/client/lib/monthGrid.ts` pure utility (pure function, unit-testable).

**Wave 2 (sequential — each depends on Wave 1):**
- Task: Create service `src/server/services/calendar.ts` (2 functions: `listInterviewsInRange`, `listDeadlinesInRange`; or a single `getMonthEvents`).
- Task: Create route `src/server/routes/calendar.ts` with `GET /api/calendar/events`.
- Task: Mount `calendarRoutes` in `worker/index.ts`.
- Task: Integration tests `tests/calendar/events.test.ts` — CRUD scenarios: empty month, month with 3 interviews + 2 deadlines, month boundary spillover (events in spillover cells), tenant isolation.

**Wave 3 (parallelizable — after Wave 2):**
- Task A: Build `EventChip`, `CalendarDayCell`, `CalendarMonthGrid` components.
- Task B: Build `ThisWeekList` component.
- Task C: Build `DayOverflowModal` component.
- Task D: Create `useCalendarMonth` hook (TanStack Query wrapper).

**Wave 4 (sequential):**
- Task: Wire everything into `src/client/routes/_authenticated/calendar.tsx` replacing placeholder. Include empty states, loading skeletons, error state.
- Task: Manual smoke test — navigate to calendar, see current month, click a chip → navigate to detail with `?tab=interviews` or `?tab=overview`.

**Exit criteria:** VIEW-03 satisfied — empirically verifiable on the rendered page.

### 08-02 Analytics + Settings Plan — Wave structure

**Wave 0 (sequential — sets foundation; cannot parallelize because migration order matters):**
- Task: install `recharts@^3.8.1` (date-fns already in from 08-01).
- Task: Add `src/db/schema/userSettings.ts` (new Drizzle table).
- Task: Add `src/shared/constants.ts` — no change needed (no new enum).
- Task: Add `src/shared/validators/analytics.ts` — `analyticsRangeSchema`, `analyticsThresholdsSchema`, `ANALYTICS_THRESHOLD_DEFAULTS`.
- Task: Add `src/shared/validators/userSettings.ts` — re-export for clarity.
- Task: Run `npm run db:generate` to produce migration 0006. Update `tests/setup.ts` with the new DDL (user_settings) AND the index.

**Wave 1 (parallelizable):**
- Task A: Build `src/server/services/analytics.ts` with 4 service functions: `getFunnelCounts`, `getResponseTimeAverages`, `getSourceBreakdown`, `getStatCards`.
- Task B: Build `src/server/services/userSettings.ts` with `getAnalyticsThresholds`, `upsertAnalyticsThresholds`, `resetAnalyticsThresholds`.
- Task C: Build `src/client/lib/dateRange.ts` (pure, unit-testable).
- Task D: Build `src/client/lib/responseTimeColor.ts` (pure).

**Wave 2 (sequential):**
- Task: Build `src/server/routes/analytics.ts` (4 routes) + `src/server/routes/userSettings.ts` (3 routes).
- Task: Mount both in `worker/index.ts`.
- Task: Integration tests — `tests/analytics/funnel.test.ts`, `tests/analytics/response-times.test.ts`, `tests/analytics/sources.test.ts`, `tests/analytics/stats.test.ts`, `tests/settings/analytics-thresholds.test.ts`.

**Wave 3 (parallelizable — after Wave 2):**
- Task A: `useAnalytics` hook (four queries in one module) + `useAnalyticsThresholds`.
- Task B: Build `AnalyticsDateRangeBar`, `CustomRangeModal`, `StatCard`.
- Task C: Build `PipelineFunnelChart`, `SourceEffectivenessChart`, `ResponseTimeTable`.
- Task D: Build `AnalyticsThresholdsSection`, `ThresholdRow` (settings components).

**Wave 4 (sequential):**
- Task: Wire into `src/client/routes/_authenticated/analytics.tsx` — URL search params via `validateSearch`, conditional rendering across loading/error/empty/data states.
- Task: Wire `AnalyticsThresholdsSection` into `src/client/routes/_authenticated/settings.tsx` (first real section — settings.tsx is currently a placeholder).
- Task: Manual smoke test — change filter to 30d, watch all four panels re-fetch; edit a threshold in Settings, verify Response Time table recolors on next Analytics visit.

**Exit criteria:** VIEW-05, ANLY-01..05 satisfied; response-time cells recolor per thresholds; Settings section saves and reset works.

### Cross-plan dependencies

| Dependency | From | To | How handled |
|------------|------|-----|-------------|
| date-fns install | 08-01 Wave 0 | 08-02 | 08-02 can `import` directly once 08-01 merges; no re-install needed |
| `tests/setup.ts` changes | 08-02 Wave 0 | future plans | Inline SQL pattern already established Phase 2. Additive only. |
| URL search param pattern | Phase 4 | 08-02 Wave 4 | Reuse existing `validateSearch` pattern |
| `Modal.tsx` | Phase 3 | 08-01 (DayOverflowModal), 08-02 (CustomRangeModal) | Reused; no changes to Modal itself |
| `FilterChips.tsx` | Phase 4 | 08-02 (AnalyticsDateRangeBar) | Reused with `variant="tab"` — the tab variant is the closest to the UI-SPEC "filled active" look. If needed, add an `aria-pressed={isActive}` attribute per UI-SPEC accessibility note line 463 as a one-line upgrade. |

**If 08-01 and 08-02 run in parallel (gsd worktree pattern):** 08-02 Wave 0 installs date-fns too (idempotent — npm dedupes), eliminating the cross-plan dependency.

## Code Examples

### Funnel data fetch (client)
```tsx
// src/client/hooks/useAnalytics.ts (excerpt)
import { useQuery } from "@tanstack/react-query";
import type { DateRange } from "@/client/lib/dateRange";
import { format } from "date-fns";

function rangeToQueryParams(range: DateRange): string {
    const p = new URLSearchParams({
        from: format(range.from, "yyyy-MM-dd"),
        to:   format(range.to,   "yyyy-MM-dd"),
    });
    return p.toString();
}

export function useFunnel(range: DateRange) {
    return useQuery({
        queryKey: ["analytics", "funnel", range.from.toISOString(), range.to.toISOString()],
        queryFn: async () => {
            const res = await fetch(`/api/analytics/funnel?${rangeToQueryParams(range)}`);
            if (!res.ok) throw new Error("Failed to load funnel");
            const json = await res.json();
            return json.data;
        },
    });
}
// Repeat shape for useResponseTimes / useSources / useStats — OR combine into a single queryFn that fetches all four in parallel and returns `{ funnel, responseTimes, sources, stats }`.
```

### Month grid render
```tsx
// src/client/components/calendar/CalendarMonthGrid.tsx (sketch)
import { format, isSameMonth, isToday } from "date-fns";
import { generateMonthGrid } from "@/client/lib/monthGrid";

export function CalendarMonthGrid({ anchor, events }: { anchor: Date; events: CalendarEvent[] }) {
    const cells = generateMonthGrid(anchor);
    const byDay = groupBy(events, (e) => format(e.date, "yyyy-MM-dd"));

    return (
        <div role="grid" aria-label={`Calendar for ${format(anchor, "LLLL yyyy")}`}
             className="grid grid-cols-7 gap-px">
            {cells.map((cell) => {
                const key = format(cell, "yyyy-MM-dd");
                const dayEvents = byDay.get(key) ?? [];
                const inMonth = isSameMonth(cell, anchor);
                return (
                    <CalendarDayCell
                        key={key}
                        date={cell}
                        events={dayEvents}
                        inMonth={inMonth}
                        isToday={isToday(cell)}
                    />
                );
            })}
        </div>
    );
}
```

### Response-time cell coloring
```ts
// src/client/lib/responseTimeColor.ts
export type ResponseTimeZone = "green" | "amber" | "red" | "none";

export function getResponseTimeZone(
    avgDays: number | null,
    threshold: { greenBelow: number; amberBelow: number },
): ResponseTimeZone {
    if (avgDays === null) return "none";
    if (avgDays < threshold.greenBelow) return "green";
    if (avgDays < threshold.amberBelow) return "amber";
    return "red";
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| date-fns v2 `import * as dateFns` | date-fns v3+ named imports | v3.0 (Dec 2023) | Much better tree-shaking; essential for Workers |
| Recharts v2 with manual React 19 patch | Recharts v3 native React 19 peer | v3.0 (mid-2025) | No workaround needed; peerDependencies include `^19` |
| Moment.js for all date math | date-fns, day.js, or native `Intl` | 2020+ | Moment deprecated; 300kB saved |
| React Router v6 context | TanStack Router `validateSearch` | Phase 3 project decision | Type-safe search params |

**Deprecated/outdated (do NOT use):**
- `react-beautiful-dnd` — unmaintained. @hello-pangea/dnd is the drop-in replacement and is already in dependencies.
- date-fns v2 patterns (namespace imports).
- `new Date() - N * 86400 * 1000` for "30 days ago" — use `subDays(now, 30)`.

## Open Questions

1. **Should the calendar endpoint return events for the full 42-cell range, or just the anchor month?**
   - What we know: UI-SPEC shows spillover cells (line 208) — events DO appear on out-of-month days.
   - What's unclear: whether users expect spillover events or if the simpler "month-only" is fine.
   - Recommendation: **return 42-cell range** (exactly `{ from: startOfWeek(startOfMonth(anchor)), to: addDays(that, 42) }`). This matches the rendered grid and matches UI-SPEC.

2. **Case-insensitivity for source grouping: planner's call per D-11 — recommended case-insensitive.**
   - What we know: `source` is free-text; users may type `LinkedIn`, `linkedin`, `linked in`.
   - What's unclear: whether to normalize "linked in" vs "LinkedIn" further (strip spaces, etc.).
   - Recommendation: **LOWER() only** in Phase 8. More aggressive normalization (remove spaces, punctuation) is a follow-up polish item.

3. **Analytics panel fetch granularity: four separate queries or one bulk query?**
   - What we know: UI-SPEC per-panel error states imply per-endpoint queries — a single bulk endpoint would fail-everything-at-once.
   - Recommendation: **four separate endpoints + four TanStack queries in parallel**. TanStack Query dedupes and caches per key; separate endpoints enable per-panel retry. Bundle to one client hook (`useAnalytics(range)`) that internally runs four queries.

4. **Should the Settings thresholds page save per-field (debounce) or on blur?**
   - What we know: UI-SPEC line 437 says both: "debounced save (500ms) via useDebouncedMutate. On blur, immediate save."
   - Recommendation: **both, exactly as spec**. Use the existing `useDebouncedMutate` hook (`src/client/hooks/useDebouncedMutate.ts`, verified present).

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.4 + `@cloudflare/vitest-pool-workers` 0.14.7 (Workers runtime test pool) |
| Config file | `vitest.config.ts` (existing) |
| Quick run command | `npm test -- tests/<pattern>` or `npx vitest run tests/calendar` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| VIEW-03 | `GET /api/calendar/events?month=YYYY-MM` returns interviews + deadlines intersecting the 42-cell range; respects tenant isolation | integration | `npx vitest run tests/calendar/events.test.ts` | ❌ Wave 0 (08-01) |
| VIEW-03 | Month grid renders 42 cells regardless of month length | unit | `npx vitest run src/client/lib/monthGrid.test.ts` | ❌ Wave 1 (08-01) |
| VIEW-03 | Empty month (no events) renders grid + ThisWeekList empty state — smoke check in integration | integration / manual | — (visual) | manual |
| VIEW-05 | `/analytics` route renders with all four panels | manual | browser smoke | manual |
| VIEW-05 | Settings page has Analytics section and saves thresholds | manual + integration (thresholds API) | `npx vitest run tests/settings/analytics-thresholds.test.ts` | ❌ Wave 2 (08-02) |
| ANLY-01 | `GET /api/analytics/funnel` returns correct counts for seeded timeline events; conversion computed | integration | `npx vitest run tests/analytics/funnel.test.ts` | ❌ Wave 2 (08-02) |
| ANLY-01 | Funnel respects date-range filter | integration | `npx vitest run tests/analytics/funnel.test.ts` | same file |
| ANLY-01 | Funnel respects soft-delete (doesn't count deleted apps) | integration | `npx vitest run tests/analytics/funnel.test.ts` | same file |
| ANLY-01 | Funnel respects tenant isolation | integration | `npx vitest run tests/analytics/funnel.test.ts` | same file |
| ANLY-02 | `GET /api/analytics/sources` returns top-8 grouped by LOWER(source), stacked by outcome, with ghosted derived correctly | integration | `npx vitest run tests/analytics/sources.test.ts` | ❌ Wave 2 (08-02) |
| ANLY-02 | Ghosted = applied + no status_change + no interview_round + >30d since updated | integration | `npx vitest run tests/analytics/sources.test.ts` | same file |
| ANLY-03 | `GET /api/analytics/response-times` returns avg days per adjacent transition using LAG() | integration | `npx vitest run tests/analytics/response-times.test.ts` | ❌ Wave 2 (08-02) |
| ANLY-03 | Skipped stages (applied→interviewing direct) correctly contribute 0 to adjacent-pair averages | integration | `npx vitest run tests/analytics/response-times.test.ts` | same file |
| ANLY-03 | Zone classifier maps avgDays to green/amber/red per thresholds | unit | `npx vitest run src/client/lib/responseTimeColor.test.ts` | ❌ Wave 1 (08-02) |
| ANLY-04 | `GET /api/analytics/stats` returns correct counts for total/active/offers/rejection rate | integration | `npx vitest run tests/analytics/stats.test.ts` | ❌ Wave 2 (08-02) |
| ANLY-04 | Rejection rate with denominator=0 returns null | integration | `npx vitest run tests/analytics/stats.test.ts` | same file |
| ANLY-05 | All analytics endpoints accept `from`/`to` and restrict results | integration | all four test files above | see above |
| ANLY-05 | preset → range mapping produces correct Date objects for 30d/90d/ytd/all/custom | unit | `npx vitest run src/client/lib/dateRange.test.ts` | ❌ Wave 1 (08-02) |
| VIEW-05 / ANLY-03 | Thresholds: GET returns defaults when row absent, PATCH upserts, POST reset deletes row | integration | `npx vitest run tests/settings/analytics-thresholds.test.ts` | ❌ Wave 2 (08-02) |
| VIEW-05 / ANLY-03 | Threshold validator rejects greenBelow >= amberBelow | unit | `npx vitest run src/shared/validators/analytics.test.ts` | ❌ Wave 0 (08-02) |

### Sampling Rate

- **Per task commit:** `npx vitest run tests/<area>` where `<area>` is `calendar/`, `analytics/`, or `settings/` depending on the task.
- **Per wave merge:** `npm test` (full suite).
- **Phase gate:** Full suite green + manual browser smoke (calendar click-through, filter change, threshold edit) before `/gsd:verify-work`.

### Wave 0 Gaps

- [ ] **08-01:** `tests/calendar/events.test.ts` — covers VIEW-03 endpoint behavior (seed interviews + deadlines, assert returned shape matches month-range filter).
- [ ] **08-01:** `src/client/lib/monthGrid.test.ts` — pure-function unit test for `generateMonthGrid(anchor)` returning 42 cells.
- [ ] **08-02:** `tests/analytics/funnel.test.ts` — seed timeline_event with known transitions; assert counts and conversion.
- [ ] **08-02:** `tests/analytics/response-times.test.ts` — seed multi-step transitions; assert LAG() output.
- [ ] **08-02:** `tests/analytics/sources.test.ts` — seed apps with varied sources + ghosted conditions; assert top-8 and outcome stacks.
- [ ] **08-02:** `tests/analytics/stats.test.ts` — seed across statuses; assert stat card numbers including null rejection rate.
- [ ] **08-02:** `tests/settings/analytics-thresholds.test.ts` — GET defaults, PATCH upsert, POST reset, Zod rejection of invalid payloads.
- [ ] **08-02:** `src/client/lib/dateRange.test.ts` — unit test preset → range mapping across 30d/90d/ytd/all/custom boundaries.
- [ ] **08-02:** `src/client/lib/responseTimeColor.test.ts` — unit test zone classifier including boundary values.
- [ ] **08-02:** `src/shared/validators/analytics.test.ts` — unit test threshold schema refinement (green < amber).
- [ ] **08-02:** `tests/setup.ts` updates — add `user_settings` CREATE TABLE + `idx_timeline_event_user_occurred` CREATE INDEX statements.

*(Framework install: none needed — Vitest + Workers pool already installed.)*

## Common Pitfalls

### Pitfall 1: Forgetting soft-delete filter in analytics aggregates
**What goes wrong:** Funnel counts include deleted applications, inflating numbers.
**Why it happens:** Aggregation queries start from `timeline_event` (which has no `deletedAt`), not from `application`.
**How to avoid:** Every analytics query MUST `INNER JOIN application ON application.id = timeline_event.application_id` and add `application.deleted_at IS NULL` to the WHERE clause. Integration test: create app, seed timeline events, soft-delete app, assert funnel count unchanged.
**Warning signs:** Tests pass but stale data in production after user deletes something.

### Pitfall 2: Timezone mismatch on date range boundaries
**What goes wrong:** A user in IST filters "Today" and loses events because server compares against UTC `startOfDay`.
**Why it happens:** Date pickers yield `YYYY-MM-DD` strings interpreted as UTC midnight; local event at 11 PM IST is stored as 17:30 UTC — same day in IST but 0 or 1 day off in UTC.
**How to avoid:** Interpret range inputs at `startOfDay` / `endOfDay` in **server local time** (which is UTC for Workers). Document that "today" means UTC day in MVP. Acceptable tradeoff; revisit in v2 if requested. (No tests-regressing behavior unless tests seed timestamps near midnight — add a boundary test for 23:59:59 and 00:00:00.)
**Warning signs:** Off-by-one-day results at dusk.

### Pitfall 3: Recharts bar `radius` prop on stacked bars
**What goes wrong:** Rounded corners appear on internal stack segments (between outcomes), breaking the single-bar visual.
**Why it happens:** Each `<Bar>` gets its own rounding by default.
**How to avoid:** Set `radius={[0, 4, 4, 0]}` **only on the final (rightmost) stack segment** — Recharts' convention is that the last `<Bar>` drawn is on top / at the bar's tail. UI-SPEC doesn't spec corner radius; safest to either (a) skip radius entirely on stacked chart (flat bars) or (b) conditionally radius the last `<Bar>`.

### Pitfall 4: Stale funnel data after a status change
**What goes wrong:** User drags a card from Applied to Screening; Analytics page shows old numbers.
**Why it happens:** TanStack Query cache keys don't invalidate on application status mutations.
**How to avoid:** In `useUpdateStatus` (existing hook in `useApplications.ts`), add to `onSettled`:
```ts
queryClient.invalidateQueries({ queryKey: ["analytics"] });
queryClient.invalidateQueries({ queryKey: ["calendar"] });
```
This is a small, documented change to an existing hook. Include in 08-02.

### Pitfall 5: URL-encoded "+" treated as space in search params
**What goes wrong:** A custom date range URL `?preset=custom&from=2026-01-01&to=2026-04-23` may re-serialize incorrectly.
**Why it happens:** TanStack Router is usually fine here, but older URL parsing tools can drop `-`/`+` differently.
**How to avoid:** Use plain `YYYY-MM-DD` strings (no `+`, no offsets). `URLSearchParams` handles them correctly.

### Pitfall 6: Non-deterministic Recharts animation flashing
**What goes wrong:** Chart appears briefly at 0 height then snaps to correct size — jarring.
**Why it happens:** Chart is rendered before `ResponsiveContainer` measures the parent.
**How to avoid:** Ensure parent has explicit height (UI-SPEC already says `h-[280px]` etc.). Set `isAnimationActive={false}` on bars. Show a skeleton during `isLoading`.

### Pitfall 7: `json_extract` NULL returns vs missing keys
**What goes wrong:** Timeline events written in an earlier phase that have a slightly different metadata shape cause `json_extract(metadata, '$.to')` to return NULL, breaking GROUP BY.
**Why it happens:** Metadata is free-form text; a past schema drift would leave orphan shapes.
**How to avoid:** Verify in integration tests that all `status_change` events have `{from, to}` shape. Phase 2 service code (`src/server/services/application.ts`) is the sole writer; tests confirm shape. Add a defensive `json_extract(...) IS NOT NULL` to the WHERE clause.

### Pitfall 8: `user_settings` primary key collision under parallel PATCH
**What goes wrong:** Two fast debounced PATCHes race — both try INSERT; the second fails uniquely.
**Why it happens:** INSERT OR REPLACE isn't used; or upsert semantics aren't correct.
**How to avoid:** Use `INSERT ... ON CONFLICT(user_id) DO UPDATE SET analytics_thresholds = excluded.analytics_thresholds, updated_at = unixepoch()` — Drizzle: `.onConflictDoUpdate({ target: userSettings.userId, set: { ... } })`. Integration test: issue two PATCHes in quick succession and assert no error + final value is the second PATCH's.

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Recharts 3.8 + React 19 regression | LOW | HIGH | React 19 officially in peerDependencies (verified via npm); Recharts has explicit React 19 bullets in 3.0+ release notes. If regression surfaces, downgrade to latest 3.x known-good (current 3.8.1 is most recent). |
| date-fns 4 ESM-first breaks Vite 8 + Workers | LOW | MEDIUM | v4 ESM is the modern norm; Vite 8 + Rolldown handles natively. If issue, pin to date-fns@^3.6. |
| LAG() not supported on D1 | VERY LOW | HIGH | SQLite window functions since 3.25 (2018); D1 is modern SQLite. Confirmed by a Cloudflare community thread. Can verify with `npx wrangler d1 execute DB --local --command="SELECT sqlite_version()"` during Wave 0 — fail-fast if version < 3.25. |
| Bundle size spike from Recharts | LOW | LOW | Route-level code splitting isolates Recharts to `/analytics` chunk. Main bundle unchanged. Budget: < 100KB gzipped for analytics chunk is achievable. |
| Workers 10ms CPU limit exceeded by aggregate SQL | LOW | MEDIUM | SQL runs on D1 (separate from Workers CPU). Worker just marshals results. SQL query time unrelated to Workers 10ms budget. |
| Timeline metadata shape drift from old apps | LOW | MEDIUM | Phase 2 service code is the sole writer; verified by all Phase 2 tests. Integration tests should seed and read to confirm. If drift found, write a one-off data migration. |
| Ghosted derivation query performance at scale | LOW | MEDIUM | Two NOT EXISTS subqueries per row in top-8 source group. With typical user having < 500 apps, still < 10ms. Monitor via Drizzle query logging during development. |
| Chart accessibility gaps (WCAG) | MEDIUM | LOW | UI-SPEC specifies ARIA and number-reinforcement patterns. Implement per spec; add unit test for `aria-label` on each `<Bar>` using React Testing Library. |
| Custom range modal date-input browser inconsistency | LOW | LOW | Native `<input type="date">` varies on Safari/iOS. Acceptable for v1; users get a platform-native picker. Revisit if complaint rate is high. |

## Sources

### Primary (HIGH confidence)
- **CLAUDE.md (project)** — verified stack: Recharts, date-fns, Drizzle, Hono, TanStack, Zod, Zustand, Tailwind v4.
- **npm registry (verified 2026-04-23)** — `recharts@3.8.1` (published 2026-03-25), `date-fns@4.1.0` (published 2025-08-03), both with React 19 peerDependencies confirmed.
- **CONTEXT.md (08-CONTEXT.md)** — 20 locked decisions D-01..D-20, verbatim constraints.
- **UI-SPEC (08-UI-SPEC.md)** — visual + interaction contracts, component inventory, copy contracts.
- **REQUIREMENTS.md** — VIEW-03, VIEW-05, ANLY-01..05 canonical definitions.
- **Prior phase summaries (02-01, 02-02, 02-03, 05-01, 05-02, 06-01, 06-02, 06-03)** — data schema, query patterns, test patterns.
- **Phase 2 source code** — `src/server/services/application.ts` (baseConditions, createTimelineEvent), `src/db/schema/application.ts` (timeline_event table shape), confirmed metadata shape for `status_change`.
- **Phase 6 source code** — `src/db/schema/deadline.ts`, `src/client/hooks/useDeadlines.ts` — deadline shape and hook conventions.
- **Phase 5 source code** — `src/db/schema/interview.ts` — interview_round.scheduled_at shape.
- **Drizzle ORM docs** — [joins](https://orm.drizzle.team/docs/joins), [SQL operator](https://orm.drizzle.team/docs/sql), [select](https://orm.drizzle.team/docs/select).
- **SQLite docs — window functions** — [https://sqlite.org/windowfunctions.html](https://sqlite.org/windowfunctions.html). LAG() supported since 3.25 (2018).
- **SQLite LAG tutorial** — [https://www.sqlitetutorial.net/sqlite-window-functions/sqlite-lag/](https://www.sqlitetutorial.net/sqlite-window-functions/sqlite-lag/).
- **Recharts 3 docs** — [BarChart API](https://recharts.github.io/en-US/api/BarChart), [ResponsiveContainer API](https://recharts.github.io/en-US/api/ResponsiveContainer), [Stacked BarChart example](https://recharts.github.io/en-US/examples/StackedBarChart).
- **Recharts peerDependencies (npm)** — `react: '^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0'` (React 19 officially supported).

### Secondary (MEDIUM confidence)
- **date-fns v4 release blog** — [v4.0 time zone support announcement](https://blog.date-fns.org/v40-with-time-zone-support/).
- **Cloudflare D1 docs** — [Overview](https://developers.cloudflare.com/d1/), [SQL statements](https://developers.cloudflare.com/d1/sql-api/sql-statements/).

### Tertiary (LOW confidence — flagged for validation)
- **Recharts bundle size 290KB** — cited in 2026 pkgpulse article; planner should re-measure against actual build output if bundle budget is tight.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions verified via npm; peerDependencies confirmed.
- Architecture (aggregation SQL): HIGH — LAG() is a standard, well-documented feature; the GROUP BY funnel pattern is canonical; existing Phase 2 patterns are read from source and consistent.
- Pitfalls: MEDIUM — pitfalls 1, 3, 4, 6 are drawn from direct observation of existing code patterns; pitfalls 2, 5, 7, 8 are general industry traps with clear mitigations.
- Runtime State Inventory: N/A (greenfield).
- Environment Availability: HIGH — local verification against `package.json` and repo state.
- Validation Architecture: HIGH — test file naming matches Phase 2/5/6 conventions; integration test style is well-established.

**Research date:** 2026-04-23
**Valid until:** 2026-05-23 (30 days — Recharts and date-fns are stable libraries; major Cloudflare D1 or Drizzle changes would invalidate earlier)

---

*Phase: 08-calendar-analytics*
*Research completed: 2026-04-23*
