# Project Research Summary

**Project:** JobDash
**Domain:** Multi-user job application tracker SPA on Cloudflare edge platform
**Researched:** 2026-04-16
**Confidence:** HIGH

## Executive Summary

JobDash is a multi-user job application tracker being rebuilt from a validated Google Sheets + Apps Script prototype into a full-stack SPA on Cloudflare's edge platform. The expert approach for this type of product is a single Cloudflare Worker serving both a React SPA and a Hono REST API, backed by D1 (SQLite), KV (sessions/cache), and R2 (file storage). This architecture eliminates CORS, simplifies deployment, and keeps hosting at $0/month on the free tier. The stack is well-documented with official Cloudflare integrations for every major component (Vite plugin, Hono, Drizzle ORM, better-auth), meaning implementation should follow established patterns rather than blazing new trails.

The recommended approach is to build the foundation (Worker + auth + database schema + core CRUD) first, then layer on the three primary views (dashboard, kanban, table) in a second major push, and progressively add depth features (file uploads, analytics, notifications) in later phases. The Sheets prototype already validated the core feature set and data model, so the web rebuild is a known-domain problem -- the risk is execution, not product discovery. The key differentiators against competitors (Huntr, Teal, ApplyArc) are a smart dashboard as the default landing view, pipeline analytics, company-level intelligence that persists across applications, and full data portability. None of these are technically exotic.

The primary risks are all Cloudflare free-tier constraints. The 10ms CPU limit on Workers will break password hashing unless native `node:crypto` is used as a custom hash function in better-auth. D1's 50-query-per-invocation limit on the free plan demands disciplined query batching from day one -- no N+1 patterns, no ORM-generated query cascades. KV's eventual consistency makes it unsuitable as a primary session store; sessions belong in D1 with KV as a read-through cache. These are all solvable problems with documented workarounds, but they must be addressed in the foundation phase, not discovered in production. If the free tier proves too constraining, the $5/month paid plan removes most limits.

## Key Findings

### Recommended Stack

The stack centers on Cloudflare-native services with a React frontend. Every major library has official Cloudflare integration documentation, and the entire stack targets zero hosting cost on the free tier. The single-project structure (no monorepo) with `src/client/`, `src/server/`, and `src/shared/` directories keeps deployment simple while maintaining clean boundaries.

**Core technologies:**
- **Vite 8 + @cloudflare/vite-plugin** -- Build tool with first-class Workers integration via the Environment API
- **React 19** -- UI framework (project requirement), stable with Actions support
- **Hono 4** -- API framework built for Workers; 12kB, zero deps, native D1/R2/KV bindings
- **Drizzle ORM** -- Type-safe SQL for D1; clean migration story, reads like SQL not a leaky abstraction
- **better-auth** -- TypeScript-first auth replacing deprecated Lucia; Google OAuth + email/password with Hono integration
- **TanStack Router + TanStack Query** -- Type-safe routing for SPAs; de facto async state management with caching and optimistic updates
- **shadcn/ui + Tailwind CSS v4** -- Copy-paste component primitives with zero runtime overhead; CSS-first config
- **Zod 4** -- Shared validation schemas between API and frontend; 57% smaller than v3

**Critical version note:** better-auth's default scrypt hashing exceeds the 10ms CPU limit on Workers free tier. Must override with native `node:crypto.scryptSync` as a custom hash function.

### Expected Features

**Must have (table stakes -- P1 for launch):**
- Authentication (Google OAuth + email/password), multi-user from day one
- Application CRUD with full detail panel (company, role, status, priority, source, URL, dates, notes)
- Status pipeline with color-coded visual indicators (Wishlist through Withdrawn)
- Kanban board with drag-and-drop status changes
- Table view with sorting, filtering, and full-text search
- Smart dashboard landing view with summary stats (active count, interviews this week, response rates)
- Interview round tracking (type, date, interviewer, questions, outcome, self-rating)
- Lightweight contact management linked to applications
- Activity timeline with auto-generated status change events
- Markdown notes per application
- Dark mode with system preference detection
- Mobile-responsive design (especially the quick-add flow)

**Should have (competitive differentiators -- P2 for v1.x):**
- Company entity with persisted research notes across applications
- Tags and labels (user-defined, color-coded)
- Deadline and staleness tracking with urgency signals (amber at 7d, red at 14d)
- Salary tracking with comparison view across applications
- Job description snapshots (URL auto-scrape + manual paste, stored in R2)
- Bulk actions (archive, tag, status change, delete)
- Calendar view for interviews
- Company ratings and post-mortem reviews
- CSV/JSON import and export

