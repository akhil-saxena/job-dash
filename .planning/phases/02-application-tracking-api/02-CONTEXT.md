# Phase 2: Application Tracking API - Context

**Gathered:** 2026-04-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Complete REST API for job applications — CRUD with all fields, status pipeline (Wishlist through Withdrawn), automatic timeline event generation on state changes, pin/star, archive, and soft-delete. This is API-only — no frontend views (Phase 3-4 handle UI).

</domain>

<decisions>
## Implementation Decisions

### API Response Format
- **D-01:** Standard JSON envelope: `{ data: T, error?: { code: string, message: string }, pagination?: { page, limit, total, totalPages } }`
- **D-02:** List endpoints support query params: `?status=applied&priority=high&source=linkedin&search=google&sort=created_at&order=desc&page=1&limit=20`
- **D-03:** Error responses use HTTP status codes: 400 (validation), 401 (unauth), 403 (forbidden), 404 (not found), 409 (conflict), 422 (unprocessable), 429 (rate limit), 500 (server)
- **D-04:** All mutations return the updated/created resource in the `data` field

### Status Pipeline
- **D-05:** Status values: `wishlist`, `applied`, `screening`, `interviewing`, `offer`, `accepted`, `rejected`, `withdrawn`
- **D-06:** Any-to-any status transitions allowed — no strict ordering enforcement. Users may skip stages, revert, or move directly to final states.
- **D-07:** Status changes via `PATCH /api/applications/:id` (updating the `status` field) or dedicated `PATCH /api/applications/:id/status` endpoint
- **D-08:** Every status change auto-generates a timeline event with `{ from_status, to_status, timestamp }`

### Timeline Events
- **D-09:** Events auto-generated for: application created, status changed, archived/unarchived, pinned/unpinned, soft-deleted/restored
- **D-10:** Event schema: `{ id, application_id, user_id, event_type, description, metadata (JSON), occurred_at }`
- **D-11:** Event types: `status_change`, `created`, `archived`, `unarchived`, `pinned`, `unpinned`, `deleted`, `restored`
- **D-12:** Metadata stores structured context: e.g., `{ from: "applied", to: "interviewing" }` for status changes

### Application Schema
- **D-13:** Follows original spec schema: company name, role title, job posting URL, location type (remote/hybrid/onsite), location city, salary min/max/offered/currency/equity/bonus, status, priority (high/medium/low), source, is_pinned, is_archived, notes (markdown), slug, applied_at, created_at, updated_at, deleted_at (soft delete)
- **D-14:** Slug auto-generated from company + role: `"google-senior-sde"`. Collision handled with incrementing suffix: `"google-senior-sde-2"`
- **D-15:** Slug is unique per user (not globally): `UNIQUE(user_id, slug)`

### Tenant Isolation
- **D-16:** Carried from Phase 1 (D-12): Every query includes `WHERE user_id = ?`. Auth middleware injects userId from session. No endpoint returns data from other users.

### Soft Delete & Archive
- **D-17:** Soft delete sets `deleted_at` timestamp. Default queries exclude `WHERE deleted_at IS NULL`. Restore clears `deleted_at`.
- **D-18:** Archive sets `is_archived = 1`. Archived apps excluded from default queries but searchable with `?archived=true`.
- **D-19:** Archive and soft-delete are independent: an app can be archived AND soft-deleted.

### Claude's Discretion
- Exact Hono route file organization (single file vs split by concern)
- Input validation library choice (Zod schemas or manual)
- Index strategy on D1 tables beyond what the original spec defines
- Whether to use Drizzle's relational queries or raw SQL for complex joins
- Pagination implementation details (offset vs cursor)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Original Spec
- `job-tracker-spec.md` §4.2 — Applications table schema, indexes, slug generation
- `job-tracker-spec.md` §6 — API routes for applications (GET/POST/PATCH/DELETE patterns)
- `job-tracker-spec.md` §8.1 — Tenant isolation patterns (forUser helper)

### Research
- `.planning/research/STACK.md` — Hono + Drizzle patterns, D1 constraints (50 queries/invocation)
- `.planning/research/ARCHITECTURE.md` — API layer structure, D1 query batching
- `.planning/research/PITFALLS.md` — D1 50-query limit, SQLite ALTER TABLE limitations

### Phase 1 Foundation
- `src/db/schema/auth.ts` — Existing Drizzle schema patterns (nanoid PKs, integer timestamps, cascade deletes)
- `src/shared/types.ts` — CloudflareBindings and AppEnv types
- `src/server/lib/db.ts` — Database factory (createDb)
- `src/server/middleware/auth.ts` — requireAuth middleware (sets userId in context)
- `worker/index.ts` — Route mounting pattern, middleware ordering

### Project Context
- `.planning/PROJECT.md` — Core value, constraints
- `.planning/REQUIREMENTS.md` — TRACK-01 through TRACK-08

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `createDb(d1)` — Database factory in `src/server/lib/db.ts`, returns typed Drizzle instance
- `requireAuth` middleware — Sets `c.get("userId")` for tenant isolation
- Schema patterns — `nanoid()` PKs, `integer("created_at", { mode: "timestamp" }).default(sql\`(unixepoch())\`)`, cascade deletes
- `AppEnv` type — Hono environment with Bindings + Variables

### Established Patterns
- Hono route modules exported and mounted via `app.route("/", module)` in worker/index.ts
- Auth middleware applied to `/api/*` after specific route handlers
- Schema defined in `src/db/schema/` with barrel export in `index.ts`

### Integration Points
- New application routes mount in `worker/index.ts` (before the `requireAuth` catch-all)
- New schema tables added to `src/db/schema/` and re-exported from `index.ts`
- New migration generated via `npx drizzle-kit generate`
- Timeline events table references applications table via foreign key

</code_context>

<specifics>
## Specific Ideas

- API should follow the same patterns as the auth routes — Hono route modules, same error format
- The applications table is the core of the entire product — get the schema right since SQLite ALTER TABLE is limited (from PITFALLS.md)
- Include all fields from the original spec (job-tracker-spec.md §4.2) from day one, even if some aren't used in the UI until later phases

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-application-tracking-api*
*Context gathered: 2026-04-16*
