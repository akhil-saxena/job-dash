# Phase 1: Authentication & Foundation - Context

**Gathered:** 2026-04-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Deploy a Cloudflare Worker with D1 database, Hono API framework, and better-auth providing Google OAuth + email/password authentication with persistent sessions. Users can sign up, log in, reset passwords, and maintain secure sessions. This phase establishes the runtime foundation that all subsequent phases build on.

</domain>

<decisions>
## Implementation Decisions

### Session Storage
- **D-01:** Sessions stored in D1 (SQLite), NOT KV. Research identified KV's eventual consistency (up to 60 seconds propagation) as causing intermittent auth failures across edge locations. D1 provides sequential consistency.
- **D-02:** Session tokens use httpOnly, Secure, SameSite=Lax cookies. No localStorage token storage.

### Auth Error Handling
- **D-03:** Auth errors display inline on the login/signup form (e.g., "Invalid credentials", "Email already registered"). No full-page error screens.
- **D-04:** Unexpected errors (network, 500s) show a toast notification — don't clear the form.
- **D-05:** Rate limit exceeded shows a clear countdown message, not a generic error.

### Password Hashing Strategy
- **D-06:** Use native `node:crypto.scryptSync` override in better-auth to work within the Workers free tier 10ms CPU limit. This is a documented workaround (GitHub issue #8860).
- **D-07:** If native crypto fails during testing, fall back to Google OAuth-only auth (no email/password) rather than upgrading to the paid Workers plan.

### Project Structure
- **D-08:** Single project using Vite 8 + @cloudflare/vite-plugin. One Worker serves both the React SPA and the Hono API. No monorepo, no separate frontend/backend repos.
- **D-09:** Use `wrangler` for local development and deployment to Cloudflare.

### Database Schema Foundation
- **D-10:** Use Drizzle ORM with D1 driver for type-safe schema definition and migrations.
- **D-11:** All table primary keys use `nanoid` (URL-safe, shorter than UUIDs).
- **D-12:** Every user-owned table includes `user_id` column with foreign key to users table. Tenant isolation enforced via middleware that injects user_id into all queries.
- **D-13:** Timestamps stored as INTEGER (Unix epoch seconds) using `DEFAULT (unixepoch())`.

### Auth Providers
- **D-14:** Google OAuth configured as primary login method (prominent button).
- **D-15:** Email/password as secondary (below OAuth button, classic form).
- **D-16:** Email verification required after email/password signup before full access.

### Claude's Discretion
- Exact D1 schema for auth tables (better-auth manages its own tables via Drizzle adapter)
- Hono middleware structure and route organization
- Error response format (JSON structure)
- Development environment setup scripts
- CORS configuration (single-origin, should be minimal)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Spec
- `job-tracker-spec.md` §2 — Original tech stack decisions (reference only — Cloudflare replaces Next.js/Turso/Vercel)
- `job-tracker-spec.md` §4.2 — Database schema design (users, accounts, sessions tables — adapt for D1/better-auth)
- `job-tracker-spec.md` §8 — Multi-user architecture, tenant isolation patterns, middleware auth guard

### Research
- `.planning/research/STACK.md` — Full technology stack with versions, rationale, and constraints
- `.planning/research/ARCHITECTURE.md` — System structure, component boundaries, data flow, build order
- `.planning/research/PITFALLS.md` — Critical pitfalls including CPU limit, KV consistency, D1 query limits, schema migration limitations

### Project Context
- `.planning/PROJECT.md` — Project vision, core value, constraints (zero cost, all-Cloudflare)
- `.planning/REQUIREMENTS.md` — AUTH-01 through AUTH-04 requirements

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project. No existing React, TypeScript, or Cloudflare Worker code.

### Established Patterns
- None — this phase establishes the foundational patterns that all subsequent phases will follow.

### Integration Points
- This phase creates the foundation: Worker runtime, D1 database, auth middleware, session management. All subsequent phases connect to these.

</code_context>

<specifics>
## Specific Ideas

- Auth UI should match the minimal-warm aesthetic decided in PROJECT.md — clean whitespace, rounded elements, soft pastel accents
- Login page should feel like Linear's login — simple, centered, no clutter
- Google OAuth button should be prominent (most users will prefer this)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-authentication-foundation*
*Context gathered: 2026-04-16*
