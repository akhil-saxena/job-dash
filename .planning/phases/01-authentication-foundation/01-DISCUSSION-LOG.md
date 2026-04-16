# Phase 1: Authentication & Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-16
**Phase:** 01-authentication-foundation
**Areas discussed:** Session storage, Auth error UX, Password hashing strategy, Project structure
**Mode:** Auto (all areas auto-selected, recommended defaults chosen)

---

## Session Storage

| Option | Description | Selected |
|--------|-------------|----------|
| D1 (SQLite) | Sequential consistency, reliable across edge locations | ✓ |
| KV | Fast reads but eventual consistency (up to 60s propagation) | |
| Hybrid (KV read cache + D1 source) | Best performance but added complexity | |

**User's choice:** D1 (SQLite) — auto-selected (recommended)
**Notes:** Research PITFALLS.md flagged KV eventual consistency causing intermittent auth failures. D1 provides sequential consistency.

---

## Auth Error UX

| Option | Description | Selected |
|--------|-------------|----------|
| Inline form errors + toast for unexpected | Errors appear next to relevant fields, toasts for 500s | ✓ |
| Full-page error screens | Dedicated error page for each failure type | |
| Modal dialogs | Overlay with error details | |

**User's choice:** Inline form errors + toast for unexpected — auto-selected (recommended)
**Notes:** Standard web app pattern. Keeps user in context, doesn't clear form state.

---

## Password Hashing Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Native node:crypto.scryptSync override | Documented workaround for 10ms CPU limit | ✓ |
| Upgrade to paid Workers plan ($5/mo) | 30s CPU limit, removes constraint entirely | |
| OAuth-only (no email/password) | Eliminates the problem but removes AUTH-01 | |

**User's choice:** Native crypto override with OAuth-only fallback — auto-selected (recommended)
**Notes:** Documented in better-auth GitHub issue #8860. If native crypto fails, fall back to OAuth-only rather than paying.

---

## Project Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Single project (Vite + CF plugin) | One Worker serves SPA + API, no CORS, simple deployment | ✓ |
| Monorepo (separate frontend/backend) | More isolation but CORS complexity, two deployments | |
| Separate repos | Maximum isolation but coordination overhead | |

**User's choice:** Single project with Vite + @cloudflare/vite-plugin — auto-selected (recommended)
**Notes:** Research confirmed plugin is GA (April 2025). Eliminates CORS, simplifies development and deployment.

---

## Claude's Discretion

- D1 schema structure for auth tables
- Hono middleware organization
- Error response JSON format
- Development environment scripts
- CORS configuration

## Deferred Ideas

None — discussion stayed within phase scope
