# Roadmap: JobDash

## Overview

JobDash goes from zero to a complete multi-user job application tracker in 10 phases. The foundation (auth, database, Worker runtime) ships first to resolve Cloudflare free-tier risks early. The core application tracking API follows, then the frontend shell with dashboard, then the remaining views. Once users can see and interact with their pipeline, depth features layer on progressively: interviews, company intelligence, tags/deadlines/salary, JD snapshots, analytics, and finally notifications and the command palette. Each phase delivers a coherent, testable capability.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Authentication & Foundation** - Deployed Worker with D1 database, auth (Google OAuth + email/password), and session management
- [ ] **Phase 2: Application Tracking API** - Complete CRUD for job applications with status pipeline and auto-generated timeline events
- [ ] **Phase 3: Frontend Shell & Dashboard** - React SPA shell with layout, routing, dark mode, responsive base, and smart dashboard landing view
- [ ] **Phase 4: Kanban, Table & Detail Views** - Kanban board with drag-and-drop, table view with sort/filter/search, calendar view, and application detail panel
- [ ] **Phase 5: Interview Tracking & Notes** - Interview round logging with full detail fields and WYSIWYG markdown notes with auto-save
- [ ] **Phase 6: Company Intelligence & Contacts** - Company entity with research notes and ratings, contact manager, and referral tracking
- [ ] **Phase 7: Tags, Deadlines & Salary** - Custom tags with filtering, deadline tracking with urgency signals, and salary comparison
- [ ] **Phase 8: JD Snapshots & Bulk Actions** - Job description save/scrape with versioning, and multi-select bulk operations
- [ ] **Phase 9: Analytics** - Funnel/Sankey chart, source effectiveness, response heatmap, summary stats, and date filtering
- [ ] **Phase 10: Notifications & Command Palette** - In-app notification system with bell dropdown, and Cmd+K command palette for quick actions

## Phase Details

### Phase 1: Authentication & Foundation
**Goal**: Users can sign up, log in, and maintain secure sessions on a deployed Cloudflare Worker with a production-ready database schema
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04
**Success Criteria** (what must be TRUE):
  1. User can create an account with email and password and land on an authenticated page
  2. User can sign in with Google OAuth in one click and land on an authenticated page
  3. User session survives browser refresh without re-login
  4. User can trigger a password reset email and set a new password
  5. Unauthenticated requests to API endpoints return 401
**Plans**: 4 plans

Plans:
- [x] 01-01-PLAN.md — Project scaffold: Vite 8 + React 19 + Hono + Cloudflare Worker + D1 + Tailwind + Biome
- [x] 01-02-PLAN.md — Server-side auth: Drizzle schema, better-auth factory, auth routes, middleware, email helper
- [x] 01-03-PLAN.md — Client-side auth: React auth pages (login, signup, reset), auth client, placeholder dashboard
- [x] 01-04-PLAN.md — Test infrastructure: vitest + integration tests + end-to-end verification checkpoint

### Phase 2: Application Tracking API
**Goal**: Users can create, read, update, and delete job applications through a complete REST API with status pipeline enforcement and automatic timeline event generation
**Depends on**: Phase 1
**Requirements**: TRACK-01, TRACK-02, TRACK-03, TRACK-04, TRACK-05, TRACK-06, TRACK-07, TRACK-08
**Success Criteria** (what must be TRUE):
  1. User can create an application with all fields (company, role, status, priority, location, salary, source, URL, date, notes) via API
  2. User can update any application field and the change persists
  3. User can soft-delete an application and recover it; user can archive an application to remove it from active pipeline
  4. Application status transitions follow the defined pipeline (Wishlist through Withdrawn) and every status change auto-generates a timestamped timeline event
  5. User can pin/star applications and the flag persists across sessions
**Plans**: TBD

Plans:
- [ ] 02-01: TBD
- [ ] 02-02: TBD

