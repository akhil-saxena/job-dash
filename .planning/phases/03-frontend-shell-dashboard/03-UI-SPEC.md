---
phase: 3
slug: frontend-shell-kanban
status: approved
shadcn_initialized: false
design_system: hand-rolled
updated: 2026-04-18
---

# Phase 3: Frontend Shell & Kanban — UI Design Contract

**Created:** 2026-04-16
**Updated:** 2026-04-18 after design exploration
**Status:** Approved

## Design Philosophy

Glass card aesthetic throughout. Warm gradient backgrounds, frosted glass surfaces, Apple system fonts. Minimal chrome — the content IS the interface. No emojis anywhere, SVG icons only.

## Design Tokens

### Typography
- Primary: `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', system-ui, sans-serif`
- Mono: `'SF Mono', 'Menlo', 'Monaco', monospace`
- Weights: 400 (body), 600 (labels/headings) — 2 weights only
- Sizes: 9-10px (uppercase labels), 11px (small), 12px (secondary), 13px (body), 14px (mobile body), 18-22px (headings)

### Colors

**Surface (60/30/10):**
- Dominant 60%: warm gradient `linear-gradient(145deg, #f5f3f0, #ece8e3, #e8e4df)`
- Secondary 30%: `rgba(255,255,255, .55-.65)` (glass cards)
- Accent 10%: `#292524` (buttons, active indicators)

**Text:**
- Primary: `#1c1917`
- Secondary: `#78716c`
- Muted: `#a8a29e`
- On accent: `#ffffff`

**Status:**
| Status | Color | Badge BG (light) |
|--------|-------|-------------------|
| Wishlist | `#6b7280` | `rgba(107,114,128,.12)` |
| Applied | `#3b82f6` | `rgba(59,130,246,.12)` |
| Screening | `#8b5cf6` | `rgba(139,92,246,.12)` |
| Interviewing | `#f59e0b` | `rgba(245,158,11,.12)` |
| Offer | `#22c55e` | `rgba(34,197,94,.12)` |
| Accepted | `#10b981` | `rgba(16,185,129,.12)` |
| Rejected | `#ef4444` | `rgba(239,68,68,.12)` |
| Withdrawn | `#64748b` | `rgba(100,116,139,.12)` |

**Card Urgency Tints:**
- Amber (interview today): `rgba(245,158,11,.06)` bg + `rgba(245,158,11,.15)` border
- Green (offer expiring): `rgba(34,197,94,.06)` bg + `rgba(34,197,94,.15)` border
- Red (stale): `rgba(239,68,68,.05)` bg + `rgba(239,68,68,.12)` border

### Glass Effect
```css
background: rgba(255,255,255, .55);
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
border: 1px solid rgba(255,255,255, .5);
border-radius: 10px;
/* Hover: */
background: rgba(255,255,255, .8);
box-shadow: 0 2px 6px rgba(0,0,0, .04);
```

### Spacing Scale
4, 8, 12, 16, 24, 32px

### Border Radius
- 6px: buttons, small elements
- 8px: kanban cards (desktop)
- 10px: inputs, badges, Q&A cards
- 12px: cards (mobile), interview rounds
- 14px: modals
- 99px: pills, filter chips

### Icons
- Source: Lucide (SVG, stroke-based)
- Stroke width: 1.8px
- Sizes: 12px (inline), 14px (mobile inline), 16-18px (buttons), 20px (sidebar)
- Star ratings: filled/empty SVG polygons (gold `#f59e0b` filled, `#d6d3d1` outlined)

## Components

### Badge
Unified component for status labels, user tags, priority indicators.
- `filled`: soft colored bg, pill `border-radius: 99px`
- `outlined`: border only, no fill, pill
- `dot`: colored dot + plain text, no background
- Props: `color`, `variant ('filled' | 'outlined' | 'dot')`, `size ('sm' | 'md')`

### Button
- `filled`: `#292524` bg, white text (primary actions)
- `outline`: border, transparent bg (secondary)
- `ghost`: `rgba(0,0,0,.04)` bg, no border (tertiary)
- Radius: 6px. Sizes: sm 30px, md 34px
- Props: `variant`, `size`, `color` (for destructive)

### Input
- `glass`: subtle border, frosted bg, radius 10px
- `raised`: elevated with shadow
- Textarea: same styles, resizable, markdown hint below
- Props: `variant`, `label`, `error`, `hint`

### Column Header
- `filled`: subtle bg fill, colored dot + name + count badge
- `minimal`: uppercase, muted, small
- Props: `status`, `count`, `variant`

### Search Bar
- `glass`: border, frosted bg, Cmd+K shortcut badge
- `raised`: elevated with shadow
- Props: `variant`, `placeholder`

### Filter Chips
- `tab`: square, subtle bg active
- `outlined`: border, darker when active
- `underline`: just underline
- Props: `active`, `variant`, `count`

