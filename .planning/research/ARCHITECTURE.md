# Architecture Research

**Domain:** Multi-user job application tracker on Cloudflare edge platform
**Researched:** 2026-04-16
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
                         Browser (React SPA)
                              |
                    HTTPS (fetch / presigned URL)
                              |
         +--------------------+--------------------+
         |                                         |
         v                                         v
  Cloudflare Worker (API)                    Cloudflare R2
  [Hono + Drizzle ORM]                  (resume/JD file storage)
         |                                   (direct upload via
    +----+--------+--------+                  presigned URLs)
    |             |        |
    v             v        v
 Cloudflare    Cloudflare  Cloudflare
    D1            KV       Cron Triggers
 (SQLite DB)  (sessions,   (daily nudge
              rate-limit    reminders)
               counters)
```

### Deployment Topology: Single Worker, Not SPA + Separate API

The Cloudflare Vite plugin (GA April 2025) enables a single Worker to serve both static assets (the React SPA) and API routes. This is the recommended approach over deploying the SPA on Pages and the API on a separate Worker.

**Why single Worker over Pages + Worker split:**

1. **No CORS** -- SPA and API share the same origin. No preflight requests, no CORS headers to manage.
2. **Shared bindings** -- One `wrangler.jsonc` configures D1, KV, R2 bindings for both static serving and API routes.
3. **Simpler deployment** -- One `wrangler deploy` deploys everything. No service bindings, no multi-project orchestration.
4. **SPA routing built-in** -- Setting `not_found_handling = "single-page-application"` in wrangler config serves `index.html` for all navigation requests while routing non-navigation requests (API calls via `fetch()`) to the Worker script.

**Known caveat:** Direct browser navigation to API URLs (e.g., typing `/api/applications` in the address bar) will serve the SPA instead of the API response, because the browser sends `Sec-Fetch-Mode: navigate`. This is a non-issue for production use since the SPA only calls APIs via `fetch()`.

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|----------------|----------------|
| **React SPA** | UI rendering, client-side routing, optimistic updates, local state | React 19 + React Router + TanStack Query |
| **Hono API** | REST API, auth middleware, request validation, business logic | Hono framework on Cloudflare Workers runtime |
| **D1 (SQLite)** | Persistent relational data -- users, applications, interviews, contacts, etc. | Single shared database with `user_id` column on every table for tenant isolation |
| **KV** | Session tokens, rate-limit counters, cached analytics snapshots | Key-value pairs with TTL expiration |
| **R2** | File storage -- resumes, cover letters, JD snapshots (large text) | S3-compatible object store; files uploaded via presigned URLs |
| **Cron Triggers** | Scheduled tasks -- daily reminders, stale application nudges, cleanup | Worker `scheduled` handler, runs on UTC schedule |
| **Better Auth** | Authentication -- Google OAuth + email/password, session management | Library with native D1 adapter, Hono middleware integration |

## Recommended Project Structure

```
job-track/
├── src/
│   ├── client/                   # React SPA (Vite builds this)
│   │   ├── components/
│   │   │   ├── ui/               # Primitives (Button, Input, Modal, Badge)
│   │   │   ├── kanban/           # Board, Column, Card
│   │   │   ├── application/      # DetailPanel, ApplicationForm, StatusBadge
│   │   │   ├── interview/        # RoundCard, RoundForm
│   │   │   ├── editor/           # MarkdownEditor (Tiptap), AutoSave
│   │   │   ├── analytics/        # Charts, StatCards
│   │   │   ├── layout/           # Sidebar, Header, ThemeToggle
│   │   │   ├── command/          # CommandPalette (cmdk)
│   │   │   └── notifications/    # Bell, Dropdown
│   │   ├── hooks/                # useApplications, useAutoSave, etc.
│   │   ├── lib/                  # Client utilities, API client wrapper
│   │   ├── pages/                # Route components (or routes/ with React Router)
│   │   ├── stores/               # Client state (Zustand or React context)
│   │   └── App.tsx               # Root with Router + QueryClient providers
│   │
│   ├── server/                   # Hono API (runs in Worker)
│   │   ├── routes/
│   │   │   ├── applications.ts   # /api/applications/*
│   │   │   ├── interviews.ts     # /api/applications/:id/interviews/*
│   │   │   ├── deadlines.ts      # /api/deadlines/*
│   │   │   ├── companies.ts      # /api/companies/*
│   │   │   ├── contacts.ts       # /api/contacts/*
│   │   │   ├── tags.ts           # /api/tags/*
│   │   │   ├── notifications.ts  # /api/notifications/*
│   │   │   ├── analytics.ts      # /api/analytics/*
│   │   │   ├── import-export.ts  # /api/import/*, /api/export/*
│   │   │   └── upload.ts         # /api/upload/* (presigned URL generation)
│   │   ├── middleware/
│   │   │   ├── auth.ts           # Session validation, user injection
│   │   │   ├── rate-limit.ts     # KV-backed rate limiting
│   │   │   └── validate.ts       # Zod validation middleware
│   │   ├── services/             # Business logic layer
│   │   │   ├── application.ts    # Application CRUD + timeline events
│   │   │   ├── interview.ts
│   │   │   ├── notification.ts   # Nudge logic, digest generation
│   │   │   └── analytics.ts      # Funnel computation, caching
│   │   └── index.ts              # Hono app entry, route mounting
│   │
│   ├── db/                       # Shared between client types and server
│   │   ├── schema.ts             # Drizzle ORM schema definitions
│   │   ├── migrations/           # SQL migration files
│   │   └── client.ts             # drizzle(env.DB) factory
│   │
│   ├── shared/                   # Shared between client and server
│   │   ├── validators/           # Zod schemas (used by both API and forms)
│   │   │   ├── application.ts
│   │   │   ├── interview.ts
│   │   │   └── common.ts
│   │   ├── types.ts              # TypeScript types derived from Zod/Drizzle
│   │   ├── constants.ts          # Status enum, priority enum, colors
│   │   └── slug.ts               # Slug generation (used both sides)
│   │
│   └── worker.ts                 # Worker entry point: mounts Hono + static assets
│
├── public/                       # Static assets (favicon, og-image)
├── wrangler.jsonc                # D1, KV, R2 bindings, cron triggers
├── drizzle.config.ts             # Drizzle Kit config pointing to D1
├── vite.config.ts                # Vite + @cloudflare/vite-plugin
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### Structure Rationale

