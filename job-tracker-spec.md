# JobPilot — Job Application Tracker

## Product Spec v1.0

**Author:** Akhil Saxena
**Date:** April 15, 2026
**Status:** Draft

---

## 1. Vision

A full-featured, multi-user job application tracker that replaces messy spreadsheets with a clean, production-grade web app. Track every application from wishlist to offer, log interview experiences, build a personal question bank, and get insights into your job search pipeline.

---

## 2. Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 15 (App Router) | Full-stack in one project, SSR, API routes, middleware |
| Database | Turso (libSQL) | Free tier: 9GB, SQLite on the edge, low latency |
| ORM | Drizzle ORM | Type-safe queries, clean migrations, reads like SQL |
| Validation | Zod | Shared schemas between frontend forms and API routes |
| Auth | NextAuth.js v5 (Google provider) | Multi-user auth, Drizzle adapter for session storage |
| Rich Text | Tiptap (markdown mode) | WYSIWYG editing, stores as markdown |
| Markdown Render | react-markdown + remark-gfm | Lightweight read-only rendering for previews |
| Drag & Drop | @hello-pangea/dnd | Maintained fork of react-beautiful-dnd |
| Animations | Framer Motion | Micro-interactions, card lifts, toasts |
| Virtualization | @tanstack/virtual | Table view performance with 100+ rows |
| Charts | Recharts | Funnel, heatmap, analytics visualizations |
| Rate Limiting | @upstash/ratelimit + Upstash Redis | Free tier, protects API routes |
| Email | Resend | Free tier (100 emails/day), follow-up reminders |
| Cron | Vercel Cron | Daily reminder jobs |
| Styling | Tailwind CSS 4 | Utility-first, dark mode built-in |
| Deployment | Vercel (Hobby) | Free, edge functions, cron, analytics |
| Command Palette | cmdk | Cmd+K quick actions |

**Total cost: $0/month** on free tiers for small-to-moderate usage (<100 users).

---

## 3. Features

### 3.1 MVP (v1)

#### Core Application Tracking
- Create, edit, archive, and soft-delete job applications
- Fields: company name, company URL, role title, job posting URL, location (remote/hybrid/onsite + city), salary min/max, source, priority, status, notes (markdown)
- Status pipeline: `Wishlist → Applied → Screening → Interviewing → Offer → Accepted → Rejected → Withdrawn`
- Pin/star high-priority applications
- Tags & labels (user-defined, color-coded)
- Archive vs. delete (soft-delete with `deleted_at`, archived apps remain searchable)

#### Job Posting Snapshot
- Save the full job description as markdown when adding an application
- Job postings get taken down — this preserves them for interview prep
- Stored in `application_snapshots` table, versioned (company may update the JD)

#### Interview Round Tracking
- Log each interview round: type, date, duration, interviewer, meeting link
- Round types: Phone Screen, Recruiter Call, Technical, System Design, Behavioral, Hiring Manager, Bar Raiser, Take-Home, Panel, Custom
- Per-round markdown fields: questions asked, your answers, experience notes, feedback received
- Self-rating per round (1-5)
- Status per round: Scheduled, Completed, Cancelled, No-Show

#### Company Research Notes
- Dedicated markdown section per company for Glassdoor reviews, tech stack, culture, funding, red/green flags
- Stored at company level so notes persist across multiple applications to the same company

#### Company Rating
- After an application concludes (accepted/rejected/withdrawn), rate overall experience (1-5 stars)
- Optional written review of the company's hiring process
- Personal company review system that builds over time

#### Salary Research
- Salary expectation fields per application: expected min/max, offered amount, equity, bonus
- Salary comparison view across all applications
- Currency support (INR, USD, EUR, GBP)

#### Deadline & Expiry Tracking
- Deadline types: application close date, offer expiry, recruiter callback expected, custom
- Dashboard widget showing upcoming deadlines sorted by urgency
- Color coding: red (<3 days), yellow (3-7 days), green (>7 days), overdue (flashing red)
- Auto-marks as resolved when the parent application status changes

#### Referral Tracker
- Track who referred you, their contact info, referral status
- Link referrals to contacts and applications
- Track referral follow-ups and outcomes

#### Multiple Board Views
- **Kanban** (default): columns = statuses, drag to change status
- **Table**: sortable, filterable, searchable list view with virtualization
- **Calendar**: interviews and deadlines on a calendar layout
- **Timeline**: Gantt-chart-style view of all applications over time

