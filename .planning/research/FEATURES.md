# Feature Research

**Domain:** Job application tracker (personal productivity / career management)
**Researched:** 2026-04-16
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete. Every serious competitor (Huntr, Teal, ApplyArc, Simplify) ships all of these.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Application CRUD (company, role, status, source, URL, notes) | Core purpose of the product. Every competitor and every Notion template starts here. | LOW | Already proven in the Sheets prototype. Minimum fields: company, role, status, priority, source, location, applied date, posting URL. |
| Status pipeline with visual indicators | Users need at-a-glance progress. Huntr/Teal/ApplyArc all use color-coded statuses. | LOW | Existing pipeline (Wishlist > Applied > Screening > Interviewing > Offer > Accepted > Rejected > Withdrawn) is comprehensive and matches industry standard. |
| Kanban board with drag-and-drop | The dominant UX pattern in this space. Huntr, Teal, ApplyArc, Simplify, Notion templates -- all kanban-first. Users who have tried any competitor expect this. | MEDIUM | Every competitor defaults to kanban. JobDash should offer it but can default to dashboard (per PROJECT.md). Drag-and-drop status changes are the core interaction. |
| Table/list view with sorting, filtering, search | Power users managing 50-200+ applications need bulk scanning. Spreadsheet refugees expect this. Built In explicitly offers kanban vs. list toggle. | MEDIUM | Essential for high-volume job seekers. Must support filtering by status, source, date range, priority. Full-text search across company/role/notes. |
| Application detail panel | Per-application deep view with all metadata, notes, contacts, interview rounds. Huntr has this per-card. Notion templates use linked databases. | MEDIUM | The Sheets prototype already has detailed per-job tabs. Web version should be a slide-out panel or dedicated page. |
| Status change tracking / activity timeline | Users need history of what happened and when. Huntr logs every interaction. The Sheets prototype already tracks status transitions and activity logs. | LOW | Auto-generated events for status changes, interview additions, note edits. Timestamp + description format. |
| Interview round tracking | Managing multiple rounds per application is core to job searching. Huntr and the Sheets prototype both track round type, date, interviewer, notes, and outcome. | MEDIUM | Fields: round type (phone screen, technical, behavioral, etc.), date/time, interviewer, duration, questions asked, self-rating, outcome (pass/fail/waiting), feedback received. |
| Contact management (recruiter, hiring manager, referral) | Users track who they talked to. Huntr has a full CRM layer. Teal has a "Networking CRM." Even Notion templates include contact sections. | LOW | Lightweight is fine -- name, role, email, LinkedIn URL, notes. Linked to applications. Don't overbuild into a full CRM. |
| Notes with rich text | Every tracker has notes. Users expect markdown or basic formatting. Notion templates set a high bar here. | MEDIUM | Markdown editor with auto-save. Per-application and per-company notes. WYSIWYG is nice-to-have, but rendered markdown is sufficient for v1. |
| Data export (CSV/JSON) | Users fear vendor lock-in. Google Sheets users expect portability. This is also a trust signal. | LOW | CSV export of all applications + interview rounds. JSON for full data fidelity. |
| Authentication (multi-user) | Per PROJECT.md, multi-user from day one. Google OAuth + email/password. Standard expectation for any web app storing personal data. | MEDIUM | Google OAuth for convenience, email/password as fallback. Session-based auth on Cloudflare Workers. |
| Mobile-responsive design | Users capture applications from phone (lunch break, commuting). ApplyArc and Huntr both have mobile apps/responsive design. | MEDIUM | Not a native app -- responsive web is sufficient. Key mobile actions: add application, update status, view pipeline. |
| Dark mode | Expected in 2026 for any productivity tool. System preference detection is standard. | LOW | CSS variables + system preference media query. Toggle in settings. |

### Differentiators (Competitive Advantage)