- **`client/` vs `server/`:** Clean separation. The Vite build bundles `client/` for the browser; the Worker runtime executes `server/`. Both import from `shared/` and `db/`.
- **`shared/validators/`:** Zod schemas validate on the client (form validation) AND server (API validation). Single source of truth prevents drift.
- **`server/services/`:** Business logic lives here, not in route handlers. Route handlers parse input, call a service, return a response. Services are testable without HTTP context.
- **`db/schema.ts` at top level:** Both the server (for queries) and build tools (for migration generation) need access to the schema.

## Architectural Patterns

### Pattern 1: Tenant Isolation via user_id Column (Shared Database)

**What:** Every data table includes a `user_id` column. Every query filters by the authenticated user's ID. One D1 database serves all users.

**When to use:** For this project -- expected user count is in the hundreds, not thousands. A single D1 database (5 GB free tier) is more than sufficient.

**Why not database-per-tenant:** D1 supports up to 50,000 databases per account and Cloudflare recommends per-tenant databases for SaaS at scale. However, for a job tracker with moderate user counts:
- Cross-user queries are not needed (each user sees only their data)
- A single database simplifies migrations, backups, and development
- The free tier gives 5 GB total storage -- more than enough for hundreds of users tracking thousands of applications

**Trade-offs:** Simpler to build and migrate. Must be disciplined about always including `user_id` in WHERE clauses. No true isolation -- a bug could leak data across users.

**Implementation:**
```typescript
// server/middleware/auth.ts -- inject userId into context
app.use('/api/*', async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: 'Unauthorized' }, 401);
  c.set('userId', session.user.id);
  c.set('session', session);
  await next();
});

// server/services/application.ts -- always scope by user
export async function listApplications(db: DrizzleD1, userId: string, filters: Filters) {
  return db.select()
    .from(applications)
    .where(and(
      eq(applications.userId, userId),       // ALWAYS present
      isNull(applications.deletedAt),
      ...buildFilters(filters)
    ))
    .orderBy(desc(applications.updatedAt));
}
```

### Pattern 2: Presigned URL Upload for R2

**What:** The client requests a short-lived presigned PUT URL from the API. The client then uploads the file directly to R2, bypassing the Worker. The Worker never handles file bytes.