#### Dark Mode
- System preference detection + manual toggle
- Persisted in user settings

#### Import / Export
- **Import from CSV**: column mapping UI, preview before import
- **Export to CSV/JSON**: full data export, one-click download
- Bulk actions: select multiple apps → archive, tag, change status, delete

### 3.2 v2 (Post-Launch)

- Chrome extension for one-click save from LinkedIn/job boards
- Question bank with tagging (behavioral, DSA, system design, etc.)
- Reusable answer templates (STAR format)
- Pre-interview checklist (auto-generated per round)
- "Questions to ask them" list per application
- Email template generator (follow-up, thank-you, negotiation, withdrawal)
- Calendar sync (Google Calendar push/pull)
- Community questions (opt-in: share anonymized questions per company)
- Weekly/monthly auto-generated reports
- Mobile-optimized list view

---

## 4. Data Model

### 4.1 Entity Relationship

```
users
 ├── has many → applications
 ├── has many → tags
 ├── has many → contacts
 └── has one  → user_settings

applications
 ├── has many → interview_rounds
 ├── has many → application_snapshots
 ├── has many → deadlines
 ├── has many → contacts (via application_contacts)
 ├── has many → timeline_events
 ├── has many → application_form_answers
 ├── has many → documents
 └── has many ↔ tags (via application_tags)

companies (shared across users)
 ├── has many → company_notes (per user)
 └── has many → company_ratings (per user)
```

### 4.2 Schema

