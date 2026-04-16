# Requirements: JobDash

**Defined:** 2026-04-16
**Core Value:** At a glance, the user knows exactly where every application stands and what needs attention today

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication

- [x] **AUTH-01**: User can sign up with email and password
- [x] **AUTH-02**: User can log in with Google OAuth (one-click)
- [x] **AUTH-03**: User session persists across browser refresh
- [x] **AUTH-04**: User can reset password via email link

### Application Tracking

- [ ] **TRACK-01**: User can create a job application with company, role, status, priority, location type, location city, salary min/max, currency, source, job posting URL, applied date, and markdown notes
- [ ] **TRACK-02**: User can edit any application field inline from the detail panel
- [ ] **TRACK-03**: User can soft-delete applications (recoverable)
- [ ] **TRACK-04**: User can archive applications to declutter the active pipeline
- [ ] **TRACK-05**: User can pin/star high-priority applications
- [ ] **TRACK-06**: Application status follows the pipeline: Wishlist, Applied, Screening, Interviewing, Offer, Accepted, Rejected, Withdrawn
- [ ] **TRACK-07**: User can change application status via drag-and-drop on kanban or from the detail panel
- [ ] **TRACK-08**: Status changes auto-generate timeline events with timestamp and description

### Views

- [ ] **VIEW-01**: Smart dashboard as the default landing view with summary cards (total active, interviews this week, offer rate, avg days in pipeline)
- [ ] **VIEW-02**: Dashboard shows stale application warnings (no update in 7+ days) and upcoming interviews
- [ ] **VIEW-03**: Dashboard provides quick-add and quick-action buttons
- [ ] **VIEW-04**: Kanban board with columns per status, drag-and-drop to change status, card preview (company, role, days in status, priority, deadline, tags)
- [ ] **VIEW-05**: Table view with sortable columns, filterable by status/source/priority/tags/date range, full-text search across company/role/notes
- [ ] **VIEW-06**: Calendar view showing scheduled interviews and deadlines in month/week layout
- [ ] **VIEW-07**: Application detail panel (slide-over or page) with tabs: Overview, Interviews, JD Snapshot, Timeline, Documents

### Interviews

- [ ] **INTV-01**: User can log interview rounds per application with round type (phone screen, recruiter call, technical, system design, behavioral, hiring manager, bar raiser, take-home, panel, custom)
- [ ] **INTV-02**: Each round tracks: scheduled date/time, duration, interviewer name/role, meeting link, status (scheduled/completed/cancelled/no-show)
- [ ] **INTV-03**: Each round has markdown fields for questions asked, user's answers, experience notes, and feedback received
- [ ] **INTV-04**: User can self-rate each round (1-5 stars)

### Company Intelligence

- [ ] **COMP-01**: Company entity persists across applications (deduplicated by domain)
- [ ] **COMP-02**: User can write markdown research notes per company (Glassdoor reviews, tech stack, culture, red/green flags)
- [ ] **COMP-03**: Company notes persist when user applies to multiple roles at the same company
- [ ] **COMP-04**: User can rate a company (1-5 stars) and write a review after an application concludes
- [ ] **COMP-05**: User can record rejection reason, key learnings, and "would reapply?" flag per concluded application

### Job Description Snapshots

- [ ] **SNAP-01**: User can save a job description by pasting markdown text
- [ ] **SNAP-02**: User can save a job description by providing a URL (app auto-scrapes the posting content)
- [ ] **SNAP-03**: Snapshots are versioned (user can re-scrape if JD changes)
- [ ] **SNAP-04**: Saved JD renders as formatted markdown in the detail panel

### Contacts & Referrals

- [ ] **CONT-01**: User can create contacts with name, role (recruiter/hiring manager/referral/peer), company, email, phone, LinkedIn URL, and notes
- [ ] **CONT-02**: User can link contacts to specific applications with a relationship type (referrer, interviewer, recruiter, hiring manager)
- [ ] **CONT-03**: User can track referrals per application with referrer, referral status (pending/submitted/confirmed/used/expired), and notes

### Tags & Labels

