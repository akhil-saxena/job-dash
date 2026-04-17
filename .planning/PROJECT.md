# JobDash

## What This Is

A full-featured, multi-user job application tracker that replaces spreadsheets with a clean, production-grade web app. Track every application from wishlist to offer, log interview experiences, save job descriptions before they disappear, and get at-a-glance pipeline clarity. Built on Cloudflare's edge stack for zero hosting cost.

## Core Value

At a glance, the user knows exactly where every application stands and what needs attention today — nothing falls through the cracks.

## Requirements

### Validated

- ✓ Multi-user auth: Google OAuth + email/password — Phase 1
- ✓ Application CRUD with status pipeline, pin, archive, soft-delete — Phase 2
- ✓ Auto-generated timeline events on status changes — Phase 2

### Active

- [ ] Kanban board as home page with drag-and-drop status changes
- [ ] Table view with sorting, filtering, search (card list on mobile)
- [ ] Full-page application detail with hero + tabs
- [ ] Calendar view with Google Calendar sync
- [ ] Interview round tracking with Q&A pairs, markdown, star ratings
- [ ] JD snapshots — auto-scrape + manual paste, versioned
- [ ] Company research notes (markdown, persisted per company)
- [ ] Document uploads per application (R2 storage)
- [ ] Tags & labels (user-defined, color-coded)
- [ ] Deadline & staleness tracking with urgency card tints
- [ ] Salary tracking (min/max/offered, currency)
- [ ] Analytics: pipeline funnel, source effectiveness, response times
- [ ] Command palette (Cmd+K)
- [ ] Dark mode with system preference detection
- [ ] Glass card design system with reusable components
- [ ] Mobile-responsive with bottom tab bar

### Out of Scope

- Separate dashboard page — kanban IS the home page, dashboard was redundant
- Contacts/referral tracker — contacts noted in application detail instead
- Notifications system — deferred to v2, architecture allows adding later
- Bulk actions — not needed at < 30 applications
- Salary comparison page — salary fields per-app, no dedicated view
- Company ratings — replaced by per-round interview experience rating
- CSV import/export — deferred to v2
- Chrome extension — v2 feature
- Question bank / templates — v2 feature
- Native mobile app — responsive web sufficient
- Real-time collaboration — single-user is fine

## Context

- Replaces an existing Google Sheets + Apps Script implementation that had poor UX
- Built on all-Cloudflare stack: Pages + Workers + D1 + R2 (zero cost)
- Auth (Phase 1) and API (Phase 2) are complete and tested
- Design system defined: glass card aesthetic, warm gradient, Apple system fonts, SVG icons
- Design direction explored through interactive prototyping — all page layouts and components locked
- Starting with clean data slate — no migration from Sheets

## Constraints

- **Cost**: $0/month — must stay within Cloudflare free tiers (D1 5GB, R2 10GB, Workers 100K req/day, KV 100K reads/day)
- **Stack**: All Cloudflare — Pages (frontend), Workers (API), D1 (SQLite database), R2 (file/document storage), KV (sessions, cache)
- **Auth**: Google OAuth + email/password, session-based
- **Frontend**: React SPA on Cloudflare Pages
- **Design**: Minimal-warm aesthetic — clean whitespace, rounded UI elements, pastel accents, dark mode support

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| All-Cloudflare stack over Next.js/Vercel | User has CF account, zero cost, edge performance, single ecosystem | — Pending |
| Smart dashboard as default view (not kanban) | User needs add + update + review equally; dashboard routes to all three | — Pending |
| Multi-user from day one | Deliberate choice — not retrofitting auth later | — Pending |
| Google OAuth + email/password auth | OAuth for convenience, email/password as universal fallback | — Pending |
| No data migration from Sheets | Starting fresh — avoids migration complexity | — Pending |
| JD auto-scrape + manual paste | Postings get taken down; both capture methods needed | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-16 after initialization*
