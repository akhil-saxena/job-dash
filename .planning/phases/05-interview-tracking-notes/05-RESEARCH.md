# Phase 5: Interview Tracking & Notes - Research

**Researched:** 2026-04-18
**Domain:** Database schema design, CRUD API (Hono), React UI with TanStack Query, auto-save, markdown editing
**Confidence:** HIGH

## Summary

Phase 5 adds interview round tracking per application (INTV-01 through INTV-04) and a markdown notes system with auto-save (NOTE-01 through NOTE-03). The database needs two new tables: `interview_round` (one-to-many with `application`) and `interview_qa` (one-to-many with `interview_round`). The API layer follows the established Hono pattern from `src/server/routes/applications.ts` -- a separate `interviewRoutes` module with Zod-validated endpoints. The frontend replaces the existing static `InterviewsTab.tsx` (which already has design tokens and layout from Phase 10) with a data-driven component backed by TanStack Query hooks.

The auto-save pattern already exists in `OverviewTab.tsx` via `useDebouncedMutate` -- a debounced mutation with "Saving..."/"Saved" indicators. This exact pattern should be reused for all markdown text fields (experience notes, feedback, Q&A answers). Star ratings are pure SVG with click handling -- no library needed.

**Primary recommendation:** Use separate `interview_round` and `interview_qa` tables (not JSON columns) for Q&A pairs, following the established relational pattern. Extend the existing `useDebouncedMutate` pattern for all auto-save fields. Build the InterviewsTab as an accordion of round cards, each expandable to show Q&A pairs, notes, and rating.

## Project Constraints (from CLAUDE.md)

- Cost: $0/month -- must stay within Cloudflare free tiers (D1 5GB, R2 10GB, Workers 100K req/day)
- Stack: Cloudflare Workers (Hono API), D1 (SQLite via Drizzle ORM), React 19 SPA
- Auth: Session-based via better-auth, userId available via `c.get("userId")` in Hono context
- Design: Minimal-warm aesthetic, glass cards, amber accents, dark mode
- Frontend: shadcn/ui components, Tailwind CSS v4, TanStack Router + TanStack Query
- Validation: Zod v3 schemas shared between API and frontend
- ORM: Drizzle ORM v0.45 with SQLite dialect
- IDs: nanoid for all primary keys
- Timestamps: INTEGER (Unix epoch seconds) with `sql\`(unixepoch())\`` default
- Linting: Biome
- Git commits: No Co-Authored-By line for Claude

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INTV-01 | Log interview rounds per application with round type (phone screen, recruiter call, technical, system design, behavioral, hiring manager, bar raiser, take-home, panel, custom) | New `interview_round` table with `round_type` TEXT column constrained by `INTERVIEW_ROUND_TYPES` constant; API POST/PATCH/DELETE endpoints |
| INTV-02 | Each round tracks: scheduled date/time, duration, interviewer name/role, meeting link, status (scheduled/completed/cancelled/no-show) | Columns on `interview_round` table: `scheduled_at` (timestamp), `duration_minutes` (integer), `interviewer_name`, `interviewer_role`, `meeting_link`, `status` TEXT |
| INTV-03 | Each round has individual Q&A pairs (add/remove) with markdown for questions and answers, plus experience notes and feedback fields | Separate `interview_qa` table (foreign key to round); `experience_notes` and `feedback` TEXT columns on `interview_round` |
| INTV-04 | User can self-rate each round (1-5 SVG stars) | `rating` INTEGER column (1-5, nullable) on `interview_round`; SVG star component with click/hover handling |
| NOTE-01 | Markdown editor for application notes with auto-save (debounced) | Reuse existing `useDebouncedMutate` from OverviewTab; textarea with markdown hint |
| NOTE-02 | "Saving..."/"Saved" indicator on all editors | Pattern already exists in OverviewTab -- extend to all editable text fields in InterviewsTab |
| NOTE-03 | Markdown supported everywhere: notes, Q&A answers, company research, JD editing | Markdown rendering via simple regex-based renderer or a lightweight library; hint indicators on all textarea fields |
</phase_requirements>

## Standard Stack

