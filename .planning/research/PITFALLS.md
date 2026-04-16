# Pitfalls Research

**Domain:** Job application tracker on Cloudflare edge stack (Workers + D1 + R2 + KV + Pages)
**Researched:** 2026-04-16
**Confidence:** HIGH (verified against official Cloudflare docs and community reports)

## Critical Pitfalls

### Pitfall 1: 10ms CPU Limit on Free Workers Plan Silently Kills Features

**What goes wrong:**
The Cloudflare Workers free plan caps CPU time at 10ms per request. Authentication flows (password hashing, JWT verification, OAuth token exchange), complex dashboard queries, and any initialization-heavy code routinely exceed this. The insidious part: features appear to work in local dev (wrangler dev has no CPU limit) but silently fail or throw 503s in production. The emdash CMS team reported this exact issue -- everything looked fine locally but features silently broke on deploy.

**Why it happens:**
Developers conflate wall time (total elapsed) with CPU time (actual compute). Network I/O (fetch, D1 queries, KV reads) does not count toward CPU time, but bcrypt/scrypt hashing, JSON parsing of large payloads, schema validation, and ORM overhead do. 10ms is extremely tight for any request that does real computation.

**How to avoid:**
- Budget for the $5/month Workers Paid plan from day one. The free plan's 10ms CPU limit is incompatible with authentication and complex queries. The paid plan gives 30 seconds default (extendable to 5 minutes).
- If staying free-tier is non-negotiable: use lightweight auth (no bcrypt; use Web Crypto API's PBKDF2 which is a native binding and does not count as CPU), minimize JSON parsing, avoid ORMs with heavy initialization.
- Profile CPU time in local dev using `wrangler dev --log-level debug` and Cloudflare's DevTools CPU profiler.

**Warning signs:**
- Intermittent 503 errors in production that don't reproduce locally
- Auth endpoints timing out or returning empty responses
- Features working on first request but failing on subsequent ones (Worker isolate reuse masks cold-start CPU cost)

**Phase to address:**
Phase 1 (Foundation). Must decide free vs. paid before writing any auth code. This decision shapes the entire auth strategy.

---

### Pitfall 2: D1's 50-Query-Per-Invocation Limit on Free Plan Breaks Complex Pages

**What goes wrong:**
On the free plan, D1 allows only 50 queries per Worker invocation. A dashboard page that loads summary cards, recent applications, upcoming interviews, pipeline counts, and notification badges can easily require 10-20 queries. Add auth session validation, and a single page load consumes half the budget. Kanban board with multiple columns? Each column could be a separate query. You hit 50 fast.

**Why it happens:**
Developers design API endpoints assuming unlimited database access. ORMs like Drizzle generate multiple queries for relations and eager loading. N+1 query patterns (loading applications then looping to load interviews for each) are the fastest way to hit this ceiling.

**How to avoid:**
- Use D1's `db.batch()` method to send multiple statements in a single call. Batched queries count as fewer invocations and reduce latency from network round trips.
- Design API endpoints to use SQL JOINs and CTEs instead of multiple sequential queries. One query returning applications with their latest status is better than one query per status column.
- Consolidate dashboard data into 2-3 well-crafted queries using subqueries and aggregations rather than 15 simple ones.
- On the paid plan this limit rises to 1,000 queries per invocation -- another reason to budget $5/month.

**Warning signs:**
- "D1_ERROR: too many API calls" errors in production
- Dashboard loads partially (some cards render, others show errors)
- Performance degrades as you add features that each need their own queries

**Phase to address:**
Phase 1-2 (Database schema and API design). Query patterns must be planned from the start. Retrofitting batch queries into an ORM-heavy codebase is painful.

---

### Pitfall 3: KV Eventual Consistency Breaks Session Management

**What goes wrong:**
KV is eventually consistent globally, with changes taking up to 60 seconds to propagate across Cloudflare's edge network. If you store sessions in KV: a user logs in, the session is written to KV at edge location A, then their next request routes to edge location B which hasn't seen the session yet. Result: user appears logged out, or worse, sees another user's stale data. Negative lookups (key doesn't exist) are also cached, so even creating a new session can appear to fail at other locations.

**Why it happens:**
KV is optimized for read-heavy, write-infrequent data. Sessions are write-heavy (created, refreshed, invalidated frequently). Developers pick KV for sessions because Cloudflare's docs list it as a session store option, but the fine print says it's best when data is "not typically modified" and doesn't need "immediate consistency."

