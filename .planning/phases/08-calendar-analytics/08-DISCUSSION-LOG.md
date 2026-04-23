# Phase 8: Calendar & Analytics - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-23
**Phase:** 08-calendar-analytics
**Areas discussed:** Pipeline funnel model, Calendar interactions & scope, Analytics filter + response-time detail, Source chart / stat cards / thresholds UI / scope slicing

---

## Gray-Area Selection

User was offered 4 areas. Selected 3 (Pipeline funnel, Calendar interactions, Analytics filter + response-time) and explicitly requested to **drop Google Calendar sync from Phase 8 scope** (4th option "Google Calendar sync depth" not selected; user added "Can remove google calendar sync" as a scope change).

**Scope reduction captured:** VIEW-03 amended to remove "with Google Calendar sync" — calendar view remains read-only. Sync moved to deferred.

---

## Pipeline Funnel Model

| Option | Description | Selected |
|--------|-------------|----------|
| Flow from timeline | Count every app that ever reached a stage (derived from `status_change` timeline events). Real drop-off %. | ✓ |
| Snapshot of current status | Count apps currently in each status. Simpler query, no drop-off. | |
| Hybrid | Show both snapshot + ever-reached counts. | |

**User's choice:** Flow from timeline.

| Option | Description | Selected |
|--------|-------------|----------|
| Applied → Screening → Interviewing → Offer | 4-stage funnel, terminal outcomes in stat cards. | ✓ |
| Applied through Accepted, with Rejected/Withdrawn as branches | Full pipeline including terminal outcomes in funnel. | |
| Wishlist → Applied → Screening → Interviewing → Offer | Includes wishlist as top of funnel. | |

**User's choice:** Applied → Screening → Interviewing → Offer (after clarifying the difference between "screening" = recruiter call and "interviewing" = formal loop).

**Notes:** User asked for clarification on "screening" vs "interviewing" before deciding. Given the clarification (screening = phone screen / recruiter, interviewing = hiring-team loop, with existing `round_type` enum distinguishing them), user opted to keep them distinct.

| Option | Description | Selected |
|--------|-------------|----------|
| Count + conversion % from previous stage | "Screening: 18 (43% of Applied)". Standard funnel UX. | ✓ |
| Count only | Raw numbers, user computes drop-off mentally. | |
| Count + % of total top-of-funnel | Everything anchored to 'Applied'. | |

**User's choice:** Count + conversion % from previous stage.

---

## Calendar Interactions & Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Both — interviews + deadlines with distinct chip colors | Blue for interviews, amber/red for deadlines. | ✓ |
| Interviews only | Simpler. Deadlines stay in detail page only. | |
| Both with user-toggleable layers | Checkboxes to filter layer visibility. | |

**User's choice:** Both with distinct chip colors.

| Option | Description | Selected |
|--------|-------------|----------|
| Navigate to app detail, scroll to relevant tab | Click interview → app/Interviews; click deadline → app/Overview. | ✓ |
| Hover popover with details, click to navigate | Preview on hover, works less well on touch. | |
| Inline expand in calendar | Side panel, keeps calendar context. | |

**User's choice:** Navigate to app detail with relevant tab.

| Option | Description | Selected |
|--------|-------------|----------|
| Month only + 'This Week' list below | Matches roadmap spec. | ✓ |
| Month + Week toggle | More views, more surface area. | |
| Month + Week + Day view | Full calendar app UX, overkill. | |

**User's choice:** Month only + 'This Week' list.

| Option | Description | Selected |
|--------|-------------|----------|
| Stack up to 3, '+N more' overflow | Google Calendar style. | ✓ |
| Dots only on month grid, details in 'This Week' | Ultra-minimal. | |
| Show all stacked no limit | Risk of ragged cells. | |

**User's choice:** Stack up to 3 with '+N more' overflow.

---

## Analytics Filter + Response Time

| Option | Description | Selected |
|--------|-------------|----------|
| Preset chips only (30d / 90d / YTD / All) | Fast, 90% case. | |
| Presets + 'Custom' chip with date picker | Covers edge cases. | ✓ |
| Custom picker only | Most flexible, most clicks. | |

**User's choice:** Presets + Custom picker.

| Option | Description | Selected |
|--------|-------------|----------|
| Global — one filter for all metrics | Single chip row at top. | ✓ |
| Per-card filters | Max control, noisy UI. | |

**User's choice:** Global.

| Option | Description | Selected |
|--------|-------------|----------|
| By stage transition | applied→screening, etc. Reuses timeline aggregation. | ✓ |
| By company | Rich but sparse. | |
| Both (toggle) | More value, more complexity. | |

**User's choice:** By stage transition.

| Option | Description | Selected |
|--------|-------------|----------|
| Hard-coded sensible defaults | Zero settings UI. | |
| Per-transition hard-coded | Different defaults per stage, still no UI. | |
| User-configurable in settings | Max flexibility, adds settings UI. | ✓ |

**User's choice:** User-configurable in settings.

**Notes:** Adds scope — Phase 8 now includes a Settings-page Analytics section with threshold editors.

---

## Source Chart / Stat Cards / Thresholds UI / Slicing

| Option | Description | Selected |
|--------|-------------|----------|
| Horizontal bars: response rate per source | Response rate = moved past applied ÷ total per source. | |
| Stacked bars: per source, stacked by final outcome | Segments for offer / interviewing / rejected / ghosted. | ✓ |
| Two charts: volume + response rate | More complete, more real estate. | |

**User's choice:** Stacked bars by final outcome. "Ghosted" definition added to Claude's Discretion (no status change + no interviews for 30d).

| Option | Description | Selected |
|--------|-------------|----------|
| Total apps / Response rate / Avg response time / Interview conversion | Roadmap's original list. | |
| Total apps / Currently active / Offers received / Rejection rate | Outcome-focused. | ✓ |
| Let me describe my own | Free text. | |

**User's choice:** Total apps / Currently active / Offers received / Rejection rate.

| Option | Description | Selected |
|--------|-------------|----------|
| Settings page — new 'Analytics' section | One-time configuration location. | ✓ |
| Modal from Analytics page (gear icon) | Closer to data. | |
| Both | Redundant. | |

**User's choice:** Settings page Analytics section.

| Option | Description | Selected |
|--------|-------------|----------|
| 2 plans: calendar (08-01), analytics + settings (08-02) | Cohesive atomic units. | ✓ |
| 3 plans: calendar, analytics charts, settings wire-up | Smaller but creates stub-and-wire churn. | |
| 4 plans: calendar / data layer / UI / settings | Very granular, more ceremony. | |

**User's choice:** 2 plans.

---

## Derived Definitions (confirmed as Claude's Discretion)

| Metric | Definition |
|--------|------------|
| Ghosted | Applied + no status change + no interview scheduled for 30 days |
| Currently Active | Status ∈ {applied, screening, interviewing, offer} |
| Rejection Rate | rejected ÷ (accepted + rejected + withdrawn) |
| Response (source chart) | Any status change past 'applied' OR any interview scheduled |

User confirmed "All four are fine — write context."

---

## Deferred Ideas

- **Google Calendar sync** — explicitly dropped by user from Phase 8 scope. Candidate for a standalone future phase (Phase 11+).
- Analytics CSV/PDF export
- Saved filter presets
- Per-card filters
- Week/day calendar views
- Per-company response time
- Advanced charts (Sankey, heatmaps)