Features that set JobDash apart. Aligned with the core value: "at a glance, the user knows exactly where every application stands and what needs attention today."

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Smart dashboard as default landing view | Every competitor defaults to kanban. JobDash's insight is that users need a command center showing summary stats + urgency signals + quick actions, not just a board. The Sheets prototype already validated summary stats (active count, interviews this week, avg response, offer rate). | MEDIUM | Dashboard with: summary cards, stale application warnings (days in status > 7/14), upcoming interviews, recent activity feed, quick-add. Routes to kanban/table/detail as needed. |
| Job description snapshots (auto-scrape + manual paste) | Postings get taken down within days/weeks. No major competitor preserves the full JD. Huntr saves basic metadata but not the full posting. This is a real pain point users mention. | HIGH | Auto-scrape from URL (fetch + parse) plus manual paste fallback. Store in R2 as versioned documents. Show diff if JD changes (re-scrape). |
| Pipeline analytics (Sankey/funnel, source effectiveness, response heatmap) | Most competitors offer basic stats at best. The Sheets prototype already has 5 chart types (pipeline by status, source effectiveness, applications over time, pipeline aging, response rate by source). Deep analytics help users optimize their search strategy. | HIGH | Sankey diagram showing flow between statuses. Source effectiveness (which sources lead to interviews). Response time heatmap (which days/times get responses). Funnel conversion rates. Weekly application velocity. |
| Deadline and staleness tracking with urgency signals | Competitors don't actively surface "what needs attention." The Sheets prototype already tracks days-in-status with amber (7d) and red (14d) warnings. This directly serves the core value. | LOW | Color-coded urgency on dashboard and kanban cards. Follow-up nudge reminders. "Stale" badge when application hasn't moved in configurable days. |
| Company research notes (persisted across applications) | If you apply to multiple roles at the same company over time, notes should persist. No competitor does this -- they're all per-application. | LOW | Company entity linked to applications. Markdown notes, star rating, culture notes. Reusable across applications to same company. |
| Company ratings and post-mortem reviews | After an application concludes, users rarely capture what they learned. The Sheets prototype has a "Post-Process" section with rating, review, rejection reason, key learnings, reapply timeline. No competitor prompts for this. | LOW | Unlock after status reaches Accepted/Rejected/Withdrawn. Fields: 1-5 star rating, written review, rejection reason/stage, key learnings, "would reapply?" flag. Aggregates into company intelligence over time. |
| Command palette (Cmd+K) | Power-user UX borrowed from Linear/Notion/Raycast. Fast navigation + quick actions without clicking through menus. No job tracker has this. | MEDIUM | Search applications, change status, add application, navigate views. Keyboard-driven workflow for speed. |
| Salary tracking with comparison view | Users track salary ranges across applications but no competitor surfaces a comparison view. Huntr/Teal store salary per-application but don't visualize it. | LOW | Min/max/offered per application with currency support. Comparison view showing salary ranges across all active applications. Helps with negotiation leverage. |
| CSV import with column mapping | Users migrating from spreadsheets need this. Google Sheets was the most common tracker before dedicated apps. Column mapping UI makes it work with any spreadsheet format. | MEDIUM | Upload CSV, preview data, map columns to fields, import. Handles date formats, status mapping, deduplication. |
| Tags and labels (user-defined, color-coded) | Power users need custom categorization beyond status/priority. Notion templates offer this. Most dedicated trackers don't. | LOW | User-created tags with colors. Filter by tag. Bulk-apply tags. Use cases: "remote-only," "FAANG," "startup," "requires-visa." |
| Bulk actions | Managing 50-200+ applications requires bulk operations. Spreadsheets handle this naturally. Dedicated trackers often don't. | MEDIUM | Multi-select + bulk status change, tag, archive, delete. Essential for high-volume users maintaining their pipeline. |
| Calendar view for interviews | Huntr mentions "manage all interview times in one place." Nymbus advertises an interview calendar. Visual timeline of upcoming interviews is natural. | MEDIUM | Month/week view showing scheduled interviews. Click to view/edit interview details. Doesn't need full calendar app complexity -- just interviews and deadlines. |
| Follow-up reminders (cron-driven nudges) | 7-10 day follow-up after applying is a standard best practice. No competitor proactively reminds you. The Sheets prototype has a daily refresh cron. | MEDIUM | Configurable rules: "remind me N days after applying if no status change," "remind me N days after interview if no feedback." In-app notifications + optional email digest. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems. Explicitly NOT building these.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| AI resume builder / ATS optimization | Huntr, Teal, Prentus all bundle this. It's the #1 upsell for competitors. | Massive scope increase. AI resume tools are an entire product category. Teal charges $29/mo mostly for this. Quality is inconsistent -- users report "generic" AI suggestions and wrong skill extraction. Building this means competing with dedicated resume tools. | Stay focused on tracking. Users already have preferred resume tools. Link to external resume per application (store the file in R2 if they upload it). |
| Chrome extension for one-click save | Huntr, Teal, Simplify all have highly-rated extensions. It's the #1 onboarding feature for competitors. | High complexity (separate codebase, Chrome Web Store review, cross-origin scraping, maintenance across job board DOM changes). The PROJECT.md already marks this as v2. | Manual add with URL auto-populate (fetch metadata from pasted URL). Quick-add from mobile. Revisit for v2 when core tracking is validated. |
| Application form autofill | Simplify's entire value prop. Huntr has it. Very appealing at 100+ applications. | Extremely high complexity. Requires maintaining compatibility with dozens of ATS systems (Workday, Greenhouse, Lever, iCIMS). Simplify has a full team dedicated to this. Breakage is constant. | Out of scope entirely. This is a different product. |
| AI interview prep / mock interviews | Prentus and ApplyArc offer AI mock interviews. Trending feature in 2026. | Another entire product category. Quality depends heavily on AI model quality and prompt engineering. Users report mixed results. Dilutes core value proposition. | Store interview questions and self-rated answers per round (already in scope). Let users prep with their preferred AI tool. |
| Email parsing / Gmail integration | JustAJobApp auto-tracks from Gmail. Some users want "just connect my email and auto-detect applications." | Privacy nightmare (full email access). Unreliable parsing (email formats vary wildly). Users uncomfortable granting email access to a job tracker. Creates dependency on email provider APIs. | Manual status updates with drag-and-drop (fast enough). Follow-up reminders replace the need to watch email. |
| Real-time collaboration | Notion templates support sharing. Some users want to share with career coaches or partners. | PROJECT.md explicitly excludes this. Adds massive complexity (websockets, conflict resolution, permissions). Single-user-at-a-time is the right call for a personal tracker. | Each user has their own account and data. Share via export if needed. |
| Calendar sync (Google Calendar push/pull) | Convenient to see interviews in existing calendar. Huntr mentions this. | Complex OAuth flow, bidirectional sync conflicts, timezone edge cases, API quota management. PROJECT.md marks as v2. | Calendar view within the app. Users can manually add interviews to their calendar (or copy event details). Revisit for v2. |
| Job board aggregation / job search | Some trackers (CareerFlow) also search for jobs. Users want "find jobs + track them" in one place. | Completely different product. Requires scraping or API access to job boards. Maintenance-heavy. Dilutes focus. | Track applications from any source. Paste URLs. Focus on the tracking, not the discovery. |
| LinkedIn profile optimization | Teal and CareerFlow offer this. It's adjacent to job searching. | Requires LinkedIn API access (limited/expensive). Another entire feature category. Not related to application tracking. | Out of scope entirely. |