### Phase 3: Frontend Shell & Dashboard
**Goal**: Users see a polished React SPA with the smart dashboard as their landing view, giving at-a-glance pipeline clarity with summary cards, warnings, and quick actions
**Depends on**: Phase 2
**Requirements**: VIEW-01, VIEW-02, VIEW-03, UI-01, UI-02, UI-03, UI-04
**Success Criteria** (what must be TRUE):
  1. User lands on a smart dashboard showing summary cards (total active, interviews this week, offer rate, avg days in pipeline)
  2. Dashboard highlights stale applications (no update in 7+ days) and upcoming interviews
  3. Dashboard provides quick-add and quick-action buttons that open pre-filled forms
  4. User can toggle dark mode manually and it auto-detects system preference on first visit
  5. Layout renders cleanly on both desktop and mobile with the minimal-warm aesthetic (whitespace, rounded elements, sharp typography, pastel accents, consistent status colors)
**Plans**: TBD
**UI hint**: yes

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD

### Phase 4: Kanban, Table & Detail Views
**Goal**: Users can interact with their application pipeline through kanban drag-and-drop, a sortable/filterable table, a calendar of interviews/deadlines, and a comprehensive detail panel
**Depends on**: Phase 3
**Requirements**: VIEW-04, VIEW-05, VIEW-06, VIEW-07, UI-05
**Success Criteria** (what must be TRUE):
  1. User can view applications as a kanban board with columns per status, drag a card to a new column, and see the status change reflected immediately (optimistic UI with rollback on failure)
  2. User can view applications in a table with sortable columns, filter by status/source/priority/tags/date range, and full-text search across company/role/notes
  3. User can view a calendar showing scheduled interviews and deadlines in month/week layout
  4. User can open an application detail panel (slide-over or page) with tabs for Overview, Interviews, JD Snapshot, Timeline, and Documents
**Plans**: TBD
**UI hint**: yes

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

### Phase 5: Interview Tracking & Notes
**Goal**: Users can log detailed interview rounds per application and write rich markdown notes with auto-save
**Depends on**: Phase 4
**Requirements**: INTV-01, INTV-02, INTV-03, INTV-04, NOTE-01, NOTE-02
**Success Criteria** (what must be TRUE):
  1. User can add interview rounds to an application, selecting from round types (phone screen, recruiter call, technical, system design, behavioral, hiring manager, bar raiser, take-home, panel, custom)
  2. Each round tracks scheduled date/time, duration, interviewer name/role, meeting link, and status (scheduled/completed/cancelled/no-show)
  3. User can write markdown in each round for questions asked, answers given, experience notes, and feedback received
  4. User can self-rate each interview round on a 1-5 star scale
  5. Markdown notes editor shows "Saving..." / "Saved" indicator and auto-saves on debounced input
**Plans**: TBD
**UI hint**: yes

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD

### Phase 6: Company Intelligence & Contacts
**Goal**: Users build persistent company knowledge that carries across applications, and manage contacts (recruiters, hiring managers, referrals) linked to specific applications
**Depends on**: Phase 4
**Requirements**: COMP-01, COMP-02, COMP-03, COMP-04, COMP-05, CONT-01, CONT-02, CONT-03
**Success Criteria** (what must be TRUE):
  1. Company entity is deduplicated by domain -- applying to multiple roles at the same company shares one company record
  2. User can write and view markdown research notes per company (Glassdoor reviews, tech stack, culture, flags) that persist across applications
  3. User can rate a company (1-5 stars) and write a review after an application concludes, and record rejection reason, key learnings, and "would reapply?" flag
  4. User can create contacts with name, role type, company, email, phone, LinkedIn URL, and notes
  5. User can link contacts to applications with relationship type (referrer, interviewer, recruiter, hiring manager) and track referral status
**Plans**: TBD
**UI hint**: yes

Plans:
- [ ] 06-01: TBD
- [ ] 06-02: TBD

