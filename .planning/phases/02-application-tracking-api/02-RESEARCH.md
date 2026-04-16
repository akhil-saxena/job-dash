# Phase 2: Application Tracking API - Research

**Researched:** 2026-04-16
**Domain:** REST API for CRUD operations on job applications, status pipeline, timeline events, soft-delete, archive, pin -- built with Hono + Drizzle ORM on Cloudflare D1
**Confidence:** HIGH

## Summary

Phase 2 builds the core data model and REST API for job applications and timeline events. The existing Phase 1 foundation provides Hono route modules, Drizzle ORM schema patterns (nanoid PKs, integer timestamps with `unixepoch()` defaults, cascade deletes), `requireAuth` middleware injecting `userId` into context, and `createDb(d1)` factory. This phase adds two new database tables (`application` and `timeline_event`), a Zod validation layer, a service layer for business logic (status changes generating timeline events atomically via `db.batch()`), and a complete set of REST endpoints following the response envelope pattern defined in CONTEXT.md decisions.

The critical technical constraints are: D1 does not support interactive transactions (must use `db.batch()` for atomic multi-statement operations), SQLite ALTER TABLE is extremely limited (schema must be right the first time), and the project currently uses Zod v3 (not v4) with `@hono/zod-validator` v0.5. All query patterns must enforce tenant isolation via `WHERE user_id = ?` on every query.

**Primary recommendation:** Define both tables and all indexes in a single migration, build a thin route -> service -> DB architecture with Zod validation at the route layer, and use `db.batch()` for any operation that writes to multiple tables (e.g., status change + timeline event).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Standard JSON envelope: `{ data: T, error?: { code: string, message: string }, pagination?: { page, limit, total, totalPages } }`
- **D-02:** List endpoints support query params: `?status=applied&priority=high&source=linkedin&search=google&sort=created_at&order=desc&page=1&limit=20`
- **D-03:** Error responses use HTTP status codes: 400 (validation), 401 (unauth), 403 (forbidden), 404 (not found), 409 (conflict), 422 (unprocessable), 429 (rate limit), 500 (server)
- **D-04:** All mutations return the updated/created resource in the `data` field
- **D-05:** Status values: `wishlist`, `applied`, `screening`, `interviewing`, `offer`, `accepted`, `rejected`, `withdrawn`
- **D-06:** Any-to-any status transitions allowed -- no strict ordering enforcement. Users may skip stages, revert, or move directly to final states.
- **D-07:** Status changes via `PATCH /api/applications/:id` (updating the `status` field) or dedicated `PATCH /api/applications/:id/status` endpoint
- **D-08:** Every status change auto-generates a timeline event with `{ from_status, to_status, timestamp }`
- **D-09:** Events auto-generated for: application created, status changed, archived/unarchived, pinned/unpinned, soft-deleted/restored
- **D-10:** Event schema: `{ id, application_id, user_id, event_type, description, metadata (JSON), occurred_at }`
- **D-11:** Event types: `status_change`, `created`, `archived`, `unarchived`, `pinned`, `unpinned`, `deleted`, `restored`
- **D-12:** Metadata stores structured context: e.g., `{ from: "applied", to: "interviewing" }` for status changes
- **D-13:** Follows original spec schema: company name, role title, job posting URL, location type (remote/hybrid/onsite), location city, salary min/max/offered/currency/equity/bonus, status, priority (high/medium/low), source, is_pinned, is_archived, notes (markdown), slug, applied_at, created_at, updated_at, deleted_at (soft delete)
- **D-14:** Slug auto-generated from company + role: `"google-senior-sde"`. Collision handled with incrementing suffix: `"google-senior-sde-2"`
- **D-15:** Slug is unique per user (not globally): `UNIQUE(user_id, slug)`
- **D-16:** Carried from Phase 1 (D-12): Every query includes `WHERE user_id = ?`. Auth middleware injects userId from session. No endpoint returns data from other users.
- **D-17:** Soft delete sets `deleted_at` timestamp. Default queries exclude `WHERE deleted_at IS NULL`. Restore clears `deleted_at`.
- **D-18:** Archive sets `is_archived = 1`. Archived apps excluded from default queries but searchable with `?archived=true`.
- **D-19:** Archive and soft-delete are independent: an app can be archived AND soft-deleted.

