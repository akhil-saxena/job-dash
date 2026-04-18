---
phase: 06-tags-deadlines-company
plan: 04
subsystem: ui
tags: [react, tanstack-query, company, salary, auto-save, debounce]

requires:
  - phase: 06-02
    provides: "Company API endpoints (findOrCreate, PATCH)"
  - phase: 05-03
    provides: "useDebouncedMutate hook, SaveIndicator component"
provides:
  - "useCompanyForApplication hook for company findOrCreate"
  - "useUpdateCompany hook for company field updates"
  - "CompanyResearchCard component with markdown notes"
  - "SalaryCard component with editable compensation fields"
  - "SALARY_CURRENCIES constant (INR, USD, EUR, GBP)"
affects: [detail-page, company-features]

tech-stack:
  added: []
  patterns: [POST-as-query for idempotent findOrCreate, per-field debounced auto-save]

key-files:
  created:
    - src/client/hooks/useCompany.ts
    - src/client/components/detail/CompanyResearchCard.tsx
    - src/client/components/detail/SalaryCard.tsx
  modified:
    - src/client/components/detail/OverviewTab.tsx
    - src/client/hooks/useApplicationDetail.ts
    - src/shared/constants.ts

key-decisions:
  - "Used useQuery with POST for idempotent findOrCreate instead of useMutation -- safe for re-fetching"
  - "Replaced static Contacts panel with CompanyResearchCard since contacts are out of scope"

patterns-established:
  - "Company findOrCreate via POST-as-query pattern: useQuery wrapping a POST to idempotent endpoint"
  - "Salary inputs stored as strings locally with Number conversion on save for clean UX"

requirements-completed: [COMP-01, COMP-02, COMP-03, SAL-01, SAL-02]

duration: 4min
completed: 2026-04-18
---

# Phase 06 Plan 04: Company Research & Salary UI Summary

**Company research card with shared markdown notes and salary editor with currency dropdown, all auto-saving via debounced mutations**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-18T18:32:47Z
- **Completed:** 2026-04-18T18:36:50Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- useCompanyForApplication hook finds/creates company on mount via idempotent POST
- CompanyResearchCard with markdown notes, auto-save, shared-notes hint for cross-application persistence
- SalaryCard with currency dropdown (INR/USD/EUR/GBP), min/max/offered/equity/bonus fields
- OverviewTab integration: SalaryCard in main column, CompanyResearchCard replaces static Contacts panel in sidebar
- ApplicationDetail interface updated with salaryOffered field

## Task Commits

Each task was committed atomically:

1. **Task 1: Company hook + CompanyResearchCard with markdown notes** - `e34a711` (feat)
2. **Task 2: SalaryCard editor + OverviewTab integration** - `27fdb54` (feat)

## Files Created/Modified
- `src/client/hooks/useCompany.ts` - useCompanyForApplication (findOrCreate) and useUpdateCompany hooks
- `src/client/components/detail/CompanyResearchCard.tsx` - Markdown research notes card with auto-save
- `src/client/components/detail/SalaryCard.tsx` - Editable compensation card with currency dropdown
- `src/client/components/detail/OverviewTab.tsx` - Integrated SalaryCard and CompanyResearchCard, removed Contacts panel
- `src/client/hooks/useApplicationDetail.ts` - Added salaryOffered to ApplicationDetail interface
- `src/shared/constants.ts` - Added SALARY_CURRENCIES constant

## Decisions Made
- Used useQuery wrapping POST for idempotent findOrCreate instead of useMutation -- safe for automatic re-fetching and caching
- Replaced static Contacts panel with CompanyResearchCard since contacts/referral tracker is explicitly out of scope per PROJECT.md

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added missing SALARY_CURRENCIES constant**
- **Found during:** Task 1 (pre-implementation check)
- **Issue:** Plan referenced SALARY_CURRENCIES from constants.ts but it did not exist
- **Fix:** Added `SALARY_CURRENCIES = ["INR", "USD", "EUR", "GBP"] as const` and SalaryCurrency type to shared/constants.ts
- **Files modified:** src/shared/constants.ts
- **Verification:** TypeScript compiles, SalaryCard imports successfully
- **Committed in:** e34a711 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential for SalaryCard to function. No scope creep.

## Issues Encountered
None

## Known Stubs
None -- all data is wired to real API endpoints with auto-save mutations.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Company research and salary UI complete on detail page
- Ready for remaining Phase 06 plans or Phase 07+ work

## Self-Check: PASSED
- All 3 created files verified on disk
- Both task commits (e34a711, 27fdb54) verified in git log
- SUMMARY.md exists at expected path

---
*Phase: 06-tags-deadlines-company*
*Completed: 2026-04-18*