### Core (already installed -- no new packages needed for Phase 5)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| Drizzle ORM | 0.45.2 | Database schema + queries for new tables | Installed |
| Hono | 4.12.14 | API route handlers for interview CRUD | Installed |
| @hono/zod-validator | 0.5.0 | Request validation middleware | Installed |
| Zod | 3.25.76 | Schema validation (shared) | Installed |
| TanStack Query | 5.99.0 | Data fetching/mutation hooks | Installed |
| React | 19.2.4 | UI components | Installed |
| lucide-react | 1.8.0 | Icons (Star, Plus, Trash2, ChevronDown, etc.) | Installed |
| nanoid | 5.1.9 | ID generation | Installed |

### Optional (evaluate during implementation)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-markdown | 10.x | Markdown rendering | If simple regex is insufficient; adds ~15kB. Consider only if NOTE-03 demands rich rendering |
| @tiptap/react | 3.22.x | Rich text editor | Listed in CLAUDE.md stack but NOT needed for Phase 5. Phase 5 uses plain textarea with markdown hints. Tiptap is for future WYSIWYG upgrade |

**No new npm installs required for Phase 5.** All dependencies are already in package.json. Markdown rendering for Phase 5 can start with a lightweight `renderMarkdown` utility (bold, italic, code, lists) using regex. Full markdown rendering (react-markdown or Tiptap) is deferred until NOTE-03 scope is confirmed to need it.

## Architecture Patterns

### Database Schema Design

```
interview_round
  - id: TEXT PK (nanoid)
  - application_id: TEXT FK -> application.id ON DELETE CASCADE
  - user_id: TEXT FK -> user.id ON DELETE CASCADE
  - round_number: INTEGER NOT NULL (auto-assigned: count of rounds + 1)
  - round_type: TEXT NOT NULL (phone_screen, recruiter_call, technical, system_design, behavioral, hiring_manager, bar_raiser, take_home, panel, custom)
  - custom_type_name: TEXT (only when round_type = 'custom')
  - scheduled_at: INTEGER (timestamp, nullable -- upcoming rounds have this)
  - duration_minutes: INTEGER DEFAULT 60
  - interviewer_name: TEXT
  - interviewer_role: TEXT
  - meeting_link: TEXT
  - status: TEXT NOT NULL DEFAULT 'scheduled' (scheduled, completed, cancelled, no_show)
  - rating: INTEGER (1-5, nullable)
  - experience_notes: TEXT (markdown)
  - feedback: TEXT (markdown)
  - sort_order: INTEGER NOT NULL DEFAULT 0 (for manual reordering later)
  - created_at: INTEGER DEFAULT (unixepoch())
  - updated_at: INTEGER DEFAULT (unixepoch())

  INDEXES:
    - idx_interview_round_app ON (application_id, sort_order)
    - idx_interview_round_user ON (user_id)
    - idx_interview_round_scheduled ON (application_id, scheduled_at) -- for upcoming rounds query

interview_qa
  - id: TEXT PK (nanoid)
  - round_id: TEXT FK -> interview_round.id ON DELETE CASCADE
  - user_id: TEXT FK -> user.id ON DELETE CASCADE
  - question: TEXT NOT NULL
  - answer: TEXT (markdown, nullable -- user may not have answered yet)
  - sort_order: INTEGER NOT NULL DEFAULT 0
  - created_at: INTEGER DEFAULT (unixepoch())
  - updated_at: INTEGER DEFAULT (unixepoch())

  INDEXES:
    - idx_interview_qa_round ON (round_id, sort_order)
```

**Why separate tables (not JSON columns):**
1. D1 is SQLite -- no native JSON query operators. Searching/filtering Q&A pairs would require full-text parsing.
2. Individual Q&A pairs need independent auto-save -- updating one pair should not overwrite others (race condition with JSON column).
3. Adding/removing pairs is cleaner with INSERT/DELETE than JSON array manipulation.
4. Relational approach matches the existing `application` -> `timeline_event` pattern in the codebase.

**Why user_id on both tables:**
Tenant isolation -- every query includes `userId` filtering (matching existing `baseConditions` pattern in `application.ts` service). This prevents cross-user data leaks even if a round_id is guessed.

