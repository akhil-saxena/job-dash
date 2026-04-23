---
phase: 8
slug: calendar-analytics
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-23
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution. Derived from the `## Validation Architecture` section of `08-RESEARCH.md`.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.4 + `@cloudflare/vitest-pool-workers` 0.14.7 (Workers runtime test pool) |
| **Config file** | `vitest.config.ts` (existing) |
| **Quick run command** | `npx vitest run tests/<area>` (area = `calendar`, `analytics`, or `settings`) |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~45 seconds (current suite is ~30s; Phase 8 adds ~7 new test files) |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run tests/<area>` targeting the area touched by the task.
- **After every plan wave:** Run `npm test` (full suite).
- **Before `/gsd:verify-work`:** Full suite must be green AND manual browser smoke completed (calendar click-through, filter change on /analytics, threshold edit on /settings).
- **Max feedback latency:** 15 seconds for targeted runs, 45 seconds for full suite.

---

## Per-Task Verification Map

Task IDs use the pattern `{phase}-{plan}-{task}` as established in prior phases. Exact task IDs will be assigned by the planner — this table lists the tests each planned task must wire to.

| Test File | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|-----------|------|------|-------------|-----------|-------------------|-------------|--------|
| `tests/calendar/events.test.ts` | 08-01 | 0 | VIEW-03 | integration | `npx vitest run tests/calendar/events.test.ts` | ❌ Wave 0 | ⬜ pending |
| `src/client/lib/monthGrid.test.ts` | 08-01 | 1 | VIEW-03 | unit | `npx vitest run src/client/lib/monthGrid.test.ts` | ❌ Wave 1 | ⬜ pending |
| `tests/analytics/funnel.test.ts` | 08-02 | 2 | ANLY-01, ANLY-05 | integration | `npx vitest run tests/analytics/funnel.test.ts` | ❌ Wave 2 | ⬜ pending |
| `tests/analytics/sources.test.ts` | 08-02 | 2 | ANLY-02, ANLY-05 | integration | `npx vitest run tests/analytics/sources.test.ts` | ❌ Wave 2 | ⬜ pending |
| `tests/analytics/response-times.test.ts` | 08-02 | 2 | ANLY-03, ANLY-05 | integration | `npx vitest run tests/analytics/response-times.test.ts` | ❌ Wave 2 | ⬜ pending |
| `tests/analytics/stats.test.ts` | 08-02 | 2 | ANLY-04, ANLY-05 | integration | `npx vitest run tests/analytics/stats.test.ts` | ❌ Wave 2 | ⬜ pending |
| `src/client/lib/responseTimeColor.test.ts` | 08-02 | 1 | ANLY-03 | unit | `npx vitest run src/client/lib/responseTimeColor.test.ts` | ❌ Wave 1 | ⬜ pending |
| `src/client/lib/dateRange.test.ts` | 08-02 | 1 | ANLY-05 | unit | `npx vitest run src/client/lib/dateRange.test.ts` | ❌ Wave 1 | ⬜ pending |
| `tests/settings/analytics-thresholds.test.ts` | 08-02 | 2 | VIEW-05, ANLY-03 | integration | `npx vitest run tests/settings/analytics-thresholds.test.ts` | ❌ Wave 2 | ⬜ pending |
| `src/shared/validators/analytics.test.ts` | 08-02 | 0 | VIEW-05, ANLY-03 | unit | `npx vitest run src/shared/validators/analytics.test.ts` | ❌ Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Files that must be stubbed (skeletons committed and imported) before Wave 1 execution so downstream tasks have test targets to wire to:

- [ ] `tests/calendar/events.test.ts` — stub with `it.todo` entries for each VIEW-03 behavior (range filter, tenant isolation, interview+deadline merge)
- [ ] `src/shared/validators/analytics.test.ts` — stub with `it.todo` entries for `analyticsThresholdsSchema` rejection cases (greenBelow >= amberBelow, negative numbers, non-integer)
- [ ] `src/shared/validators/analytics.ts` — Zod schemas (`analyticsRangeSchema`, `analyticsThresholdsSchema`, `calendarMonthSchema`) and the `ANALYTICS_THRESHOLD_DEFAULTS` constant; required by server tests and client types
- [ ] Shared analytics fixtures in `tests/setup.ts` — seed helpers for `timeline_event` status transitions, interview/deadline dates, and source-effectiveness outcomes (reused across 4 analytics test files)

*Existing infrastructure (Vitest config, `@cloudflare/vitest-pool-workers`, `tests/setup.ts`) covers the runtime. No new framework installs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `/analytics` renders all four panels correctly on desktop + mobile | VIEW-05 | Visual — no dev-tools assertion is meaningful | Load `/analytics`, confirm stat card strip, funnel, source chart, response-time table render with seeded data; toggle dark mode; resize to mobile and confirm stacking |
| Settings → Analytics section persists edits | VIEW-05 | Interactive UX — debounce + optimistic save not straightforward to automate end-to-end | Edit a threshold value, blur, reload — value persists; test invalid input (greenBelow >= amberBelow) — inline error shown |
| Empty month (no events) renders grid + ThisWeekList empty state | VIEW-03 | Visual verification of copy + illustration | Navigate to a month with no scheduled events; confirm calendar grid is fully rendered (42 cells) and ThisWeekList shows "Clear week ahead" empty state |
| Calendar click-through navigates correctly | VIEW-03 | Covers cross-component interaction (route + tab pre-select) — cheaper to eyeball than write Playwright | Click interview chip → verify `/app/:slug` Interviews tab; click deadline chip → verify Overview tab; click "+N more" → verify modal lists events and each row navigates on click |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify OR are listed in the Manual-Only table with explicit justification
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify (both plans satisfy this — 08-01 has 2 automated surfaces, 08-02 has 8 automated surfaces + 2 manual)
- [ ] Wave 0 covers all MISSING references (analytics validators + shared fixtures stubbed before Wave 1)
- [ ] No watch-mode flags (all commands use `vitest run`, not `vitest` or `--watch`)
- [ ] Feedback latency < 15s for targeted runs, < 45s for full suite
- [ ] `nyquist_compliant: true` set in frontmatter once sign-off checks complete

**Approval:** pending
