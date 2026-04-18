# JobDash

A full-featured, multi-user job application tracker that replaces spreadsheets with a clean, production-grade web app. Track every application from wishlist to offer, log interview experiences, save job descriptions, and get at-a-glance pipeline clarity.

Built on Cloudflare's edge stack for zero hosting cost.

## Features

- **Kanban board** with drag-and-drop between stages (Wishlist, Applied, Screening, Interviewing, Offer)
- **Application detail page** with tabbed views: Overview, Interviews, JD, Docs, Timeline
- **Interview tracking** with round types, Q&A pairs, star ratings, and auto-saving notes
- **Sortable table view** with status filters, search, and mobile card list
- **Glass card aesthetic** with warm cream tones, amber accents, and dark mode support
- **Responsive layout** with icon sidebar on desktop and bottom tab bar on mobile

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TanStack Router, TanStack Query, Zustand |
| Styling | Tailwind CSS v4, shadcn/ui patterns |
| API | Hono on Cloudflare Workers |
| Database | Cloudflare D1 (SQLite) via Drizzle ORM |
| Auth | better-auth (Google OAuth + email/password) |
| Drag & Drop | @hello-pangea/dnd |
| Build | Vite 8 with @cloudflare/vite-plugin |

## Project Structure

```
job-track/
├── src/
│   ├── client/                  # React SPA
│   │   ├── components/
│   │   │   ├── auth/            # Login, signup, reset forms
│   │   │   ├── design-system/   # Button, Badge, Input, Modal, etc.
│   │   │   ├── detail/          # DetailPage, tabs (Overview, Interviews, JD, Docs, Timeline)
│   │   │   ├── kanban/          # KanbanBoard, KanbanCard, KanbanColumn
│   │   │   ├── layout/          # AppShell, Sidebar, Header, BottomTabBar
│   │   │   ├── modals/          # QuickAddModal
│   │   │   └── table/           # ApplicationTable, MobileCardList
│   │   ├── hooks/               # useApplications, useInterviews, useSearch, useTheme
│   │   ├── lib/                 # colors, urgency, auth-client
│   │   └── routes/              # TanStack Router file-based routes
│   ├── server/
│   │   ├── routes/              # Hono API routes (applications, interviews, auth)
│   │   ├── services/            # Business logic with tenant isolation
│   │   └── middleware/          # Auth middleware
│   ├── shared/                  # Constants, Zod validators
│   └── db/
│       ├── schema/              # Drizzle table definitions
│       └── migrations/          # D1 SQL migrations
├── worker/                      # Cloudflare Worker entry point
├── tests/                       # Vitest integration tests (Workers runtime)
└── .planning/                   # GSD project management artifacts
```

## Routes

| Path | View |
|------|------|
| `/board` | Kanban board (home) |
| `/list` | Sortable table with filters |
| `/app/:slug` | Application detail (5 tabs) |
| `/calendar` | Calendar view (planned) |
| `/analytics` | Analytics dashboard (planned) |
| `/settings` | User settings (planned) |

## Development

```bash
# Install dependencies
npm install

# Start dev server (Vite + Wrangler)
npm run dev

# Run tests
npm test

# Type check
npx tsc --noEmit

# Generate Drizzle migration
npx drizzle-kit generate

# Deploy to Cloudflare
npm run deploy
```

## Cloudflare Free Tier

Designed to stay within Cloudflare's free tier:

| Service | Limit |
|---------|-------|
| Workers | 100K requests/day |
| D1 | 5M reads/day, 100K writes/day, 5GB storage |
| KV | 100K reads/day, 1K writes/day |
| R2 | 10GB storage (for future document uploads) |
| Pages | Unlimited static requests |

## Status

Phases 1-5 and 10 complete. Core application tracking, interview logging, and design refresh are built. Remaining phases cover tags/deadlines, JD snapshots, calendar/analytics, and command palette polish.