### Claude's Discretion
- Exact Hono route file organization (single file vs split by concern)
- Input validation library choice (Zod schemas or manual)
- Index strategy on D1 tables beyond what the original spec defines
- Whether to use Drizzle's relational queries or raw SQL for complex joins
- Pagination implementation details (offset vs cursor)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TRACK-01 | User can create a job application with company, role, status, priority, location type, location city, salary min/max, currency, source, job posting URL, applied date, and markdown notes | Application schema (D-13), Zod create schema, POST endpoint, slug generation (D-14/D-15), auto-generate "created" timeline event (D-09) |
| TRACK-02 | User can edit any application field inline from the detail panel | PATCH endpoint with partial update Zod schema, return updated resource (D-04), auto-generate timeline events for status/pin/archive changes (D-09) |
| TRACK-03 | User can soft-delete applications (recoverable) | DELETE endpoint sets deleted_at (D-17), restore via PATCH, auto-generate "deleted"/"restored" timeline events (D-09/D-11) |
| TRACK-04 | User can archive applications to declutter the active pipeline | Archive toggle endpoint sets is_archived (D-18), independent of soft-delete (D-19), auto-generate "archived"/"unarchived" events (D-09/D-11) |
| TRACK-05 | User can pin/star high-priority applications | Pin toggle endpoint sets is_pinned, auto-generate "pinned"/"unpinned" events (D-09/D-11) |
| TRACK-06 | Application status follows the pipeline: Wishlist, Applied, Screening, Interviewing, Offer, Accepted, Rejected, Withdrawn | Status enum validation via Zod (D-05), any-to-any transitions allowed (D-06) |
| TRACK-07 | User can change application status via drag-and-drop on kanban or from the detail panel | Dedicated PATCH /api/applications/:id/status endpoint (D-07), plus status changes via general PATCH (D-07) -- this phase is API-only; drag-and-drop UI is Phase 4 |
| TRACK-08 | Status changes auto-generate timeline events with timestamp and description | db.batch() for atomic status update + timeline event insert (D-08), metadata stores from/to status (D-12), timeline_event table with event_type, description, metadata JSON, occurred_at |
</phase_requirements>

## Standard Stack

### Core (already installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Hono | ^4.12.14 | API framework | Already in use for auth routes. Route module pattern established. |
| Drizzle ORM | ^0.45.2 | Database ORM for D1 | Already in use for auth schema. Schema-as-code, `db.batch()` for D1 transactions. |
| @hono/zod-validator | ^0.5.0 | Request validation middleware | Already installed. Validates request body/query/params against Zod schemas. |
| Zod | ^3.24.0 | Schema validation | Already installed (v3, not v4). Shared validation schemas for API input. |
| nanoid | ^5.1.9 | ID generation | Already in use for auth table PKs. 21-char URL-safe IDs. |

### Supporting (no new installs needed)

This phase requires zero new dependencies. All necessary libraries are already installed.

### Discretion Recommendations

| Area | Recommendation | Rationale |
|------|---------------|-----------|
| Route organization | Single file `src/server/routes/applications.ts` | Phase 2 has ~10 endpoints for a single resource. One file keeps related routes together. Split only when file exceeds ~300 lines. |
| Validation | Zod schemas in `src/shared/validators/application.ts` | Already installed, pairs with `@hono/zod-validator` for server-side validation. Same schemas reusable by frontend in later phases. |
| Index strategy | Add indexes beyond spec for `user_id + is_archived`, `user_id + is_pinned`, and `user_id + source` | D1 has limited query optimization; indexes on filter columns prevent full table scans at 100+ rows. |
| Query style | Drizzle query builder (`.select().from().where()`) for CRUD; avoid relational queries for now | Relational queries (`.query.application.findMany()`) add implicit JOINs that may hit D1 query budget. Explicit queries are more predictable. |
| Pagination | Offset-based (`LIMIT/OFFSET`) | Simpler to implement, sufficient for personal tracker scale (unlikely to exceed 1000 applications per user). Cursor-based is overkill here. |

