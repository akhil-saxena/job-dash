# JobPilot — Google Sheets Job Tracker

## Design Spec

**Author:** Akhil Saxena
**Date:** April 15, 2026
**Status:** Approved

---

## 1. Overview

A fully automated Google Sheets job application tracker that replaces scattered emails and bookmarks with a structured, clean spreadsheet. Built with Google Apps Script + HTML sidebar forms for a mini-app experience inside Sheets.

**Goals:**
- Actually usable for daily job search tracking
- Zero cost, zero deployment, zero maintenance
- Clean pastel aesthetic, not a cluttered spreadsheet
- Full automation: buttons create rows, tabs, links, timestamps automatically

**Non-goals:**
- Not a portfolio piece (separate project for that)
- Not a published add-on or shared product
- No external services, APIs, or databases

---

## 2. Architecture

**Platform:** Single Google Spreadsheet with bound Apps Script

**Components:**
- Google Sheets — data storage and UI
- Apps Script (Code.gs) — automation logic, triggers, menu actions
- HTML Service — sidebar form templates served from Apps Script

**Approach:** Approach B — Apps Script + HTML Sidebar Forms. Sidebar panels slide in from the right for data entry. Dashboard stays visible while filling forms. Styled HTML forms with validation and dropdowns.

---

## 3. Tab Structure

| Tab | Type | Visibility | Purpose |
|-----|------|-----------|---------|
| Dashboard | Master table | Visible | All applications at a glance |
| Analytics | Charts & stats | Visible | Visual pipeline analytics |
| {Company} - {Role} | Job detail | Visible | One per application, auto-created |
| _Template | Template | Hidden | Blank job tab, cloned for each new application |
| _Config | Settings | Hidden | Dropdown values, color hex codes, settings |

**Tab naming:** Job tabs named as "{Company} - {Role}" (e.g. "Google - SDE2"). Tab color set to match status color via Apps Script.

---

## 4. Dashboard Tab

### 4.1 Summary Stats Row (frozen)

Top row, frozen, auto-computed:

| Stat | Formula logic |
|------|--------------|
| Total Active | Count where status not in (Rejected, Withdrawn, Accepted) |
| Interviews This Week | Script-computed (daily trigger + on form submit): scans interview dates across all job tabs |
| Avg Days to Response | Average of (first status change date - applied date) |
| Offer Rate % | Count(Offer + Accepted) / Count(all non-Wishlist) |

### 4.2 Columns (16 visible + 1 hidden)

| # | Column | Type | Notes |
|---|--------|------|-------|
| 1 | Company | Text | Bold, primary color |
| 2 | Role | Text | Secondary color |
| 3 | Status | Dropdown | Pastel badge via conditional formatting |
| 4 | Priority | Dropdown | High/Medium/Low with colored dot |
| 5 | Location | Dropdown | Remote/Hybrid/Onsite + city text |
| 6 | Salary Range | Text | e.g. "35-50L" |
| 7 | Source | Dropdown | LinkedIn/Referral/Naukri/Company Site/Indeed/AngelList/Other |
| 8 | Applied Date | Date | Auto-set when status changes from Wishlist |
| 9 | Last Updated | Date | Auto-timestamps on any edit (onEdit trigger) |
| 10 | Next Deadline | Date | Red <3 days, yellow 3-7, green >7 |
| 11 | Days in Status | Number | Script-computed from hidden "Status Changed Date" column. Amber at 7+, red at 14+ |
| 12 | Next Action | Text | Free-text one-liner: "Send follow-up", "Prep for R3" |
| 13 | Referral | Text | Name of referrer |
| 14 | Tags | Text | Comma-separated |
| 15 | Job URL | URL | Link to job posting |
| 16 | Details | Hyperlink | Auto-generated link to job's detail tab |
| 17 | Status Changed Date | Date (hidden column) | Auto-set when status changes. Used to compute Days in Status. |

### 4.3 Dashboard Behaviors

- **Conditional formatting:** Status cells get pastel background + muted text color
- **Rejected/Withdrawn rows:** Entire row dimmed (light gray text)
- **Auto-sort:** By status priority order, then by deadline urgency (onEdit or manual menu action)
- **Last Updated:** Auto-timestamps via onEdit trigger when any cell in the row changes
- **Days in Status:** Script-computed: `TODAY() - [Status Changed Date]` (hidden column tracks when status last changed, distinct from Last Updated). Conditional formatting for amber/red
- **Details column:** Hyperlink auto-created by Apps Script pointing to the job's tab

### 4.4 Status Color Palette (pastel)