**How to avoid:**
- Store sessions in D1, not KV. D1 provides sequential consistency within a session (via bookmarks). Session reads/writes go to the same primary database, avoiding stale-read problems.
- If using KV for session caching (for read performance), implement a write-through pattern: write to D1 as source of truth, cache in KV with short TTL, and always fall back to D1 on KV miss.
- For session invalidation (logout), write a tombstone to D1 immediately and let KV cache expire naturally -- but always check D1 for invalidation before trusting KV.

**Warning signs:**
- Users report being randomly logged out, especially when traveling or using VPNs (different edge locations)
- Login works perfectly in local dev (single location) but fails intermittently in production
- Session-dependent features (CSRF tokens, flash messages) are unreliable

**Phase to address:**
Phase 1 (Auth/session design). Session storage choice must be made before implementing auth. Switching from KV to D1 sessions later requires a migration.

---

### Pitfall 4: SQLite ALTER TABLE Limitations Create Migration Nightmares

**What goes wrong:**
D1 uses SQLite, which has severely limited ALTER TABLE support. You cannot alter column types, add constraints to existing columns, or drop NOT NULL. The only supported ALTER operations are RENAME TABLE, RENAME COLUMN, ADD COLUMN, and DROP COLUMN. Any structural change requires the "create new table, copy data, drop old table, rename" dance. In a rapidly evolving app with 10+ tables and foreign keys, this becomes a minefield.

**Why it happens:**
Developers coming from PostgreSQL or MySQL expect ALTER TABLE to handle arbitrary changes. They design schemas casually, expecting to "fix it later." With SQLite/D1, "later" means writing complex migration scripts that temporarily disable foreign keys, copy data row by row, and pray nothing goes wrong.

**How to avoid:**
- Invest heavily in schema design upfront. Get the data model right in Phase 1 before writing application code. Use TEXT for flexible fields, INTEGER for IDs, and avoid overly normalized schemas that create many foreign key chains.
- Use nullable columns with application-level validation rather than NOT NULL constraints you might need to change later.
- Keep a migration strategy from day one using wrangler's built-in migration system (`wrangler d1 migrations create`). Test every migration against a local D1 database before applying to production.
- For complex changes, write migration scripts that: (1) create new table with desired schema, (2) copy data with transformations, (3) drop old table, (4) rename new table. Always wrap in a transaction.

**Warning signs:**
- You're tempted to "just add a column and change the type later"
- Migration files start containing multiple CREATE/INSERT/DROP/RENAME sequences
- Foreign key errors during migrations (foreign keys must be disabled during table rebuilds)

**Phase to address:**
Phase 1 (Database schema). The schema must be designed with SQLite limitations in mind. Every table should be reviewed for "what if we need to change this column?"

---

### Pitfall 5: SPA Routing 404s on Cloudflare Pages

**What goes wrong:**
React client-side routes (e.g., `/dashboard`, `/applications/123`) return 404 on page refresh or direct URL access. The server tries to find `/dashboard/index.html` which doesn't exist as a static file.

**Why it happens:**
Cloudflare Pages automatically handles SPA routing IF there is no `404.html` file at the project root. Many starter templates, build tools, or developer habits include a custom 404.html, which disables the automatic SPA fallback. The `_redirects` file approach (`/* /index.html 200`) causes infinite loop warnings and is explicitly broken on Pages.

**How to avoid:**
- Do NOT include a `404.html` file in your build output. Cloudflare Pages will automatically serve `index.html` for all unmatched routes, which is exactly what a React SPA needs.
- If using Cloudflare Workers with static assets (not Pages), set `not_found_handling` to `"single-page-application"` in the assets configuration.
- Test routing immediately after first deployment: navigate to a deep link, refresh, and verify it loads the SPA correctly.

**Warning signs:**
- Build tool generates a `404.html` in the output directory
- Direct links to application routes return 404 in production but work in dev
- Users sharing links to specific pages report "page not found"

**Phase to address:**
Phase 1 (Project scaffold/deployment). Must be verified on the very first deploy.

---

### Pitfall 6: R2 CORS Configuration Breaks File Uploads From Browser

**What goes wrong:**
Presigned URL uploads to R2 (for job description files, resume uploads, company logos) fail with CORS errors in the browser. The error reads: "Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present."

**Why it happens:**
Unlike AWS S3, R2 does NOT support the `*` wildcard for `AllowedHeaders` in CORS configuration. You must explicitly list every header the client will send (e.g., `content-type`, `content-length`, `x-amz-checksum-*`). Additionally, presigned URLs only work with the S3 API domain (`*.r2.cloudflarestorage.com`), not custom domains, which further complicates CORS if your app domain differs.