**When to use:** Any file upload -- resumes, cover letters, JD documents.

**Trade-offs:** Efficient (no Worker CPU/memory for file transfer). Requires two round-trips (get URL, then upload). File size validation must happen client-side or via R2 upload conditions.

**Implementation flow:**
```
Client                           Worker API                    R2
  |                                  |                          |
  |-- POST /api/upload/presign ----->|                          |
  |   { filename, contentType }      |                          |
  |                                  |-- generatePresignedUrl ->|
  |<-- { uploadUrl, key } ----------|                          |
  |                                  |                          |
  |-- PUT uploadUrl (file bytes) ----|------------------------->|
  |                                  |                          |
  |-- POST /api/documents -----------|                          |
  |   { applicationId, key, name }   |-- save metadata to D1   |
```

### Pattern 3: Optimistic UI with TanStack Query

**What:** Mutations update the UI immediately before the API response arrives. On failure, the UI rolls back to the previous state and shows an error toast.

**When to use:** Kanban drag-and-drop (status changes), pin/archive toggles, inline edits -- any action where perceived speed matters.

**Trade-offs:** More complex client code. Must handle rollback gracefully. Small window where UI and server state diverge.

**Implementation:**
```typescript
// hooks/useStatusChange.ts
const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: (args: { id: string; status: string }) =>
    api.patch(`/api/applications/${args.id}/status`, { status: args.status }),
  onMutate: async ({ id, status }) => {
    await queryClient.cancelQueries({ queryKey: ['applications'] });
    const previous = queryClient.getQueryData(['applications']);
    queryClient.setQueryData(['applications'], (old) =>
      old.map(app => app.id === id ? { ...app, status } : app)
    );
    return { previous };
  },
  onError: (_err, _vars, context) => {
    queryClient.setQueryData(['applications'], context.previous);
    toast.error('Status change failed -- reverted.');
  },
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['applications'] }),
});
```

### Pattern 4: Service Layer Separation

**What:** Route handlers delegate to service functions. Services contain business logic. Route handlers only parse request, call service, format response.

**When to use:** Always. Even for simple CRUD.

**Trade-offs:** Slightly more files. But services are testable without HTTP context, reusable across routes (e.g., status change service called by both API route and cron handler), and keep route files thin.

```typescript
// server/routes/applications.ts -- thin route
app.patch('/:id/status', zValidator('json', statusChangeSchema), async (c) => {
  const userId = c.get('userId');
  const { id } = c.req.param();
  const { status } = c.req.valid('json');
  const result = await applicationService.changeStatus(c.get('db'), userId, id, status);
  return c.json(result);
});

// server/services/application.ts -- business logic
export async function changeStatus(db: DrizzleD1, userId: string, appId: string, newStatus: string) {
  const app = await db.select().from(applications)
    .where(and(eq(applications.id, appId), eq(applications.userId, userId)))
    .get();
  if (!app) throw new NotFoundError('Application not found');

  const oldStatus = app.status;
  await db.batch([
    db.update(applications).set({ status: newStatus, updatedAt: now() }).where(eq(applications.id, appId)),
    db.insert(timelineEvents).values({
      id: nanoid(), applicationId: appId, userId,
      eventType: 'status_change',
      description: `${oldStatus} -> ${newStatus}`,
      metadata: JSON.stringify({ from: oldStatus, to: newStatus }),
    }),
  ]);
  return { id: appId, status: newStatus, previousStatus: oldStatus };
}
```

## Data Flow

### Request Flow (API Call)

```
Browser (React SPA)
    |
    | fetch('/api/applications', { headers: { cookie: sessionToken } })
    |
    v
Cloudflare Worker
    |
    | 1. Static asset check -- not a static file, invoke Worker script
    |
    v
Hono Router
    |
    | 2. Middleware chain: auth -> rate-limit -> route handler
    |
    v
Auth Middleware
    |
    | 3. Read session token from cookie
    | 4. Lookup session in KV (fast) or D1 (fallback)
    | 5. Inject userId into Hono context
    |
    v
Route Handler
    |
    | 6. Validate request body (Zod)
    | 7. Call service function with (db, userId, params)
    |
    v
Service Layer
    |
    | 8. Query D1 via Drizzle ORM
    | 9. Always WHERE user_id = ? (tenant isolation)
    | 10. Use db.batch() for multi-statement atomicity
    |
    v
D1 (SQLite)
    |
    | 11. Execute query, return rows
    |
    v
Service Layer -> Route Handler -> JSON Response -> Browser
```