### Recommended Project Structure
```
src/
  db/
    schema/
      application.ts    # existing
      auth.ts           # existing
      interview.ts      # NEW: interview_round + interview_qa tables
      index.ts          # ADD: export * from "./interview"
  server/
    routes/
      applications.ts   # existing
      interviews.ts     # NEW: interview CRUD routes
    services/
      application.ts    # existing
      interview.ts      # NEW: interview service functions
  shared/
    constants.ts        # EXTEND: INTERVIEW_ROUND_TYPES, INTERVIEW_STATUSES
    validators/
      application.ts    # existing
      interview.ts      # NEW: Zod schemas for interview/QA
  client/
    hooks/
      useInterviews.ts  # NEW: TanStack Query hooks for interviews
    components/
      detail/
        InterviewsTab.tsx  # REPLACE: swap static data for real data
        InterviewRoundCard.tsx  # NEW: accordion round card
        QACard.tsx              # NEW: Q&A pair card
        StarRating.tsx          # NEW: SVG star rating component
        SaveIndicator.tsx       # NEW: reusable "Saving..."/"Saved" widget
```

### Pattern 1: API Route Structure (following existing applications.ts pattern)
**What:** Hono route module with `app.onError` handler, Zod validation, and service layer separation
**When to use:** All new API endpoints

The existing pattern is:
1. Routes file imports service functions and validators
2. Each route extracts `userId` via `c.get("userId")`, creates DB via `createDb(c.env.DB)`
3. Calls service function, wraps result in `success()` or `paginated()`
4. Error handler catches `AppError` subclasses

New interview routes should be nested under applications:
```
POST   /api/applications/:appId/interviews          -- create round
GET    /api/applications/:appId/interviews          -- list rounds + QA pairs
PATCH  /api/interviews/:roundId                     -- update round fields
DELETE /api/interviews/:roundId                     -- delete round
POST   /api/interviews/:roundId/qa                  -- add Q&A pair
PATCH  /api/interview-qa/:qaId                      -- update Q&A pair
DELETE /api/interview-qa/:qaId                      -- delete Q&A pair
```

NOTE: Use flat paths for update/delete operations on rounds and QA (e.g., `/api/interviews/:roundId` not `/api/applications/:appId/interviews/:roundId`) to avoid Hono trie router issues noted in Phase 4 decisions. The `appId` is verified through the service layer via the round's `application_id` + `user_id`.

### Pattern 2: Auto-Save with Debounced Mutations
**What:** Debounce user input, show "Saving..."/"Saved" indicator, optimistic local state
**When to use:** All editable text fields (notes, Q&A answers, experience notes, feedback)

Existing implementation in `OverviewTab.tsx`:
```typescript
function useDebouncedMutate(
  mutate: (fields: Record<string, unknown>) => void,
  delay = 800,
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debouncedMutate = useCallback(
    (fields: Record<string, unknown>) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => mutate(fields), delay);
    },
    [mutate, delay],
  );
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);
  return debouncedMutate;
}
```

This should be extracted to a shared hook file (`src/client/hooks/useDebouncedMutate.ts`) and reused across:
- Application notes (OverviewTab -- already uses it)
- Interview experience notes
- Interview feedback
- Q&A answer fields

### Pattern 3: Accordion Round Cards
**What:** Each interview round is a collapsible card showing summary when collapsed, full detail when expanded
**When to use:** InterviewsTab layout

Structure:
- **Collapsed:** Numbered badge + round type + date + interviewer + status badge + star rating (read-only)
- **Expanded:** All collapsed content + editable fields (interviewer, meeting link, duration) + Q&A pairs (add/remove) + experience notes textarea + feedback textarea + editable star rating
- **Upcoming highlight:** Rounds with `status === "scheduled"` and `scheduled_at > now` get amber border (matching existing `isNext` pattern in static InterviewsTab)

### Pattern 4: Star Rating Component
**What:** 1-5 clickable SVG stars for self-rating
**When to use:** Each interview round card

Implementation approach:
- 5 SVG star icons from lucide-react (`Star`)
- Filled stars (amber fill) for rated values, outline for empty
- Click to set rating, click same star to clear
- Hover preview with lighter amber fill
- Read-only mode (no hover/click) for collapsed accordion view