## Architecture Patterns

### Recommended Project Structure (new files for this phase)

```
src/
  db/
    schema/
      auth.ts                    # Existing (unchanged)
      application.ts             # NEW: application + timeline_event tables
      index.ts                   # UPDATE: re-export application schema
    migrations/
      0001_*.sql                 # NEW: generated migration for application tables
  server/
    routes/
      auth.ts                    # Existing (unchanged)
      applications.ts            # NEW: all application CRUD routes
    services/
      application.ts             # NEW: business logic (CRUD, slug gen, timeline events)
    lib/
      db.ts                      # Existing (unchanged)
      response.ts                # NEW: response envelope helpers
  shared/
    types.ts                     # UPDATE: add application-related types
    validators/
      application.ts             # NEW: Zod schemas for create/update/query/status
    constants.ts                 # NEW: status enum, priority enum, event types
worker/
  index.ts                       # UPDATE: mount applicationRoutes
tests/
  applications/
    crud.test.ts                 # NEW: create, read, update, list tests
    status.test.ts               # NEW: status change + timeline event tests
    softdelete.test.ts           # NEW: soft delete + restore tests
    archive-pin.test.ts          # NEW: archive + pin toggle tests
  setup.ts                       # UPDATE: add application + timeline_event migration SQL
```

### Pattern 1: Thin Route -> Service -> DB

**What:** Route handlers parse HTTP input and format HTTP output. Services contain all business logic and database operations. Routes never import Drizzle directly.

**When to use:** Every endpoint in this phase.

**Example:**
```typescript
// src/server/routes/applications.ts
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { AppEnv } from "@/shared/types";
import { createApplicationSchema } from "@/shared/validators/application";
import { createDb } from "@/server/lib/db";
import * as applicationService from "@/server/services/application";
import { success, error } from "@/server/lib/response";

const app = new Hono<AppEnv>();

app.post(
  "/api/applications",
  zValidator("json", createApplicationSchema),
  async (c) => {
    const userId = c.get("userId");
    const db = createDb(c.env.DB);
    const input = c.req.valid("json");
    const result = await applicationService.create(db, userId, input);
    return c.json(success(result), 201);
  }
);

export { app as applicationRoutes };
```

### Pattern 2: Atomic Writes with db.batch()

**What:** D1 does not support interactive transactions (`BEGIN`/`COMMIT`). Use `db.batch()` to send multiple statements as a single atomic batch. If any statement fails, the entire batch rolls back.

**When to use:** Any operation that writes to multiple tables -- status change + timeline event, create application + "created" event, soft-delete + "deleted" event.

**Example:**
```typescript
// src/server/services/application.ts
import { eq, and, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";
import { application, timelineEvent } from "@/db/schema";
import type { Database } from "@/server/lib/db";

export async function changeStatus(
  db: Database,
  userId: string,
  appId: string,
  newStatus: string
) {
  // First: read current state (separate query)
  const app = await db
    .select()
    .from(application)
    .where(
      and(
        eq(application.id, appId),
        eq(application.userId, userId),
        isNull(application.deletedAt)
      )
    )
    .get();

  if (!app) throw new NotFoundError("Application not found");
  if (app.status === newStatus) return app; // no-op

  const now = new Date();
  // Atomic: update status + insert timeline event
  const [updated] = await db.batch([
    db
      .update(application)
      .set({ status: newStatus, updatedAt: now })
      .where(eq(application.id, appId))
      .returning(),
    db.insert(timelineEvent).values({
      id: nanoid(),
      applicationId: appId,
      userId,
      eventType: "status_change",
      description: `Status changed from ${app.status} to ${newStatus}`,
      metadata: JSON.stringify({ from: app.status, to: newStatus }),
      occurredAt: now,
    }),
  ]);

  return updated[0];
}
```

