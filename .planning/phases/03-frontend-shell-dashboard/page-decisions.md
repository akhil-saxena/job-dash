# Page Layout Decisions

**Date:** 2026-04-18
**All pages use glass card aesthetic, Apple system fonts, SVG icons**

## Pages

### Kanban (home page)
- **Layout:** Pure board, no stats strip, no dashboard
- **Columns:** Grid auto-fit, fill page width, no horizontal scroll
- **Card:** BC2 — company badge + name/role + right-aligned days/tags
- **Urgency:** Tint (amber/green/red) = urgency, no redundant text labels. Hint bar with icon only when there's an action
- **Mobile:** Collapsible status sections, priority-ordered (Interviewing first)

### List/Table
- **Layout:** L1 — Glass Table
- **Desktop:** Glass-styled table with sortable columns (Company, Role, Status, Priority, Source, Applied, Days)
- **Mobile:** Glass card list replacing table rows
- **Filters:** Tab-style chips above

### Application Detail
- **Layout:** D1 — Hero + Tabs (full page, not sidebar)
- **Hero:** Variant A — Dropdowns + Info Pills
  - Company name big, role below
  - Status dropdown + priority dropdown right-aligned (always editable)
  - Info pills below: location (icon + "Hybrid · Mountain View"), salary (icon + "$180-240K"), days (icon + "11d")
  - Pin + archive actions
  - NO tags in hero — tags live in Overview tab
  - NO source, applied date in hero — those live in Overview
- **Overview tab:** O1 — Two-Column Grid
  - Fields left (URL, location, salary, equity)
  - Notes right (markdown textarea with "Saved" indicator)
  - Company research below spanning full width
- **Interviews tab:** I1 — Accordion Cards
  - Glass cards, click to expand Q&A body
  - Numbered badge (green=done, amber=scheduled)
  - SVG star ratings (filled/empty, NOT asterisks)
  - Q&A as bordered glass cards inside each round
  - Experience notes + feedback at bottom of expanded round
- **JD Snapshot tab:** J1 — Rendered Glass Card
  - Rendered markdown in glass card (read mode)
  - Edit + Re-scrape buttons
  - Version info
- **Documents tab:** Glass cards per file, upload button expands to drop zone on drag
- **Timeline tab:** Glass card rows, colored dot + text + date

### Calendar
- **Layout:** C1 — Month Grid + List
- **Top:** Full month grid in glass card, events as colored chips on dates
- **Below:** "This Week" and "Upcoming" sections as glass card lists
- **Month/Week toggle**
- **Google Calendar sync indicator**

### Analytics
- **Layout:** A1 — Dashboard Grid
- **Top:** 4 summary stat cards (big numbers)
- **Middle:** Pipeline funnel (left) + source effectiveness (right)
- **Bottom:** Response time table with green/amber/red cells
- **Date filter chips at top**

### Settings
- Profile, theme/currency, tag management, export/delete
- Glass card sections stacked

## Navigation
- **Desktop:** Icon sidebar (72px), 5 items: Board, List, Calendar, Analytics, Settings
- **Mobile:** Bottom tab bar (5 items), no sidebar
- **Detail page:** Full page with back button, not in nav