```sql
-- =====================
-- AUTH (managed by NextAuth Drizzle adapter)
-- =====================

CREATE TABLE users (
  id            TEXT PRIMARY KEY,
  name          TEXT,
  email         TEXT UNIQUE NOT NULL,
  email_verified INTEGER,
  image         TEXT,
  plan          TEXT DEFAULT 'free',  -- 'free' | 'pro' (future-proofing)
  created_at    INTEGER DEFAULT (unixepoch()),
  updated_at    INTEGER DEFAULT (unixepoch())
);

CREATE TABLE accounts (
  -- NextAuth managed: provider, providerAccountId, access_token, etc.
);

CREATE TABLE sessions (
  -- NextAuth managed: sessionToken, userId, expires
);

-- =====================
-- USER SETTINGS
-- =====================

CREATE TABLE user_settings (
  user_id               TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  theme                 TEXT DEFAULT 'system',  -- 'light' | 'dark' | 'system'
  email_notifications   INTEGER DEFAULT 0,
  notification_time     TEXT DEFAULT '09:00',
  timezone              TEXT DEFAULT 'Asia/Kolkata',
  default_currency      TEXT DEFAULT 'INR',
  kanban_collapsed      TEXT DEFAULT '[]',  -- JSON array of collapsed status columns
  created_at            INTEGER DEFAULT (unixepoch()),
  updated_at            INTEGER DEFAULT (unixepoch())
);

-- =====================
-- COMPANIES (shared, deduped by domain)
-- =====================

CREATE TABLE companies (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  domain        TEXT UNIQUE,
  url           TEXT,
  created_at    INTEGER DEFAULT (unixepoch())
);

CREATE TABLE company_notes (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id    TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  content       TEXT,  -- markdown: glassdoor reviews, tech stack, culture, flags
  updated_at    INTEGER DEFAULT (unixepoch()),
  UNIQUE(user_id, company_id)
);

CREATE TABLE company_ratings (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id    TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  rating        INTEGER CHECK (rating BETWEEN 1 AND 5),
  review        TEXT,  -- markdown
  created_at    INTEGER DEFAULT (unixepoch()),
  UNIQUE(user_id, company_id)
);

-- =====================
-- APPLICATIONS
-- =====================

CREATE TABLE applications (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id      TEXT REFERENCES companies(id),
  role_title      TEXT NOT NULL,
  job_posting_url TEXT,
  location_type   TEXT,  -- 'remote' | 'hybrid' | 'onsite'
  location_city   TEXT,
  salary_min      INTEGER,
  salary_max      INTEGER,
  salary_offered  INTEGER,
  salary_currency TEXT DEFAULT 'INR',
  equity          TEXT,
  bonus           TEXT,
  status          TEXT NOT NULL DEFAULT 'wishlist',
    -- 'wishlist' | 'applied' | 'screening' | 'interviewing'
    -- | 'offer' | 'accepted' | 'rejected' | 'withdrawn'
  priority        TEXT DEFAULT 'medium',  -- 'high' | 'medium' | 'low'
  source          TEXT,  -- 'linkedin' | 'company_site' | 'referral' | 'naukri' | 'indeed' | 'angel_list' | 'other'
  is_pinned       INTEGER DEFAULT 0,
  is_archived     INTEGER DEFAULT 0,
  notes           TEXT,  -- markdown (general notes)
  slug            TEXT NOT NULL,  -- URL-friendly: 'google-sde2'
  applied_at      INTEGER,
  created_at      INTEGER DEFAULT (unixepoch()),
  updated_at      INTEGER DEFAULT (unixepoch()),
  deleted_at      INTEGER,  -- soft delete
  UNIQUE(user_id, slug)
);

CREATE INDEX idx_applications_user_status ON applications(user_id, status)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_applications_user_pinned ON applications(user_id, is_pinned)
  WHERE deleted_at IS NULL;

-- =====================
-- JOB POSTING SNAPSHOTS
-- =====================

CREATE TABLE application_snapshots (
  id              TEXT PRIMARY KEY,
  application_id  TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,  -- markdown: full JD
  version         INTEGER DEFAULT 1,
  captured_at     INTEGER DEFAULT (unixepoch())
);

-- =====================
-- INTERVIEW ROUNDS
-- =====================

CREATE TABLE interview_rounds (
  id                TEXT PRIMARY KEY,
  application_id    TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  user_id           TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  round_number      INTEGER NOT NULL,
  round_type        TEXT NOT NULL,
    -- 'phone_screen' | 'recruiter_call' | 'technical' | 'system_design'
    -- | 'behavioral' | 'hiring_manager' | 'bar_raiser' | 'take_home'
    -- | 'panel' | 'custom'
  custom_type_name  TEXT,  -- if round_type = 'custom'
  scheduled_at      INTEGER,
  duration_minutes  INTEGER DEFAULT 60,
  location          TEXT,  -- office address or meeting link
  status            TEXT DEFAULT 'scheduled',  -- 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  interviewer_name  TEXT,
  interviewer_role  TEXT,
  questions_asked   TEXT,  -- markdown
  my_answers        TEXT,  -- markdown
  experience_notes  TEXT,  -- markdown
  feedback_received TEXT,  -- markdown
  self_rating       INTEGER CHECK (self_rating BETWEEN 1 AND 5),
  created_at        INTEGER DEFAULT (unixepoch()),
  updated_at        INTEGER DEFAULT (unixepoch())
);

CREATE INDEX idx_interview_rounds_app ON interview_rounds(application_id, round_number);

-- =====================
-- DEADLINES
-- =====================

CREATE TABLE deadlines (
  id              TEXT PRIMARY KEY,
  application_id  TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,  -- 'application_close' | 'offer_expiry' | 'follow_up' | 'custom'
  title           TEXT NOT NULL,
  deadline_at     INTEGER NOT NULL,
  is_resolved     INTEGER DEFAULT 0,
  created_at      INTEGER DEFAULT (unixepoch())
);

CREATE INDEX idx_deadlines_user_pending ON deadlines(user_id, deadline_at)
  WHERE is_resolved = 0;

-- =====================
-- CONTACTS
-- =====================

CREATE TABLE contacts (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  role          TEXT,  -- 'recruiter' | 'hiring_manager' | 'referral' | 'peer' | 'other'
  company_id    TEXT REFERENCES companies(id),
  email         TEXT,
  phone         TEXT,
  linkedin_url  TEXT,
  notes         TEXT,  -- markdown
  created_at    INTEGER DEFAULT (unixepoch()),
  updated_at    INTEGER DEFAULT (unixepoch())
);

CREATE TABLE application_contacts (
  application_id  TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  contact_id      TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  relationship    TEXT,  -- 'referrer' | 'interviewer' | 'recruiter' | 'hiring_manager'
  PRIMARY KEY (application_id, contact_id)
);

-- =====================
-- REFERRALS
-- =====================

CREATE TABLE referrals (
  id              TEXT PRIMARY KEY,
  application_id  TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contact_id      TEXT REFERENCES contacts(id),
  referrer_name   TEXT NOT NULL,
  referral_status TEXT DEFAULT 'pending',  -- 'pending' | 'submitted' | 'confirmed' | 'used' | 'expired'
  referred_at     INTEGER,
  notes           TEXT,
  created_at      INTEGER DEFAULT (unixepoch())
);

-- =====================
-- APPLICATION FORM ANSWERS (reusable)
-- =====================

CREATE TABLE application_form_answers (
  id              TEXT PRIMARY KEY,
  application_id  TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_text   TEXT NOT NULL,
  answer_text     TEXT NOT NULL,  -- markdown
  created_at      INTEGER DEFAULT (unixepoch())
);

-- =====================
-- DOCUMENTS
-- =====================

CREATE TABLE documents (
  id              TEXT PRIMARY KEY,
  application_id  TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,  -- 'resume' | 'cover_letter' | 'portfolio' | 'other'
  name            TEXT NOT NULL,
  url             TEXT,
  content         TEXT,  -- markdown (for inline docs)
  created_at      INTEGER DEFAULT (unixepoch())
);

-- =====================
-- TIMELINE EVENTS (auto-generated)
-- =====================

CREATE TABLE timeline_events (
  id              TEXT PRIMARY KEY,
  application_id  TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type      TEXT NOT NULL,
    -- 'status_change' | 'interview_scheduled' | 'interview_completed'
    -- | 'feedback_received' | 'follow_up_sent' | 'deadline_set'
    -- | 'note_added' | 'document_added'
  description     TEXT NOT NULL,
  metadata        TEXT,  -- JSON: { from: 'applied', to: 'interviewing' }
  occurred_at     INTEGER DEFAULT (unixepoch())
);

CREATE INDEX idx_timeline_app ON timeline_events(application_id, occurred_at);

-- =====================
-- TAGS
-- =====================

CREATE TABLE tags (
  id        TEXT PRIMARY KEY,
  user_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name      TEXT NOT NULL,
  color     TEXT DEFAULT '#6B7280',  -- hex color
  UNIQUE(user_id, name)
);

CREATE TABLE application_tags (
  application_id  TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  tag_id          TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (application_id, tag_id)
);

-- =====================
-- NOTIFICATIONS (in-app)
-- =====================

CREATE TABLE notifications (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  application_id  TEXT REFERENCES applications(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,  -- 'follow_up_reminder' | 'deadline_approaching' | 'deadline_overdue'
  title           TEXT NOT NULL,
  message         TEXT,
  is_read         INTEGER DEFAULT 0,
  action_url      TEXT,  -- deep link into the app
  created_at      INTEGER DEFAULT (unixepoch())
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, created_at)
  WHERE is_read = 0;
```