## Feature Dependencies

```
[Auth (multi-user)]
    |
    +---> [Application CRUD]
    |         |
    |         +---> [Status pipeline]
    |         |         |
    |         |         +---> [Kanban board]
    |         |         +---> [Table view]
    |         |         +---> [Dashboard view]
    |         |         +---> [Status tracking / activity timeline]
    |         |         +---> [Deadline / staleness tracking]
    |         |
    |         +---> [Application detail panel]
    |         |         |
    |         |         +---> [Interview round tracking]
    |         |         +---> [Notes (rich text)]
    |         |         +---> [JD snapshots]
    |         |         +---> [Salary tracking]
    |         |
    |         +---> [Contact management]
    |         |         |
    |         |         +---> [Referral tracking]
    |         |
    |         +---> [Company entity]
    |                   |
    |                   +---> [Company research notes]
    |                   +---> [Company ratings / post-mortem]
    |
    +---> [Tags & labels]
    |         |
    |         +---> [Bulk actions (tag)]
    |
    +---> [Analytics]
    |         |
    |         +---> [Salary comparison view]
    |
    +---> [Notifications / reminders]
    |         |
    |         +---> [Follow-up nudges (cron)]
    |         +---> [Email digest]
    |
    +---> [Data import (CSV)]
    +---> [Data export (CSV/JSON)]
    +---> [Command palette]
    +---> [Dark mode]

[Calendar view] --requires--> [Interview round tracking]
[Sankey diagram] --requires--> [Status tracking / activity timeline]
[Bulk actions] --requires--> [Table view]
```