**Defer (v2+):**
- Pipeline analytics (Sankey/funnel, source effectiveness, response heatmap) -- needs data volume
- Command palette (Cmd+K) -- power-user feature, not essential for validation
- Follow-up reminders and email digests -- requires notification infrastructure
- Chrome extension -- separate codebase, high maintenance

**Anti-features (explicitly not building):**
- AI resume builder / ATS optimization -- entire separate product category
- Application form autofill -- requires maintaining ATS compatibility
- Email parsing / Gmail integration -- privacy nightmare, unreliable
- Real-time collaboration -- single-user-at-a-time is correct for personal tracker

### Architecture Approach

The architecture is a single Cloudflare Worker serving both the React SPA (static assets) and the Hono API on the same origin. This eliminates CORS entirely. D1 provides relational storage with tenant isolation via `user_id` columns on every table (shared database, not database-per-tenant -- appropriate for hundreds of users). R2 handles file storage via presigned URL uploads that bypass the Worker. KV serves as a read-through cache for sessions and analytics. The service layer pattern keeps business logic testable and reusable: thin route handlers delegate to service functions that accept `(db, userId, params)`.

**Major components:**
1. **React SPA (client)** -- UI rendering, client-side routing, optimistic updates via TanStack Query, local state in Zustand
2. **Hono API (server)** -- REST endpoints, auth middleware, Zod request validation, service layer delegation
3. **D1 (SQLite)** -- All persistent relational data; every query scoped by `user_id`; `db.batch()` for multi-statement atomicity
4. **KV** -- Session read cache (write-through from D1), rate-limit counters, analytics cache with TTL
5. **R2** -- Resume/cover letter/JD file storage via presigned URL uploads
6. **Cron Triggers** -- Daily reminders, stale application nudges, session cleanup (max 3 on free plan)

### Critical Pitfalls

1. **10ms CPU limit kills auth on free tier** -- Password hashing with scrypt exceeds the limit. Override better-auth's hash function with native `node:crypto.scryptSync`. Test on deployed Worker immediately, not just local dev where there is no CPU limit.

2. **D1's 50-query-per-invocation limit on free plan** -- Dashboard pages can easily trigger 10-20 queries. Use `db.batch()` for multi-statement calls, design queries with JOINs and CTEs instead of N+1 patterns, and consolidate dashboard data into 2-3 well-crafted queries.

3. **KV eventual consistency breaks sessions** -- Sessions written at one edge location may not be visible at another for up to 60 seconds. Store sessions in D1 as the source of truth; use KV only as a read-through cache with short TTL and D1 fallback on miss.

4. **SQLite ALTER TABLE limitations** -- Cannot alter column types, add constraints to existing columns, or drop NOT NULL. Get the schema right upfront. Use nullable columns with application-level validation. Invest in schema design before writing application code.

5. **Kanban ordering with naive integer positions** -- Sequential integers require renumbering all subsequent cards on every drag. Use fractional/lexicographic indexing from day one (`fractional-indexing` npm package). Update only the moved card, not every card after it.

6. **Missing user_id scoping in queries** -- A single query without the `WHERE user_id = ?` clause is a data leak across users. Enforce this in middleware or a query wrapper. This is a privacy-critical requirement that must be verified with multi-account testing.

7. **R2 CORS rejects wildcard headers** -- Unlike S3, R2 does not support `AllowedHeaders: ["*"]`. Explicitly list all headers (`content-type`, `content-length`, etc.). Test uploads from the deployed frontend, not curl.

## Implications for Roadmap

Based on the combined research, here is the suggested phase structure. The ordering follows architectural dependencies (each phase builds on the previous), groups features that share implementation patterns, and front-loads risk mitigation.

### Phase 1: Foundation (Worker + Auth + Schema + Core CRUD)
**Rationale:** Nothing works without the runtime, database, and authentication. This phase resolves the highest-risk pitfalls (CPU limit, session storage, schema design) before any feature code is written. The architecture research confirms this must come first.
**Delivers:** Deployed Worker with Hono API, D1 database with migrations, Google OAuth + email/password auth, session management, and application CRUD endpoints (no UI yet).
**Addresses:** Auth (P1), Application CRUD data layer, status pipeline data model
**Avoids:** CPU limit pitfall (by using native crypto from day one), KV session pitfall (by using D1 sessions + KV cache), ALTER TABLE pitfall (by investing in schema design upfront), OAuth redirect mismatch (by testing in deployed environment)

