# Phase 8: Calendar & Analytics - Context

**Gathered:** 2026-04-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Ship two read-only views backed by existing data:

1. **Calendar view** (`/calendar`) — month grid of scheduled interviews + deadlines with click-through to the application detail page, plus a "This Week" list below the grid.
2. **Analytics view** (`/analytics`) — pipeline funnel, source effectiveness chart, response time table with color coding, and summary stat cards. A global date range filter controls all metrics.
3. **Settings additions** — new "Analytics" section on `/settings` for user-configurable response-time thresholds.

**Scope reductions from original roadmap:**
- **Google Calendar sync removed.** VIEW-03 was originally "calendar view with Google Calendar sync." User dropped the sync portion; the calendar view remains, but nothing writes to or reads from Google Calendar. Sync can return as its own phase later if desired.

**Not in scope (deferred to other phases):**
- Google Calendar sync (any direction, any trigger)
- Command palette (Phase 9)
- Chart types not listed in success criteria (Sankey, heatmaps, etc.)
- Per-card filters or saved filter presets
- Exporting analytics to CSV/PDF
- Per-company response time granularity (chose by-stage-transition only)

</domain>

<decisions>
## Implementation Decisions

### Pipeline Funnel (ANLY-01)
- **D-01:** Model = **flow from timeline events.** Count every application that has ever reached a stage (derived from `timeline_event` rows with `event_type = "status_change"`), not the snapshot of apps currently in that status. This enables real drop-off rates and feeds response-time-by-transition too.
- **D-02:** Stages = **Applied → Screening → Interviewing → Offer** (4 horizontal bars, top to bottom). Wishlist is excluded (not applied yet). Terminal outcomes (accepted/rejected/withdrawn) are NOT funnel bars — they live in stat cards and the source-chart stack.
- **D-03:** Each bar displays **count + conversion % from previous stage**, e.g. "Screening: 18 (43% of Applied)".
- **D-04:** Screening stays a distinct stage (not collapsed into Interviewing). Matches existing enum semantics (screening = recruiter call / phone screen; interviewing = formal loop with hiring team).