### Tab Bar
- `underline`: bottom border + dark text (primary)
- `chip`: subtle background (alt)
- Horizontal scroll on mobile (`scrollbar-width: none`)

### Kanban Card (BC2)
- Company badge (colored initial, 24px desktop, 36px mobile)
- Main row: badge + company/role (mid) + days/tags (right)
- Urgency: background tint, NO redundant text labels
- Hint bar: appears below main row only when actionable (clock icon + time, alert icon + deadline)
- Card rendering rules:

| Condition | Tint | Hint Bar | Days |
|-----------|------|----------|------|
| Normal | None | None | Muted gray |
| Interview today/tomorrow | Amber | Clock + time | Normal |
| Interview this week | None | Clock + day (muted) | Normal |
| Stale 7+d | Red | None (tint says it) | Red bold |
| Offer expiring | Green | Alert + date | Normal |
| Rejected | None | None | 40% opacity |

### Interview Round Card
Accordion glass card.
- Header: numbered badge + type + date + interviewer + status badge + SVG stars
- Body: Q&A pairs + experience notes + feedback
- Upcoming: amber border accent
- Props: `variant ('accordion' | 'timeline')`, `expanded`

### Q&A Pair
- `card`: bordered glass card, Q/A labels, add/remove, markdown hint
- `indent`: left border, no wrapper (view mode)
- Props: `variant`, `editable`

### Timeline Event
Glass card row: colored dot + text + right-aligned date

### Document Item
Glass card: colored icon square + filename + metadata

### Upload Zone
Default: ghost button with upload icon + "Upload file" text.
Drag-over: expands to full dashed drop zone. Collapses back on drop/leave.

### Modal
Glass card centered (desktop). Bottom sheet slide-up with grab handle (mobile).

## Page Layouts

### Navigation
- **Desktop sidebar:** 72px icon rail, tooltips on hover. Items: Board, List, Calendar, Analytics, Settings
- **Mobile:** 58px bottom tab bar. Items: Board, List, Cal, Stats, More
- **Detail:** full page with back button, not in navigation

### Kanban (home page)
- Pure board, no stats strip
- Columns: `display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr))`
- Column headers: filled variant
- Mobile: collapsible status sections ordered by priority (Interviewing first)

### List/Table
- Desktop: glass table with sortable column headers
- Filter chips (tab style) + search bar above
- Mobile < 768px: table hidden, glass card list shown instead

### Application Detail
**Hero (sticky):** Dropdowns + Info Pills
- Company name (22px), role (14px) left
- Status dropdown + priority dropdown + pin star + archive button right
- Info pills row: location icon + text, salary icon + text, days icon + text
- No tags, source, applied date in hero

**Tabs:** Underline style — Overview, Interviews (N), JD, Docs (N), Timeline

**Overview:** Two-column grid. Fields left, notes right, company research full-width below.

**Interviews:** Accordion cards. SVG star ratings. Q&A bordered cards inside. Add round button.

**JD Snapshot:** Rendered markdown glass card. Edit/Re-scrape buttons. Version info.

**Documents:** Glass cards per file. Upload button → drop zone on drag.

**Timeline:** Glass card event rows.

### Calendar
- Month grid glass card with event chips on dates. Today highlighted.
- Below: "This Week" glass card list with colored left bars
- Month/Week toggle. Google Calendar sync badge.

### Analytics
- Date filter chips (30d / 90d / All time)
- 4 stat cards (big numbers) in a row
- Pipeline funnel (left) + source effectiveness (right) — horizontal CSS bars
- Response time table with green/amber/red cells

### Settings
- Stacked glass card sections: Profile, Appearance, Tags, Data

## Dark Mode
- Trigger: `class="dark"` on `<html>`, Tailwind v4 `@custom-variant dark`
- Detect: `prefers-color-scheme` media query on first visit
- Toggle: manual in header, persisted to localStorage
- Surfaces: `#18181b` dominant, `#27272a` cards, `#f4f4f5` accent
- Glass: same alpha approach on dark surfaces

## Responsive
- `> 768px`: desktop — sidebar, full tables, multi-column
- `≤ 768px`: tablet — kanban 2-col, card list, single-column detail
- `≤ 480px`: phone — kanban 1-col, simplified, bottom bar, horizontal tab scroll

## Copywriting

| Element | Text |
|---------|------|
| Primary CTA | "+ Add Application" (header), "+ Add" (mobile) |
| Quick-add modal title | "Add Application" |
| Quick-add submit | "Add Application" |
| Quick-add cancel | "Discard" |
| Add round | "+ Add Round" |
| Add Q&A | "+ Add Question & Answer" |
| Upload button | "Upload" |
| Upload drop zone | "Drop files here" |
| Empty kanban | "No applications yet. Add your first one." |
| Empty interviews | "No rounds logged yet." |
| Error fetch | "Something went wrong. Try again." |
| Markdown hint | `**bold** *italic* - lists \`code\`` |

---
*Phase 3 UI-SPEC — approved 2026-04-18 after iterative design exploration*
