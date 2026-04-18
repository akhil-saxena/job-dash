# Roadmap: JobDash

## Overview

JobDash: a multi-user job application tracker on Cloudflare's edge stack. 9 phases from foundation to polish. Auth and API are complete (Phases 1-2). Phase 3 builds the frontend shell with kanban as the home page. Subsequent phases layer on views, interviews, depth features, and analytics. Simplified from original 10-phase plan after design exploration — dashboard page removed (kanban is home), contacts/notifications/bulk actions deferred to v2.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Authentication & Foundation** - Deployed Worker with D1 database, auth (Google OAuth + email/password), and session management
- [x] **Phase 2: Application Tracking API** - Complete CRUD for job applications with status pipeline and auto-generated timeline events
- [ ] **Phase 3: Frontend Shell & Kanban** - React SPA shell with design system, routing, dark mode, kanban home page, responsive layout
- [ ] **Phase 4: Table, Detail & Navigation** - Table/list view, full-page application detail with hero + tabs, search, mobile card list
- [ ] **Phase 5: Interview Tracking & Notes** - Interview round logging with Q&A pairs, markdown notes with auto-save, SVG star ratings
- [ ] **Phase 6: Tags, Deadlines & Company Intelligence** - Custom tags, deadline tracking with urgency tints, company entity with research notes, salary fields
- [ ] **Phase 7: JD Snapshots & Documents** - Job description save/scrape with versioning, document uploads to R2
- [ ] **Phase 8: Calendar & Analytics** - Calendar with Google Calendar sync, analytics dashboard (funnel, sources, response times)
- [ ] **Phase 9: Command Palette & Polish** - Cmd+K palette, optimistic UI, responsive polish, settings page

## Phase Details

### Phase 1: Authentication & Foundation
**Goal**: Users can sign up, log in, and maintain secure sessions on a deployed Cloudflare Worker with a production-ready database schema
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04
**Status**: Complete

### Phase 2: Application Tracking API
**Goal**: Users can create, read, update, and delete job applications through a complete REST API with status pipeline enforcement and automatic timeline event generation
**Depends on**: Phase 1
**Requirements**: TRACK-01, TRACK-02, TRACK-03, TRACK-04, TRACK-05, TRACK-06, TRACK-07, TRACK-08
**Status**: Complete

### Phase 3: Frontend Shell & Kanban
**Goal**: Users see a polished React SPA with kanban as the home page, glass card design system, dark mode, responsive layout, and the core navigation shell
**Depends on**: Phase 2
**Requirements**: VIEW-01, UI-01, UI-02, UI-03, UI-04, UI-06
**Success Criteria** (what must be TRUE):
  1. User lands on kanban board showing applications as glass cards in status columns
  2. Kanban columns fill page width (grid auto-fit), no horizontal scroll
  3. Cards show company badge, role, days, urgency tints (no redundant labels)
  4. Dark mode toggles and auto-detects system preference
  5. Design system components built: Badge, Button, Input, Card, Column Header, Search Bar, Tab Bar
  6. Icon sidebar on desktop (72px), bottom tab bar on mobile
  7. App shell with routing (TanStack Router): Board, List, Calendar, Analytics, Settings + detail page
  8. Quick-add modal for new applications
**Plans**: 3 plans

Plans:
- [x] 03-01-PLAN.md — Design tokens, dark mode, status colors, and 9 design system components
- [x] 03-02-PLAN.md — TanStack Router with auth guards, app shell layout (sidebar, header, bottom tab bar)
- [x] 03-03-PLAN.md — Kanban board with data fetching, urgency tints, mobile layout, quick-add modal

**UI hint**: yes

### Phase 4: Table, Detail & Navigation
**Goal**: Users can view applications in a sortable/filterable table, open any application as a full-page detail view with hero + tabs, and search across all applications
**Depends on**: Phase 3
**Requirements**: VIEW-02, VIEW-04, UI-05
**Success Criteria**:
  1. Desktop: glass table with sortable columns (Company, Role, Status, Priority, Source, Applied, Days)
  2. Mobile: glass card list replacing table
  3. Filter chips (tab/outlined/underline variants) above table
  4. Detail page: sticky hero with status/priority dropdowns + info pills (salary, location, days)
  5. Detail tabs: Overview (two-column), placeholder tabs for Interviews/JD/Docs/Timeline
  6. Optimistic UI on drag-and-drop, status changes, pin/archive
  7. Global search bar with Cmd+K shortcut hint
**Plans**: 3 plans

Plans:
- [x] 04-01-PLAN.md — getBySlug API endpoint, shared optimistic mutation hooks, search store, @hello-pangea/dnd install
- [x] 04-02-PLAN.md — Kanban drag-and-drop, glass table/list view, filter chips, global search with Cmd+K
- [ ] 04-03-PLAN.md — Full-page application detail with sticky hero, tabs, and Overview tab

**UI hint**: yes

