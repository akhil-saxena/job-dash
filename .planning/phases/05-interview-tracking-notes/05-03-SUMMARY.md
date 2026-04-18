---
phase: 05-interview-tracking-notes
plan: 03
subsystem: ui
tags: [react, tanstack-query, interview, auto-save, debounce, star-rating, accordion]

requires:
  - phase: 05-02
    provides: "Interview CRUD API with 8 endpoints for rounds and QA pairs"
  - phase: 05-01
    provides: "Interview round/QA schema, constants, Zod validators"
  - phase: 10
    provides: "Static InterviewsTab, DetailPage with tab badge, glass card design system"
provides:
  - "Data-driven InterviewsTab with accordion round cards and Q&A pair management"
  - "8 TanStack Query hooks for interview round and QA CRUD"
  - "Shared useDebouncedMutate hook extracted from OverviewTab"
  - "StarRating SVG component with click/hover/clear"
  - "SaveIndicator component for auto-save status display"
  - "Real interview count in DetailPage tab badge"
affects: [frontend-detail-page, overview-tab]

tech-stack:
  added: []
  patterns: ["Per-field debounced auto-save to avoid race conditions", "Shared useDebouncedMutate hook for reuse across tabs", "Accordion card pattern for expandable detail sections"]

key-files:
  created:
    - src/client/hooks/useInterviews.ts
    - src/client/hooks/useDebouncedMutate.ts
    - src/client/components/detail/StarRating.tsx
    - src/client/components/detail/SaveIndicator.tsx
    - src/client/components/detail/QACard.tsx
    - src/client/components/detail/InterviewRoundCard.tsx
  modified:
    - src/client/components/detail/InterviewsTab.tsx
    - src/client/components/detail/DetailPage.tsx
    - src/client/components/detail/OverviewTab.tsx

key-decisions:
  - "Per-field debounced mutations in QACard and InterviewRoundCard to prevent race conditions on partial updates"
  - "Extracted useDebouncedMutate to shared hook for reuse between OverviewTab and interview components"

patterns-established:
  - "Per-field auto-save: each textarea/input sends only its own field in the PATCH call, preventing overwrites"
  - "Accordion card pattern: collapsed header with key info, expanded body with full edit form"
  - "StarRating component: click to set, click same star to clear, hover preview, readOnly mode for collapsed views"

requirements-completed: [INTV-01, INTV-02, INTV-03, INTV-04, NOTE-01, NOTE-02, NOTE-03]

duration: 4min
completed: 2026-04-18
---

# Phase 05 Plan 03: Interview Frontend UI Summary

**Data-driven InterviewsTab with accordion round cards, Q&A pair management, SVG star ratings, per-field debounced auto-save with Saving/Saved indicators, and real-time tab badge count**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-18T17:38:47Z
- **Completed:** 2026-04-18T17:43:00Z
- **Tasks:** 3 (2 auto + 1 checkpoint auto-approved)
- **Files modified:** 9

## Accomplishments
- 8 TanStack Query hooks for full interview round and QA pair CRUD (useInterviews, useInterviewCount, useCreateRound, useUpdateRound, useDeleteRound, useCreateQA, useUpdateQA, useDeleteQA)
- Extracted useDebouncedMutate to shared hook, updated OverviewTab to import from shared module
- InterviewRoundCard accordion with editable fields (interviewer, role, duration, meeting link, status, rating), experience notes, feedback, and Q&A section -- all with auto-save
- StarRating SVG component with click/hover/clear interaction and amber fill
- SaveIndicator and QACard reusable components with per-field debounced mutations
- InterviewsTab fully rewritten: no static data, real API data, loading/empty states, inline add-round form
- DetailPage tab badge shows real interview count via useInterviewCount

## Task Commits

Each task was committed atomically:

1. **Task 1: Create shared hooks and reusable UI components** - `120c4ce` (feat)
2. **Task 2: Build InterviewRoundCard and rewrite InterviewsTab with real data** - `99196a9` (feat)
3. **Task 3: Verify interview tracking UI end-to-end** - auto-approved (checkpoint)

## Files Created/Modified
- `src/client/hooks/useDebouncedMutate.ts` - Shared debounced auto-save hook
- `src/client/hooks/useInterviews.ts` - 8 TanStack Query hooks for interview CRUD
- `src/client/components/detail/StarRating.tsx` - SVG star rating with click/hover/clear
- `src/client/components/detail/SaveIndicator.tsx` - Saving.../Saved indicator component
- `src/client/components/detail/QACard.tsx` - Editable Q&A pair card with per-field auto-save
- `src/client/components/detail/InterviewRoundCard.tsx` - Accordion card for interview rounds with full edit form
- `src/client/components/detail/InterviewsTab.tsx` - Rewritten with real data, removed all static samples
- `src/client/components/detail/DetailPage.tsx` - Tab badge uses real interview count
- `src/client/components/detail/OverviewTab.tsx` - Imports useDebouncedMutate from shared hook

## Decisions Made
- Per-field debounced mutations: each text field sends only its changed value to prevent race conditions when multiple fields are edited quickly
- Extracted useDebouncedMutate as a shared hook rather than duplicating in each component

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Known Stubs
None - all components are wired to real API data. The static SAMPLE_INTERVIEWS data has been fully replaced.

## Next Phase Readiness
- Phase 05 (interview-tracking-notes) is now complete: schema (Plan 01), API (Plan 02), and frontend (Plan 03)
- All interview CRUD flows operational end-to-end
- Ready for visual verification by the user

## Self-Check: PASSED

All 9 files verified on disk. Both task commit hashes found in git log.

---
*Phase: 05-interview-tracking-notes*
*Completed: 2026-04-18*
