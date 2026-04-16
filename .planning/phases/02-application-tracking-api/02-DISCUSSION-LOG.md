# Phase 2: Application Tracking API - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-16
**Phase:** 02-application-tracking-api
**Areas discussed:** API response format, Status pipeline enforcement, Timeline event granularity, Slug generation
**Mode:** Auto (all areas auto-selected, recommended defaults chosen)

---

## API Response Format

| Option | Description | Selected |
|--------|-------------|----------|
| Standard envelope `{ data, error, pagination }` | Consistent structure, predictable parsing | ✓ |
| Flat responses (no envelope) | Simpler but inconsistent between list/detail | |
| GraphQL-style errors array | More flexible but overkill for REST | |

**User's choice:** Standard envelope — auto-selected (recommended)
**Notes:** Consistent with typical REST API patterns. Pagination included for list endpoints.

---

## Status Pipeline Enforcement

| Option | Description | Selected |
|--------|-------------|----------|
| Any-to-any transitions | Users can skip stages, revert, move to final states freely | ✓ |
| Strict sequential | Must follow pipeline order, no skipping | |
| Soft enforcement | Warn on unusual transitions but allow | |

**User's choice:** Any-to-any transitions — auto-selected (recommended)
**Notes:** Job searching is messy. Users may skip stages or revert. The original spec doesn't enforce strict ordering.

---

## Timeline Event Granularity

| Option | Description | Selected |
|--------|-------------|----------|
| All state changes auto-logged | Status, archive, pin, create, delete — comprehensive trail | ✓ |
| Status changes only | Minimal — only status transitions | |
| User-triggered + status | Status changes + explicit user notes | |

**User's choice:** All state changes auto-logged — auto-selected (recommended)
**Notes:** Matches TRACK-08. Provides comprehensive audit trail for the timeline view in Phase 4.

---

## Slug Generation

| Option | Description | Selected |
|--------|-------------|----------|
| Auto from company + role with collision suffix | `google-senior-sde`, `google-senior-sde-2` | ✓ |
| nanoid-based slugs | Random, no collision risk, but not human-readable | |
| User-provided slugs | Manual entry, error-prone | |

**User's choice:** Auto from company + role — auto-selected (recommended)
**Notes:** Matches original spec (job-tracker-spec.md §4.4). Unique per user, not globally.

---

## Claude's Discretion

- Route file organization
- Input validation approach
- D1 index strategy
- Drizzle relational queries vs raw SQL
- Pagination implementation

## Deferred Ideas

None — discussion stayed within phase scope