### Phase 2: Core Data Model Expansion
**Rationale:** The relational data model (interviews, companies, contacts, tags, timeline events) must exist before building views that display it. Batch this work to get all entities and relationships right together, avoiding schema migration churn later.
**Delivers:** Complete API for interviews, companies, contacts, tags, deadlines, and auto-generated timeline events. All endpoints scoped by `user_id`.
**Addresses:** Interview round tracking (P1), contact management (P1), activity timeline (P1), company entity (P2), tags/labels (P2)
**Avoids:** N+1 query patterns (by designing batch-friendly query patterns from the start), missing `user_id` scoping (by verifying isolation with multi-account tests)

### Phase 3: Frontend Shell + Primary Views
**Rationale:** With the full API available, build the three primary views (dashboard, kanban, table) and the application detail panel. This is where users first interact with the product. The dashboard-first approach is JobDash's primary differentiator and should be the default view from the start.
**Delivers:** React SPA with layout shell, dashboard landing view, kanban board with drag-and-drop, table view with sorting/filtering, application detail panel, TanStack Query integration, dark mode.
**Addresses:** Dashboard view (P1), kanban board (P1), table view (P1), detail panel (P1), dark mode (P1), mobile-responsive (P1), markdown notes (P1)
**Avoids:** Kanban ordering pitfall (by using fractional indexing from the start), optimistic UI absence (by implementing TanStack Query optimistic mutations for drag-and-drop), SPA routing 404s (by verifying routing on first deploy)

### Phase 4: Feature Depth + File Storage
**Rationale:** With core views working, add depth features that enrich the per-application experience. File storage (R2) enables JD snapshots and document uploads. Salary tracking and staleness signals add competitive differentiation.
**Delivers:** R2 file uploads via presigned URLs, JD snapshot scraping, salary tracking with comparison, deadline/staleness tracking, bulk actions, CSV/JSON import/export, pin/star/archive.
**Addresses:** JD snapshots (P2), salary tracking (P2), staleness/deadline tracking (P2), bulk actions (P2), data import/export (P2), company ratings/post-mortem (P2), calendar view (P2)
**Avoids:** R2 CORS pitfall (by explicitly listing headers and testing from deployed frontend), SSRF on JD scraping (by validating URLs against an allowlist of known job board domains)

### Phase 5: Intelligence + Notifications
**Rationale:** Analytics, reminders, and email digests depend on a populated data model and established usage patterns. These features add intelligence on top of existing data rather than creating new data structures.
**Delivers:** Pipeline analytics (Sankey/funnel, source effectiveness), cron-driven follow-up reminders, in-app notification system, email digest via Resend, KV caching for analytics, command palette.
**Addresses:** Pipeline analytics (P3), follow-up reminders (P3), notification system (P3), email digest (P3), command palette (P3)
**Avoids:** Analytics performance trap (by pre-computing aggregations and caching in KV with TTL), cron trigger limits (by consolidating all reminders into a single efficient cron job)

### Phase 6: Polish + Hardening
**Rationale:** Final polish, security hardening, and UX refinements that make the product production-ready for external users.
**Delivers:** Rate limiting (KV-backed), onboarding flow, empty states, skeleton loading screens, session expiry handling, responsive design polish, error boundaries, CSRF protection.
**Addresses:** Security hardening, UX polish items from "looks done but isn't" checklist
**Avoids:** Security mistakes (rate limiting, CSRF, error message leakage), UX pitfalls (session expiry white screens, mobile quick-add friction)

### Phase Ordering Rationale

