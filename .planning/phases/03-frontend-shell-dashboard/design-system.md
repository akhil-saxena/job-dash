# JobDash Design System

**Date:** 2026-04-18
**Philosophy:** Glass card aesthetic throughout. Reusable components with variant props.

## Atoms

### Badge (unified component)
Used for: status labels, user tags, priority indicators — all one component.
- **Variant: filled** — soft colored background, pill shape (`border-radius: 99px`)
- **Variant: outlined** — border only, no fill, pill shape
- **Variant: dot** — colored dot + plain text, no background
- Props: `color` (any status/tag color), `variant` ('filled' | 'outlined' | 'dot'), `size` ('sm' | 'md')
- No redundant labeling — tint on parent card replaces "stale" badge

### Button
- Shape: `border-radius: 6px`
- **Variant: filled** — dark solid bg (#292524), white text (primary actions)
- **Variant: outline** — border, transparent bg (secondary actions)
- **Variant: ghost** — subtle gray bg, no border (tertiary/cancel)
- Sizes: `sm` (30px), `md` (34px)
- Props: `variant` ('filled' | 'outline' | 'ghost'), `size`, `color` (for destructive = red)

### Input
- **Variant: glass** (default) — subtle border, frosted glass bg, `border-radius: 10px`
- **Variant: raised** — elevated with shadow, bigger feel (prominent forms)
- Textarea: same styles, resizable, markdown hint below
- Focus: ring effect, darker border
- Props: `variant` ('glass' | 'raised'), `label`, `error`, `hint`

### Column Header (kanban)
- **Variant: filled** — subtle bg fill, dot + name + count badge (prominent)
- **Variant: minimal** — uppercase, small, muted — header recedes, cards dominate
- Props: `status`, `count`, `variant` ('filled' | 'minimal')

### Search Bar
- **Variant: glass** — matches input glass style, Cmd+K shortcut badge
- **Variant: raised** — elevated, prominent, shadow
- Props: `variant` ('glass' | 'raised'), `placeholder`

### Filter Chips
- **Variant: tab** — square, subtle bg when active, no border
- **Variant: outlined** — border, darker border + subtle fill when active
- **Variant: underline** — just underline, lightest weight
- Props: `active`, `variant` ('tab' | 'outlined' | 'underline'), `count`

## Composed Components

### Interview Round Card
- **Primary: Accordion card** — glass card, click to expand Q&A body below
  - Number badge (colored circle: green=done, amber=scheduled)
  - Type + date + duration + interviewer
  - Status badge (filled variant)
  - Star rating: use filled/empty star SVG icons (NOT asterisks)
  - Upcoming rounds get amber border accent
- **Alt: Timeline style** — for a more sequential/progress view
  - Vertical line connecting numbered nodes
  - Same info, different spatial layout
- Props: `variant` ('accordion' | 'timeline'), `expanded`

### Q&A Pair
- **Primary: Bordered card** — bordered glass card with Q label + textarea, A label + textarea
  - Markdown hint below each textarea
  - Remove (x) button top-right
  - Numbered (Q1, Q2, Q3...)
- **Alt: Left border indent** — no card wrapper, just left border + content
  - Question bold, answer below, markdown hint
  - Lighter weight, for viewing mode
- Props: `variant` ('card' | 'indent'), `editable`
- "+ Add Question & Answer" button below pairs

### Timeline Event
- **Glass cards** — each event in its own glass card row
  - Colored dot + event text + right-aligned time
  - Consistent with overall glass aesthetic
  - Events: status changes, interviews, documents, pins
- Props: `color` (status color), `text`, `time`

### Document Item
- **Glass cards** — each file in its own glass card
  - Colored icon square (file type SVG) + filename + metadata
  - Hover: subtle lift
  - Download action on click/button
- Props: `type` ('resume' | 'cover_letter' | 'portfolio' | 'other'), `name`, `size`, `date`

### Tab Bar (detail page)
- **Primary: Underline** — active tab gets bottom border + dark text
- **Alt: Background chip** — active tab gets subtle background, no underline
- Both: horizontal scroll on mobile, `scrollbar-width: none`
- Props: `variant` ('underline' | 'chip'), `items[]`, `active`

### Upload Zone
- **Default state: Inline button** — compact icon + "Upload file" text (variant: ghost button)
- **Drag-over state: Expands to drop zone** — on `dragenter`, button transforms into a full dashed-border drop zone with "Drop files here" text. On `dragleave`/`drop`, collapses back to button.
- Implementation: CSS transition on height/padding, JS `dragenter`/`dragleave` listeners
- Props: `accept` (file types), `maxSize`

### Modal
- **Glass card** — frosted glass bg, rounded 14px, shadow
- Centered on desktop, slides up from bottom on mobile (bottom sheet with grab handle)
- Backdrop: semi-transparent dark overlay
- Close: X button + Escape key + backdrop click
- Props: `title`, `open`, `onClose`

### Kanban Card (locked — BC2 no-redundant-labels)
- Company badge (colored initial square) + name/role + right-aligned days/tags
- Urgency: background tint (amber=interview, green=offer, red=stale), NO text labels for tint
- Hint bar: only appears when there's an action (clock icon + interview time, alert icon + deadline)
- Non-urgent cards: compact single row, no hint bar
- Rendering rules:
  - Normal: no tint, no hint, muted days
  - Interview today/tomorrow: amber tint + hint bar with clock icon
  - Interview this week: no tint + hint bar muted
  - Stale 7+d: red tint, red bold days, NO hint bar
  - Offer expiring: green tint + hint bar with alert icon
  - Rejected: 40% opacity, no extras

## Design Tokens

### Colors
- Status: wishlist (#6b7280), applied (#3b82f6), screening (#8b5cf6), interviewing (#f59e0b), offer (#22c55e), accepted (#10b981), rejected (#ef4444), withdrawn (#64748b)
- Surface: dominant (warm gradient #f5f3f0 → #e8e4df), secondary (white at .55-.65 alpha), accent (#292524)
- Text: primary (#1c1917), secondary (#78716c), muted (#a8a29e)
- Tints (card urgency): amber (.06 alpha), green (.06 alpha), red (.05 alpha)

### Typography
- Font: -apple-system, SF Pro stack
- Weights: 400 (body), 600 (labels/headings)
- Sizes: 9-10px (uppercase labels), 11px (small/muted), 12px (secondary), 13px (body), 14px (mobile body), 16-22px (headings)

### Spacing
- Scale: 4, 8, 12, 16, 24, 32px
- Card padding: 8-10px (desktop kanban), 12-14px (mobile)
- Component gaps: 6-8px (kanban columns), 12px (between cards)

### Radius
- 6px (buttons, small elements)
- 8px (kanban cards desktop)
- 10px (inputs, badges, Q&A cards)
- 12px (mobile cards, interview rounds)
- 14px (modals)
- 99px (pills, filter chips)

### Glass Effect
- Background: rgba(255,255,255, .5-.65) — varies by component importance
- Backdrop-filter: blur(10-16px)
- Border: rgba(255,255,255, .5)
- Hover: rgba(255,255,255, .8) + box-shadow: 0 2px 6px rgba(0,0,0,.04)
- Tinted: status color at .05-.06 alpha replaces white bg

### Icons
- Source: Lucide (SVG, stroke-based, 1.8px stroke width)
- Sizes: 12px (inline), 14px (mobile inline), 16-18px (buttons/nav), 20px (sidebar)
- No emojis anywhere — only SVG icons
- Star rating: filled/empty star SVGs (not text asterisks)