- [ ] **TAG-01**: User can create custom tags with a name and color
- [ ] **TAG-02**: User can assign multiple tags to any application
- [ ] **TAG-03**: User can filter applications by tag across all views

### Deadlines & Staleness

- [ ] **DEAD-01**: User can set deadlines per application (types: application close, offer expiry, follow-up, custom)
- [ ] **DEAD-02**: Deadlines display urgency color coding: red (<3 days), yellow (3-7 days), green (>7 days), overdue (flashing/pulsing)
- [ ] **DEAD-03**: Dashboard deadline widget shows upcoming deadlines sorted by urgency
- [ ] **DEAD-04**: Applications show a "stale" indicator when no status update for 7+ days in active statuses

### Salary

- [ ] **SAL-01**: User can track salary expectation (min/max), offered amount, equity, and bonus per application
- [ ] **SAL-02**: User can set currency per application (INR, USD, EUR, GBP)
- [ ] **SAL-03**: User can view a salary comparison across all applications

### Analytics

- [ ] **ANLY-01**: Funnel/Sankey chart showing flow from Applied through each stage to final outcome
- [ ] **ANLY-02**: Source effectiveness bar chart showing response rate by source (LinkedIn, referral, company site, etc.)
- [ ] **ANLY-03**: Response time heatmap showing avg days to hear back by company or by stage
- [ ] **ANLY-04**: Summary stat cards (total active, interviews this week, offer rate %, avg time in pipeline)
- [ ] **ANLY-05**: Date range filter on all analytics charts

### Notifications

- [ ] **NOTF-01**: Notification bell in header with unread count badge
- [ ] **NOTF-02**: Notification dropdown with actionable items (icon, title, description, time ago, action button, dismiss)
- [ ] **NOTF-03**: "Mark all as read" action
- [ ] **NOTF-04**: Notifications generated for: deadline approaching (<3 days), deadline overdue, stale application (7+ days no update)

### Command Palette

- [ ] **CMD-01**: Cmd+K opens a command palette for quick actions
- [ ] **CMD-02**: Quick add: type company + role to open pre-filled form
- [ ] **CMD-03**: Quick navigate: search and jump to any application
- [ ] **CMD-04**: Quick status: change application status from palette

### Bulk Actions

- [ ] **BULK-01**: User can multi-select applications in table view
- [ ] **BULK-02**: Bulk actions available: archive, tag, change status, delete

### Notes

- [ ] **NOTE-01**: Markdown editor (WYSIWYG) for application notes with auto-save (debounced)
- [ ] **NOTE-02**: "Saving..." / "Saved" indicator on all editors

### Design & Polish

- [ ] **UI-01**: Dark mode with system preference detection and manual toggle
- [ ] **UI-02**: Desktop-first responsive design; mobile-friendly for quick capture
- [ ] **UI-03**: Minimal-warm aesthetic: clean whitespace, rounded elements, sharp typography, soft pastel accents
- [ ] **UI-04**: Consistent status color system across all views (kanban columns, badges, table indicators, timeline dots, analytics charts)
- [ ] **UI-05**: Optimistic UI for drag-and-drop, status changes, pin/archive (instant feedback, background sync, rollback on failure)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Automation

- **AUTO-01**: Follow-up reminder cron job (nudge after 7+ days in Applied with no update)
- **AUTO-02**: Email digest for pending deadlines and stale applications
- **AUTO-03**: Auto-resolve deadlines when parent application status changes

### Data Portability

- **DATA-01**: CSV import with column mapping UI and preview
- **DATA-02**: CSV export of all applications and interview rounds
- **DATA-03**: JSON export for full data fidelity

### Additional Views

- **VIEW-08**: Timeline/Gantt view of all applications over time

### Account Management

- **ACCT-01**: Account deletion with 30-day soft-delete grace period
- **ACCT-02**: Privacy policy page

### Browser Extension