- **Foundation first (Phase 1):** Every subsequent phase depends on the Worker runtime, database, and auth. The highest-risk pitfalls (CPU limits, session storage, schema design) must be resolved before writing feature code.
- **Data model before views (Phase 2 before 3):** Views are projections of data. Building the complete relational model first means views can be built without API gaps or schema changes.
- **Views before depth (Phase 3 before 4):** Users need to see and interact with their data before enrichment features matter. The dashboard-first differentiator should be experienced early.
- **Depth before intelligence (Phase 4 before 5):** Analytics and reminders are only meaningful with sufficient data and established usage patterns.
- **Polish last (Phase 6):** Security hardening and UX refinements refine what exists rather than creating new capabilities.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** better-auth + D1 + Hono wiring, native crypto hash override, session storage pattern
- **Phase 3:** Fractional indexing for kanban, TanStack Router file-based routing with Cloudflare Vite plugin
- **Phase 4:** R2 presigned URL CORS configuration, JD scraping strategy and URL validation
- **Phase 5:** Sankey chart library choice (Recharts vs Nivo vs custom D3), Resend email integration from Workers

Phases with standard patterns (skip research-phase):
- **Phase 2:** Standard relational CRUD with Drizzle ORM -- well-documented
- **Phase 6:** Rate limiting, error handling, responsive CSS -- established patterns

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All libraries verified against official docs and npm; Cloudflare free tier limits confirmed against pricing pages; better-auth CPU workaround verified via GitHub issue |
| Features | HIGH | Competitor analysis covers 7+ products; feature prioritization validated against the existing Sheets prototype; anti-features are well-reasoned |
| Architecture | HIGH | Single-Worker architecture documented by Cloudflare; Vite plugin is GA; all integration patterns have official tutorials or guides |
| Pitfalls | HIGH | Every pitfall sourced from official Cloudflare docs or verified community reports; the emdash deployment case study validates the CPU/query limit concerns |

**Overall confidence:** HIGH

### Gaps to Address

- **Free tier vs. $5/month paid plan decision:** The 10ms CPU limit and 50-query-per-invocation limit are tight. Research documents workarounds for both, but the $5/month paid plan removes most constraints. This decision should be made before Phase 1 implementation begins.
- **Sankey chart implementation:** Recharts lacks native Sankey support. Need to evaluate @nivo/sankey vs custom D3 during Phase 5 planning. This is a contained risk -- it only affects one visualization.
- **JD scraping reliability:** Auto-scraping job descriptions from arbitrary URLs is inherently fragile (DOM changes, anti-scraping measures, rate limits). The manual paste fallback is essential. Scraping strategy needs validation during Phase 4 planning.
- **KV write limit for sessions (1K writes/day):** With D1 as the primary session store, this is mitigated. But if session creation patterns push beyond 1K KV writes/day, the KV cache layer must be tuned or dropped.
- **Cloudflare Email Service (native):** Currently in private beta. If it exits beta during development, it could replace Resend with a native Worker binding (no API key, no third-party dependency). Monitor during Phase 5 planning.

## Sources

### Primary (HIGH confidence)
- [Cloudflare D1 Pricing](https://developers.cloudflare.com/d1/platform/pricing/)
- [Cloudflare Workers Limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Cloudflare KV How It Works](https://developers.cloudflare.com/kv/concepts/how-kv-works/)
- [Cloudflare R2 Pricing](https://developers.cloudflare.com/r2/pricing/)
- [Cloudflare Vite Plugin GA](https://developers.cloudflare.com/changelog/post/2025-04-08-vite-plugin/)
- [Hono + Cloudflare Workers](https://hono.dev/docs/getting-started/cloudflare-workers)
- [Drizzle ORM + D1](https://orm.drizzle.team/docs/connect-cloudflare-d1)
- [better-auth CPU issue #8860](https://github.com/better-auth/better-auth/issues/8860)
- [D1 SQL Statements (ALTER TABLE)](https://developers.cloudflare.com/d1/sql-api/sql-statements/)
- [R2 CORS Configuration](https://developers.cloudflare.com/r2/buckets/cors/)

### Secondary (MEDIUM confidence)
- [Deploying emdash to Cloudflare](https://emdash-labs.com/blog/deploying-emdash-to-cloudflare-what-we-learned)
- [Better Auth + CF Workers Integration Guide](https://medium.com/@senioro.valentino/better-auth-cloudflare-workers-the-integration-guide-nobody-wrote-8480331d805f)
- [Fractional Indexing for Kanban Boards](https://nickmccleery.com/posts/08-kanban-indexing/)
- [D1 Query Optimization Journey](https://rxliuli.com/blog/journey-to-optimize-cloudflare-d1-database-queries/)

### Tertiary (LOW confidence)
- Competitor feature analysis based on public product pages and review articles -- feature availability may have changed since research date

---
*Research completed: 2026-04-16*
*Ready for roadmap: yes*
