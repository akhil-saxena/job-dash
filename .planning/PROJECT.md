# JobDash

## What This Is

A full-featured, multi-user job application tracker that replaces spreadsheets with a clean, production-grade web app. Track every application from wishlist to offer, log interview experiences, save job descriptions before they disappear, and get at-a-glance pipeline clarity. Built on Cloudflare's edge stack for zero hosting cost.

## Core Value

At a glance, the user knows exactly where every application stands and what needs attention today — nothing falls through the cracks.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Smart dashboard landing view with summary cards and quick actions
- [ ] Kanban board with drag-and-drop status changes
- [ ] Table view with sorting, filtering, and search
- [ ] Calendar view for interviews and deadlines
- [ ] Timeline view for application history
- [ ] Application CRUD with full detail panel (company, role, salary, status, priority, source, notes)
- [ ] Status pipeline: Wishlist → Applied → Screening → Interviewing → Offer → Accepted → Rejected → Withdrawn
- [ ] Interview round tracking (type, date, interviewer, questions, answers, self-rating, feedback)
- [ ] Job description snapshots — auto-scrape from URL + manual paste, versioned
- [ ] Company research notes (markdown, persisted per company across applications)
- [ ] Company ratings (1-5 stars + written review after application concludes)
- [ ] Deadline & expiry tracking with urgency color coding
- [ ] Referral tracking linked to contacts and applications
- [ ] Contact manager (recruiters, hiring managers, referrals)
- [ ] Tags & labels (user-defined, color-coded)
- [ ] Pin/star high-priority applications
- [ ] Archive and soft-delete
- [ ] Salary tracking (min/max/offered, currency support, comparison view)
- [ ] Auto-generated timeline events (status changes, interviews, feedback)
- [ ] In-app notification system with bell dropdown
- [ ] Follow-up nudge reminders (cron-driven)
- [ ] Email digest for pending deadlines and stale applications
- [ ] Analytics: funnel/Sankey chart, source effectiveness, response heatmap, summary stats
- [ ] Command palette (Cmd+K) for quick actions and navigation
- [ ] Multi-user auth: Google OAuth + email/password
- [ ] Dark mode with system preference detection
- [ ] CSV import with column mapping
- [ ] CSV/JSON data export
- [ ] Bulk actions (archive, tag, status change, delete)
- [ ] Markdown editor for notes (WYSIWYG with auto-save)
- [ ] Mobile-responsive design for quick capture on phone

### Out of Scope

- Chrome extension for one-click save from LinkedIn — v2 feature, high complexity
- Question bank / reusable answer templates — v2 feature
- Pre-interview checklist generation — v2 feature
- Email template generator — v2 feature
- Calendar sync (Google Calendar push/pull) — v2 feature
- Community questions (anonymized sharing) — v2 feature
- Native mobile app — web responsive is sufficient
- Real-time collaboration — single-user-at-a-time is fine

## Context

- Replaces an existing Google Sheets + Apps Script implementation (in `src/`) that had functional parity for basic tracking but poor UX — clunky forms, no drag-and-drop, not visually clean
- The original web app spec (`job-tracker-spec.md`) was written for Next.js + Turso + Vercel — now pivoting to all-Cloudflare for zero cost and ecosystem simplicity
- User has an existing Cloudflare account, so deployment and configuration are familiar
- Starting with a clean data slate — no migration from Sheets needed
- Design goal: Linear's minimal structure + Todoist's warm approachability (whitespace, sharp typography, rounded elements, soft colors)

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