### Phase 5: Interview Tracking & Notes
**Goal**: Users can log detailed interview rounds with Q&A pairs, markdown notes, and self-ratings
**Depends on**: Phase 4
**Requirements**: INTV-01, INTV-02, INTV-03, INTV-04, NOTE-01, NOTE-02, NOTE-03
**Success Criteria**:
  1. Accordion round cards with numbered badge, type, date, interviewer, status badge, SVG star rating
  2. Q&A pairs as bordered glass cards inside each round (add/remove)
  3. Markdown support everywhere with hint indicators
  4. Auto-save with "Saving..."/"Saved" indicator
  5. Experience notes and feedback fields per round
  6. Upcoming rounds highlighted with amber border
**Plans**: 3 plans

Plans:
- [x] 05-01-PLAN.md — DB schema (interview_round + interview_qa tables), constants, Zod validators, migration
- [x] 05-02-PLAN.md — Interview CRUD API (service layer + Hono routes + integration tests)
- [x] 05-03-PLAN.md — Frontend InterviewsTab with accordion rounds, Q&A cards, star ratings, auto-save

**UI hint**: yes

### Phase 6: Tags, Deadlines & Company Intelligence
**Goal**: Users can organize with tags, track deadlines with urgency signals, persist company research, and track salary details
**Depends on**: Phase 4
**Requirements**: TAG-01, TAG-02, TAG-03, DEAD-01, DEAD-02, DEAD-03, COMP-01, COMP-02, COMP-03, SAL-01, SAL-02
**Success Criteria**:
  1. Create tags with name + color, assign to applications, filter by tag
  2. Deadlines with urgency: kanban card tints (red=stale, amber=interview, green=offer)
  3. Stale indicator at 7+ days with no status update
  4. Company entity deduplicated by domain, shared research notes
  5. Salary min/max/offered/currency per application
**Plans**: TBD

### Phase 7: JD Snapshots & Documents
**Goal**: Users can save job descriptions as markdown and upload documents per application
**Depends on**: Phase 4
**Requirements**: SNAP-01, SNAP-04, DOC-01, DOC-02, DOC-03
**Success Criteria**:
  1. Paste markdown JD into detail page
  2. Rendered markdown in glass card (JD tab)
  3. Upload files to R2, listed as glass cards (Docs tab)
  5. Upload button expands to drop zone on drag-over
**Plans**: TBD
**UI hint**: yes

### Phase 8: Calendar & Analytics
**Goal**: Users can view interviews/deadlines on a calendar with Google Calendar sync, and analyze their pipeline with charts
**Depends on**: Phase 6
**Requirements**: VIEW-03, VIEW-05, ANLY-01, ANLY-02, ANLY-03, ANLY-04, ANLY-05
**Success Criteria**:
  1. Month grid with interview/deadline events as colored chips
  2. "This Week" list below calendar
  3. Google Calendar sync (read/write, using existing Google OAuth)
  4. Pipeline funnel horizontal bars
  5. Source effectiveness chart
  6. Response time table with green/amber/red cells
  7. Summary stat cards with date range filter
**Plans**: TBD
**UI hint**: yes

### Phase 9: Command Palette & Polish
**Goal**: Users can navigate and act quickly with Cmd+K, and the app is polished for production
**Depends on**: Phase 8
**Requirements**: CMD-01, CMD-02, CMD-03, CMD-04
**Success Criteria**:
  1. Cmd+K opens command palette
  2. Quick add, navigate, status change from palette
  3. Settings page: profile, theme, tags, export
  4. Responsive polish pass across all pages
  5. Error states, empty states, loading states
**Plans**: TBD

## Progress

**Execution Order:**
Phases 1-4 are linear. 5, 6, 7 can partially overlap after 4. 8 depends on 6. 9 is final.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Authentication & Foundation | 4/4 | Complete | 2026-04-16 |
| 2. Application Tracking API | 3/3 | Complete | 2026-04-16 |
| 3. Frontend Shell & Kanban | 0/3 | Planning | - |
| 4. Table, Detail & Navigation | 2/3 | Executing | - |
| 5. Interview Tracking & Notes | 0/3 | Planning | - |
| 6. Tags, Deadlines & Company | 0/0 | Not started | - |
| 7. JD Snapshots & Documents | 0/0 | Not started | - |
| 8. Calendar & Analytics | 0/0 | Not started | - |
| 9. Command Palette & Polish | 0/0 | Not started | - |
| 10. Design Refresh — Board & Detail | 3/3 | Complete    | 2026-04-18 |

### Phase 10: Design Refresh — Board & Detail
**Goal**: Restyle the kanban board view (column layout, card design with richer meta, column header dots + amber count badges, column body gradients, add-card placeholders) and build out all 5 application detail tabs (enhanced Overview with reminder bar + role excerpt, Interviews schedule, JD with fit score + skill grid, Docs with file grid + drag-drop, Timeline with full activity events) to match the two HTML design mockups
**Depends on**: Phase 4
**Requirements**: UI-01, UI-02, UI-03, VIEW-01, VIEW-04
**Plans**: 3 plans

Plans:
- [x] 10-01-PLAN.md — Kanban board restyle: column borders, rich cards, gradient washes, add-card buttons
- [x] 10-02-PLAN.md — Enhanced Overview tab with KV grid, role excerpt, contacts sidebar + Timeline tab
- [x] 10-03-PLAN.md — Interviews, JD, Docs tabs + wire all 5 tabs into DetailPage

**UI hint**: yes
