# Requirements: JobDash

**Defined:** 2026-04-16
**Updated:** 2026-04-18 after design simplification
**Core Value:** At a glance, the user knows exactly where every application stands and what needs attention today

## v1 Requirements

### Authentication

- [x] **AUTH-01**: User can sign up with email and password
- [x] **AUTH-02**: User can log in with Google OAuth (one-click)
- [x] **AUTH-03**: User session persists across browser refresh
- [x] **AUTH-04**: User can reset password via email link

### Application Tracking

- [x] **TRACK-01**: User can create a job application with company, role, status, priority, location type, location city, salary min/max, currency, source, job posting URL, applied date, and markdown notes
- [x] **TRACK-02**: User can edit any application field inline from the detail page
- [x] **TRACK-03**: User can soft-delete applications (recoverable)
- [x] **TRACK-04**: User can archive applications to declutter the active pipeline
- [x] **TRACK-05**: User can pin/star high-priority applications
- [x] **TRACK-06**: Application status follows the pipeline: Wishlist, Applied, Screening, Interviewing, Offer, Accepted, Rejected, Withdrawn
- [x] **TRACK-07**: User can change application status via drag-and-drop on kanban or from the detail page
- [x] **TRACK-08**: Status changes auto-generate timeline events with timestamp and description

### Views

- [ ] **VIEW-01**: Kanban board as the home/landing page with columns per status, drag-and-drop, card preview (company badge, role, days, urgency tint)
- [ ] **VIEW-02**: Table view with sortable columns, filterable by status/source/priority/tags, full-text search. Mobile: glass card list
- [ ] **VIEW-03**: Calendar view showing scheduled interviews and deadlines in month/week layout with Google Calendar sync
- [ ] **VIEW-04**: Application detail as a full page with sticky hero + tabbed sections (Overview, Interviews, JD, Docs, Timeline)
- [ ] **VIEW-05**: Analytics page with pipeline funnel, source effectiveness, response time table, summary stats

### Interviews

- [ ] **INTV-01**: User can log interview rounds per application with round type (phone screen, recruiter call, technical, system design, behavioral, hiring manager, bar raiser, take-home, panel, custom)
- [ ] **INTV-02**: Each round tracks: scheduled date/time, duration, interviewer name/role, meeting link, status (scheduled/completed/cancelled/no-show)
- [ ] **INTV-03**: Each round has individual Q&A pairs (add/remove) with markdown for questions and answers, plus experience notes and feedback fields
- [ ] **INTV-04**: User can self-rate each round (1-5 SVG stars)

### Company Intelligence

- [ ] **COMP-01**: Company entity persists across applications (deduplicated by domain)
- [ ] **COMP-02**: User can write markdown research notes per company (Glassdoor reviews, tech stack, culture, flags)
- [ ] **COMP-03**: Company notes persist when user applies to multiple roles at the same company

### Job Description Snapshots

- [ ] **SNAP-01**: User can save a job description by pasting markdown text
- [ ] **SNAP-02**: User can save a job description by providing a URL (app auto-scrapes the posting content)
- [ ] **SNAP-03**: Snapshots are versioned (user can re-scrape if JD changes)
- [ ] **SNAP-04**: Saved JD renders as formatted markdown in the detail page

### Tags & Labels

- [ ] **TAG-01**: User can create custom tags with a name and color
- [ ] **TAG-02**: User can assign multiple tags to any application
- [ ] **TAG-03**: User can filter applications by tag across all views

### Deadlines & Staleness

- [ ] **DEAD-01**: User can set deadlines per application (types: application close, offer expiry, follow-up, custom)
- [ ] **DEAD-02**: Kanban cards show urgency via background tint (red=stale, amber=interview, green=offer expiring) — no redundant text labels
- [ ] **DEAD-03**: Applications show stale indicator when no status update for 7+ days

### Salary

- [ ] **SAL-01**: User can track salary expectation (min/max), offered amount, equity, and bonus per application
- [ ] **SAL-02**: User can set currency per application (INR, USD, EUR, GBP)

### Analytics

- [ ] **ANLY-01**: Pipeline funnel chart showing flow from Applied through each stage
- [ ] **ANLY-02**: Source effectiveness bar chart showing response rate by source
- [ ] **ANLY-03**: Response time table showing avg days by company/stage with color coding
- [ ] **ANLY-04**: Summary stat cards (total apps, response rate, avg response time, interview conversion)
- [ ] **ANLY-05**: Date range filter on all analytics

### Command Palette

- [ ] **CMD-01**: Cmd+K opens a command palette for quick actions
- [ ] **CMD-02**: Quick add: type company + role to open pre-filled form
- [ ] **CMD-03**: Quick navigate: search and jump to any application
- [ ] **CMD-04**: Quick status: change application status from palette

### Notes & Markdown

- [ ] **NOTE-01**: Markdown editor for application notes with auto-save (debounced)
- [ ] **NOTE-02**: "Saving..." / "Saved" indicator on all editors
- [ ] **NOTE-03**: Markdown supported everywhere: notes, Q&A answers, company research, JD editing

### Design & Polish

- [ ] **UI-01**: Dark mode with system preference detection and manual toggle
- [ ] **UI-02**: Desktop-first responsive design; mobile-friendly with bottom tab bar
- [ ] **UI-03**: Glass card aesthetic: warm gradient bg, frosted glass surfaces, Apple system fonts
- [ ] **UI-04**: Consistent status color system across all views
- [ ] **UI-05**: Optimistic UI for drag-and-drop, status changes, pin/archive
- [ ] **UI-06**: Reusable design system components (Badge, Button, Input, Card, etc.)