### 4.3 ID Generation

Use `nanoid` for all primary keys — shorter than UUIDs, URL-safe, collision-resistant.

```ts
import { nanoid } from 'nanoid';
const id = nanoid(); // "V1StGXR8_Z5jdHi6B-myT"
```

### 4.4 Slug Generation

Application slugs are auto-generated from company name + role title, used in URLs.

```ts
// "Google" + "Senior SDE" → "google-senior-sde"
// Collision: "google-senior-sde-2"
const generateSlug = (company: string, role: string, existing: string[]) => {
  let base = `${company}-${role}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
  let slug = base;
  let counter = 2;
  while (existing.includes(slug)) {
    slug = `${base}-${counter++}`;
  }
  return slug;
};
```

---

## 5. Page Structure & Routing

```
/                              → Landing page (unauthenticated)
/login                         → Google OAuth sign-in

/dashboard                     → Kanban board (default view)
/dashboard/table               → Table view
/dashboard/calendar            → Calendar view
/dashboard/timeline            → Timeline view

/app/[slug]                    → Application detail (overview tab)
/app/[slug]/interviews         → Interview rounds
/app/[slug]/snapshot           → Job posting snapshot
/app/[slug]/timeline           → Application timeline
/app/[slug]/documents          → Attached documents

/analytics                     → Funnel, response rates, heatmap
/contacts                      → Contact / referral manager
/settings                      → User preferences, tags, export, account deletion
/settings/tags                 → Manage tags
/settings/import               → CSV import
/settings/export               → Data export (CSV/JSON)