### Authentication Flow (Google OAuth)

```
Browser                       Worker (Better Auth)              Google OAuth
  |                                  |                              |
  |-- Click "Sign in with Google" -->|                              |
  |                                  |-- redirect to Google ------->|
  |<-- Google consent screen --------|                              |
  |-- approve --------------------->|<-- auth code callback --------|
  |                                  |-- exchange code for tokens -->|
  |                                  |<-- id_token, access_token ---|
  |                                  |                              |
  |                                  |-- upsert user in D1          |
  |                                  |-- create session in D1 + KV  |
  |<-- Set-Cookie: session=xxx ------|                              |
  |-- subsequent API calls with cookie -->                          |
```

### File Upload Flow

```
Browser                          Worker API                      R2
  |                                  |                            |
  |-- POST /api/upload/presign ----->|                            |
  |   (auth check, validate type)    |                            |
  |                                  |-- S3 presigned PUT URL --->|
  |<-- { url, key, expiresIn } ------|                            |
  |                                  |                            |
  |-- PUT url (file bytes, ~2MB) ----|                         -->|
  |<-- 200 OK ----------------------|                         ---|
  |                                  |                            |
  |-- POST /api/documents ---------->|                            |
  |   (save metadata: key, name,     |-- INSERT into D1           |
  |    applicationId, type)          |                            |
```

### Cron / Scheduled Flow

```
Cron Trigger (daily 08:00 UTC)
    |
    v
Worker scheduled() handler
    |
    | 1. Query D1: users with email_notifications = true
    | 2. For each user:
    |    a. Find stale applications (applied 7+ days, no update)
    |    b. Find upcoming deadlines (within 3 days)
    |    c. Find interviews without follow-up
    | 3. INSERT notification rows into D1
    | 4. For users with email enabled:
    |    a. Build digest email
    |    b. Send via Resend API (HTTP fetch from Worker)
    |
    v
Done (logged in Workers Logs)
```

### State Management (Client)

```
TanStack Query Cache (server state)
    |
    | useQuery(['applications', filters]) -- fetches from API
    | useMutation() -- optimistic update + API call
    |
    v
React Components
    |
    | Local state: form inputs, modal open/close, view toggle
    | URL state: current view, filters, search query (React Router)
    |
    v
Zustand Store (client-only state, optional)
    |
    | Theme preference, sidebar collapsed, kanban column order
    | Persisted to localStorage
```

### Key Data Flows

1. **Application CRUD:** SPA -> Hono route -> service -> D1 (with automatic timeline event creation on status changes)
2. **Kanban drag-drop:** SPA optimistic update -> API PATCH -> D1 update + timeline event -> SPA cache invalidation
3. **File upload:** SPA -> API presign -> R2 direct upload -> API metadata save -> D1
4. **Session auth:** Cookie -> KV lookup (fast path) -> D1 lookup (cold path) -> userId injected into context
5. **Notifications:** Cron trigger -> D1 query for stale items -> D1 insert notifications -> Resend API for email
6. **Analytics:** SPA -> API -> D1 aggregate queries -> KV cache (TTL 5 min) -> JSON response

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 1-100 users | Current architecture is perfect. Single D1 database, no caching needed. Free tier limits (5M reads/day, 100K writes/day) are far beyond what 100 users generate. |
| 100-1K users | Add KV caching for analytics queries (expensive aggregations). Monitor D1 read/write counts approaching free tier limits. Consider paid tier ($5/mo for 25B reads). |
| 1K-10K users | Split to database-per-tenant if write contention becomes an issue. D1 handles concurrent reads well but SQLite's single-writer model may bottleneck under heavy writes. Build migration tooling to shard existing data. |
| 10K+ users | Full per-tenant D1 databases. API gateway Worker routes to per-tenant Workers. This is a fundamental re-architecture -- only plan for it if growth demands it. |

### Scaling Priorities

1. **First bottleneck: D1 write contention.** SQLite allows only one writer at a time. Under heavy concurrent writes from many users, requests will queue. Mitigation: use `db.batch()` to group related writes into a single transaction, reducing write operations. KV for session storage keeps session reads off D1.
2. **Second bottleneck: Free tier limits.** At sustained usage, 5M reads/day and 100K writes/day are the hard limits. A single page load with dashboard + notifications + deadlines might generate 4-6 D1 reads per user. 100 daily active users = ~600 reads/day from page loads alone -- well within limits.