### Pattern 3: Response Envelope Helpers

**What:** Consistent response format per D-01/D-03/D-04.

**Example:**
```typescript
// src/server/lib/response.ts
export function success<T>(data: T) {
  return { data };
}

export function paginated<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
) {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export function apiError(code: string, message: string) {
  return { data: null, error: { code, message } };
}
```

### Pattern 4: Slug Generation with Collision Handling

**What:** Auto-generate URL-friendly slugs from company + role, per D-14/D-15.

**Example:**
```typescript
// src/shared/slug.ts
export function generateBaseSlug(company: string, role: string): string {
  return `${company}-${role}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// src/server/services/application.ts
async function resolveUniqueSlug(
  db: Database,
  userId: string,
  baseSlug: string
): Promise<string> {
  // Check for existing slugs matching the pattern
  const existing = await db
    .select({ slug: application.slug })
    .from(application)
    .where(
      and(
        eq(application.userId, userId),
        like(application.slug, `${baseSlug}%`)
      )
    )
    .all();

  const slugSet = new Set(existing.map((r) => r.slug));
  if (!slugSet.has(baseSlug)) return baseSlug;

  let counter = 2;
  while (slugSet.has(`${baseSlug}-${counter}`)) counter++;
  return `${baseSlug}-${counter}`;
}
```

### Pattern 5: Filter Query Builder

**What:** Build dynamic WHERE clauses from query params (D-02).

**Example:**
```typescript
// src/server/services/application.ts
import { eq, and, isNull, like, desc, asc, sql } from "drizzle-orm";