**How to avoid:**
- Configure R2 CORS rules explicitly listing all headers: `content-type`, `content-length`, `x-amz-content-sha256`, and any custom headers your upload flow uses.
- Set `AllowedOrigins` to your specific app domain (not `*` in production).
- For file uploads, consider proxying through your Worker instead of presigned URLs. The Worker can handle CORS, validate file types/sizes, and write to R2 via the binding (no network hop, no CORS issues). This is simpler and more secure for a small-scale app.
- If using presigned URLs: test CORS from the browser immediately, not just via curl/Postman (which skip CORS).

**Warning signs:**
- File uploads work via API testing tools but fail in the browser
- CORS errors appear only for PUT/POST requests (GET may work because no preflight is needed for simple requests)
- Upload works on localhost but fails on the deployed domain

**Phase to address:**
Phase where file storage is implemented (likely Phase 2-3 for JD snapshots). Must be tested from the actual deployed frontend, not just local dev.

---

### Pitfall 7: Kanban Board Ordering Uses Naive Integer Positions

**What goes wrong:**
Using sequential integers (1, 2, 3...) for card positions in kanban columns means every drag-and-drop operation requires renumbering all subsequent cards. Dragging card from position 1 to position 5 requires updating positions of cards 2, 3, 4, 5. With D1's query limits and network latency, this creates visible lag and potential data races if two users (or the same user rapidly) reorder cards.

**Why it happens:**
Integer positions are the obvious first implementation. They work perfectly in prototypes with 5 cards. They break down with 50+ applications per column and frequent reordering.

**How to avoid:**
- Use fractional indexing for card positions. Store position as a REAL (float) column. When inserting between positions 2.0 and 3.0, assign 2.5. This requires updating only the moved card, not every card after it.
- Even better: use lexicographic string indexing (e.g., the `fractional-indexing` npm package). Strings avoid float precision loss entirely and sort correctly with SQLite's text ordering.
- For either approach, implement periodic "rebalancing" as a background job -- when positions get too densely packed (e.g., 2.4999999 and 2.5000001), renumber the entire column with even spacing.

**Warning signs:**
- Drag-and-drop feels sluggish because each reorder triggers N database writes
- Card ordering occasionally "jumps" or reverts after rapid dragging
- Position column values become absurdly precise floats (1.000000000001)

**Phase to address:**
Phase 2 (Kanban board implementation). Must be designed into the schema, not retrofitted.

---

### Pitfall 8: OAuth Redirect URI Mismatch Between Dev and Production

**What goes wrong:**
Google OAuth requires the redirect URI registered in the Google Cloud Console to exactly match (byte-for-byte) the URI your app sends. With separate environments (local dev on `localhost:8787`, staging on `staging.jobdash.pages.dev`, production on `jobdash.app`), developers forget to register all URIs or misconfigure the callback endpoint. OAuth silently fails with a generic "redirect_uri_mismatch" error.

**Why it happens:**
The split architecture (React SPA on Pages, API Worker on a separate route/subdomain) means the OAuth callback must route through the Worker (which handles the token exchange), but the final redirect must land on the SPA. Getting this flow right across environments requires careful URL management.

**How to avoid:**
- Register all environment URIs in Google Cloud Console from day one: `http://localhost:8787/auth/callback/google`, `https://your-worker.your-subdomain.workers.dev/auth/callback/google`, `https://yourdomain.com/auth/callback/google`.
- Use environment variables (`AUTH_REDIRECT_URI`) that differ per environment rather than hardcoding any URLs.
- Store the user's original URL in the OAuth `state` parameter so the callback can redirect back to the correct SPA page after auth completes.
- Test the full OAuth flow in production immediately after deploying auth -- don't assume it works because local dev was fine.

**Warning signs:**
- OAuth works locally but fails with "redirect_uri_mismatch" in production
- Users get stuck on Google's error page after clicking "Sign in with Google"
- Deploying to a new environment (staging, preview) breaks auth without any code changes