## Anti-Patterns

### Anti-Pattern 1: Putting Sessions in D1 Only

**What people do:** Store session tokens exclusively in D1 and look them up on every API request.
**Why it's wrong:** Every single API call hits D1 for session validation before the actual query runs. Doubles read volume. KV is purpose-built for this -- high read frequency, eventually consistent is fine for sessions.
**Do this instead:** Store sessions in KV with TTL (24-48 hours). On KV miss, fall back to D1 lookup and re-populate KV. Better Auth supports KV as secondary storage for exactly this pattern.

### Anti-Pattern 2: Routing File Uploads Through the Worker

**What people do:** Accept multipart form uploads in the Worker, then write the bytes to R2 from within the Worker.
**Why it's wrong:** Worker CPU time and memory are limited (128 MB). Large files (5-10 MB resumes) consume Worker resources and risk hitting time/size limits. The free tier allows 10ms CPU time per request.
**Do this instead:** Generate presigned R2 URLs. The browser uploads directly to R2, bypassing the Worker entirely. The Worker only handles the lightweight presign request and the subsequent metadata save.

### Anti-Pattern 3: No Service Layer (Fat Route Handlers)

**What people do:** Put all business logic directly in Hono route handlers -- validation, database queries, side effects (timeline events, notifications).
**Why it's wrong:** Route handlers become 100+ lines, untestable without HTTP mocking, and business logic gets duplicated when the same operation is triggered from multiple places (e.g., status change from API route AND from cron job).
**Do this instead:** Thin route handlers that call service functions. Services accept (db, userId, params) and return data. Routes parse HTTP input and format HTTP output.

### Anti-Pattern 4: Shared Companies Table Across Users

**What people do:** Following the spec's suggestion of a shared `companies` table deduplicated by domain, where User A and User B both reference the same "Google" record.
**Why it's wrong:** Creates a complex deduplication problem (company names vary: "Google", "Google LLC", "Alphabet"). Requires upsert logic on every application create. Opens risk of one user modifying shared data. Adds no real value for a personal tracker.
**Do this instead:** Make companies per-user. Each user has their own company records. Simpler queries, no shared-state coordination, no dedup bugs. If a user applies to Google three times, all three link to their own "Google" company record where their personal notes live.

### Anti-Pattern 5: Client-Side Only Validation

**What people do:** Validate form inputs with Zod on the client and skip server-side validation since "the same schemas are used."
**Why it's wrong:** API endpoints are callable directly (curl, Postman, malicious scripts). Client validation is a UX feature, not a security feature.
**Do this instead:** Shared Zod schemas in `src/shared/validators/` used on BOTH client forms AND server route handlers via Hono's `zValidator` middleware. Validate twice, define once.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **Google OAuth** | Better Auth Google provider; redirect flow | Configure at console.cloud.google.com. Callback URL is `https://yourdomain.com/api/auth/callback/google`. |
| **Resend** | HTTP API call from Worker (cron handler) | Free tier: 3,000 emails/month. Use for daily digest emails only, not transactional auth emails (Better Auth handles those separately). API key stored as Worker secret. |
| **R2 (S3 API)** | Worker binding for presigned URL generation; direct client upload | No egress fees. 10 GB free storage. Files keyed as `{userId}/{type}/{nanoid}-{filename}`. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **SPA <-> API** | HTTP REST (JSON) over same origin | No CORS needed. Cookie-based auth. TanStack Query manages caching/invalidation. |
| **API <-> D1** | Drizzle ORM via Worker D1 binding | `c.env.DB` binding. One Drizzle instance per request. Use `db.batch()` for multi-statement atomicity (D1 does not support interactive transactions). |
| **API <-> KV** | Worker KV binding | `c.env.SESSION_KV` for sessions, `c.env.CACHE_KV` for analytics cache. TTL-based expiration. |
| **API <-> R2** | Worker R2 binding (for presigned URLs); S3 API (for client uploads) | `c.env.FILES_BUCKET` binding. Use `getSignedUrl` from `@aws-sdk/s3-request-presigner`. |
| **Cron <-> API** | Same Worker, different handler | The `scheduled()` handler shares the same codebase and bindings as the `fetch()` handler. Cron calls service functions directly, not via HTTP. |