function buildFilters(userId: string, params: ListParams) {
  const conditions = [
    eq(application.userId, userId),
    isNull(application.deletedAt),
  ];

  if (!params.archived) {
    conditions.push(eq(application.isArchived, false));
  }
  if (params.status) {
    conditions.push(eq(application.status, params.status));
  }
  if (params.priority) {
    conditions.push(eq(application.priority, params.priority));
  }
  if (params.source) {
    conditions.push(eq(application.source, params.source));
  }
  if (params.search) {
    // Search across company name and role title
    conditions.push(
      sql`(${application.companyName} LIKE ${'%' + params.search + '%'}
        OR ${application.roleTitle} LIKE ${'%' + params.search + '%'})`
    );
  }

  return and(...conditions);
}
```

### Anti-Patterns to Avoid

- **Fat route handlers:** Never put database queries directly in route handlers. Always delegate to service functions. Routes should be 5-15 lines maximum.
- **Forgetting userId in WHERE clauses:** Every single query must include `eq(application.userId, userId)`. Never trust client-supplied IDs alone -- always verify ownership.
- **Using interactive transactions with D1:** `db.transaction()` will fail on D1. Always use `db.batch()`.
- **Returning Drizzle Date objects directly:** Drizzle's `mode: "timestamp"` returns Date objects. The JSON serializer handles them, but be consistent -- the response will contain ISO strings.
- **Skipping timeline events on mutations:** Every state-changing operation (create, status change, archive, pin, delete, restore) must generate a timeline event. Use `db.batch()` to ensure atomicity.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Request validation | Custom if/else validation in route handlers | `@hono/zod-validator` with Zod schemas | Type inference, consistent error format, reusable schemas across client/server |
| Slug generation | Random IDs for URLs | Deterministic slug from company+role | SEO-friendly, human-readable, debuggable -- per D-14 |
| Response formatting | Ad-hoc JSON structures per endpoint | Shared envelope helpers (`success()`, `paginated()`, `apiError()`) | Per D-01 consistency requirement |
| Multi-table atomic writes | Sequential `await` calls (no atomicity) | `db.batch()` | D1 has no interactive transactions; batch is the only way to get rollback-on-failure |
| Query filtering | String concatenation for SQL WHERE | Drizzle's `and()`, `eq()`, `isNull()` composable conditions | SQL injection protection, type safety, readable code |

## Common Pitfalls

### Pitfall 1: D1 batch() Return Type Confusion

**What goes wrong:** `db.batch()` returns a tuple where each element corresponds to the result of the query at that index. Developers try to destructure it incorrectly or expect a single merged result.
**Why it happens:** The return type is `[ResultType1, ResultType2, ...]` -- a TypeScript tuple, not an array of a single type.
**How to avoid:** Always destructure with named variables matching position: `const [updatedRows, _insertResult] = await db.batch([updateQuery, insertQuery])`. The insert result for D1 is a `D1Result` object with `meta.changes` count, not the inserted row (unless you use `.returning()`).
**Warning signs:** TypeScript errors about tuple index access, or undefined results when accessing the wrong position.

### Pitfall 2: Slug Collision Race Condition

**What goes wrong:** Two concurrent requests for the same company+role both check for existing slugs, both see none, both insert with the same slug, and the second one fails with a UNIQUE constraint violation.
**Why it happens:** The slug check and insert are not atomic. D1's auto-commit means the first insert commits before the second one checks.
**How to avoid:** The UNIQUE(user_id, slug) constraint on the table catches this at the database level. Handle the constraint violation error gracefully -- catch the D1 error, append an incremented suffix, and retry the insert. This is rare for a personal tracker (one user creating apps sequentially).
**Warning signs:** 500 errors on application creation with "UNIQUE constraint failed" in the D1 error message.

### Pitfall 3: Soft-Delete Leaking into Queries

**What goes wrong:** A new endpoint or query forgets to include `WHERE deleted_at IS NULL`, causing soft-deleted applications to appear in list results, counts, or search.
**Why it happens:** Every query must explicitly exclude soft-deleted records. There's no automatic mechanism in Drizzle to enforce this.
**How to avoid:** Create a `baseConditions(userId)` helper that returns `[eq(application.userId, userId), isNull(application.deletedAt)]` and use it in every query. Only the "list deleted" and "restore" endpoints should omit the `isNull(deletedAt)` condition.
**Warning signs:** Deleted applications appearing in the kanban board or search results.

### Pitfall 4: Missing Timeline Events on Edge Cases

**What goes wrong:** Archive/unarchive, pin/unpin, or restore operations don't generate timeline events because the developer only wired up timeline events for status changes and forgot about D-09.
**Why it happens:** D-09 explicitly requires events for seven categories: created, status_changed, archived, unarchived, pinned, unpinned, deleted, restored. It's easy to wire up the obvious ones (create, status change) and forget the rest.
**How to avoid:** Create a `createTimelineEvent(db, params)` helper in the service layer and call it from every mutation function. Use `db.batch()` to bundle the mutation + event insert. A code review checklist should verify every write endpoint generates the appropriate event.
**Warning signs:** Timeline view for an application missing archive/pin/delete history.

### Pitfall 5: Zod v3 vs v4 API Differences

**What goes wrong:** Developer copies code examples from Zod v4 docs (e.g., `z.string().email()` works in both, but `z.number().int().min(0)` chaining may differ, and v4's `z.coerce` behavior changed).
**Why it happens:** The project uses Zod `^3.24.0`, but many online examples and docs now default to Zod v4 syntax.
**How to avoid:** Always check the Zod v3 API. The `@hono/zod-validator` v0.5 is compatible with Zod v3. Stick to established Zod v3 patterns. If upgrading to v4, do it as a separate task.
**Warning signs:** TypeScript errors from Zod imports, runtime validation not behaving as expected.

### Pitfall 6: Offset Pagination Performance at Scale

**What goes wrong:** `OFFSET 1000 LIMIT 20` still scans 1020 rows in SQLite before returning 20. With 500+ applications, deep pagination becomes slow.
**Why it happens:** SQLite doesn't have a magic way to skip rows -- OFFSET requires scanning.
**How to avoid:** For a personal tracker, this is unlikely to be a real problem (most users have <200 applications). But set a reasonable max limit (100 per page) and default to 20. If performance becomes an issue later, switch to cursor-based pagination (`WHERE created_at < ?` + `LIMIT`).
**Warning signs:** API response times increasing linearly with page number.

## Code Examples

### Application Table Schema (Drizzle)

```typescript
// src/db/schema/application.ts
import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { user } from "./auth";