/privacy                       → Privacy policy
```

---

## 6. API Routes

All routes prefixed with `/api/`. All require authentication via NextAuth middleware. All enforce `user_id` scoping.

### Applications
```
GET    /api/applications              → List (with filters, pagination, search)
POST   /api/applications              → Create
GET    /api/applications/[id]         → Get detail
PATCH  /api/applications/[id]         → Update (including status change)
DELETE /api/applications/[id]         → Soft delete
PATCH  /api/applications/[id]/archive → Toggle archive
PATCH  /api/applications/[id]/pin     → Toggle pin
POST   /api/applications/bulk         → Bulk action (archive, tag, status, delete)
PATCH  /api/applications/[id]/status  → Status change (creates timeline event)
```

### Interview Rounds
```
GET    /api/applications/[id]/interviews       → List rounds for app
POST   /api/applications/[id]/interviews       → Add round
PATCH  /api/interviews/[id]                    → Update round
DELETE /api/interviews/[id]                    → Delete round
```

### Deadlines
```
GET    /api/deadlines                 → All pending deadlines (dashboard widget)
POST   /api/applications/[id]/deadlines → Create deadline
PATCH  /api/deadlines/[id]            → Update / resolve
DELETE /api/deadlines/[id]            → Delete
```

### Companies
```
GET    /api/companies/search          → Autocomplete search
POST   /api/companies                 → Create (or find existing by domain)
GET    /api/companies/[id]/notes      → Get user's notes for company
PUT    /api/companies/[id]/notes      → Upsert notes
POST   /api/companies/[id]/rating     → Rate company
```

### Contacts & Referrals
```
GET    /api/contacts                  → List user's contacts
POST   /api/contacts                  → Create
PATCH  /api/contacts/[id]             → Update
DELETE /api/contacts/[id]             → Delete
POST   /api/applications/[id]/referral → Add referral
```

### Tags
```
GET    /api/tags                      → List user's tags
POST   /api/tags                      → Create
PATCH  /api/tags/[id]                 → Update (name, color)
DELETE /api/tags/[id]                 → Delete (removes from all apps)
POST   /api/applications/[id]/tags    → Assign tags to app
```

### Timeline
```
GET    /api/applications/[id]/timeline → Timeline events for an app
```

### Snapshots
```
GET    /api/applications/[id]/snapshots → All JD versions
POST   /api/applications/[id]/snapshots → Save JD snapshot
```

### Notifications
```
GET    /api/notifications             → Unread notifications
PATCH  /api/notifications/[id]/read   → Mark as read
POST   /api/notifications/read-all    → Mark all as read
```

### Analytics
```
GET    /api/analytics/funnel          → Status funnel data
GET    /api/analytics/source-rates    → Response rate by source
GET    /api/analytics/response-times  → Time-to-response data
GET    /api/analytics/summary         → Dashboard stats
```

### Data Management
```
POST   /api/import/csv               → Import from CSV
GET    /api/export/csv                → Export all data as CSV
GET    /api/export/json               → Export all data as JSON
DELETE /api/account                   → Delete account + all data (30-day soft delete)
```

### Cron (Vercel Cron, internal)
```
POST   /api/cron/reminders           → Daily: generate follow-up nudge notifications
POST   /api/cron/cleanup             → Weekly: hard-delete 30-day-old soft-deleted accounts
```

---

## 7. Key UI Components

### 7.1 Kanban Board
- Columns = status values, each with a count badge
- Cards show: company initial avatar, company name, role, days in current status, priority dot, nearest deadline (if any), tags
- Drag between columns to change status (optimistic UI + rollback)
- "Rejected" and "Withdrawn" columns collapsed by default
- Filter bar: by tag, source, priority, date range
- Search: full-text across company name, role, notes
- Default: last 30 days, toggle to show archived
- Empty column state: ghost card with helpful CTA

### 7.2 Application Detail (Slide-over Panel)
- Triggered by clicking a kanban card or table row
- Tabs: Overview | Interviews | JD Snapshot | Timeline | Documents
- **Overview**: all fields editable inline, markdown notes with Tiptap editor, company research notes, salary info, tags, contacts, referral
- **Interviews**: chronological list of rounds, each expandable with full markdown fields
- **JD Snapshot**: rendered markdown of saved job description, version history
- **Timeline**: auto-generated event stream with icons per event type
- **Documents**: list of attached resume versions, cover letters, links

### 7.3 Deadline Widget (Dashboard)
- Positioned above or beside the kanban
- Sorted by urgency (nearest first)
- Color-coded badges: red/yellow/green/overdue
- Click → navigates to the application
- "Resolve" button on each item

### 7.4 Analytics Dashboard
- **Funnel chart**: Sankey diagram showing flow from Applied → each subsequent stage → final outcome
- **Source effectiveness**: bar chart of response rate by source (LinkedIn, referral, Naukri, etc.)
- **Time-to-response heatmap**: grid showing avg days to hear back, by company or by stage
- **Summary cards**: total active, interviews this week, offer rate %, avg time in pipeline
- Date range filter on all charts

### 7.5 Command Palette (Cmd+K)
- Quick add: "add [company] [role]" → opens pre-filled form
- Quick navigate: "go [company]" → jumps to application detail
- Quick log: "log interview [company]" → opens interview form
- Quick status: "reject [company]" → changes status
- Search: anything → searches across all applications

### 7.6 Notification Bell
- Badge count of unread notifications
- Dropdown with actionable items
- Each has: icon, title, description, time ago, action button, dismiss
- "Mark all as read" at top

---

## 8. Multi-User Architecture

### 8.1 Tenant Isolation

Every database query MUST include `user_id` filtering. Use a Drizzle helper:

```ts
// lib/db/helpers.ts
import { eq, and } from 'drizzle-orm';

