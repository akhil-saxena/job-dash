# Phase 1: Authentication & Foundation - Research

**Researched:** 2026-04-17
**Domain:** Cloudflare Workers + Hono + better-auth + Drizzle/D1 authentication and project foundation
**Confidence:** HIGH

## Summary

Phase 1 establishes the entire runtime foundation: a Vite 8 + @cloudflare/vite-plugin project serving a React SPA and Hono API from a single Cloudflare Worker, with D1 (SQLite) as the database via Drizzle ORM, and better-auth providing Google OAuth + email/password authentication with persistent cookie-based sessions stored in D1.

The most critical technical risk is **password hashing within the Workers free tier 10ms CPU limit**. The proven workaround uses `node:crypto.scryptSync` (native, not pure-JS) via better-auth's custom `password.hash` and `password.verify` configuration. This is documented in better-auth issue #8860 and requires the `nodejs_compat` compatibility flag in wrangler config.

**Primary recommendation:** Scaffold with Vite 8 React-TS template, add @cloudflare/vite-plugin + wrangler, mount Hono API under `/api/*` using `run_worker_first`, configure better-auth per-request with D1 via Drizzle adapter, use `node:crypto.scryptSync` for password hashing, and deploy Resend for transactional email (verification + password reset).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Sessions stored in D1 (SQLite), NOT KV. D1 provides sequential consistency vs KV's eventual consistency.
- **D-02:** Session tokens use httpOnly, Secure, SameSite=Lax cookies. No localStorage token storage.
- **D-03:** Auth errors display inline on the login/signup form. No full-page error screens.
- **D-04:** Unexpected errors (network, 500s) show a toast notification -- don't clear the form.
- **D-05:** Rate limit exceeded shows a clear countdown message, not a generic error.
- **D-06:** Use native `node:crypto.scryptSync` override in better-auth to work within the Workers free tier 10ms CPU limit. Documented workaround (GitHub issue #8860).
- **D-07:** If native crypto fails during testing, fall back to Google OAuth-only auth (no email/password) rather than upgrading to the paid Workers plan.
- **D-08:** Single project using Vite 8 + @cloudflare/vite-plugin. One Worker serves both the React SPA and the Hono API. No monorepo.
- **D-09:** Use `wrangler` for local development and deployment to Cloudflare.
- **D-10:** Use Drizzle ORM with D1 driver for type-safe schema definition and migrations.
- **D-11:** All table primary keys use `nanoid` (URL-safe, shorter than UUIDs).
- **D-12:** Every user-owned table includes `user_id` column with foreign key to users table. Tenant isolation enforced via middleware.
- **D-13:** Timestamps stored as INTEGER (Unix epoch seconds) using `DEFAULT (unixepoch())`.
- **D-14:** Google OAuth configured as primary login method (prominent button).
- **D-15:** Email/password as secondary (below OAuth button, classic form).
- **D-16:** Email verification required after email/password signup before full access.

### Claude's Discretion
- Exact D1 schema for auth tables (better-auth manages its own tables via Drizzle adapter)
- Hono middleware structure and route organization
- Error response format (JSON structure)
- Development environment setup scripts
- CORS configuration (single-origin, should be minimal)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AUTH-01 | User can sign up with email and password | better-auth `emailAndPassword.enabled: true` with custom `node:crypto.scryptSync` hash/verify, `requireEmailVerification: true`, Resend for verification email |
| AUTH-02 | User can log in with Google OAuth (one-click) | better-auth `socialProviders.google` with clientId/clientSecret, callback URL `/api/auth/callback/google`, client-side `signIn.social({ provider: "google" })` |
| AUTH-03 | User session persists across browser refresh | better-auth sessions stored in D1 via Drizzle adapter, httpOnly/Secure/SameSite=Lax cookies, 7-day default expiry with 1-day rolling refresh |
| AUTH-04 | User can reset password via email link | better-auth `emailAndPassword.sendResetPassword` function with Resend, client-side `requestPasswordReset` + `resetPassword` flows |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- Never add Co-Authored-By line for Claude in commit messages. Commits should only attribute the user.

## Standard Stack

### Core (Phase 1 Only)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| vite | 8.0.8 | Build tool & dev server | Cloudflare's official Vite plugin requires Vite 8. Uses Rolldown for fast builds. |
| @cloudflare/vite-plugin | 1.32.3 | Vite + Workers integration | Official plugin. Runs Worker in Workers runtime during dev. Auto-detects wrangler config. |
| react | ^19.0 | UI framework | Project requirement. v19 stable. |
| react-dom | ^19.0 | React DOM renderer | Required by React. |
| hono | 4.12.14 | API framework on Workers | Built for Workers from day one. 12kB, zero deps. First-class D1/R2/KV bindings. |
| better-auth | 1.6.5 | Authentication framework | TypeScript-first, Google OAuth + email/password, Drizzle adapter, Hono integration. Active maintenance. |
| drizzle-orm | 0.45.2 | Database ORM for D1 | Type-safe SQL, first-class D1 support, clean migration story. |
| zod | 4.3.6 | Schema validation | Shared between API (Hono zValidator) and future frontend forms. |
| nanoid | 5.1.9 | ID generation | URL-safe, shorter than UUIDs. Decision D-11. |
| resend | 6.12.0 | Transactional email | Free tier: 100 emails/day, 3000/month. Verification + password reset emails. |
| tailwindcss | ^4.2 | Styling | v4, CSS-first config. Needed for auth UI pages. |
| typescript | ^5.7 | Type safety | End-to-end types from DB schema to API. |

### Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| wrangler | 4.83.0 | Cloudflare CLI: dev server, deploy, D1 migrations, secrets |
| drizzle-kit | latest | DB migration generation and push |
| @cloudflare/workers-types | latest | TypeScript types for Workers runtime |
| @biomejs/biome | ^1.x | Linter + formatter (replaces ESLint + Prettier) |
| @vitejs/plugin-react | latest | React Fast Refresh for Vite |
| @tailwindcss/vite | latest | Tailwind CSS Vite plugin |

### Not Needed in Phase 1

These are in the full stack but NOT installed in Phase 1:

- TanStack Router, TanStack Query, Zustand (Phase 3+)
- shadcn/ui components beyond basic form elements (Phase 3+)
- @hello-pangea/dnd, cmdk, recharts, tiptap, motion (later phases)

### Installation

```bash
# Scaffold Vite React-TS project
npm create vite@latest job-dash -- --template react-ts
cd job-dash

# Core framework
npm install hono @hono/zod-validator
npm install drizzle-orm better-auth
npm install zod nanoid resend

# Dev dependencies
npm install -D wrangler @cloudflare/vite-plugin @cloudflare/workers-types
npm install -D drizzle-kit
npm install -D typescript @types/react @types/react-dom
npm install -D @biomejs/biome
npm install -D tailwindcss @tailwindcss/vite @vitejs/plugin-react
```

## Architecture Patterns

### Recommended Project Structure (Phase 1)

```
job-dash/
  src/
    client/                   # React SPA
      components/
        auth/                 # LoginForm, SignupForm, ResetPasswordForm
        ui/                   # Button, Input, Card, Toast (minimal)
        layout/               # AuthLayout (centered card)
      lib/
        auth-client.ts        # better-auth client instance
      pages/
        login.tsx
        signup.tsx
        reset-password.tsx
        dashboard.tsx         # Placeholder authenticated page
      App.tsx
      main.tsx
    server/                   # Hono API (Workers runtime)
      routes/
        auth.ts               # Mount better-auth handler on /api/auth/*
      middleware/
        auth.ts               # Session validation, userId injection
      lib/
        auth.ts               # better-auth server instance factory
        db.ts                 # Drizzle D1 factory
        email.ts              # Resend email helper
    db/
      schema/
        auth.ts               # better-auth tables (user, session, account, verification)
      migrations/             # SQL migration files
    shared/
      types.ts                # Shared TypeScript types
  worker/
    index.ts                  # Worker entry: creates Hono app, mounts routes
  public/                     # Static assets (favicon)
  wrangler.jsonc              # D1 bindings, assets config, nodejs_compat
  drizzle.config.ts           # Drizzle Kit config
  vite.config.ts              # Vite + @cloudflare/vite-plugin + react
  tsconfig.json
  tsconfig.app.json
  tsconfig.worker.json
  biome.json
  package.json
  .dev.vars                   # Local dev secrets (GOOGLE_CLIENT_ID, etc.)
  .gitignore
```

### Pattern 1: Per-Request Auth Instance (Cloudflare Workers + D1)

**What:** better-auth cannot be instantiated at module level because D1 bindings are only available inside request context. Create a factory function that accepts the environment bindings and returns a configured auth instance.

**When to use:** Every request that touches authentication.

**Example:**
```typescript
// src/server/lib/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import crypto from "node:crypto";
import * as schema from "../../db/schema/auth";
import { nanoid } from "nanoid";

const SCRYPT_PARAMS = { N: 16384, r: 16, p: 1, maxmem: 128 * 16384 * 16 * 2 };

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(password.normalize("NFKC"), salt, 64, SCRYPT_PARAMS);
  return `${salt.toString("hex")}:${key.toString("hex")}`;
}

async function verifyPassword({
  hash,
  password,
}: { hash: string; password: string }): Promise<boolean> {
  const [saltHex, keyHex] = hash.split(":");
  if (!saltHex || !keyHex) return false;
  const key = crypto.scryptSync(
    password.normalize("NFKC"),
    Buffer.from(saltHex, "hex"),
    64,
    SCRYPT_PARAMS,
  );
  return crypto.timingSafeEqual(key, Buffer.from(keyHex, "hex"));
}

export function createAuth(env: Env) {
  const db = drizzle(env.DB, { schema });

  return betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    basePath: "/api/auth",
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema,
    }),
    advanced: {
      database: {
        generateId: () => nanoid(),
      },
      defaultCookieAttributes: {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      password: {
        hash: hashPassword,
        verify: verifyPassword,
      },
      sendResetPassword: async ({ user, url }) => {
        // Use Resend -- see email helper
      },
    },
    emailVerification: {
      sendVerificationEmail: async ({ user, url }) => {
        // Use Resend -- see email helper
      },
    },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        prompt: "select_account",
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,  // 7 days
      updateAge: 60 * 60 * 24,       // Refresh after 1 day
    },
    trustedOrigins: [env.BETTER_AUTH_URL],
  });
}
```

Source: [better-auth issue #8860](https://github.com/better-auth/better-auth/issues/8860), [Hono + better-auth on CF](https://hono.dev/examples/better-auth-on-cloudflare), [better-auth discussion #7963](https://github.com/better-auth/better-auth/discussions/7963)

### Pattern 2: Hono Route Mounting for better-auth

**What:** Mount all better-auth routes under `/api/auth/*` using Hono's `on()` method, passing the raw request to better-auth's handler.

**When to use:** Worker entry point setup.

**Example:**
```typescript
// worker/index.ts (or src/server/index.ts)
import { Hono } from "hono";
import { createAuth } from "../src/server/lib/auth";

type Env = {
  Bindings: CloudflareBindings;
};

const app = new Hono<Env>();

// Mount better-auth -- handles all /api/auth/* routes
app.on(["GET", "POST"], "/api/auth/**", (c) => {
  const auth = createAuth(c.env);
  return auth.handler(c.req.raw);
});

// Auth middleware for protected routes
app.use("/api/*", async (c, next) => {
  // Skip auth routes (already handled above)
  if (c.req.path.startsWith("/api/auth")) return next();

  const auth = createAuth(c.env);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  c.set("userId", session.user.id);
  c.set("session", session);
  await next();
});

// Protected API routes go here
app.get("/api/me", (c) => {
  return c.json({ userId: c.get("userId") });
});

export default app;
```

Source: [Hono better-auth on Cloudflare](https://hono.dev/examples/better-auth-on-cloudflare)

### Pattern 3: Wrangler Configuration for SPA + API

**What:** Configure wrangler.jsonc so the SPA serves all navigation requests while API routes go to the Worker.

**Example:**
```jsonc
// wrangler.jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "job-dash",
  "compatibility_date": "2026-04-15",
  "compatibility_flags": ["nodejs_compat"],
  "main": "./worker/index.ts",
  "assets": {
    "not_found_handling": "single-page-application",
    "run_worker_first": ["/api/*"]
  },
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "job-dash-db",
      "database_id": "<your-database-id>",
      "migrations_dir": "src/db/migrations"
    }
  ]
}
```

Source: [Cloudflare Workers Vite tutorial](https://developers.cloudflare.com/workers/vite-plugin/tutorial/), [SPA routing docs](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/)

### Pattern 4: better-auth Client for React SPA

**What:** Create the auth client instance used by React components for sign-in, sign-up, and session management.

**Example:**
```typescript
// src/client/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: window.location.origin,
  basePath: "/api/auth",
});

// Usage in components:
// const { data: session, isPending } = authClient.useSession();
// await authClient.signIn.social({ provider: "google" });
// await authClient.signIn.email({ email, password });
// await authClient.signUp.email({ email, password, name });
// await authClient.requestPasswordReset({ email, redirectTo: "/reset-password" });
// await authClient.resetPassword({ newPassword, token });
// await authClient.sendVerificationEmail({ email, callbackURL: "/" });
```

Source: [better-auth email-password docs](https://better-auth.com/docs/authentication/email-password), [better-auth Google docs](https://better-auth.com/docs/authentication/google)

### Anti-Patterns to Avoid

- **Module-level auth instance:** D1 bindings are only available in request context. The auth factory MUST be called per-request with `c.env`.
- **Sessions in KV:** Decision D-01 explicitly forbids this. KV's eventual consistency (up to 60s propagation) causes intermittent auth failures.
- **bcrypt/argon2 pure-JS:** Exceeds 10ms CPU limit on free tier. Use `node:crypto.scryptSync` only.
- **Cookie cache without testing:** better-auth bug #4203 (as of early 2026) causes sessions to fail refresh from secondary storage after cookie cache expires. Do NOT enable `session.cookieCache` until this is verified fixed. Use database-only sessions.
- **Hardcoded redirect URIs:** Use environment variables for all URLs. Different between local dev and production.
- **Awaiting email sends:** better-auth docs explicitly warn: "Avoid awaiting the email sending to prevent timing attacks." Use `waitUntil` or fire-and-forget.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| OAuth flow (Google) | Custom OAuth redirect/callback/token exchange | better-auth `socialProviders.google` | OAuth has dozens of edge cases (PKCE, state verification, token refresh, account linking). One missed step = security vulnerability. |
| Password hashing | Custom scrypt wrapper from scratch | better-auth `password.hash`/`verify` with `node:crypto.scryptSync` | The provided code from issue #8860 handles salt generation, NFKC normalization, timing-safe comparison. Copy it verbatim. |
| Session management | Custom cookie parsing, token generation, expiry | better-auth built-in sessions | Session management includes rolling refresh, secure cookie signing, CSRF protection, multi-device support. |
| Email verification flow | Custom token generation, expiry, validation | better-auth `emailVerification` + Resend | Token generation, expiry, one-time-use, email enumeration protection are all built in. |
| Password reset flow | Custom reset token system | better-auth `sendResetPassword` + Resend | Same as email verification -- token lifecycle is handled by the library. |
| ID generation | Custom random string functions | `nanoid` | Collision resistance, URL-safety, configurable length. Well-tested library. |

**Key insight:** better-auth handles the entire auth lifecycle (sign-up, sign-in, session, verification, reset, OAuth). The only custom code needed is the password hash override for Workers CPU limits and the email sending function.

## Common Pitfalls

### Pitfall 1: 10ms CPU Limit Silently Kills Email/Password Signup

**What goes wrong:** better-auth's default pure-JS scrypt (`@noble/hashes/scrypt`) needs ~100ms CPU. The Workers free tier allows 10ms. Signup appears to work in local dev (no CPU limit) but fails with 503 in production.
**Why it happens:** `wrangler dev` has no CPU limit. Production Workers free tier enforces 10ms strictly.
**How to avoid:** Use the `node:crypto.scryptSync` override (Pattern 1 above) with `SCRYPT_PARAMS = { N: 16384, r: 16, p: 1 }`. These params produce a hash in ~2-5ms CPU. Requires `nodejs_compat` compatibility flag.
**Warning signs:** Intermittent 503 errors on signup/login in production only. "Worker exceeded CPU time limit" in Workers logs.

### Pitfall 2: D1 Binding Not Available at Module Level

**What goes wrong:** Attempting to create the Drizzle/better-auth instance at the top of a module (outside a request handler) fails because `env.DB` is undefined.
**Why it happens:** Cloudflare Workers only expose bindings (D1, KV, R2) within the `fetch()` handler's `env` parameter. Module-level code runs before any request.
**How to avoid:** Use a factory function (`createAuth(env)`) called inside each request handler or middleware. Cache the auth instance on the Hono context if needed to avoid recreating within the same request.
**Warning signs:** "Cannot read property 'prepare' of undefined" errors, "env is not defined" at startup.

### Pitfall 3: OAuth Redirect URI Mismatch Between Environments

**What goes wrong:** Google OAuth returns "redirect_uri_mismatch" error in production while working locally.
**Why it happens:** The callback URL `{baseURL}/api/auth/callback/google` must match EXACTLY what's registered in Google Cloud Console. Different environments have different base URLs.
**How to avoid:** Register ALL environment URIs in Google Cloud Console: `http://localhost:5173/api/auth/callback/google` (Vite dev), `https://job-dash.<account>.workers.dev/api/auth/callback/google` (staging), `https://yourdomain.com/api/auth/callback/google` (production). Use `BETTER_AUTH_URL` env var per environment.
**Warning signs:** OAuth works locally but fails on deploy. Users stuck on Google error page.

### Pitfall 4: SPA Routing 404s on Direct Navigation

**What goes wrong:** Navigating directly to `/login` or refreshing on `/dashboard` returns 404.
**Why it happens:** Without proper SPA fallback config, the Worker tries to find a static file at `/login/index.html`.
**How to avoid:** Set `"not_found_handling": "single-page-application"` in wrangler.jsonc `assets` section. Do NOT include a `404.html` in build output. Verify after first deploy by navigating to a deep link.
**Warning signs:** Direct URLs return 404 in production. Refresh on any non-root page fails.

### Pitfall 5: better-auth Cookie Cache Bug (#4203)

**What goes wrong:** Sessions fail to refresh from secondary storage after cookie cache expires. Users get randomly logged out.
**Why it happens:** Known bug in better-auth (reopened Jan 2026, issue #4203). Cookie cache and secondary storage don't interact correctly.
**How to avoid:** Do NOT enable `session.cookieCache` for now. Use D1 as the sole session store (Decision D-01 aligns with this). Performance is acceptable for a personal tracker -- each request does one D1 read for session validation.
**Warning signs:** Users logged out after ~5 minutes (cookie cache TTL), especially on second+ request.

### Pitfall 6: SQLite ALTER TABLE Limitations Bite Later

**What goes wrong:** Needing to change a column type or add a NOT NULL constraint to an existing column requires the full "create new table, copy data, drop old, rename" dance.
**Why it happens:** D1 uses SQLite which supports only RENAME TABLE, RENAME COLUMN, ADD COLUMN, DROP COLUMN in ALTER TABLE.
**How to avoid:** Get the auth schema right the first time. better-auth manages its own tables, so there's less risk here. For app tables added later, use nullable columns with app-level validation. Use TEXT for flexible fields.
**Warning signs:** Migration files containing multi-step CREATE/INSERT/DROP/RENAME sequences.

### Pitfall 7: Forgetting `run_worker_first` for Auth Callback Routes

**What goes wrong:** Google OAuth callback hits the SPA fallback instead of the Worker because `Sec-Fetch-Mode: navigate` causes the SPA handler to intercept the browser redirect.
**Why it happens:** OAuth callback is a browser navigation (redirect from Google), not a `fetch()` call. Without `run_worker_first`, the SPA's `not_found_handling` catches it.
**How to avoid:** Configure `"run_worker_first": ["/api/*"]` in wrangler.jsonc. This ensures ALL `/api/*` routes (including auth callbacks) hit the Worker first.
**Warning signs:** Google OAuth redirects to a blank SPA page instead of completing the auth flow.

## Code Examples

### Drizzle Schema for better-auth Tables (D1/SQLite)

```typescript
// src/db/schema/auth.ts
// Generated by better-auth CLI, then customized for D1:
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

export const user = sqliteTable("user", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
```

**IMPORTANT:** The schema above is a reference pattern. In practice, generate the schema using `npx @better-auth/cli generate` and then review/adapt for D1. The CLI generates the exact columns better-auth expects, preventing schema mismatch bugs.

Source: [better-auth database docs](https://better-auth.com/docs/concepts/database), [Drizzle adapter docs](https://better-auth.com/docs/adapters/drizzle)

### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    cloudflare(),
  ],
});
```

Source: [Cloudflare Vite plugin tutorial](https://developers.cloudflare.com/workers/vite-plugin/tutorial/)

### Resend Email Helper

```typescript
// src/server/lib/email.ts
import { Resend } from "resend";

export function createEmailSender(apiKey: string) {
  const resend = new Resend(apiKey);

  return {
    async sendVerificationEmail(to: string, url: string) {
      await resend.emails.send({
        from: "JobDash <noreply@yourdomain.com>",
        to,
        subject: "Verify your email address",
        html: `<p>Click the link to verify your email: <a href="${url}">${url}</a></p>`,
      });
    },
    async sendPasswordResetEmail(to: string, url: string) {
      await resend.emails.send({
        from: "JobDash <noreply@yourdomain.com>",
        to,
        subject: "Reset your password",
        html: `<p>Click the link to reset your password: <a href="${url}">${url}</a></p>`,
      });
    },
  };
}
```

Source: [Resend + Workers tutorial](https://developers.cloudflare.com/workers/tutorials/send-emails-with-resend/)

### TypeScript Configuration (Worker types)

```json
// tsconfig.worker.json
{
  "extends": "./tsconfig.node.json",
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.worker.tsbuildinfo",
    "types": ["@cloudflare/workers-types/2023-07-01", "vite/client"]
  },
  "include": ["worker"]
}
```

### Environment Variables (.dev.vars)

```
BETTER_AUTH_URL=http://localhost:5173
BETTER_AUTH_SECRET=your-random-secret-at-least-32-chars
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
RESEND_API_KEY=re_your_resend_api_key
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Lucia v3 for auth | better-auth ^1.6 | March 2025 (Lucia deprecated) | better-auth is the spiritual successor. TypeScript-first, active maintenance. |
| `node_compat` flag | `nodejs_compat` flag | 2024 | `node_compat` is legacy. Use `nodejs_compat` for full Node.js API support including `node:crypto`. |
| Pages + separate Worker | Single Worker with assets | April 2025 (@cloudflare/vite-plugin GA) | One project, one deploy. No CORS, shared bindings. |
| KV for sessions | D1 for sessions | Community consensus 2025 | KV eventual consistency (60s propagation) causes auth failures. D1 is sequentially consistent. |
| `_redirects` file for SPA routing | `not_found_handling: "single-page-application"` | 2025 | `_redirects` causes infinite loops on Pages. Native config is reliable. |
| bcrypt/argon2 JS libs | `node:crypto.scryptSync` native | 2025 (Workers added node:crypto) | JS crypto libs exceed 10ms CPU limit. Native crypto runs in ~2-5ms. |

## Open Questions

1. **better-auth schema generation on D1**
   - What we know: The CLI generates schema, but D1 is only accessible during requests. The CLI needs a direct database connection for remote operations.
   - What's unclear: Whether `drizzle-kit push` or `wrangler d1 migrations apply` is the better migration path for D1.
   - Recommendation: Use `npx @better-auth/cli generate --output ./src/db/schema/auth.ts` to generate the Drizzle schema file locally. Then use `drizzle-kit generate` to create SQL migration files, and `wrangler d1 migrations apply` to apply them. This keeps migrations in git and works with D1's local dev mode.

2. **Resend domain verification timing**
   - What we know: Resend requires domain verification (DNS records) before sending from a custom domain.
   - What's unclear: Whether the user already has a domain configured on Cloudflare for this project.
   - Recommendation: For initial development, use Resend's sandbox mode (sends to the account owner's email only). Add domain verification as a deployment task. Fall back to `onboarding@resend.dev` sender during development.

3. **better-auth cookie cache bug status (#4203)**
   - What we know: Bug reported Jan 2026, causes sessions to fail refresh when cookie cache expires.
   - What's unclear: Whether this is fixed in v1.6.5.
   - Recommendation: Do NOT enable cookie cache. Sessions in D1 only (aligns with Decision D-01). Revisit if performance becomes an issue.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build, dev server | Yes | v20.17.0 | -- |
| npm | Package management | Yes | 10.8.2 | -- |
| wrangler | CF dev/deploy | No (not global) | -- | Install as devDependency, use via npx |
| Google Cloud Console | OAuth credentials | External service | -- | Must create project + OAuth credentials manually |
| Resend account | Transactional email | External service | -- | Must sign up at resend.com; sandbox mode for dev |
| Cloudflare account | D1, Workers deployment | External service | -- | User confirmed existing account |

**Missing dependencies with no fallback:**
- Google Cloud Console OAuth credentials must be created manually before OAuth testing
- Resend account must be created for email verification and password reset

**Missing dependencies with fallback:**
- wrangler: Install as devDependency (`npm i -D wrangler`), use via `npx wrangler`

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest (standard for Vite projects) + miniflare (Workers runtime testing) |
| Config file | None -- Wave 0 must create vitest.config.ts |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | Email/password signup creates user + sends verification | integration | `npx vitest run tests/auth/signup.test.ts -t "signup"` | No -- Wave 0 |
| AUTH-02 | Google OAuth callback creates/links user + sets session cookie | integration | `npx vitest run tests/auth/oauth.test.ts -t "google"` | No -- Wave 0 |
| AUTH-03 | Session cookie survives page reload, returns valid session on getSession | integration | `npx vitest run tests/auth/session.test.ts -t "persist"` | No -- Wave 0 |
| AUTH-04 | Password reset email sent, token valid, password changed | integration | `npx vitest run tests/auth/reset.test.ts -t "reset"` | No -- Wave 0 |
| -- | Unauthenticated /api/* returns 401 | unit | `npx vitest run tests/auth/middleware.test.ts -t "401"` | No -- Wave 0 |
| -- | Password hash fits within CPU budget | unit | `npx vitest run tests/auth/hash.test.ts -t "cpu"` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `vitest.config.ts` -- Vitest configuration with miniflare environment
- [ ] `tests/auth/signup.test.ts` -- Email/password signup flow
- [ ] `tests/auth/oauth.test.ts` -- Google OAuth flow (mocked)
- [ ] `tests/auth/session.test.ts` -- Session persistence
- [ ] `tests/auth/reset.test.ts` -- Password reset flow
- [ ] `tests/auth/middleware.test.ts` -- Auth middleware 401 behavior
- [ ] `tests/auth/hash.test.ts` -- Password hash performance
- [ ] Framework install: `npm i -D vitest @cloudflare/vitest-pool-workers` (Cloudflare's official Vitest integration for Workers)

## Sources

### Primary (HIGH confidence)
- [better-auth issue #8860](https://github.com/better-auth/better-auth/issues/8860) -- CPU limit workaround with `node:crypto.scryptSync`. Closed with fix. Code verified.
- [Hono better-auth on Cloudflare](https://hono.dev/examples/better-auth-on-cloudflare) -- Official Hono example for the exact stack.
- [better-auth email/password docs](https://better-auth.com/docs/authentication/email-password) -- Email verification, password reset, custom hashing configuration.
- [better-auth session management docs](https://better-auth.com/docs/concepts/session-management) -- Session expiry, cookie cache, secondary storage.
- [better-auth cookie docs](https://better-auth.com/docs/concepts/cookies) -- Cookie attributes, prefix, cross-domain.
- [better-auth database docs](https://better-auth.com/docs/concepts/database) -- Core table schema (user, session, account, verification).
- [better-auth Google provider](https://better-auth.com/docs/authentication/google) -- Google OAuth configuration, callback URL format.
- [better-auth options reference](https://better-auth.com/docs/reference/options) -- `generateId`, `basePath`, `trustedOrigins`, Workers `backgroundTasks`.
- [Cloudflare Vite plugin tutorial](https://developers.cloudflare.com/workers/vite-plugin/tutorial/) -- Full React SPA + API setup guide.
- [Cloudflare SPA routing docs](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/) -- `not_found_handling` and `run_worker_first`.
- [Drizzle ORM + D1 docs](https://orm.drizzle.team/docs/connect-cloudflare-d1) -- Drizzle D1 driver setup.
- [Cloudflare node:crypto docs](https://developers.cloudflare.com/workers/runtime-apis/nodejs/crypto/) -- Full `node:crypto` support with `nodejs_compat`.
- [Resend + Workers tutorial](https://developers.cloudflare.com/workers/tutorials/send-emails-with-resend/) -- Email sending from Workers.
- npm registry version checks (April 2026) -- All package versions verified current.

### Secondary (MEDIUM confidence)
- [better-auth discussion #7963](https://github.com/better-auth/better-auth/discussions/7963) -- Community setup for Hono + Drizzle + D1. Pattern validated against official docs.
- [better-auth-cloudflare GitHub](https://github.com/zpg6/better-auth-cloudflare) -- Community integration library. Useful reference but not required (we use better-auth directly).
- [better-auth + CF Workers guide (Medium)](https://medium.com/@senioro.valentino/better-auth-cloudflare-workers-the-integration-guide-nobody-wrote-8480331d805f) -- Integration guide, Feb 2026. Cross-referenced with official docs.

### Tertiary (LOW confidence)
- better-auth bug #4203 (cookie cache + secondary storage) -- Status unclear in v1.6.5. Mitigation: don't use cookie cache.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- All versions verified against npm registry. Integration patterns confirmed across multiple official sources.
- Architecture: HIGH -- Cloudflare's official Vite plugin tutorial demonstrates exact SPA + Worker pattern. better-auth + Hono integration is an official example.
- Pitfalls: HIGH -- CPU limit workaround verified in issue #8860 with working code. KV consistency and SPA routing issues documented in official Cloudflare docs.
- Password hashing: HIGH -- `node:crypto.scryptSync` workaround code provided in issue #8860, params tested on Workers free tier.
- Cookie cache bug: LOW -- Bug report exists but resolution status for v1.6.5 unclear. Conservative approach (disable cache) eliminates risk.

**Research date:** 2026-04-17
**Valid until:** 2026-05-17 (30 days -- better-auth is actively developed, check for breaking changes)
