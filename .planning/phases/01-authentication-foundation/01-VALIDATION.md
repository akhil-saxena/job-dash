---
phase: 1
slug: authentication-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-16
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | AUTH-01, AUTH-02, AUTH-03 | scaffold | N/A (scaffold only) | N/A | ⬜ pending |
| 01-02-01 | 02 | 2 | AUTH-01, AUTH-02, AUTH-03, AUTH-04 | integration | `npx vitest run` | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 | 3 | AUTH-01, AUTH-02, AUTH-03, AUTH-04 | manual | Browser test | N/A | ⬜ pending |
| 01-04-01 | 04 | 4 | AUTH-01 | integration | `npx vitest run tests/auth/signup.test.ts` | ❌ W0 | ⬜ pending |
| 01-04-02 | 04 | 4 | AUTH-02 | integration | `npx vitest run tests/auth/oauth.test.ts` | ❌ W0 | ⬜ pending |
| 01-04-03 | 04 | 4 | AUTH-03 | integration | `npx vitest run tests/auth/session.test.ts` | ❌ W0 | ⬜ pending |
| 01-04-04 | 04 | 4 | AUTH-01, AUTH-02, AUTH-03, AUTH-04 | unit | `npx vitest run tests/auth/hash.test.ts tests/auth/middleware.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest` + `@cloudflare/vitest-pool-workers` — test framework for Workers
- [ ] `tests/setup.ts` — test environment configuration with D1 migration
- [ ] `tests/auth/signup.test.ts` — AUTH-01 email/password signup test
- [ ] `tests/auth/oauth.test.ts` — AUTH-02 Google OAuth initiation test
- [ ] `tests/auth/session.test.ts` — AUTH-03 session persistence test
- [ ] `tests/auth/middleware.test.ts` — 401 unauthorized test
- [ ] `tests/auth/hash.test.ts` — scryptSync performance test

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Google OAuth redirect flow | AUTH-02 | Requires real Google OAuth consent screen | Deploy to staging, click "Sign in with Google", verify redirect and session creation |
| Password reset email delivery | AUTH-04 | Requires Resend API and real email | Trigger reset, check email inbox, click link, verify password change |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