### Anti-Patterns to Avoid
- **JSON column for Q&A pairs:** Causes race conditions with concurrent auto-save, makes individual pair updates impossible without read-modify-write
- **Single large PATCH endpoint:** Don't make one endpoint that accepts both round fields AND Q&A changes. Keep round updates and QA CRUD as separate endpoints for clean auto-save
- **Fetching interviews with every application list query:** Interview data should only be fetched on the detail page, not in the kanban/table list API. Use a separate query key
- **Full Tiptap integration in Phase 5:** The CLAUDE.md lists Tiptap but it's massive setup. Phase 5 needs textarea + markdown hints only. WYSIWYG is a future enhancement

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| IDs | Custom UUID/increment logic | `nanoid()` (already used everywhere) | Consistent with existing schema, collision-resistant |
| Timestamps | Date string parsing | Drizzle `integer("x", { mode: "timestamp" })` + `sql\`(unixepoch())\`` | Matches existing D-13 convention |
| Request validation | Manual field checking | `@hono/zod-validator` + shared Zod schemas | Consistent with existing pattern, type-safe |
| Debounced save | Custom debounce logic | Extract existing `useDebouncedMutate` to shared hook | Already proven in OverviewTab, handles cleanup |
| Toast notifications | Custom notification system | Existing `useToast` from `src/client/components/ui/Toast.tsx` | Already used by all mutation hooks |
| Error handling | Try-catch in routes | `AppError` subclasses + `app.onError` handler | Consistent with existing error pattern |
| Star icons | Custom SVG path drawing | `lucide-react` Star icon with fill prop | Already installed, consistent icon set |

## Common Pitfalls

### Pitfall 1: Hono Trie Router Path Conflicts
**What goes wrong:** Nested dynamic path segments like `/api/applications/:appId/interviews/:roundId` can conflict with other `/api/applications/:id` routes in Hono's trie router
**Why it happens:** Documented in Phase 4 decision: "Used /api/application-by-slug/:slug instead of /api/applications/by-slug/:slug to avoid Hono trie router crash"
**How to avoid:** Use flat paths for round/QA mutations: `/api/interviews/:roundId` and `/api/interview-qa/:qaId`. Only nest for create/list operations where the parent resource ID is required: `/api/applications/:appId/interviews`
**Warning signs:** 500 errors or wrong route matching on Workers runtime (may work locally but fail in production)

### Pitfall 2: Missing Tenant Isolation on Sub-Resources
**What goes wrong:** Interview rounds and QA pairs could leak between users if only checked by round_id/qa_id without verifying user_id
**Why it happens:** When you have `DELETE /api/interviews/:roundId`, a user could guess another user's roundId
**How to avoid:** Every service function for rounds/QA MUST include `user_id` in the WHERE clause, same as `baseConditions` pattern in application service. Include `user_id` column on both tables
**Warning signs:** Tests that only use one user will not catch this. Must test with two users

### Pitfall 3: Race Conditions on Auto-Save with Multiple Fields
**What goes wrong:** User types in experience notes and feedback simultaneously. Two debounced PATCH requests fire, second overwrites first
**Why it happens:** If both fields send a single PATCH with only their changed field, this is safe. But if the PATCH sends all round fields, the last write wins
**How to avoid:** PATCH endpoints should accept partial updates (only the fields being changed). The debounced mutation should only send the specific field being edited, not the entire round object
**Warning signs:** Data loss when quickly editing multiple fields on the same round

### Pitfall 4: Round Number Assignment Gaps
**What goes wrong:** After deleting round 2 of 4, remaining rounds show as 1, 3, 4 instead of 1, 2, 3
**Why it happens:** If round_number is stored as a static column and not recalculated
**How to avoid:** Calculate round_number dynamically in the frontend by sorting rounds by `sort_order` or `created_at` and assigning index + 1. Don't store it as a column. OR store it but recalculate on delete
**Warning signs:** Confusing numbering after any round deletion

