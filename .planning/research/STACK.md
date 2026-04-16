# Stack Research

**Domain:** Multi-user job application tracker SPA on Cloudflare edge platform
**Researched:** 2026-04-16
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Vite | ^8.0 | Build tool & dev server | Cloudflare's official Vite plugin provides first-class Workers/Pages integration. v8 uses Rolldown for 10x faster builds. Native SPA support on Pages with zero config. |
| React | ^19.0 | UI framework | Project requirement. v19 is stable with improved performance and Actions support. |
| Hono | ^4.12 | API framework (Workers) | Built for Cloudflare Workers from day one. 12kB, zero dependencies, Web Standards API. First-class bindings for D1/R2/KV. Official Cloudflare recommendation for Workers APIs. |
| Drizzle ORM | ^0.45 | Database ORM for D1 | Type-safe SQL, reads like SQL (not a leaky abstraction), first-class D1 support with `d1-http` driver. Clean migration story via `drizzle-kit`. |
| Cloudflare D1 | -- | SQLite database | Free tier: 5M reads/day, 100K writes/day, 5GB total storage. SQLite on the edge. Only real option at $0/month on Cloudflare. |
| Cloudflare R2 | -- | Object storage | Free tier: 10GB storage, 1M Class A ops/month, 10M Class B ops/month. Zero egress fees. For JD snapshots, file uploads. |
| Cloudflare KV | -- | Key-value store | Free tier: 100K reads/day, 1K writes/day, 1GB storage. For session tokens and cache. |
| Tailwind CSS | ^4.2 | Styling | v4 is 5x faster builds, zero config, CSS-first. Native dark mode. Auto-discovers template files. Pairs perfectly with shadcn/ui. |
| TypeScript | ^5.7 | Type safety | Non-negotiable for a project this size. End-to-end type safety from DB schema to UI. |

### Authentication

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| better-auth | ^1.6 | Auth framework | Replaced deprecated Lucia. TypeScript-first, supports Google OAuth + email/password, works with Drizzle + D1. Has Hono integration. Active maintenance (1.6.4 published days ago). |

**CRITICAL: Password hashing on Workers free tier (10ms CPU limit)**

better-auth uses `@noble/hashes/scrypt` (pure JS) by default, which needs ~100ms CPU -- exceeds the 10ms free tier limit. Two options:

1. **Override with `node:crypto.scryptSync`** -- Cloudflare Workers now support native `node:crypto`. Provide custom `emailAndPassword.password.hash` and `verify` functions using native crypto. This runs faster and fits within CPU budget. Known workaround documented in better-auth issue #8860.

2. **Use Web Crypto API PBKDF2** -- `crypto.subtle.deriveBits` with PBKDF2 is natively supported. Less ideal than scrypt but fits within CPU constraints.

Recommendation: Option 1 (native node:crypto scrypt). Proven workaround, retains scrypt security.

### Routing & Data Fetching

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| TanStack Router | ^1.168 | Client-side routing | Superior type safety for SPAs: typed path params, search params, loader data. File-based route generation. Purpose-built for SPAs unlike React Router v7 which optimizes for framework mode. |
| TanStack Query | ^5.99 | Server state management | De facto standard for async state in React. Caching, deduplication, background refetch, optimistic updates. 20% smaller than v4. |
| Zustand | ^5.0 | Client state management | Lightweight (1.1kB), simple API, no boilerplate. Perfect for UI state (sidebar open, active view, filters). Use TanStack Query for server state, Zustand for client state only. |

### UI Components

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn/ui | latest (copy-paste) | Component primitives | Base component library. Copy source into project -- full ownership, zero runtime overhead. Built on Radix UI (accessible) + Tailwind CSS. #1 React UI library by GitHub stars. |
| @hello-pangea/dnd | ^18.0 | Drag and drop | Kanban board drag-and-drop. Maintained fork of react-beautiful-dnd. List-oriented DnD (perfect for kanban columns). |
| cmdk | ^1.1 | Command palette | Cmd+K quick actions. Headless, unstyled, composable. Integrates naturally with shadcn/ui. |
| Recharts | ^3.8 | Charts & analytics | Funnel charts, heatmaps, analytics. Declarative React components over D3. 3.6M weekly downloads. |
| @tiptap/react | ^3.22 | Rich text editor | WYSIWYG markdown editing for notes. Headless (style it yourself). ProseMirror under the hood. Extensible via plugins. |
| @tanstack/react-table | ^8.21 | Data table | Headless table for the table view. Sorting, filtering, pagination, column visibility. Pairs with shadcn/ui's table primitives. |
| @tanstack/react-virtual | ^3.13 | List virtualization | Virtual scrolling for 100+ row tables. Lightweight, headless. |
| motion (framer-motion) | ^12.38 | Animations | Micro-interactions: card lifts, toast enter/exit, modal transitions. Import from `motion/react` (rebranded from framer-motion). |