export const forUser = (userId: string) => ({
  applications: eq(schema.applications.userId, userId),
  tags: eq(schema.tags.userId, userId),
  contacts: eq(schema.contacts.userId, userId),
  // ... every table
});

// Usage
const apps = await db.query.applications.findMany({
  where: and(
    forUser(session.user.id).applications,
    eq(schema.applications.status, 'interviewing')
  ),
});
```

### 8.2 Middleware Auth Guard

```ts
// middleware.ts
export { auth as middleware } from '@/lib/auth';

export const config = {
  matcher: ['/dashboard/:path*', '/app/:path*', '/analytics/:path*', '/api/:path*'],
};
```

### 8.3 Rate Limiting

```ts
// lib/ratelimit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(60, '1 m'), // 60 req/min per user
});
```

### 8.4 Shared Resources

The `companies` table is shared across all users (deduplicated by domain). When User A adds "Flipkart", the company record is reused when User B adds Flipkart too. But `company_notes` and `company_ratings` are per-user.

---

## 9. Notifications & Reminders

### 9.1 Follow-Up Nudge Logic

Daily cron job (`/api/cron/reminders`) runs at 8:00 AM UTC:

```
For each user with email_notifications = true:
  1. Find applications WHERE:
     - status = 'applied' AND updated_at < (now - 7 days)
     - status = 'interviewing' AND last interview completed > 3 days ago AND no feedback logged
  2. Find deadlines WHERE:
     - deadline_at < (now + 3 days) AND is_resolved = false
  3. Create notification records in DB
  4. If user has email_notifications enabled:
     - Send single digest email via Resend with all pending items