| Status | Background | Text Color |
|--------|-----------|------------|
| Wishlist | #ececec | #888888 |
| Applied | #e3eef8 | #5a7fa8 |
| Screening | #ede8f5 | #7c6c9a |
| Interviewing | #fef3e2 | #b8860b |
| Offer | #e5f0e8 | #6a8f72 |
| Accepted | #dff0e8 | #4a7a5a |
| Rejected | #f5e5e5 | #a67272 |
| Withdrawn | #eaeaea | #999999 |

### 4.5 Priority Colors

| Priority | Dot Color |
|----------|-----------|
| High | #d4887a (dusty rose) |
| Medium | #d4b574 (warm tan) |
| Low | #b0b0b0 (gray) |

---

## 5. Analytics Tab

A dedicated visible tab with charts that visualize the job search pipeline. Contains native Sheets charts plus a Sankey diagram rendered via Google Charts API.

### 5.1 Layout

The Analytics tab has a data section (hidden rows at the bottom, script-computed) and a charts section (visible area with embedded charts). Refreshed via menu action "JobPilot → Refresh Stats" or the daily trigger.

### 5.2 Native Sheets Charts

**Chart 1: Status Funnel (horizontal bar chart)**
- One bar per status, ordered by pipeline stage
- Bar length = count of applications in that status
- Colored using the pastel status palette
- Shows the shape of your pipeline at a glance

**Chart 2: Source Effectiveness (grouped bar chart)**
- X-axis: sources (LinkedIn, Referral, Naukri, etc.)
- Two bars per source: total applications vs. applications that reached Interviewing or beyond
- Shows which sources actually convert

**Chart 3: Applications Over Time (line chart)**
- X-axis: weeks or months
- Y-axis: count of applications added
- Shows your activity cadence — are you applying consistently or in bursts

**Chart 4: Pipeline Aging (horizontal bar chart)**
- Groups active applications into buckets: 0-7 days, 8-14 days, 15-30 days, 30+ days in current status
- Visual indicator of how many apps are going stale

**Chart 5: Response Rate by Source (pie or donut chart)**
- Percentage of applications per source that received any response (moved past "Applied")
- Helps identify which channels are worth your time

### 5.3 Sankey Diagram (Google Charts API)

Native Sheets charts cannot render Sankey diagrams. This is rendered via Apps Script HtmlService in a modal dialog.

**Trigger:** Menu → JobPilot → View Sankey Diagram (or a button/link on the Analytics tab)

**Implementation:**
- Apps Script reads all applications from Dashboard, computes flow counts between statuses (Applied→Screening: N, Applied→Rejected: N, Screening→Interviewing: N, etc.)
- Passes data to an HTML template that uses Google Charts `google.visualization.Sankey`
- Renders in a centered modal dialog (800x500px)
- Shows the flow: Applied → Screening → Interviewing → Offer → Accepted, with rejection/withdrawal branches at each stage
- Uses the pastel color palette for nodes

**Sankey data structure:**
```
[
  ['Applied', 'Screening', count],
  ['Applied', 'Rejected', count],
  ['Screening', 'Interviewing', count],
  ['Screening', 'Rejected', count],
  ['Interviewing', 'Offer', count],
  ['Interviewing', 'Rejected', count],
  ['Offer', 'Accepted', count],
  ['Offer', 'Rejected', count],
  ['Offer', 'Withdrawn', count],
  // ... all observed transitions
]
```

### 5.4 Data Source

All charts are driven from the Dashboard table data. A hidden section at the bottom of the Analytics tab holds pre-computed aggregation tables (pivot-style) that the charts reference. These are updated by Apps Script on:
- Menu → Refresh Stats
- Daily time-driven trigger
- After any form submission (Add Application, Update Status)

---

## 6. Job Detail Tab

Each job gets its own tab, cloned from _Template. Two-column layout with 8 sections. **Hide-if-empty rule:** rows with no data are hidden, not shown with dashes.

### 6.1 Header

Full-width top section:
- Left: **Company — Role** (large, bold), subtitle with Team/Org, Location, Source
- Right: Status badge (pastel pill), "Day N" pipeline counter

### 6.2 Left Column

**Section 1: Job Info**

| Field | Type |
|-------|------|
| Posting URL | Clickable link |
| Team / Org | Text |
| Applied Date | Date |
| Next Deadline | Date + description, red if urgent |
| Tags | Pastel pills |

**Section 2: People**

Each person row: Name + LinkedIn URL + email (if known). Only show rows that have data.