### Pitfall 5: D1 Batch Limitations with Many QA Pairs
**What goes wrong:** Creating a round with 10+ Q&A pairs in a single `db.batch()` call may hit D1's statement limit
**Why it happens:** D1 batch has practical limits. Each pair insert is a separate statement
**How to avoid:** Create the round first (single insert), then insert QA pairs in a separate batch. For typical usage (1-5 pairs per round), this is not an issue. Only matters if bulk-importing
**Warning signs:** Timeouts or errors on round creation with many pairs

### Pitfall 6: InterviewsTab Count Badge Not Updating
**What goes wrong:** The Interviews tab badge in DetailPage.tsx shows hardcoded `count: 2` instead of actual interview count
**Why it happens:** DetailPage.tsx has a static `tabs` array with `{ label: "Interviews", value: "interviews", count: 2 }`
**How to avoid:** The interview count must come from the query data. Either pass it up from InterviewsTab or fetch interview count as part of the application detail query
**Warning signs:** Tab badge shows wrong number or doesn't change after adding/removing rounds

### Pitfall 7: Migration File Conflicts
**What goes wrong:** `drizzle-kit generate` creates migration file with a random name that may conflict across branches
**Why it happens:** Drizzle-kit uses randomized migration names
**How to avoid:** Run `npm run db:generate` once after schema changes, verify the generated SQL, and commit the migration. Only one developer should generate migrations at a time
**Warning signs:** Multiple migration files for the same schema change

## Code Examples

### Schema Definition (Drizzle)
```typescript
// src/db/schema/interview.ts
import {
  sqliteTable,
  text,
  integer,
  index,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { application } from "./application";
import { user } from "./auth";

export const interviewRound = sqliteTable(
  "interview_round",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    applicationId: text("application_id")
      .notNull()
      .references(() => application.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    roundType: text("round_type").notNull(),
    customTypeName: text("custom_type_name"),
    scheduledAt: integer("scheduled_at", { mode: "timestamp" }),
    durationMinutes: integer("duration_minutes").default(60),
    interviewerName: text("interviewer_name"),
    interviewerRole: text("interviewer_role"),
    meetingLink: text("meeting_link"),
    status: text("status").notNull().default("scheduled"),
    rating: integer("rating"),
    experienceNotes: text("experience_notes"),
    feedback: text("feedback"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [
    index("idx_interview_round_app").on(t.applicationId, t.sortOrder),
    index("idx_interview_round_user").on(t.userId),
    index("idx_interview_round_scheduled").on(t.applicationId, t.scheduledAt),
  ],
);

export const interviewQa = sqliteTable(
  "interview_qa",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    roundId: text("round_id")
      .notNull()
      .references(() => interviewRound.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    question: text("question").notNull(),
    answer: text("answer"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [
    index("idx_interview_qa_round").on(t.roundId, t.sortOrder),
  ],
);
```

### Constants Extension
```typescript
// Add to src/shared/constants.ts
export const INTERVIEW_ROUND_TYPES = [
  "phone_screen",
  "recruiter_call",
  "technical",
  "system_design",
  "behavioral",
  "hiring_manager",
  "bar_raiser",
  "take_home",
  "panel",
  "custom",
] as const;
export type InterviewRoundType = (typeof INTERVIEW_ROUND_TYPES)[number];

export const INTERVIEW_STATUSES = [
  "scheduled",
  "completed",
  "cancelled",
  "no_show",
] as const;
export type InterviewStatus = (typeof INTERVIEW_STATUSES)[number];

// Display labels for round types (used in UI)
export const ROUND_TYPE_LABELS: Record<InterviewRoundType, string> = {
  phone_screen: "Phone Screen",
  recruiter_call: "Recruiter Call",
  technical: "Technical",
  system_design: "System Design",
  behavioral: "Behavioral",
  hiring_manager: "Hiring Manager",
  bar_raiser: "Bar Raiser",
  take_home: "Take-Home",
  panel: "Panel",
  custom: "Custom",
};
```