### Phase 7: Tags, Deadlines & Salary
**Goal**: Users can organize applications with custom tags, track deadlines with urgency signals, and compare salary data across applications
**Depends on**: Phase 4
**Requirements**: TAG-01, TAG-02, TAG-03, DEAD-01, DEAD-02, DEAD-03, DEAD-04, SAL-01, SAL-02, SAL-03
**Success Criteria** (what must be TRUE):
  1. User can create custom tags with name and color, assign multiple tags to any application, and filter by tag across all views
  2. User can set deadlines per application (application close, offer expiry, follow-up, custom) and deadlines display urgency color coding (red <3d, yellow 3-7d, green >7d, overdue pulsing)
  3. Dashboard deadline widget shows upcoming deadlines sorted by urgency
  4. Applications show a "stale" indicator when no status update for 7+ days in active statuses
  5. User can track salary expectation (min/max), offered amount, equity, bonus, and currency per application, and view a salary comparison across all applications
**Plans**: TBD
**UI hint**: yes

Plans:
- [ ] 07-01: TBD
- [ ] 07-02: TBD

### Phase 8: JD Snapshots & Bulk Actions
**Goal**: Users can preserve job descriptions before postings disappear (via paste or URL scrape) and perform bulk operations on multiple applications at once
**Depends on**: Phase 4
**Requirements**: SNAP-01, SNAP-02, SNAP-03, SNAP-04, BULK-01, BULK-02
**Success Criteria** (what must be TRUE):
  1. User can save a job description by pasting markdown text, and it renders as formatted markdown in the detail panel
  2. User can save a job description by providing a URL and the app auto-scrapes the posting content
  3. JD snapshots are versioned -- user can re-scrape if the posting changes and see previous versions
  4. User can multi-select applications in table view and apply bulk actions (archive, tag, change status, delete)
**Plans**: TBD
**UI hint**: yes

Plans:
- [ ] 08-01: TBD
- [ ] 08-02: TBD

### Phase 9: Analytics
**Goal**: Users can visualize their job search pipeline performance with charts, heatmaps, and summary statistics to identify what is working and what is not
**Depends on**: Phase 7
**Requirements**: ANLY-01, ANLY-02, ANLY-03, ANLY-04, ANLY-05
**Success Criteria** (what must be TRUE):
  1. User can view a funnel/Sankey chart showing application flow from Applied through each stage to final outcome
  2. User can view a source effectiveness bar chart showing response rate by source (LinkedIn, referral, company site, etc.)
  3. User can view a response time heatmap showing average days to hear back by company or by stage
  4. Summary stat cards display total active, interviews this week, offer rate %, and avg time in pipeline
  5. All analytics charts support date range filtering
**Plans**: TBD
**UI hint**: yes

Plans:
- [ ] 09-01: TBD
- [ ] 09-02: TBD

### Phase 10: Notifications & Command Palette
**Goal**: Users receive timely alerts about deadlines and stale applications, and can navigate/act quickly via keyboard-driven command palette
**Depends on**: Phase 7
**Requirements**: NOTF-01, NOTF-02, NOTF-03, NOTF-04, CMD-01, CMD-02, CMD-03, CMD-04
**Success Criteria** (what must be TRUE):
  1. Notification bell in header shows unread count badge; dropdown displays actionable items with icon, title, description, time ago, action button, and dismiss
  2. "Mark all as read" clears all notifications in one action
  3. Notifications auto-generate for deadline approaching (<3 days), deadline overdue, and stale application (7+ days no update)
  4. Cmd+K opens a command palette where user can quick-add an application, search and jump to any application, or change an application's status
**Plans**: TBD
**UI hint**: yes

Plans:
- [ ] 10-01: TBD
- [ ] 10-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5/6/7/8 (5-8 can partially overlap after 4) -> 9 -> 10

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Authentication & Foundation | 0/4 | Planning complete | - |
| 2. Application Tracking API | 0/0 | Not started | - |
| 3. Frontend Shell & Dashboard | 0/0 | Not started | - |
| 4. Kanban, Table & Detail Views | 0/0 | Not started | - |
| 5. Interview Tracking & Notes | 0/0 | Not started | - |
| 6. Company Intelligence & Contacts | 0/0 | Not started | - |
| 7. Tags, Deadlines & Salary | 0/0 | Not started | - |
| 8. JD Snapshots & Bulk Actions | 0/0 | Not started | - |
| 9. Analytics | 0/0 | Not started | - |
| 10. Notifications & Command Palette | 0/0 | Not started | - |