- **EXT-01**: Chrome extension for one-click save from job boards

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| AI resume builder / ATS optimization | Entire product category; competitors charge $29/mo for this alone |
| Application form autofill | Extremely high complexity; requires ATS compatibility maintenance |
| AI interview prep / mock interviews | Separate product category; dilutes core tracking value |
| Email parsing / Gmail integration | Privacy concerns; unreliable parsing; email access is sensitive |
| Real-time collaboration | Massive complexity (websockets, conflict resolution); single-user-at-a-time is fine |
| Calendar sync (Google Calendar) | Complex bidirectional sync; v2 candidate at best |
| Job board aggregation / search | Different product entirely; focus on tracking not discovery |
| LinkedIn profile optimization | Requires LinkedIn API; unrelated to application tracking |
| Native mobile app | Responsive web is sufficient for the mobile use case |
| Question bank / reusable answer templates | v2 feature; not core to pipeline tracking |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| AUTH-04 | Phase 1 | Complete |
| TRACK-01 | Phase 2 | Pending |
| TRACK-02 | Phase 2 | Pending |
| TRACK-03 | Phase 2 | Pending |
| TRACK-04 | Phase 2 | Pending |
| TRACK-05 | Phase 2 | Pending |
| TRACK-06 | Phase 2 | Pending |
| TRACK-07 | Phase 2 | Pending |
| TRACK-08 | Phase 2 | Pending |
| VIEW-01 | Phase 3 | Pending |
| VIEW-02 | Phase 3 | Pending |
| VIEW-03 | Phase 3 | Pending |
| VIEW-04 | Phase 4 | Pending |
| VIEW-05 | Phase 4 | Pending |
| VIEW-06 | Phase 4 | Pending |
| VIEW-07 | Phase 4 | Pending |
| INTV-01 | Phase 5 | Pending |
| INTV-02 | Phase 5 | Pending |
| INTV-03 | Phase 5 | Pending |
| INTV-04 | Phase 5 | Pending |
| COMP-01 | Phase 6 | Pending |
| COMP-02 | Phase 6 | Pending |
| COMP-03 | Phase 6 | Pending |
| COMP-04 | Phase 6 | Pending |
| COMP-05 | Phase 6 | Pending |
| CONT-01 | Phase 6 | Pending |
| CONT-02 | Phase 6 | Pending |
| CONT-03 | Phase 6 | Pending |
| TAG-01 | Phase 7 | Pending |
| TAG-02 | Phase 7 | Pending |
| TAG-03 | Phase 7 | Pending |
| DEAD-01 | Phase 7 | Pending |
| DEAD-02 | Phase 7 | Pending |
| DEAD-03 | Phase 7 | Pending |
| DEAD-04 | Phase 7 | Pending |
| SAL-01 | Phase 7 | Pending |
| SAL-02 | Phase 7 | Pending |
| SAL-03 | Phase 7 | Pending |
| SNAP-01 | Phase 8 | Pending |
| SNAP-02 | Phase 8 | Pending |
| SNAP-03 | Phase 8 | Pending |
| SNAP-04 | Phase 8 | Pending |
| BULK-01 | Phase 8 | Pending |
| BULK-02 | Phase 8 | Pending |
| ANLY-01 | Phase 9 | Pending |
| ANLY-02 | Phase 9 | Pending |
| ANLY-03 | Phase 9 | Pending |
| ANLY-04 | Phase 9 | Pending |
| ANLY-05 | Phase 9 | Pending |
| NOTF-01 | Phase 10 | Pending |
| NOTF-02 | Phase 10 | Pending |
| NOTF-03 | Phase 10 | Pending |
| NOTF-04 | Phase 10 | Pending |
| CMD-01 | Phase 10 | Pending |
| CMD-02 | Phase 10 | Pending |
| CMD-03 | Phase 10 | Pending |
| CMD-04 | Phase 10 | Pending |
| NOTE-01 | Phase 5 | Pending |
| NOTE-02 | Phase 5 | Pending |
| UI-01 | Phase 3 | Pending |
| UI-02 | Phase 3 | Pending |
| UI-03 | Phase 3 | Pending |
| UI-04 | Phase 3 | Pending |
| UI-05 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 67 total
- Mapped to phases: 67
- Unmapped: 0

---
*Requirements defined: 2026-04-16*
*Last updated: 2026-04-16 after roadmap creation*