### Documents

- [ ] **DOC-01**: User can upload files per application (resume, cover letter, portfolio)
- [ ] **DOC-02**: Files stored in R2, listed as glass cards in Documents tab
- [ ] **DOC-03**: Upload button expands to drop zone when user drags file over page

## v2 Requirements

Deferred to future release.

### Contacts & Referrals (moved from v1)
- **CONT-01**: Contact management page (recruiters, hiring managers, referrals)
- **CONT-02**: Link contacts to applications with relationship type
- **CONT-03**: Referral tracking with status

### Notifications (moved from v1)
- **NOTF-01**: In-app notification system with bell dropdown
- **NOTF-02**: Auto-generated alerts for deadlines and stale apps

### Bulk Actions (moved from v1)
- **BULK-01**: Multi-select applications in table view
- **BULK-02**: Bulk archive, tag, status change, delete

### Automation
- **AUTO-01**: Follow-up reminder cron job
- **AUTO-02**: Email digest for deadlines
- **AUTO-03**: Auto-resolve deadlines on status change

### Data Portability
- **DATA-01**: CSV import with column mapping
- **DATA-02**: CSV/JSON export

### Other
- **COMP-04**: Company ratings (1-5 stars) — replaced by per-round interview experience rating
- **COMP-05**: Rejection reason, key learnings, "would reapply?" — moved to notes
- **SAL-03**: Salary comparison view across applications
- **DEAD-03-old**: Dashboard deadline widget (dashboard removed)
- **VIEW-08**: Timeline/Gantt view

## Out of Scope

| Feature | Reason |
|---------|--------|
| Separate dashboard page | Kanban IS the home page — dashboard was redundant |
| AI resume builder / ATS optimization | Entire product category |
| Application form autofill | Extremely high complexity |
| AI interview prep | Separate product category |
| Email parsing / Gmail integration | Privacy concerns |
| Real-time collaboration | Massive complexity |
| Job board aggregation | Different product |
| LinkedIn profile optimization | Unrelated |
| Native mobile app | Responsive web sufficient |
| Question bank / templates | v2 feature |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| AUTH-04 | Phase 1 | Complete |
| TRACK-01 | Phase 2 | Complete |
| TRACK-02 | Phase 2 | Complete |
| TRACK-03 | Phase 2 | Complete |
| TRACK-04 | Phase 2 | Complete |
| TRACK-05 | Phase 2 | Complete |
| TRACK-06 | Phase 2 | Complete |
| TRACK-07 | Phase 2 | Complete |
| TRACK-08 | Phase 2 | Complete |
| VIEW-01 | Phase 3 | Pending |
| UI-01 | Phase 3 | Pending |
| UI-02 | Phase 3 | Pending |
| UI-03 | Phase 3 | Pending |
| UI-04 | Phase 3 | Pending |
| UI-06 | Phase 3 | Pending |
| VIEW-02 | Phase 4 | Pending |
| VIEW-04 | Phase 4 | Pending |
| UI-05 | Phase 4 | Pending |
| INTV-01 | Phase 5 | Pending |
| INTV-02 | Phase 5 | Pending |
| INTV-03 | Phase 5 | Pending |
| INTV-04 | Phase 5 | Pending |
| NOTE-01 | Phase 5 | Pending |
| NOTE-02 | Phase 5 | Pending |
| NOTE-03 | Phase 5 | Pending |
| COMP-01 | Phase 6 | Pending |
| COMP-02 | Phase 6 | Pending |
| COMP-03 | Phase 6 | Pending |
| TAG-01 | Phase 6 | Pending |
| TAG-02 | Phase 6 | Pending |
| TAG-03 | Phase 6 | Pending |
| DEAD-01 | Phase 6 | Pending |
| DEAD-02 | Phase 6 | Pending |
| DEAD-03 | Phase 6 | Pending |
| SAL-01 | Phase 6 | Pending |
| SAL-02 | Phase 6 | Pending |
| SNAP-01 | Phase 7 | Pending |
| SNAP-02 | Phase 7 | Pending |
| SNAP-03 | Phase 7 | Pending |
| SNAP-04 | Phase 7 | Pending |
| DOC-01 | Phase 7 | Pending |
| DOC-02 | Phase 7 | Pending |
| DOC-03 | Phase 7 | Pending |
| VIEW-03 | Phase 8 | Pending |
| VIEW-05 | Phase 8 | Pending |
| ANLY-01 | Phase 8 | Pending |
| ANLY-02 | Phase 8 | Pending |
| ANLY-03 | Phase 8 | Pending |
| ANLY-04 | Phase 8 | Pending |
| ANLY-05 | Phase 8 | Pending |
| CMD-01 | Phase 9 | Pending |
| CMD-02 | Phase 9 | Pending |
| CMD-03 | Phase 9 | Pending |
| CMD-04 | Phase 9 | Pending |

**Coverage:**
- v1 requirements: 56 total
- Mapped to phases: 56
- Unmapped: 0

---
*Requirements defined: 2026-04-16*
*Last updated: 2026-04-18 after design simplification (contacts, notifications, bulk actions, salary comparison, dashboard moved to v2)*