| Field | Type |
|-------|------|
| Recruiter | Name, LinkedIn link, email |
| Hiring Manager | Name, LinkedIn link |
| Referral | Name, LinkedIn link, "Thanked" checkbox |

**Salary** is a row within the Job Info table above (not its own section):

| Salary Range | Text (e.g. "₹35L – ₹50L") |

**Section 4: Documents**

Only show rows that have data (hide-if-empty).

| Field | Type |
|-------|------|
| Resume Version | Name + Google Drive PDF link |
| Offer Letter | Google Drive link (only shown when present) |

### 6.3 Right Column

**Section 5: Research & Prep**

Single free-form rich text area combining:
- Company interview style
- Known interview questions
- Tech stack
- Green flags / red flags
- Any prep notes

Below it: **Job Description** — clickable "View JD ↗" link to a Google Doc (see Section 7: Google Drive Structure). Only shown when a JD doc exists for this job.

**Section 5b: Application Form Q&A**

Clickable "View Form Answers ↗" link to a Google Doc. Only shown when a Q&A doc exists. Used to save screening questions and your answers from job applications (e.g. "Why this role?", "Years of Go experience?", STAR-format answers). Stored as a Google Doc for comfortable reading and full rich text.

**Section 6: Interview Rounds**

Stacked card layout, one card per round. Each card contains:

| Field | Type |
|-------|------|
| Round number + type | e.g. "R1 — Phone Screen" |
| Status | Scheduled / Completed / Cancelled / No-Show |
| Outcome | Pass / Fail / Unclear / Waiting (separate from status) |
| Date | Date |
| Duration | Minutes |
| Interviewer | Name + LinkedIn link |
| Meeting link | Clickable URL |
| Questions asked | Rich text |
| My answers | Rich text |
| Notes | Rich text |
| Feedback received | Rich text |
| Self-rating | 1-5 stars |
| Thank-you sent | Checkbox |
| Questions to ask them | Rich text (for upcoming rounds) |

Scheduled rounds have an amber border. Completed rounds have default border. "Add round via menu" placeholder at the bottom.

### 6.4 Full-Width Bottom

**Section 7: Post-Process Review**

Greyed out / dimmed until status = Accepted, Rejected, or Withdrawn. When active:

| Field | Type |
|-------|------|
| Company Rating | 1-5 stars |
| Review | Free text |
| Rejection Reason | Text (if shared by company) |
| Rejection Stage | Which round eliminated at |
| Would Re-apply? | Yes / No / Maybe |
| Reapply After | Date (cooldown period) |
| Key Learnings | One-liner takeaway |

**Section 8: Activity Log**

Auto-generated, append-only. Each entry: date + event description. Events logged:
- Application created
- Status changes (from → to)
- Interview round added
- Interview round completed
- Deadline added

---

## 7. Google Drive Structure

Job descriptions and application form Q&A are stored as Google Docs in a dedicated Drive folder for comfortable reading and full rich text formatting.

### 7.1 Folder Layout

```
My Drive/
└── Job Interviews/
    ├── Google - SDE2/
    │   ├── Job Description
    │   └── Form Answers
    ├── Stripe - Backend/
    │   └── Job Description
    └── Razorpay - Platform Eng/
        (empty until you save a doc)
```

### 7.2 Auto-Creation Logic

- **"Job Interviews" root folder:** Created on first use (first time user saves a JD or form answers). Apps Script checks if it exists by name before creating.
- **Per-job subfolder:** Created automatically when an application is created (or on first doc save for that job). Named to match the tab name: "{Company} - {Role}".
- **Google Docs:** Created on demand — only when the user triggers "Save Job Description" or "Log Form Answers" from the menu. Not pre-created for every job.
- **Links in Sheets:** After a doc is created, its URL is written back to the job detail tab as a clickable "View JD ↗" or "View Form Answers ↗" link.

### 7.3 Doc Templates

**Job Description doc:**
- Title: "{Company} - {Role} — Job Description"
- Pre-populated heading with company name, role, capture date
- User pastes the full JD below

**Form Answers doc:**
- Title: "{Company} - {Role} — Form Answers"
- Simple Q&A format: **Q:** followed by the question, **A:** followed by the answer
- User adds entries as they fill applications

---

## 8. Sidebar Forms

HTML forms served via Apps Script HtmlService, displayed in the right sidebar panel. Pastel/off-white styling matching the spreadsheet aesthetic.

### 8.1 Add Application

**Trigger:** Menu → JobPilot → Add Application