export const application = sqliteTable(
  "application",
  {
    id: text("id").primaryKey().$defaultFn(() => nanoid()),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    companyName: text("company_name").notNull(),
    roleTitle: text("role_title").notNull(),
    jobPostingUrl: text("job_posting_url"),
    locationType: text("location_type"), // 'remote' | 'hybrid' | 'onsite'
    locationCity: text("location_city"),
    salaryMin: integer("salary_min"),
    salaryMax: integer("salary_max"),
    salaryOffered: integer("salary_offered"),
    salaryCurrency: text("salary_currency").default("INR"),
    equity: text("equity"),
    bonus: text("bonus"),
    status: text("status").notNull().default("wishlist"),
    priority: text("priority").default("medium"), // 'high' | 'medium' | 'low'
    source: text("source"),
    isPinned: integer("is_pinned", { mode: "boolean" }).notNull().default(false),
    isArchived: integer("is_archived", { mode: "boolean" }).notNull().default(false),
    notes: text("notes"),
    slug: text("slug").notNull(),
    appliedAt: integer("applied_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
  },
  (t) => [
    uniqueIndex("idx_application_user_slug").on(t.userId, t.slug),
    index("idx_application_user_status").on(t.userId, t.status).where(sql`deleted_at IS NULL`),
    index("idx_application_user_pinned").on(t.userId, t.isPinned).where(sql`deleted_at IS NULL`),
    index("idx_application_user_archived").on(t.userId, t.isArchived).where(sql`deleted_at IS NULL`),
    index("idx_application_user_created").on(t.userId, t.createdAt).where(sql`deleted_at IS NULL`),
  ]
);
```

### Timeline Event Table Schema (Drizzle)

```typescript
// Also in src/db/schema/application.ts
export const timelineEvent = sqliteTable(
  "timeline_event",
  {
    id: text("id").primaryKey().$defaultFn(() => nanoid()),
    applicationId: text("application_id").notNull().references(() => application.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    eventType: text("event_type").notNull(), // D-11 enum values
    description: text("description").notNull(),
    metadata: text("metadata"), // JSON string
    occurredAt: integer("occurred_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  },
  (t) => [
    index("idx_timeline_event_app").on(t.applicationId, t.occurredAt),
  ]
);
```

### Zod Validation Schemas

```typescript
// src/shared/validators/application.ts
import { z } from "zod";
import { APPLICATION_STATUSES, PRIORITIES, LOCATION_TYPES } from "@/shared/constants";

export const createApplicationSchema = z.object({
  companyName: z.string().min(1).max(200),
  roleTitle: z.string().min(1).max(200),
  jobPostingUrl: z.string().url().optional().or(z.literal("")),
  locationType: z.enum(LOCATION_TYPES).optional(),
  locationCity: z.string().max(100).optional(),
  salaryMin: z.number().int().min(0).optional(),
  salaryMax: z.number().int().min(0).optional(),
  salaryOffered: z.number().int().min(0).optional(),
  salaryCurrency: z.string().max(3).optional(),
  equity: z.string().max(100).optional(),
  bonus: z.string().max(100).optional(),
  status: z.enum(APPLICATION_STATUSES).optional(),
  priority: z.enum(PRIORITIES).optional(),
  source: z.string().max(50).optional(),
  notes: z.string().optional(),
  appliedAt: z.string().datetime().optional(), // ISO string, convert to Date in service
});

export const updateApplicationSchema = createApplicationSchema.partial();

export const statusChangeSchema = z.object({
  status: z.enum(APPLICATION_STATUSES),
});

export const listApplicationsSchema = z.object({
  status: z.enum(APPLICATION_STATUSES).optional(),
  priority: z.enum(PRIORITIES).optional(),
  source: z.string().optional(),
  search: z.string().optional(),
  archived: z.coerce.boolean().optional(),
  sort: z.enum(["created_at", "updated_at", "applied_at", "company_name"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});
```

### Shared Constants

```typescript
// src/shared/constants.ts
export const APPLICATION_STATUSES = [
  "wishlist", "applied", "screening", "interviewing",
  "offer", "accepted", "rejected", "withdrawn",
] as const;
export type ApplicationStatus = typeof APPLICATION_STATUSES[number];

export const PRIORITIES = ["high", "medium", "low"] as const;
export type Priority = typeof PRIORITIES[number];

export const LOCATION_TYPES = ["remote", "hybrid", "onsite"] as const;
export type LocationType = typeof LOCATION_TYPES[number];

export const TIMELINE_EVENT_TYPES = [
  "created", "status_change", "archived", "unarchived",
  "pinned", "unpinned", "deleted", "restored",
] as const;
export type TimelineEventType = typeof TIMELINE_EVENT_TYPES[number];
```

### Route Module Mounting

```typescript
// worker/index.ts (updated)
import { Hono } from "hono";
import type { AppEnv } from "../src/shared/types";
import { authRoutes } from "../src/server/routes/auth";
import { applicationRoutes } from "../src/server/routes/applications";
import { requireAuth } from "../src/server/middleware/auth";

const app = new Hono<AppEnv>();

app.get("/api/health", (c) => c.json({ ok: true, timestamp: Date.now() }));

// Auth routes (public)
app.route("/", authRoutes);

// Protected routes
app.use("/api/*", requireAuth);

// Application routes (protected by middleware above)
app.route("/", applicationRoutes);

export default app;
```

### Error Handling in Route Layer

```typescript
// Custom error classes in src/server/lib/errors.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(404, "NOT_FOUND", message);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(409, "CONFLICT", message);
  }
}

// Error handler middleware (applied in route module)
// Catches AppError instances and formats per D-03
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `db.transaction()` on D1 | `db.batch()` | Drizzle 0.40+ | Must use batch for D1 atomic operations; transaction() throws |
| Zod v4 (new defaults) | Zod v3 (project pinned) | Project uses ^3.24.0 | Use Zod v3 API; do not copy v4 examples |
| `defineWorkersConfig()` for tests | `cloudflareTest()` vitest plugin | vitest 4.x | Test setup uses cloudflareTest() -- already established in Phase 1 |
| Global DB instance | Per-request `createDb(c.env.DB)` | Phase 1 pattern | Must create Drizzle instance per request from Worker binding |

## Open Questions

1. **company_id foreign key vs. inline company_name**
   - What we know: The spec (section 4.2) has `company_id TEXT REFERENCES companies(id)`. But CONTEXT.md D-13 lists "company name" as a direct field. Companies table is a later phase (Phase 6 per REQUIREMENTS.md).
   - What's unclear: Should we store `company_name` as a TEXT field on the application table now (no FK) and add `company_id` FK later when the companies table is built in Phase 6?
   - Recommendation: Store `company_name` as a TEXT column directly on the application table for Phase 2. No company_id FK. This avoids creating a companies table prematurely and follows the architecture research anti-pattern advice (companies should be per-user, not shared). When Phase 6 builds the companies entity, a migration can add the FK.

2. **Zod v3 `.coerce` for query params**
   - What we know: Query params arrive as strings. Zod v3's `z.coerce.number()` and `z.coerce.boolean()` convert strings to their target types.
   - What's unclear: Does `@hono/zod-validator` v0.5 with `zValidator("query", ...)` correctly pass raw query string values to Zod?
   - Recommendation: Yes, query validation passes raw string values. Use `z.coerce.number()` for page/limit and `z.coerce.boolean()` for archived flag. Test this in the first endpoint implementation.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 4.1.4 + @cloudflare/vitest-pool-workers 0.14.7 |
| Config file | vitest.config.ts |
| Quick run command | `npm test` (vitest run --reporter=verbose) |
| Full suite command | `npm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TRACK-01 | Create application with all fields, slug auto-generated | integration | `npx vitest run tests/applications/crud.test.ts -t "create" -x` | Wave 0 |
| TRACK-02 | Update any application field via PATCH | integration | `npx vitest run tests/applications/crud.test.ts -t "update" -x` | Wave 0 |
| TRACK-03 | Soft-delete and restore application | integration | `npx vitest run tests/applications/softdelete.test.ts -x` | Wave 0 |
| TRACK-04 | Archive/unarchive, excluded from default list | integration | `npx vitest run tests/applications/archive-pin.test.ts -t "archive" -x` | Wave 0 |
| TRACK-05 | Pin/unpin flag persists | integration | `npx vitest run tests/applications/archive-pin.test.ts -t "pin" -x` | Wave 0 |
| TRACK-06 | Status enum validated, any-to-any transitions | integration | `npx vitest run tests/applications/status.test.ts -t "enum" -x` | Wave 0 |
| TRACK-07 | Status change via PATCH and dedicated /status endpoint | integration | `npx vitest run tests/applications/status.test.ts -t "change" -x` | Wave 0 |
| TRACK-08 | Status change generates timeline event atomically | integration | `npx vitest run tests/applications/status.test.ts -t "timeline" -x` | Wave 0 |
| D-16 | Tenant isolation -- user A cannot access user B's data | integration | `npx vitest run tests/applications/crud.test.ts -t "isolation" -x` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/applications/crud.test.ts` -- covers TRACK-01, TRACK-02, D-16
- [ ] `tests/applications/status.test.ts` -- covers TRACK-06, TRACK-07, TRACK-08
- [ ] `tests/applications/softdelete.test.ts` -- covers TRACK-03
- [ ] `tests/applications/archive-pin.test.ts` -- covers TRACK-04, TRACK-05
- [ ] `tests/setup.ts` -- must be updated with application + timeline_event table migration SQL

## Project Constraints (from CLAUDE.md)

- Never add a Co-Authored-By line for Claude in commit messages. Commits should only attribute the user.
- GSD workflow enforcement: use `/gsd:execute-phase` for planned phase work, not direct edits.
- Biome is the linter/formatter (not ESLint/Prettier). Run `biome check --fix .` for formatting.

## Sources

### Primary (HIGH confidence)
- Existing codebase: `src/db/schema/auth.ts`, `src/server/routes/auth.ts`, `worker/index.ts`, `vitest.config.ts` -- established patterns for schema, routes, testing
- [Drizzle ORM Batch API](https://orm.drizzle.team/docs/batch-api) -- D1 batch() usage, transaction semantics, return types
- [Drizzle ORM SQLite Column Types](https://orm.drizzle.team/docs/column-types/sqlite) -- text enum, integer boolean/timestamp, constraints
- [Drizzle ORM Indexes & Constraints](https://orm.drizzle.team/docs/indexes-constraints) -- composite unique, partial indexes, .where()
- `job-tracker-spec.md` section 4.2 -- canonical application table schema, indexes, slug generation
- `job-tracker-spec.md` section 6 -- API route structure for applications
- `.planning/research/PITFALLS.md` -- D1 50-query limit, SQLite ALTER TABLE limitations, tenant isolation

### Secondary (MEDIUM confidence)
- [Hono Validation Guide](https://hono.dev/docs/guides/validation) -- zValidator usage with Zod
- [@hono/zod-validator npm](https://www.npmjs.com/package/@hono/zod-validator) -- v0.5 API
- `.planning/research/ARCHITECTURE.md` -- service layer separation, tenant isolation pattern

### Tertiary (LOW confidence)
- None -- all findings verified against official docs and existing codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and patterns established in Phase 1
- Architecture: HIGH -- route/service/DB pattern demonstrated in existing auth code, D1 batch() documented
- Schema design: HIGH -- follows original spec (section 4.2) adapted to existing Drizzle patterns
- Pitfalls: HIGH -- verified against official D1 docs and project pitfalls research
- Validation: HIGH -- Zod v3 + @hono/zod-validator already in package.json and compatible

**Research date:** 2026-04-16
**Valid until:** 2026-05-16 (stable -- no fast-moving dependencies)