```

### 9.2 Notification Types
| Type | Trigger | Message |
|------|---------|---------|
| `follow_up_reminder` | No update for 7+ days in "Applied" | "No response from {company} in {N} days — send a follow-up?" |
| `interview_follow_up` | Interview completed 2+ days ago, no thank-you logged | "Send a thank-you note to {interviewer} at {company}?" |
| `deadline_approaching` | Deadline within 3 days | "{company} — {deadline title} in {N} days" |
| `deadline_overdue` | Deadline passed, unresolved | "{company} — {deadline title} was {N} days ago" |

---

## 10. Onboarding & Empty States

### First-Time Flow
1. Google sign-in
2. Welcome screen with 3-step quick start: "Add your first application" (minimal form: company, role, status)
3. Dashboard loads with one card + helpful tooltips pointing to key features
4. Empty states on every view with contextual CTAs

### Empty State Examples
- **Kanban**: ghost cards with pulsing border, "Add your first application" button
- **Analytics**: chart outlines with placeholder data, "Start tracking to see your funnel"
- **Interviews**: "No interviews logged yet — add one from any application"
- **Contacts**: "Add recruiters, hiring managers, and referrals to track your network"

---

## 11. UX Details

### Form Behavior
- **Smart defaults**: auto-suggest round type based on last round, default duration 30/60 min based on type, default status "Scheduled"
- **Inline editing**: click any field on the detail view to edit in place
- **Auto-save**: debounced (500ms) auto-save on all markdown editors, subtle "Saving..." → "Saved" indicator
- **No save buttons on forms**: all changes persist automatically (except destructive actions like delete)

### Optimistic UI
- Kanban drag: update UI immediately, fire API in background, rollback on failure with toast
- Status changes: instant visual feedback, API confirms in background
- Pin/archive: toggle immediately, sync async

### Performance
- Kanban: show last 90 days by default, collapsed columns for Rejected/Withdrawn
- Table: virtualized with @tanstack/virtual for 500+ rows
- Markdown editors: lazy-load Tiptap only when a note field is focused
- Analytics: cache computed stats, revalidate on write (Next.js unstable_cache or SWR)

### Responsive Design
- Desktop-first: kanban is the primary view on laptop/desktop
- Tablet: kanban works but with fewer visible columns
- Mobile: default to table/list view, kanban hidden behind a view toggle

---

## 12. Security & Privacy

### Authentication
- NextAuth with Google OAuth provider
- No email lock — any Google account can sign up
- Session stored in Turso via Drizzle adapter

### Data Protection
- All queries scoped by `user_id` — tenant isolation at query level
- Rate limiting on all API routes (60 req/min per user)
- Input sanitization: markdown content run through DOMPurify before rendering
- No sensitive data in server logs (strip salary, notes, feedback)

### Account Management
- **Data export**: one-click full export (CSV or JSON)
- **Account deletion**: soft-delete with 30-day grace period, then hard delete via cron
- **Privacy page**: transparent about what's stored, where, and data handling

### Environment Variables
```
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
RESEND_API_KEY=
```

---

## 13. Project Structure

```
job-tracker/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx                  (kanban - default)
│   │   │   │   ├── table/page.tsx
│   │   │   │   ├── calendar/page.tsx
│   │   │   │   └── timeline/page.tsx
│   │   │   ├── app/[slug]/
│   │   │   │   ├── page.tsx                  (overview)
│   │   │   │   ├── interviews/page.tsx
│   │   │   │   ├── snapshot/page.tsx
│   │   │   │   ├── timeline/page.tsx
│   │   │   │   └── documents/page.tsx
│   │   │   ├── analytics/page.tsx
│   │   │   ├── contacts/page.tsx
│   │   │   ├── settings/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── tags/page.tsx
│   │   │   │   ├── import/page.tsx
│   │   │   │   └── export/page.tsx
│   │   │   └── layout.tsx                    (sidebar + header + notification bell)
│   │   ├── api/
│   │   │   ├── applications/
│   │   │   │   ├── route.ts                  (GET list, POST create)
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── route.ts              (GET, PATCH, DELETE)
│   │   │   │   │   ├── status/route.ts
│   │   │   │   │   ├── archive/route.ts
│   │   │   │   │   ├── pin/route.ts
│   │   │   │   │   ├── interviews/route.ts
│   │   │   │   │   ├── deadlines/route.ts
│   │   │   │   │   ├── snapshots/route.ts
│   │   │   │   │   ├── timeline/route.ts
│   │   │   │   │   ├── tags/route.ts
│   │   │   │   │   └── referral/route.ts
│   │   │   │   └── bulk/route.ts
│   │   │   ├── interviews/[id]/route.ts
│   │   │   ├── deadlines/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── companies/
│   │   │   │   ├── search/route.ts
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── notes/route.ts
│   │   │   │       └── rating/route.ts
│   │   │   ├── contacts/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── tags/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── notifications/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/read/route.ts
│   │   │   ├── analytics/
│   │   │   │   ├── funnel/route.ts
│   │   │   │   ├── source-rates/route.ts
│   │   │   │   ├── response-times/route.ts
│   │   │   │   └── summary/route.ts
│   │   │   ├── import/csv/route.ts
│   │   │   ├── export/
│   │   │   │   ├── csv/route.ts
│   │   │   │   └── json/route.ts
│   │   │   ├── account/route.ts
│   │   │   └── cron/
│   │   │       ├── reminders/route.ts
│   │   │       └── cleanup/route.ts
│   │   ├── page.tsx                          (landing page)
│   │   ├── privacy/page.tsx
│   │   └── layout.tsx                        (root)
│   ├── components/
│   │   ├── kanban/
│   │   │   ├── Board.tsx
│   │   │   ├── Column.tsx
│   │   │   ├── Card.tsx
│   │   │   └── CardPreview.tsx
│   │   ├── application/
│   │   │   ├── DetailPanel.tsx
│   │   │   ├── ApplicationForm.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── PriorityDot.tsx
│   │   │   └── TagList.tsx
│   │   ├── interview/
│   │   │   ├── RoundCard.tsx
│   │   │   ├── RoundForm.tsx
│   │   │   └── RoundTimeline.tsx
│   │   ├── editor/
│   │   │   ├── MarkdownEditor.tsx            (Tiptap wrapper)
│   │   │   ├── MarkdownPreview.tsx           (react-markdown wrapper)
│   │   │   └── AutoSaveIndicator.tsx
│   │   ├── analytics/
│   │   │   ├── FunnelChart.tsx
│   │   │   ├── SourceBarChart.tsx
│   │   │   ├── ResponseHeatmap.tsx
│   │   │   └── StatCard.tsx
│   │   ├── deadline/
│   │   │   ├── DeadlineWidget.tsx
│   │   │   ├── DeadlineItem.tsx
│   │   │   └── CountdownBadge.tsx
│   │   ├── notifications/
│   │   │   ├── NotificationBell.tsx
│   │   │   └── NotificationDropdown.tsx
│   │   ├── command/
│   │   │   └── CommandPalette.tsx            (cmdk)
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── ViewToggle.tsx
│   │   │   └── ThemeToggle.tsx
│   │   └── ui/                               (shadcn/ui primitives)
│   ├── lib/
│   │   ├── auth.ts                           (NextAuth config)
│   │   ├── db/
│   │   │   ├── index.ts                      (Turso client)
│   │   │   ├── schema.ts                     (Drizzle schema)
│   │   │   ├── helpers.ts                    (forUser, pagination, etc.)
│   │   │   └── migrations/
│   │   ├── validators/
│   │   │   ├── application.ts                (Zod schemas)
│   │   │   ├── interview.ts
│   │   │   ├── deadline.ts
│   │   │   └── shared.ts
│   │   ├── ratelimit.ts
│   │   ├── slug.ts
│   │   ├── timeline.ts                       (event creation helpers)
│   │   ├── notifications.ts                  (nudge logic)
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useApplications.ts                (SWR/React Query)
│   │   ├── useInterviews.ts
│   │   ├── useDeadlines.ts
│   │   ├── useNotifications.ts
│   │   ├── useAutoSave.ts
│   │   └── useCommandPalette.ts
│   └── types/
│       └── index.ts                          (shared TypeScript types)
├── drizzle.config.ts
├── middleware.ts
├── tailwind.config.ts
├── next.config.ts
├── package.json
└── .env.local
```

---

## 14. Status Color System

| Status | Color | Hex | Tailwind |
|--------|-------|-----|----------|
| Wishlist | Gray | #6B7280 | gray-500 |
| Applied | Blue | #3B82F6 | blue-500 |
| Screening | Purple | #8B5CF6 | violet-500 |
| Interviewing | Amber | #F59E0B | amber-500 |
| Offer | Green | #22C55E | green-500 |
| Accepted | Emerald | #10B981 | emerald-500 |
| Rejected | Red | #EF4444 | red-500 |
| Withdrawn | Slate | #64748B | slate-500 |

Used consistently across: kanban column headers, card badges, table row indicators, timeline dots, status dropdowns, and analytics charts.

---

## 15. Implementation Order

### Phase 1: Foundation (Week 1-2)
1. Next.js project setup with Tailwind, TypeScript
2. Turso database + Drizzle schema + migrations
3. NextAuth with Google OAuth + Drizzle adapter
4. Basic CRUD API for applications
5. Kanban board with drag-and-drop
6. Application detail panel with inline editing
7. Markdown editor (Tiptap) for notes

### Phase 2: Core Features (Week 3-4)
8. Interview rounds CRUD + UI
9. Job posting snapshot save/view
10. Tags & labels system
11. Deadline tracking + dashboard widget
12. Company research notes
13. Contact & referral tracking
14. Pin/archive/soft-delete

### Phase 3: Intelligence (Week 5-6)
15. Timeline events (auto-generated on status changes, interviews)
16. Notification system (in-app bell)
17. Follow-up nudge cron job
18. Email digest via Resend
19. Salary tracking fields + comparison view

### Phase 4: Views & Analytics (Week 7-8)
20. Table view with virtualization
21. Calendar view
22. Analytics: funnel chart
23. Analytics: source effectiveness
24. Analytics: response time heatmap
25. Command palette (Cmd+K)
26. Company rating system

### Phase 5: Polish (Week 9-10)
27. Dark mode
28. CSV import with column mapping
29. CSV/JSON export
30. Bulk actions
31. Empty states & onboarding flow
32. Account deletion flow
33. Privacy page
34. Rate limiting + security hardening
35. Responsive design pass
36. Performance optimization (lazy loading, caching)