**Fields:**
- Company (required)
- Role (required)
- Status (dropdown, default: Wishlist)
- Priority (dropdown, default: Medium)
- Location (dropdown: Remote/Hybrid/Onsite)
- Location City (text, optional)
- Salary Range (text, optional)
- Source (dropdown)
- Referral Name (text, optional)
- Job Posting URL (text, optional)
- Tags (text, comma-separated, optional)
- Resume Version Name (text, optional)
- Resume Drive Link (URL, optional)

**On submit:**
1. Add row to Dashboard with all fields populated
2. Clone _Template tab → rename to "{Company} - {Role}"
3. Populate job info section in new tab
4. Create hyperlink in Dashboard "Details" column
5. Apply conditional formatting for status color
6. Auto-set Applied Date if status is not Wishlist
7. Auto-timestamp Last Updated

### 8.2 Add Interview Round

**Trigger:** Menu → JobPilot → Add Interview Round

**Fields:**
- Application (dropdown of active job tabs)
- Round Type (dropdown: Phone Screen / Recruiter Call / Technical / System Design / Behavioral / Hiring Manager / Bar Raiser / Take-Home / Panel / Custom)
- Custom Type Name (text, shown only if type = Custom)
- Date (date picker)
- Duration (number, default: 60)
- Interviewer Name (text, optional)
- Interviewer LinkedIn (URL, optional)
- Meeting Link (URL, optional)
- Status (dropdown, default: Scheduled)

**On submit:**
1. Add round card to the selected job's detail tab
2. Auto-number the round (R1, R2, R3...)
3. Log "Interview round added" in Activity Log
4. If status = Scheduled, set amber border

### 8.3 Update Status

**Trigger:** Menu → JobPilot → Update Status

**Fields:**
- Application (dropdown of active job tabs)
- New Status (dropdown)

**On submit:**
1. Update status in Dashboard
2. Update status badge in job detail tab header
3. Re-apply conditional formatting
4. Log status change in Activity Log
5. Update tab color to match new status
6. If changing to Accepted/Rejected/Withdrawn, un-grey the Post-Process section

### 8.4 Add Deadline

**Trigger:** Menu → JobPilot → Add Deadline

**Fields:**
- Application (dropdown)
- Deadline Date (date picker)
- Description (text)

**On submit:**
1. Update Next Deadline column in Dashboard
2. Update deadline field in job detail tab
3. Apply urgency color formatting

### 8.5 Save Job Description

**Trigger:** Menu → JobPilot → Save Job Description

**Fields:**
- Application (dropdown of active job tabs)
- (No other fields — form just triggers doc creation and opens it)

**On submit:**
1. Create "Job Interviews" root folder in Drive if it doesn't exist
2. Create per-job subfolder if it doesn't exist
3. Create Google Doc titled "{Company} - {Role} — Job Description" with heading template
4. Write doc URL back to the job detail tab as "View JD ↗" link
5. Open the Google Doc in a new browser tab so user can paste the JD immediately

### 8.6 Log Form Answer

**Trigger:** Menu → JobPilot → Log Form Answer

**Fields:**
- Application (dropdown of active job tabs)
- Question (text, required)
- Answer (textarea, required)

**On submit:**
1. Create "Job Interviews" root folder in Drive if it doesn't exist
2. Create per-job subfolder if it doesn't exist
3. If Form Answers doc doesn't exist for this job, create it with title "{Company} - {Role} — Form Answers"
4. Append to the doc: **Q:** {question} followed by **A:** {answer} with a horizontal rule separator
5. Write doc URL back to job detail tab as "View Form Answers ↗" link (if not already linked)
6. Show confirmation with link to open the doc

---

## 9. Menu Structure

Custom menu bar: **JobPilot**

```
JobPilot
├── Add Application        → opens sidebar form
├── Add Interview Round    → opens sidebar form
├── Update Status          → opens sidebar form
├── Add Deadline           → opens sidebar form
├── ─────────────────
├── Save Job Description   → creates/opens JD doc in Drive
├── Log Form Answer        → opens sidebar form, appends Q&A to doc
├── ─────────────────
├── Sort Dashboard         → re-sorts by status priority + deadline urgency
├── Archive Rejected       → dims rejected/withdrawn rows, moves to bottom
├── Refresh Stats          → recalculates summary stats row + analytics charts
└── View Sankey Diagram    → opens modal dialog with pipeline flow visualization
```

---

## 10. Automation (Apps Script Triggers)

### 10.1 onEdit Trigger (installable)

Fires on any cell edit in the spreadsheet:

- **Dashboard edits:**
  - Update "Last Updated" timestamp for the edited row
  - Recalculate "Days in Status" for the edited row
  - If Status column changed: update hidden "Status Changed Date" column, log to Activity Log in the job's detail tab, update tab color

