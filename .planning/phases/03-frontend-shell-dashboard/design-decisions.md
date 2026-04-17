# Phase 3 — Design Decisions (from prototype exploration)

**Date:** 2026-04-16
**Updated:** After simplification pass

## Visual Direction

**Chosen:** Glass Bento — frosted glass cards on warm gradient, icon sidebar, Apple system fonts

## Simplified Feature Set

### Core (build these)
- **Kanban** — home page, columns by status, glass cards, collapsible stats strip at top
- **Table/list view** — desktop table, mobile card list
- **Application detail** — full page, hybrid layout (hero + tabs)
- **Interview rounds** — expandable cards, individual Q&A pairs, markdown everywhere
- **JD snapshots** — auto-scrape + manual paste, versioned
- **Document uploads** — resume, cover letter per application (R2 storage)
- **Tags + search** — user-defined colored tags, full-text search
- **Analytics** — pipeline funnel, source effectiveness, response stats
- **Calendar** — real calendar with events, Google Calendar sync (since user signs in with Google)
- **Command palette (Cmd+K)** — quick search, navigate, add
- **Dark mode** — system detection + manual toggle

### Cut (don't build)
- **Separate dashboard page** — kanban IS the dashboard with stats strip
- **Contacts/referral tracker** — contacts go in application notes/detail instead
- **Notifications system** — skipped for now, architecture allows adding later
- **Bulk actions** — not needed at < 30 applications
- **Salary comparison page** — salary fields stay per-application, no dedicated view
- **Company ratings** — replaced by interview experience rating per round (already exists)

### Rethought
- **Dashboard → Kanban home** with collapsible stats strip (Active, Interviews, Response Rate, Avg Days)
- **Calendar → Real calendar** with Google Calendar sync (user already authenticates with Google OAuth)
- **Company ratings → Interview experience** per round (self-rating 1-5 stars already in Q&A)
- **Contacts → Inline** — relevant contacts listed in application detail notes

## Shell

**Chosen:** Icon sidebar (72px) + Glass aesthetic
- Icon sidebar with tooltips on hover
- Mobile: bottom tab bar (5 items: Home/Board/List/Cal/Stats)
- Header: title + date, search + Cmd+K, add button, dark mode toggle, avatar

## Pages (simplified nav)

| Sidebar Icon | Page | Description |
|---|---|---|
| Grid | Kanban (home) | Pipeline columns + stats strip |
| List | Table | Desktop table / mobile cards |
| Calendar | Calendar | Month grid + Google Calendar sync |
| Chart | Analytics | Funnel, sources, response stats |
| Settings | Settings | Profile, tags, theme, export |

**Removed from nav:** Dashboard (merged into kanban), Contacts (inline)

## Kanban Home Page

- Collapsible stats strip at top: Active Apps, Interviews This Week, Response Rate, Avg Pipeline
- Below: kanban columns filling page width (grid auto-fit, no horizontal scroll)
- Columns: Wishlist, Applied, Screening, Interviewing, Offer, Rejected (collapsed/dimmed)
- Cards show: company, role, priority dot, days in status, tags, stale badge

## Application Detail (full page)

- Hero: company name, role, location, status dropdown, pin, archive
- Meta row: priority, source, applied date, salary, days, tags
- Tabs: Overview, Interviews, JD Snapshot, Documents, Timeline
- All text fields support markdown with hint
- Interview rounds: individual Q&A pairs (add/remove), experience notes, self-rating

## Table View

- Desktop: full table with sortable columns
- Mobile (< 768px): stacked glass cards replacing table rows
- Search + filter chips above

## Calendar

- Month grid with interview/deadline events on dates
- Upcoming list below
- Google Calendar sync (read/write)
- Add events directly

## Analytics

- Pipeline funnel (horizontal bars)
- Source effectiveness (bar chart with response rates)
- Summary stats (total, response rate, avg response time, interview conversion)