### Dependency Notes

- **Auth must come first:** Every feature depends on user identity. Multi-user from day one per PROJECT.md.
- **Application CRUD is the foundation:** Views (kanban, table, dashboard) are projections of application data. Build the data model first, views second.
- **Detail panel requires CRUD:** Interview rounds, notes, JD snapshots all hang off individual applications.
- **Company entity enables cross-application intelligence:** Must exist before company notes or ratings make sense. One company -> many applications.
- **Analytics requires status history:** The Sankey diagram and funnel analysis need the activity log / status transition data.
- **Calendar view requires interview dates:** Can't show a calendar without interview round tracking in place.
- **Bulk actions require table view:** Multi-select is a table interaction pattern, not kanban.
- **Follow-up reminders require notifications system:** Build the in-app notification mechanism first, then add cron-driven rules.

## MVP Definition

### Launch With (v1)

Minimum viable product -- what's needed to replace the Sheets prototype and be usable for an active job search.

- [ ] Auth (Google OAuth + email/password) -- multi-user from day one
- [ ] Application CRUD with full detail panel -- company, role, status, priority, location, source, URL, applied date, salary range, notes
- [ ] Status pipeline (Wishlist > Applied > Screening > Interviewing > Offer > Accepted > Rejected > Withdrawn)
- [ ] Kanban board with drag-and-drop status changes -- the dominant interaction pattern
- [ ] Table view with sorting, filtering, search -- for power users and bulk scanning
- [ ] Dashboard landing view with summary stats -- active count, interviews this week, avg response time, offer rate
- [ ] Interview round tracking -- type, date, interviewer, questions, outcome, self-rating
- [ ] Contact management (lightweight) -- name, role, email, LinkedIn, linked to applications
- [ ] Status change tracking / activity timeline -- auto-generated events
- [ ] Notes with markdown -- per-application
- [ ] Dark mode with system preference detection
- [ ] Mobile-responsive design

### Add After Validation (v1.x)

Features to add once core tracking is working and being used daily.