### 10.2 Time-Driven Trigger (daily)

Runs once per day:

- Recalculate all "Days in Status" values
- Update deadline urgency colors (red/yellow/green)
- Recalculate summary stats row
- Refresh Analytics tab: recompute aggregation data and update chart source ranges

---

## 11. _Config Tab

Hidden tab storing configuration data:

| Section | Contents |
|---------|----------|
| Statuses | Ordered list: Wishlist, Applied, Screening, Interviewing, Offer, Accepted, Rejected, Withdrawn |
| Status Colors | Background hex + text hex for each status |
| Status Sort Priority | Numeric sort order for each status (Interviewing=1, Offer=2, Screening=3, Applied=4, Wishlist=5, Accepted=6, Rejected=7, Withdrawn=8) |
| Priorities | High, Medium, Low + dot color hex |
| Sources | LinkedIn, Referral, Naukri, Company Site, Indeed, AngelList, Other |
| Round Types | Phone Screen, Recruiter Call, Technical, System Design, Behavioral, Hiring Manager, Bar Raiser, Take-Home, Panel, Custom |
| Round Statuses | Scheduled, Completed, Cancelled, No-Show |
| Round Outcomes | Pass, Fail, Unclear, Waiting |

---

## 12. _Template Tab

Hidden tab that gets cloned for each new application. Pre-formatted with:

- Header row (Company — Role placeholder, status badge area)
- Left column sections: Job Info, People, Salary, Documents — with field labels in column A, values in column B
- Right column sections: Research & Prep (merged cell for free text), Interview Rounds area
- Bottom sections: Post-Process Review (greyed out), Activity Log
- All formatting pre-applied: section headers, borders, fonts, colors
- Placeholder text in muted gray to guide the user

---

## 13. Visual Style

- **Background:** Off-white (#faf9f6) for content areas, light cream (#f0eeea) for headers
- **Borders:** Subtle (#e5e2dc), not heavy grid lines
- **Text hierarchy:** Primary #2d2d2d, secondary #555, tertiary #888, disabled #aaa
- **Links:** Muted blue (#7b9ec4)
- **Status badges:** Pastel backgrounds with muted text (see Section 4.4)
- **Tags:** Very light tinted pills (lavender, sage, peach)
- **Empty fields:** Hidden, not shown with dashes
- **Rejected/Withdrawn:** Entire row/section dimmed to ~45% opacity
- **Sidebar forms:** Off-white background, clean labels, rounded inputs, green primary button (#7c9a72)

---

## 14. Limitations & Constraints

- **Google Sheets formatting:** No true "collapsible sections" — JD snapshot will use row grouping (group/ungroup rows) as the closest equivalent
- **Rich text in cells:** Google Sheets supports bold, italic, color, links within cells — not full markdown. Research & Prep notes and interview fields use this.
- **Sidebar forms:** Google Apps Script sidebar is 300px wide, fixed. Forms must fit within this constraint.
- **Hide-if-empty:** Implemented via Apps Script row hiding, not CSS. Runs on form submission and can be triggered manually from menu.
- **Interview round cards:** In Sheets, these are row groups with merged cells and formatting to visually approximate cards. Not actual card components.
- **Duplicate tab names:** If applying to same company+role twice (e.g. reapply after rejection), append number suffix to tab name (e.g. "Google - SDE2 (2)")
- **onEdit trigger:** Cannot detect which user made the edit (irrelevant for single-user, but noted). Has a ~1 second execution delay.
- **Daily trigger:** Runs at approximately the scheduled time (Google doesn't guarantee exact timing).
- **Collapsible JD:** Uses row grouping with a visible label row "Click + to expand Job Description" above the grouped rows

---

## 15. File Structure (Apps Script)

```
Code.gs              — Menu setup, trigger handlers, core logic
Analytics.gs         — Chart data computation, analytics refresh
DriveHelper.gs       — Google Drive folder/doc creation and linking
Sidebar.html         — Add Application form
InterviewForm.html   — Add Interview Round form
StatusForm.html      — Update Status form
DeadlineForm.html    — Add Deadline form
FormAnswerForm.html  — Log Form Answer sidebar form
SankeyDialog.html    — Sankey diagram modal (Google Charts API)
Styles.html          — Shared CSS for all sidebar/dialog forms
Utils.gs             — Helper functions (find row, get config, format dates)
```

---

## 16. What This Spec Does NOT Cover

- Chrome extension or browser integration
- Email notifications or reminders
- Multi-user sharing or permissions
- Mobile-specific optimizations
- Data import/export tooling