### Validation & Schemas

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zod | ^4.3 | Schema validation | Shared schemas between API (Hono) and frontend forms. 57% smaller in v4. 100M+ weekly downloads. |

### Email & Notifications

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Resend | ^4.x | Transactional email | Free tier: 100 emails/day, 3000/month. Follow-up reminders, deadline digests. Official Cloudflare Workers tutorial exists. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Wrangler | ^4.82 | Cloudflare CLI | Deploy, dev server, D1 migrations, R2 management. Local dev with Miniflare. |
| drizzle-kit | latest | DB migrations | Generate and push migrations to D1. Use `d1-http` driver for remote, local SQLite for dev. |
| @cloudflare/vite-plugin | ^1.x | Vite integration | Connects Vite dev server to Workers runtime. SPA + API in single project. |
| Biome | ^1.x | Linter + formatter | Replaces ESLint + Prettier. 100x faster. Single tool for linting and formatting. |

## Cloudflare Free Tier Constraints

| Service | Limit | Impact |
|---------|-------|--------|
| Workers | 100K requests/day, 10ms CPU/request | Password hashing needs native crypto workaround. Most API calls are well under 10ms. |
| D1 | 5M reads/day, 100K writes/day, 5GB storage | Generous for a personal tracker. ~50 users each making 100 writes/day = 5K writes. |
| KV | 100K reads/day, 1K writes/day, 1GB storage | Session reads are frequent -- use KV for sessions. 1K writes/day means ~1K logins/day max. |
| R2 | 10GB storage, 1M Class A ops/mo, 10M Class B ops/mo | JD snapshots are small text. 10GB is ample. |
| Pages | Unlimited static requests, 500 builds/month | SPA static assets served for free with no request cap. |
| Cron Triggers | 3 per Worker, included free | Use for: daily deadline digest, stale app nudges, session cleanup. |

## Installation