### Zod Validators
```typescript
// src/shared/validators/interview.ts
import { z } from "zod";
import { INTERVIEW_ROUND_TYPES, INTERVIEW_STATUSES } from "@/shared/constants";

export const createInterviewRoundSchema = z.object({
  roundType: z.enum(INTERVIEW_ROUND_TYPES),
  customTypeName: z.string().max(100).optional(),
  scheduledAt: z.string().datetime().optional(),
  durationMinutes: z.number().int().min(5).max(480).optional(),
  interviewerName: z.string().max(200).optional(),
  interviewerRole: z.string().max(200).optional(),
  meetingLink: z.string().url().optional().or(z.literal("")),
  status: z.enum(INTERVIEW_STATUSES).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  experienceNotes: z.string().optional(),
  feedback: z.string().optional(),
});

export const updateInterviewRoundSchema = createInterviewRoundSchema.partial();

export const createQASchema = z.object({
  question: z.string().min(1).max(2000),
  answer: z.string().max(5000).optional(),
});

export const updateQASchema = z.object({
  question: z.string().min(1).max(2000).optional(),
  answer: z.string().max(5000).optional().or(z.literal("")),
});
```

### TanStack Query Hooks Pattern
```typescript
// src/client/hooks/useInterviews.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface InterviewRound {
  id: string;
  applicationId: string;
  roundType: string;
  customTypeName: string | null;
  scheduledAt: string | null;
  durationMinutes: number;
  interviewerName: string | null;
  interviewerRole: string | null;
  meetingLink: string | null;
  status: string;
  rating: number | null;
  experienceNotes: string | null;
  feedback: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  qaPairs: InterviewQA[];
}

interface InterviewQA {
  id: string;
  roundId: string;
  question: string;
  answer: string | null;
  sortOrder: number;
}

// Fetch all rounds + QA for an application
export function useInterviews(applicationId: string) {
  return useQuery({
    queryKey: ["interviews", applicationId],
    queryFn: async () => {
      const res = await fetch(`/api/applications/${applicationId}/interviews`);
      if (!res.ok) throw new Error("Failed to fetch interviews");
      const json = await res.json();
      return json.data as InterviewRound[];
    },
    enabled: !!applicationId,
  });
}
```

### SVG Star Rating Component
```tsx
// src/client/components/detail/StarRating.tsx
import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  value: number | null;
  onChange?: (rating: number | null) => void;
  readOnly?: boolean;
  size?: number;
}

export function StarRating({ value, onChange, readOnly = false, size = 16 }: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? value ?? 0;

  return (
    <div className="flex gap-0.5" onMouseLeave={() => !readOnly && setHovered(null)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(value === star ? null : star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          className={`${readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"} transition-transform`}
        >
          <Star
            size={size}
            className={star <= display
              ? "fill-amber-400 text-amber-400"
              : "fill-transparent text-black/20 dark:text-white/20"}
          />
        </button>
      ))}
    </div>
  );
}
```

### Auto-Save Indicator (Reusable)
```tsx
// src/client/components/detail/SaveIndicator.tsx
interface SaveIndicatorProps {
  isPending: boolean;
  hasContent: boolean;
}