**Phase to address:**
Phase 1 (Auth implementation). OAuth configuration is environment-specific and must be tested per environment.

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skip D1 migrations, apply schema via raw SQL | Faster iteration in early dev | No migration history, impossible to reproduce schema changes, risky production updates | Never -- use `wrangler d1 migrations` from day one |
| Store all application data in a single denormalized table | Simpler queries, fewer JOINs | Duplicate data, inconsistent updates, painful when adding interview rounds or contacts | Never -- the domain has clear entities (applications, interviews, contacts, companies) |
| Use `localStorage` for client-side state instead of proper state management | Quick to implement, no library needed | Data loss on browser change, no sync across tabs, no persistence guarantees, can't share links to filtered views | Only for ephemeral UI state (sidebar open/closed, theme preference) |
| Inline SQL strings instead of using a query builder | No ORM setup, direct control | SQL injection risk, no type safety, painful refactoring when schema changes | Never in a multi-user app handling user input |
| Skip input validation on the Worker (rely on frontend only) | Faster API development | Any HTTP client can bypass frontend validation; data corruption, injection attacks | Never |
| Use a single Worker for both API and static assets | Simpler deployment configuration | Wastes Worker invocations on static file serving (counts against 100K/day free limit), can't leverage Pages' CDN caching | Never -- use Pages for static assets, Workers for API only |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Google OAuth | Hardcoding redirect URIs instead of using environment variables | Use `AUTH_REDIRECT_URI` env var per environment; register all URIs in Google Cloud Console |
| D1 + Drizzle ORM | Letting Drizzle generate migrations that use unsupported ALTER TABLE operations | Use Drizzle for query building only; write D1 migrations manually with `wrangler d1 migrations create` and test locally first |
| R2 presigned URLs | Using `AllowedHeaders: ["*"]` in CORS config (works on S3, broken on R2) | Explicitly list all required headers: `content-type`, `content-length`, etc. |
| KV for caching | Not setting TTLs, leading to stale cache that never refreshes | Always set explicit TTLs; use short TTLs (60-300s) for frequently changing data; remember KV's minimum TTL is 60 seconds |
| Cloudflare Pages + Workers | Deploying SPA and API as separate projects without shared auth | Use a single wrangler.toml with Pages for static assets and a Worker for the API on the same domain (or subdomain), sharing session cookies via `Domain` attribute |
| Cron Triggers (for reminders/digests) | Assuming cron runs are free and unlimited | Free plan: 5 cron triggers max, each invocation counts toward 100K/day request limit. Design cron jobs to be efficient -- one cron processes all pending reminders, not one cron per user |
| Web Crypto API (for auth) | Importing Node.js crypto libraries that don't work in Workers runtime | Use the Web Crypto API (`crypto.subtle`) which is native to Workers. Libraries like `jose` for JWT work; `bcryptjs` does not (CPU-intensive, may exceed limits) |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| N+1 queries for kanban columns | Board loads slowly, one query per application to fetch latest interview | Use JOINs and subqueries; batch all column data into 1-2 queries | 50+ applications across columns (hits D1 query limit on free plan) |
| Unbounded list queries without pagination | Table view loads all applications at once | Always use LIMIT/OFFSET or cursor-based pagination; default page size 25-50 | 200+ applications (response payload > 1MB, slow rendering) |
| Storing JD snapshots as BLOBs in D1 | Database size grows rapidly; queries slow down | Store JD text in D1 (it's just text), but store uploaded files (PDFs, images) in R2. D1 max row size is 2MB. | 100+ applications with multi-page JDs (approaches 500MB free DB limit) |
| Client-side filtering/sorting of entire dataset | Smooth with 20 items, frozen UI with 500 | Move filtering/sorting to D1 queries with proper indexes; send only the visible page to the client | 100+ applications with multiple filter criteria |
| No database indexes on frequently queried columns | Queries feel fast with 50 rows | Add indexes on: `status`, `company_name`, `created_at`, `user_id`, and any column used in WHERE/ORDER BY | 500+ rows per table (full table scans become noticeable at D1's edge latency) |
| Loading all analytics data on every dashboard visit | Dashboard becomes the slowest page | Pre-compute analytics in a cron job or use materialized views (a separate analytics table updated on status changes) | 200+ applications with funnel/heatmap calculations |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Not scoping all queries by `user_id` | User A can see/edit User B's applications via direct API calls or URL manipulation | Every D1 query must include `WHERE user_id = ?` with the authenticated user's ID. Enforce this in middleware or a query wrapper, never rely on individual endpoint code to remember. |
| Storing Google OAuth tokens in KV without encryption | Token theft gives attacker full access to user's Google account | Store tokens encrypted in D1 with a per-user encryption key derived from a server secret. Better: don't store OAuth access tokens at all -- use them only during the auth flow to get user info, then issue your own session tokens. |
| CSRF vulnerability on state-changing endpoints | Attacker tricks logged-in user into changing/deleting their applications | Use SameSite=Strict or SameSite=Lax cookies for sessions. For extra safety, include a CSRF token in the SPA that's validated on the Worker. |
| Exposing D1 query errors to the client | SQLite error messages can leak schema details (table names, column names) | Catch all D1 errors in the Worker, log them server-side, return generic error messages to the client. |
| Not rate-limiting auth endpoints | Brute-force attacks on email/password login | Implement rate limiting using KV (track failed attempts per IP/email with TTL). On free plan, the 100K request limit provides some natural protection, but it's a blunt instrument. |
| Job description scraping without URL validation | SSRF (Server-Side Request Forgery) -- attacker provides internal network URL | Validate URLs against an allowlist of domains (indeed.com, linkedin.com, greenhouse.io, lever.co, etc.) or at minimum block private IP ranges and non-HTTP(S) schemes. |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Requiring too many fields to create an application | Friction kills the quick-capture use case; users default back to spreadsheets | Minimum required fields: company name + role title. Everything else optional, fillable later. One-click or Cmd+K creation. |
| No optimistic UI updates on drag-and-drop | User drags card, nothing happens for 200-500ms while the API call completes, then the card jumps | Update the UI immediately on drag-end, send the API call in the background, revert only if it fails. This is essential for kanban to feel responsive. |
| Status pipeline is too rigid | Users have different workflows -- some skip "Screening," others have multiple interview rounds that don't fit a linear pipeline | Allow custom statuses or at minimum let users skip stages. The pipeline should be a guide, not a prison. |
| Dashboard overload -- showing everything at once | Cognitive overload; user can't find what needs attention TODAY | Dashboard should prioritize: (1) items needing action today, (2) upcoming deadlines this week, (3) recent activity. Everything else accessible but not front-and-center. |
| No confirmation on destructive actions | Accidental deletion of an application with all its interview notes and history | Soft-delete with undo (toast notification with "Undo" button for 10 seconds). Hard delete only from archive/trash after 30 days. |
| Mobile experience is an afterthought | Quick capture on phone (just saw a job posting) is a primary use case; if the form is unusable on mobile, users won't bother | Design mobile-first for the "add application" flow. The full kanban board can be desktop-optimized, but adding an application must work flawlessly on phone. |

## "Looks Done But Isn't" Checklist

- [ ] **Auth:** Login/signup works, but session expiry isn't handled -- user gets a white screen or cryptic error after session expires instead of a clean redirect to login
- [ ] **Kanban drag-and-drop:** Cards move visually, but position isn't persisted -- refresh the page and cards revert to original order
- [ ] **Search:** Text search works for exact matches, but doesn't handle partial matches, accented characters, or common misspellings (e.g., "Gogle" for "Google")
- [ ] **CSV import:** Works for the developer's test file, but breaks on real-world CSVs with commas in company names, UTF-8 characters, or inconsistent date formats
- [ ] **Notifications:** Bell icon shows count, but there's no way to mark-as-read, dismiss, or prevent the count from growing forever
- [ ] **Dark mode:** Colors are inverted, but shadows, borders, and images look wrong -- especially company logos on dark backgrounds
- [ ] **Multi-user data isolation:** App works for one user, but creating a second account reveals that both users see each other's data (missing `user_id` WHERE clauses)
- [ ] **Email/password auth:** Registration works, but there's no email verification, password reset flow, or account lockout after failed attempts
- [ ] **Offline/slow network:** App works on fast WiFi, but shows blank screens or infinite spinners on slow connections instead of cached data or skeleton screens
- [ ] **Timezone handling:** Dates display correctly in the developer's timezone, but interview times show wrong for users in different timezones. Store all dates as UTC in D1, convert to local timezone in the frontend.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Hit D1 query limit in production | LOW | Identify N+1 queries, batch them, consolidate into JOINs. Can be done incrementally per endpoint. |
| KV sessions causing auth issues | MEDIUM | Migrate session storage from KV to D1: create sessions table, update auth middleware, invalidate all existing sessions (users must re-login). |
| Schema needs ALTER TABLE changes D1 can't do | MEDIUM-HIGH | Write a migration that creates new table, copies data, drops old table, renames. Must be tested thoroughly on a local copy. D1 Time Travel (7 days free, 30 days paid) provides a safety net. |
| CORS blocking R2 uploads in production | LOW | Update R2 CORS config via wrangler or dashboard. No code changes needed, just configuration. Alternatively, switch to Worker-proxied uploads. |
| Kanban ordering breaks with integer positions | HIGH | Must change position column type (REAL or TEXT), write migration to recompute all positions, update all drag-and-drop code. This is why you use fractional indexing from the start. |
| User data isolation failure (missing user_id scoping) | CRITICAL | Audit every D1 query, add user_id WHERE clauses. If data has already been exposed, it's a privacy incident. Prevention is the only acceptable strategy. |
| Free tier limits exceeded (100K requests/day) | LOW | Upgrade to paid plan ($5/month) or optimize: cache aggressively with KV, reduce API calls with batch endpoints, use stale-while-revalidate patterns on the client. |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| CPU limit kills auth (10ms free) | Phase 1: Foundation | Deploy a hello-world Worker with auth, verify it works on the target plan |
| D1 50-query limit | Phase 1-2: Schema + API | Count queries per endpoint in integration tests; assert < 20 per page load |
| KV eventual consistency breaks sessions | Phase 1: Auth | Test login flow from two different browsers/locations; verify session is immediately valid |
| ALTER TABLE limitations | Phase 1: Schema design | Review every column: "Can we change this type later?" If yes, add a note. If no, get it right now. |
| SPA routing 404s | Phase 1: First deploy | After first deploy, navigate directly to `/dashboard` via URL bar, refresh, verify no 404 |
| R2 CORS breaks uploads | Phase 2-3: File storage | Test presigned upload from deployed frontend (not localhost, not Postman) |
| Naive kanban ordering | Phase 2: Kanban board | Drag a card 20 times rapidly, refresh page, verify order is preserved correctly |
| OAuth redirect mismatch | Phase 1: Auth | Test full Google login flow in every environment (local, preview, production) |
| Missing user_id scoping | Phase 1: Multi-user | Create two test accounts, verify account A cannot access account B's data via API |
| No input validation on Worker | Phase 1: API layer | Send malformed/malicious payloads to every endpoint, verify rejection |
| JD scraping SSRF | Phase 2-3: JD snapshots | Attempt to scrape `http://169.254.169.254/` (cloud metadata endpoint), verify it's blocked |
| Unbounded queries | Phase 2: Table view | Load test with 500+ applications, verify pagination works and response size is bounded |

## Sources

- [Cloudflare D1 Limits](https://developers.cloudflare.com/d1/platform/limits/) -- Official D1 free/paid plan limits
- [Cloudflare Workers Limits](https://developers.cloudflare.com/workers/platform/limits/) -- CPU, memory, request limits
- [Workers Best Practices (Feb 2026)](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/) -- Official production guidance
- [Cloudflare D1 Migrations](https://developers.cloudflare.com/d1/reference/migrations/) -- Migration system docs
- [Cloudflare D1 Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/) -- Backup and point-in-time recovery
- [Cloudflare KV: How KV Works](https://developers.cloudflare.com/kv/concepts/how-kv-works/) -- Eventual consistency documentation
- [R2 CORS Configuration](https://developers.cloudflare.com/r2/buckets/cors/) -- CORS setup for R2
- [R2 Presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/) -- Presigned URL limitations
- [Deploying emdash to Cloudflare: What We Learned](https://emdash-labs.com/blog/deploying-emdash-to-cloudflare-what-we-learned) -- Real-world D1/Workers deployment pitfalls
- [Journey to Optimize Cloudflare D1 Database Queries](https://rxliuli.com/blog/journey-to-optimize-cloudflare-d1-database-queries/) -- D1 query optimization case study
- [Better Auth + Cloudflare Workers Integration Guide](https://medium.com/@senioro.valentino/better-auth-cloudflare-workers-the-integration-guide-nobody-wrote-8480331d805f) -- Auth session pitfalls on Workers
- [Fractional Indexing for Kanban Boards](https://nickmccleery.com/posts/08-kanban-indexing/) -- Robust kanban card ordering
- [D1 SQL Statements](https://developers.cloudflare.com/d1/sql-api/sql-statements/) -- Supported ALTER TABLE operations
- [Cloudflare Pages vs Workers Migration (2026)](https://cogley.jp/articles/cloudflare-pages-to-workers-migration) -- Pages/Workers architecture guidance
- [CORS Issue with R2 Presigned URL - Community](https://community.cloudflare.com/t/cors-issue-with-r2-presigned-url/428567) -- Community reports on R2 CORS

---
*Pitfalls research for: Job application tracker on Cloudflare edge stack*
*Researched: 2026-04-16*