- [ ] Company entity with persisted research notes -- when applying to multiple roles at same company
- [ ] Tags and labels (user-defined, color-coded) -- when managing 30+ applications
- [ ] Deadline and staleness tracking with urgency signals -- when follow-ups start slipping
- [ ] Salary tracking with comparison view -- when negotiation phase arrives
- [ ] Job description snapshots (URL scrape + manual paste) -- validated as high-value, but technically complex
- [ ] Bulk actions (archive, tag, status change, delete) -- when application count exceeds 50
- [ ] Calendar view for interviews -- when interview density justifies a calendar
- [ ] Company ratings and post-mortem reviews -- when applications start concluding
- [ ] CSV/JSON data export -- before users accumulate too much data without an escape hatch
- [ ] CSV import with column mapping -- for Sheets migration if needed
- [ ] Pin/star high-priority applications -- quick triage
- [ ] Archive and soft-delete -- pipeline hygiene

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Pipeline analytics (Sankey, funnel, source effectiveness, response heatmap) -- needs sufficient data volume to be meaningful
- [ ] Command palette (Cmd+K) -- power-user feature, not essential for validation
- [ ] Follow-up reminders (cron-driven) -- requires notification infrastructure
- [ ] In-app notification system with bell dropdown -- requires real-time infrastructure
- [ ] Email digest for pending deadlines -- requires email sending infrastructure
- [ ] Chrome extension for one-click save -- separate codebase, high maintenance
- [ ] Timeline view for application history -- nice visualization but not essential

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Application CRUD + detail panel | HIGH | MEDIUM | P1 |
| Auth (Google OAuth + email/password) | HIGH | MEDIUM | P1 |
| Status pipeline with visual indicators | HIGH | LOW | P1 |
| Kanban board (drag-and-drop) | HIGH | MEDIUM | P1 |
| Table view (sort, filter, search) | HIGH | MEDIUM | P1 |
| Dashboard landing with summary stats | HIGH | MEDIUM | P1 |
| Interview round tracking | HIGH | MEDIUM | P1 |
| Contact management (lightweight) | MEDIUM | LOW | P1 |
| Activity timeline (auto-generated) | MEDIUM | LOW | P1 |
| Notes (markdown) | MEDIUM | MEDIUM | P1 |
| Dark mode | MEDIUM | LOW | P1 |
| Mobile-responsive | HIGH | MEDIUM | P1 |
| Company entity + research notes | MEDIUM | LOW | P2 |
| Tags and labels | MEDIUM | LOW | P2 |
| Staleness / deadline tracking | HIGH | LOW | P2 |
| Salary comparison view | MEDIUM | LOW | P2 |
| JD snapshots (scrape + paste) | HIGH | HIGH | P2 |
| Bulk actions | MEDIUM | MEDIUM | P2 |
| Calendar view (interviews) | MEDIUM | MEDIUM | P2 |
| Company ratings / post-mortem | LOW | LOW | P2 |
| CSV/JSON export | MEDIUM | LOW | P2 |
| CSV import (column mapping) | MEDIUM | MEDIUM | P2 |
| Pin/star + archive | LOW | LOW | P2 |
| Analytics (Sankey, funnel, heatmap) | MEDIUM | HIGH | P3 |
| Command palette (Cmd+K) | LOW | MEDIUM | P3 |
| Follow-up reminders (cron) | MEDIUM | HIGH | P3 |
| Notification system (bell) | MEDIUM | HIGH | P3 |
| Email digest | LOW | HIGH | P3 |
| Chrome extension | HIGH | HIGH | P3 |

**Priority key:**
- P1: Must have for launch -- the product is unusable without these
- P2: Should have, add in v1.x -- makes the product competitive
- P3: Nice to have, v2+ -- requires mature infrastructure or high data volume

## Competitor Feature Analysis