## Build Order (Dependency Graph)

The following order reflects true architectural dependencies -- each layer depends on the one before it:

```
Phase 1: Foundation
  ├── Worker + Hono setup + wrangler.jsonc bindings
  ├── D1 schema + Drizzle ORM + migrations
  ├── Better Auth (Google OAuth + email/password)
  ├── Auth middleware (session -> userId in context)
  └── Core CRUD: applications table (create, read, update, soft-delete)

Phase 2: Core Data Model
  ├── Interview rounds (depends on: applications)
  ├── Companies + company notes (depends on: applications)
  ├── Tags + application_tags (depends on: applications)
  ├── Contacts + application_contacts (depends on: applications)
  ├── Deadlines (depends on: applications)
  └── Timeline events (depends on: applications, auto-generated)

Phase 3: Frontend Shell
  ├── React SPA + Vite + Cloudflare plugin
  ├── Layout: sidebar, header, theme toggle
  ├── Dashboard (smart landing view)
  ├── Kanban board with drag-and-drop
  ├── Application detail panel
  └── API client + TanStack Query hooks

Phase 4: Feature Depth
  ├── Table view with sorting/filtering
  ├── R2 file uploads (presigned URLs) for documents
  ├── JD snapshot (auto-scrape + manual paste)
  ├── Markdown editor (Tiptap) for notes
  ├── Salary tracking + comparison
  ├── Pin/star, archive, bulk actions
  └── Command palette (Cmd+K)

Phase 5: Intelligence
  ├── Notification system (in-app bell + DB)
  ├── Cron triggers for daily reminders
  ├── Email digest via Resend
  ├── Analytics: funnel, source rates, response heatmap
  └── KV caching for analytics queries

Phase 6: Polish
  ├── Calendar view
  ├── Timeline view
  ├── Dark mode
  ├── CSV import/export
  ├── Responsive design pass
  ├── Rate limiting (KV-backed)
  └── Onboarding flow + empty states
```

**Why this order:**
- Phase 1 establishes the runtime (Worker, DB, auth) -- nothing works without it.
- Phase 2 builds the relational data model that all features depend on.
- Phase 3 gives users something to see and interact with. The API exists from Phase 1-2; now it gets a face.
- Phase 4 adds depth features that depend on the core UI shell existing.
- Phase 5 adds scheduled/background intelligence that depends on a populated data model.
- Phase 6 is polish -- views, modes, and workflows that enhance but aren't critical for core usage.

## Sources

- [Cloudflare Workers docs](https://developers.cloudflare.com/workers/)
- [Cloudflare Vite Plugin GA announcement](https://developers.cloudflare.com/changelog/post/2025-04-08-vite-plugin/)
- [React SPA on Workers tutorial](https://developers.cloudflare.com/workers/vite-plugin/tutorial/)
- [SPA routing configuration](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/)
- [D1 documentation](https://developers.cloudflare.com/d1/)
- [D1 pricing and limits](https://developers.cloudflare.com/d1/platform/pricing/)
- [R2 presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/)
- [R2 upload patterns](https://developers.cloudflare.com/r2/objects/upload-objects/)
- [KV documentation](https://developers.cloudflare.com/workers/platform/storage-options/)
- [Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/)
- [Hono on Cloudflare Workers](https://hono.dev/docs/getting-started/cloudflare-workers)
- [Drizzle ORM + D1](https://orm.drizzle.team/docs/connect-cloudflare-d1)
- [Better Auth Cloudflare integration](https://github.com/zpg6/better-auth-cloudflare)
- [Better Auth + CF Workers guide](https://medium.com/@senioro.valentino/better-auth-cloudflare-workers-the-integration-guide-nobody-wrote-8480331d805f)
- [Architecting on Cloudflare (D1 chapter)](https://architectingoncloudflare.com/chapter-12/)
- [Hono D1 Drizzle setup](https://www.firdausng.com/posts/setup-d1-cloudflare-worker-with-drizzle)
- [Resend email from Workers](https://developers.cloudflare.com/workers/tutorials/send-emails-with-resend/)
- [Cloudflare full-stack on Workers blog](https://blog.cloudflare.com/full-stack-development-on-cloudflare-workers/)

---
*Architecture research for: JobDash -- multi-user job application tracker on Cloudflare*
*Researched: 2026-04-16*