```bash
# Scaffold
npm create cloudflare@latest job-dash -- --template=react

# Core framework
npm install hono @hono/zod-validator
npm install drizzle-orm better-auth
npm install @tanstack/react-router @tanstack/react-query zustand
npm install zod

# UI
npx shadcn@latest init
npm install @hello-pangea/dnd cmdk recharts
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder
npm install @tanstack/react-table @tanstack/react-virtual
npm install motion

# Email
npm install resend

# Dev dependencies
npm install -D wrangler drizzle-kit @cloudflare/vite-plugin
npm install -D typescript @types/react @types/react-dom
npm install -D @biomejs/biome
npm install -D tailwindcss @tailwindcss/vite
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Hono | itty-router | Never for this project. itty-router is simpler but lacks middleware ecosystem, validation, and structured error handling that a multi-user app needs. |
| Drizzle ORM | Kysely | If you prefer a query builder over ORM. Kysely has D1 support but Drizzle's migration tooling and schema-as-code approach is better for this project's needs. |
| better-auth | Custom auth (Lucia patterns) | If you want zero dependencies. Lucia's codebase is now a learning resource -- you could implement the same session pattern manually. More control, more code to maintain. |
| TanStack Router | React Router v7 | If team already knows React Router. v7's SPA mode works but type safety is weaker -- advanced features require framework mode. |
| Zustand | Jotai | If you have lots of independent, fine-grained state atoms. Zustand's single-store model is simpler for this app's global UI state (view mode, sidebar, filters). |
| shadcn/ui | Radix Themes | If you want pre-styled components. But shadcn/ui gives full control over the "minimal-warm" aesthetic this project targets. |
| Recharts | Nivo | If you need more chart types (Sankey specifically). Recharts doesn't have a native Sankey -- may need Nivo or a custom D3 component for the funnel/Sankey chart. |
| Resend | Cloudflare Email Service | When it exits private beta. Native Workers binding, no API key needed. Not yet generally available as of April 2026. |
| Biome | ESLint + Prettier | If you need ESLint plugins (e.g., eslint-plugin-react-hooks). Biome covers 90% of cases and is dramatically faster. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Lucia v3 | Deprecated as of March 2025. Now a learning resource, not a maintained library. | better-auth (or hand-roll sessions using Lucia's patterns) |
| NextAuth.js / Auth.js | Designed for Next.js. Doesn't work on Cloudflare Workers without hacks. | better-auth |
| Prisma | No D1 support. Heavy, not designed for edge runtimes. Cold start overhead. | Drizzle ORM |
| Redux / Redux Toolkit | Massive boilerplate for a project this size. Server state belongs in TanStack Query, not Redux. | Zustand (client state) + TanStack Query (server state) |
| Create React App | Deprecated. No Cloudflare integration. | Vite 8 + @cloudflare/vite-plugin |
| Express.js | Node.js only. Does not run on Workers runtime. | Hono |
| bcrypt / argon2 (JS) | Exceeds 10ms CPU limit on Workers free tier. | Native node:crypto scrypt via better-auth custom hash |
| react-beautiful-dnd | Unmaintained (archived by Atlassian). | @hello-pangea/dnd (maintained fork) |
| Moment.js | Bloated (300kB+), deprecated by maintainers. | date-fns or Temporal API |
| Chakra UI / MUI | Heavy runtime CSS-in-JS, poor tree-shaking, fights Tailwind. | shadcn/ui (zero runtime, Tailwind-native) |

## Stack Patterns by Variant

**If password hashing exceeds CPU budget on free tier:**
- Use `node:crypto.scryptSync` as custom hash function in better-auth config
- If still failing, fall back to PBKDF2 via Web Crypto API
- Last resort: magic link / OTP auth only (no password, zero CPU cost)

**If Sankey/funnel chart needed:**
- Recharts lacks native Sankey support
- Use `@nivo/sankey` for the Sankey chart specifically
- Or build a custom Sankey with raw D3 (`d3-sankey` + SVG)

**If KV write limit (1K/day) becomes a bottleneck for sessions:**
- Move session storage to D1 (sessions table)
- KV reads are 100K/day -- still use KV as a read cache layer in front of D1

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| drizzle-orm@0.45 | D1 via d1-http driver | Use `dialect: "sqlite"` and `driver: "d1-http"` in drizzle.config.ts |
| better-auth@1.6 | drizzle-orm, Hono | No native d1Adapter -- use Drizzle adapter which connects to D1. Access D1 binding inside Hono request context. |
| Vite@8.0 | @cloudflare/vite-plugin@1.x | Plugin uses Vite 8's Environment API for Workers runtime dev |
| tailwindcss@4.x | shadcn/ui | shadcn/ui v2+ supports Tailwind v4 natively. CSS-first config, no tailwind.config.js needed. |
| @tanstack/react-router | @tanstack/react-query | Integrated loader pattern: route loaders can prefetch queries. Use `routerWithQueryClient`. |
| Zod@4.x | @hono/zod-validator | Hono middleware validates request bodies against Zod schemas. Shared schemas between API and frontend. |

## Monorepo vs Single Project

**Recommendation: Single project with clear directory boundaries.**

```
job-dash/
  src/
    client/          # React SPA (Pages)
      routes/
      components/
      stores/
      lib/
    server/          # Hono API (Workers)
      routes/
      middleware/
      db/
    shared/          # Zod schemas, types, constants
  wrangler.jsonc     # Workers + D1 + R2 + KV bindings
  drizzle.config.ts
  vite.config.ts
```

Why not a monorepo: single deployment target (Cloudflare), shared types without package boundaries, simpler CI. The Cloudflare Vite plugin handles serving both SPA and API from one Worker.

## Sources

- [Cloudflare D1 Pricing](https://developers.cloudflare.com/d1/platform/pricing/) -- free tier limits verified (HIGH confidence)
- [Cloudflare Workers Limits](https://developers.cloudflare.com/workers/platform/limits/) -- 10ms CPU free tier confirmed (HIGH confidence)
- [Cloudflare KV Pricing](https://developers.cloudflare.com/kv/platform/pricing/) -- 100K reads, 1K writes/day (HIGH confidence)
- [Cloudflare R2 Pricing](https://developers.cloudflare.com/r2/pricing/) -- 10GB free (HIGH confidence)
- [Hono + Cloudflare Workers](https://hono.dev/docs/getting-started/cloudflare-workers) -- official integration docs (HIGH confidence)
- [Drizzle ORM + D1](https://orm.drizzle.team/docs/connect-cloudflare-d1) -- official setup guide (HIGH confidence)
- [better-auth CPU issue #8860](https://github.com/better-auth/better-auth/issues/8860) -- password hashing workaround (HIGH confidence)
- [better-auth + Hono on Cloudflare](https://hono.dev/examples/better-auth-on-cloudflare) -- official Hono example (HIGH confidence)
- [TanStack Router vs React Router](https://tanstack.com/router/latest/docs/comparison) -- SPA type safety comparison (HIGH confidence)
- [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4) -- release announcement (HIGH confidence)
- [Lucia deprecation](https://lucia-auth.com/) -- deprecated March 2025, now learning resource (HIGH confidence)
- [shadcn/ui](https://ui.shadcn.com/) -- component library (HIGH confidence)
- npm version checks for all packages -- verified April 2026 (HIGH confidence)

---
*Stack research for: Job application tracker on Cloudflare edge platform*
*Researched: 2026-04-16*