| Feature | Huntr | Teal | ApplyArc | Simplify | Notion Templates | Spreadsheets | JobDash (Our Plan) |
|---------|-------|------|----------|----------|-----------------|--------------|-------------------|
| Kanban board | Yes (core UX) | Yes | Yes | Basic | Via database views | No | Yes (not default) |
| Table/list view | Basic | Basic | Basic | No | Yes | Yes (core UX) | Yes (full filtering) |
| Dashboard with stats | No | No | Basic | No | Manual | Manual formulas | Yes (default view -- differentiator) |
| Interview tracking | Per-card notes | Per-card notes | Basic | No | Manual fields | Manual | Detailed per-round tracking |
| Contact CRM | Full CRM | Networking CRM | No | No | Manual | Manual | Lightweight (linked to apps) |
| JD snapshot | No | Chrome ext saves metadata | No | No | Manual paste | Manual | Auto-scrape + paste (differentiator) |
| Analytics | No | No | Basic AI insights | No | No | Manual charts | Full analytics suite (differentiator) |
| Salary tracking | Basic field | Basic field | No | No | Custom field | Manual | Comparison view (differentiator) |
| Company notes | Per-application | Per-application | No | No | Linked database | Per-row | Persisted per-company (differentiator) |
| AI resume tools | No | Yes (core feature) | Yes (17 AI tools) | No | No | No | No (out of scope) |
| Chrome extension | Yes (4.9 stars) | Yes (4.9 stars) | Coming soon | Yes (core feature) | No | No | No (v2) |
| Autofill | Yes | Yes | No | Yes (core feature) | No | No | No (out of scope) |
| Data export | No | No | No | No | Notion export | Native | Yes (CSV + JSON) |
| Data import | No | No | No | No | No | N/A | Yes (CSV with mapping) |
| Command palette | No | No | No | No | Notion has one | No | Yes (differentiator) |
| Dark mode | No | No | Unknown | Unknown | Notion has it | No | Yes |
| Free tier limit | 40 jobs | Limited AI | Unlimited tracking | Unlimited | Unlimited | Unlimited | Unlimited (self-hosted) |
| Pricing | $10/mo | $29/mo | $19/mo | Free/varies | Free | Free | $0 (Cloudflare free tier) |

### Key Competitive Insights

1. **No competitor has a smart dashboard landing view.** Everyone defaults to kanban. JobDash's dashboard-first approach is genuinely differentiated.
2. **Analytics are virtually nonexistent** in the competitor space. The Sheets prototype already has more analytics than any competitor. This is a meaningful differentiator.
3. **Company-level intelligence** (persisted notes, ratings across applications) doesn't exist in any competitor. They're all per-application.
4. **Data portability** (import/export) is surprisingly absent from dedicated trackers. This is a trust signal that costs little to build.
5. **Competitors monetize via AI resume tools.** JobDash avoids this entirely -- the value is in tracking, not document generation. This keeps scope manageable and the product free.
6. **Chrome extensions are table stakes for competitors** but are explicitly v2 for JobDash. The manual-add-with-URL-fetch approach is an acceptable interim.
7. **Self-hosted / own-your-data** is an emerging differentiator. JobSync (open-source) validates this positioning. JobDash running on the user's own Cloudflare account is a privacy advantage.

## Sources

- [Huntr - Job Tracker Product Page](https://huntr.co/product/job-tracker)
- [Teal - Job Application Tracker](https://www.tealhq.com/tools/job-tracker)
- [Best Job Trackers 2026 - Prentus](https://prentus.com/blog/we-found-the-5-best-job-tracker-tools-on-the-market)
- [Best Job Application Trackers 2026 - ApplyArc](https://applyarc.com/compare/best-job-application-trackers)
- [Huntr vs Teal vs JibberJobber Comparison 2026](https://bestjobsearchapps.com/articles/en/huntr-vs-teal-vs-jibberjobber-best-job-application-tracker-for-2026-full-comparison)
- [Teal Review 2026 - Jobright](https://jobright.ai/blog/teal-review-2026-walkthrough-alternatives-and-faqs/)
- [Best Free Job Tracker Apps 2026 - ApplyArc](https://applyarc.com/blog/best-free-job-tracker-apps-2026)
- [Notion Job Application Tracker Templates](https://www.notion.com/templates/category/job-application-tracking)
- [Job Application Tracker Spreadsheet vs Dedicated Tools - ApplyArc](https://applyarc.com/blog/job-application-tracker-spreadsheet-template)
- [How to Keep Track of Job Applications 2026 - JobShinobi](https://www.jobshinobi.com/blog/how-to-keep-track-of-job-applications)
- [JobSync - Self-hosted Open Source Tracker (GitHub)](https://github.com/Gsync/jobsync)
- Existing codebase: Google Sheets + Apps Script prototype in `src/`

---
*Feature research for: Job application tracker (personal productivity / career management)*
*Researched: 2026-04-16*