export function SaveIndicator({ isPending, hasContent }: SaveIndicatorProps) {
  if (isPending) {
    return <span className="text-[10px] text-text-muted dark:text-dark-accent/40">Saving...</span>;
  }
  if (hasContent) {
    return <span className="text-[10px] text-green-600 dark:text-green-400">Saved</span>;
  }
  return null;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Google Sheets interview tracking (Code.gs) | D1 relational tables | This phase | Structured data, multi-user, proper CRUD |
| Static sample data in InterviewsTab | Real data from API via TanStack Query | This phase | InterviewsTab becomes functional |
| No markdown rendering | Textarea + markdown hints (Phase 5), Tiptap WYSIWYG (future) | Phase 5 start | Incremental -- start simple |

**Deprecated/outdated:**
- The static `SAMPLE_INTERVIEWS` array in `InterviewsTab.tsx` -- will be replaced entirely
- The "Prep notes" section in current InterviewsTab -- becomes experience_notes per round

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 4.1.4 + @cloudflare/vitest-pool-workers 0.14.7 |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run tests/interviews/ --reporter=verbose` |
| Full suite command | `npx vitest run --reporter=verbose` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INTV-01 | Create interview round with all round types | unit (API) | `npx vitest run tests/interviews/crud.test.ts -x` | Wave 0 |
| INTV-02 | Round tracks scheduled date/time, duration, interviewer, meeting link, status | unit (API) | `npx vitest run tests/interviews/crud.test.ts -x` | Wave 0 |
| INTV-03 | Q&A pair CRUD + experience notes + feedback fields | unit (API) | `npx vitest run tests/interviews/qa.test.ts -x` | Wave 0 |
| INTV-04 | Star rating 1-5 persistence | unit (API) | `npx vitest run tests/interviews/crud.test.ts -x` | Wave 0 |
| NOTE-01 | Notes auto-save via debounced PATCH | unit (API) | `npx vitest run tests/interviews/crud.test.ts -x` | Wave 0 |
| NOTE-02 | Saving/Saved indicator | manual-only | Visual verification | N/A |
| NOTE-03 | Markdown hint indicators | manual-only | Visual verification | N/A |

### Sampling Rate
- **Per task commit:** `npx vitest run tests/interviews/ --reporter=verbose`
- **Per wave merge:** `npx vitest run --reporter=verbose`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/interviews/crud.test.ts` -- covers INTV-01, INTV-02, INTV-04, NOTE-01
- [ ] `tests/interviews/qa.test.ts` -- covers INTV-03
- [ ] Update `tests/setup.ts` to include `interview_round` and `interview_qa` table creation SQL

## Open Questions

1. **Markdown rendering depth for Phase 5**
   - What we know: NOTE-03 says "Markdown supported everywhere" but the existing OverviewTab uses plain textarea with markdown hint text
   - What's unclear: Should Phase 5 add actual markdown rendering (preview mode) or just textarea + hints + "markdown supported" indicator?
   - Recommendation: Start with textarea + hints (matching OverviewTab pattern). Actual markdown preview/rendering can be a follow-up within Phase 5 or Phase 9 polish. Keep scope minimal

2. **Interview count in tab badge**
   - What we know: DetailPage.tsx hardcodes `count: 2` for Interviews tab
   - What's unclear: Should interview count come from a lightweight count-only API or from the full interviews query?
   - Recommendation: Fetch interview count as part of the application detail response (add a `interviewCount` field to the `getBySlug` and `getById` service responses). This avoids a separate API call and keeps the tab badge accurate

3. **Round number display vs storage**
   - What we know: Rounds should show numbered badges (R1, R2, R3...)
   - What's unclear: Store round_number in DB or derive from sort order?
   - Recommendation: Derive in frontend from sort_order/created_at ordering. Avoids renumbering logic on delete. The `sort_order` column supports reordering, and the display number is just `index + 1`

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `src/db/schema/application.ts` -- existing schema patterns (timestamps, nanoid, foreign keys, indexes)
- Codebase analysis: `src/server/routes/applications.ts` -- route structure, error handling, Zod validation
- Codebase analysis: `src/server/services/application.ts` -- service layer patterns (baseConditions, db.batch, timeline events)
- Codebase analysis: `src/client/hooks/useApplications.ts` -- TanStack Query hook patterns, optimistic mutations
- Codebase analysis: `src/client/components/detail/OverviewTab.tsx` -- auto-save pattern (useDebouncedMutate), Saving/Saved indicator
- Codebase analysis: `src/client/components/detail/InterviewsTab.tsx` -- existing UI shell with design tokens
- Codebase analysis: `worker/index.ts` -- route registration pattern
- Codebase analysis: `tests/applications/crud.test.ts` -- test patterns (signUpAndGetCookie, SELF.fetch)
- Codebase analysis: `src/InterviewForm.html` + `src/Code.gs` -- original round types, statuses, outcomes from Google Sheets version

### Secondary (MEDIUM confidence)
- Drizzle ORM D1 documentation -- table definition syntax, migration generation
- Hono documentation -- route nesting, trie router behavior

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies needed, everything already installed and proven
- Architecture: HIGH -- follows established patterns from Phases 1-4, just extending to new tables
- Pitfalls: HIGH -- based on real issues found in codebase (Hono trie router, Phase 4 decisions) and standard CRUD edge cases
- Database schema: HIGH -- straightforward relational design matching existing conventions

**Research date:** 2026-04-18
**Valid until:** 2026-05-18 (stable -- no external API dependencies, all internal patterns)