### Calendar (VIEW-03)
- **D-05:** Events shown = **interviews + deadlines, both layers always on, distinguished by chip color.** Interviews from `interview_round.scheduled_at`, deadlines from `deadline.due_date`. No layer toggles in Phase 8.
- **D-06:** Click an event chip → **navigate to the application detail page with the relevant tab pre-selected** (interview → Interviews tab, deadline → Overview tab). Reuses TanStack Router; no popover/side panel.
- **D-07:** View = **month-only grid + "This Week" list below.** No week-view toggle, no day view. Matches roadmap success criteria exactly.
- **D-08:** Same-day stacking = **up to 3 chips, then "+N more" overflow.** Clicking "+N more" opens a day popover (or scrolls to that day in "This Week" list — planner's call).
- **D-09:** No Google Calendar sync. No OAuth scope expansion. No refresh token storage.

### Analytics — Source Effectiveness (ANLY-02)
- **D-10:** Chart type = **stacked horizontal bars, one per source, stacked by final outcome.** Segments: Offer, Interviewing (currently in progress), Rejected, Ghosted, Withdrawn. Top N sources by volume (planner picks N — probably top 8).
- **D-11:** `source` is a free-text column, not an enum. Chart groups by exact match (case-sensitive or case-insensitive is planner's call — recommend case-insensitive).

### Analytics — Response Time Table (ANLY-03)
- **D-12:** Granularity = **by stage transition.** Rows = applied→screening, screening→interviewing, interviewing→offer. Each cell shows avg days across matching timeline-event pairs.
- **D-13:** Color cells green/amber/red based on per-transition thresholds read from user settings.

### Analytics — Summary Stat Cards (ANLY-04)
- **D-14:** Four cards: **Total Apps, Currently Active, Offers Received, Rejection Rate**.
  - Total Apps = count of applications within date range
  - Currently Active = count where status ∈ {applied, screening, interviewing, offer}
  - Offers Received = count where status ∈ {offer, accepted}
  - Rejection Rate = rejected ÷ (apps that reached any terminal state: accepted, rejected, withdrawn)

### Analytics — Date Range Filter (ANLY-05)
- **D-15:** Filter UI = **preset chips (30d / 90d / YTD / All time) + a "Custom" chip that opens a date picker.** Matches existing filter-chip pattern from Phase 4.
- **D-16:** Scope = **global.** A single filter bar at the top of `/analytics` controls every card/chart/table on the page. Filter applies to the funnel, source chart, response-time table, and stat cards.
- **D-17:** Filter default = **All time** on first load. Persist last-used value in localStorage (planner's call on key name).

### Settings additions (VIEW-05 extension)
- **D-18:** Add an "Analytics" section to `/settings` with **three threshold rows** — one per stage transition. Each row lets the user set green-below and amber-below cutoffs (in days). Values beyond amber are red.
- **D-19:** Ship with sensible defaults; write them to a new `user_settings` table (or extend existing settings if one exists — planner to verify). Defaults: applied→screening green<7d / amber<14d; screening→interviewing green<5d / amber<10d; interviewing→offer green<3d / amber<7d. These are SUGGESTIONS for the planner — tune based on data.

### Phase slicing
- **D-20:** **Two plans.**
  - **08-01** — Calendar view (month grid, event chips, "This Week" list, click-to-navigate)
  - **08-02** — Analytics dashboard (funnel + source chart + response-time table + stat cards + global filter + settings threshold section, atomic delivery)

### Claude's Discretion
- Exact component library choices within the locked stack (Recharts for bar charts is expected per CLAUDE.md; date-fns for date math)
- Whether "+N more" on calendar opens a popover vs scrolls to "This Week" list
- Exact layout within stat cards (icon placement, size)
- Whether response-time thresholds live in a new `user_settings` table or extend existing
- Exact default threshold values (D-19 suggestions can be revised by planner based on research)
- localStorage key naming for filter persistence

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project specs
- `.planning/PROJECT.md` — vision, constraints (Cloudflare free tier), minimal-warm aesthetic
- `.planning/REQUIREMENTS.md` — VIEW-03, VIEW-05, ANLY-01 through ANLY-05 definitions
- `.planning/ROADMAP.md` — Phase 8 success criteria (note: Google Calendar sync criterion is NULLIFIED by this context)

### Prior phase context (decisions to honor)
- `.planning/phases/01-authentication-foundation/01-CONTEXT.md` — D-14/15 Google OAuth setup (relevant ONLY if sync is ever added back; not used in Phase 8)
- `.planning/phases/03-frontend-shell-dashboard/03-CONTEXT.md` — D-05/06 TanStack Router, D-08/09 design system components, D-11 glass card aesthetic
- `.planning/phases/04-table-detail-navigation/04-CONTEXT.md` — D-03 filter-chip pattern (reuse for date range presets), D-06 route params + slug nav

### Prior phase summaries (data surfaces to consume)
- `.planning/phases/02-application-tracking-api/02-*-SUMMARY.md` — application + timeline_event schema, status enum
- `.planning/phases/05-interview-tracking-notes/05-*-SUMMARY.md` — interview_round schema (scheduled_at, round_type)
- `.planning/phases/06-tags-deadlines-company/06-*-SUMMARY.md` — deadline schema (due_date, deadline_type)

### Stack & conventions
- `CLAUDE.md` — Recharts locked as chart lib; date-fns preferred; Cloudflare free tier constraints
- `src/shared/constants.ts` — `APPLICATION_STATUSES`, `TIMELINE_EVENT_TYPES`, `INTERVIEW_ROUND_TYPES`

No external ADRs or design specs for Phase 8 — calendar and analytics patterns are industry-standard enough that research can rely on common knowledge + Recharts docs.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Glass card + badge + filter-chip components** (`src/client/components/design-system/`, `src/client/components/ui/`) — reuse for event chips, stat cards, date range chips
- **`useApplications`, `useInterviews`, `useDeadlines` hooks** (`src/client/hooks/`) — already fetch the raw data; new analytics queries can be dedicated endpoints or derived client-side
- **TanStack Router** — both `/calendar` and `/analytics` routes exist as placeholder components, replace content in place
- **`src/client/lib/urgency.ts`** — existing urgency/color logic for deadlines; potentially adaptable for response-time color thresholds
- **Settings route placeholder** (`src/client/routes/_authenticated/settings.tsx`) — exists, ready to extend with Analytics section

### Established Patterns
- **Client-side query params for filter state** (Phase 4 D-04) — apply the same pattern to date range filter if URL-shareable; otherwise localStorage
- **Filter chips above content** (Phase 4 D-03) — reuse for date range presets
- **Glass-card layout** (Phase 3 D-11) — calendar cells + analytics cards should use this
- **Optimistic mutations with TanStack Query** (Phase 4 D-14) — not relevant for read-only analytics, but settings threshold updates should use same pattern

### Integration Points
- `src/client/routes/_authenticated/calendar.tsx` — replace placeholder component with month grid + "This Week" list
- `src/client/routes/_authenticated/analytics.tsx` — replace placeholder with full dashboard
- `src/client/routes/_authenticated/settings.tsx` — add Analytics section with threshold editor
- New `src/server/services/analytics.ts` + `src/server/routes/analytics.ts` — aggregate queries (funnel counts from timeline, response-time averages, source breakdown). Aggregates go server-side for SQL efficiency.
- Possible new `user_settings` table OR column set — decide during research. Drizzle migration needed either way.
- `src/client/hooks/useAnalytics.ts` (new) — wraps analytics endpoints

### Missing dependencies (to install in Phase 8)
- `recharts` — chart library (per CLAUDE.md stack)
- `date-fns` — date math for range filters and "This Week" list

</code_context>

<specifics>
## Specific Ideas

- Calendar "This Week" list shows the next 7 days from today, grouped by day, with each event as a row (chip + time + company + role).
- "+N more" overflow on calendar cells should keep the month grid from becoming ragged.
- Analytics page reads clean on mobile — stat cards stack, charts become full-width, response-time table gets horizontal scroll if needed.
- Response-time thresholds in Settings → Analytics should preview the color (small green/amber/red dot) next to each input so the user understands what they're setting.

</specifics>

<deferred>
## Deferred Ideas

### Moved out of Phase 8
- **Google Calendar sync** — was in VIEW-03. User dropped it from Phase 8. Can become its own phase later (Phase 11+ candidate). Would require: OAuth scope expansion (calendar.events), refresh token storage, per-event vs dedicated-calendar decision, conflict resolution, sync trigger choice.

### Not requested, belong elsewhere
- **Analytics export (CSV/PDF)** — potential Phase 9 polish or Phase 11+ feature
- **Saved filter presets / custom date ranges as favorites** — polish item, not Phase 8
- **Per-card date filters** — rejected in favor of global filter (D-16)
- **Week/day calendar views** — rejected in favor of month-only + This Week (D-07)
- **Per-company response time** — rejected in favor of by-stage-transition (D-12)
- **Heatmap / Sankey / advanced charts** — out of scope; Recharts covers the 4 needed charts

### Reviewed Todos (not folded)
None — todo match returned 0 matches for Phase 8.

</deferred>

---

*Phase: 08-calendar-analytics*
*Context gathered: 2026-04-23*
