# JobPilot

A fully automated Google Sheets job application tracker. Replaces scattered emails and bookmarks with a structured spreadsheet powered by Apps Script sidebar forms, Google Drive integration, and analytics charts.

## What It Does

- **Dashboard tab** with 16 columns: company, role, status (pastel badges), priority, salary, source, deadlines, and more
- **Per-job detail tabs** auto-created for each application with interview rounds, company research, salary tracking, and documents
- **Sidebar forms** for adding applications, interview rounds, status updates, and deadlines
- **Google Drive integration** for storing job descriptions and application form Q&A as rich-text Google Docs
- **Analytics tab** with 5 native charts (status funnel, source effectiveness, applications over time, pipeline aging, response rate) plus a Sankey diagram
- **Automation** via onEdit triggers (auto-timestamps, status tracking) and daily triggers (deadline urgency, stats refresh)

## Tech Stack

- Google Sheets (data + UI)
- Google Apps Script (automation + sidebar forms)
- Google Drive API (JD and form answer docs)
- Google Charts API (Sankey diagram)
- clasp CLI (local development)

## Project Structure

```
job-track/
├── src/                        # Apps Script files (pushed via clasp)
│   ├── Code.gs                 # Menu, triggers, onEdit handler
│   ├── FormHandlers.gs         # Server-side form processing
│   ├── DashboardActions.gs     # Sort, archive, stats, hide-if-empty
│   ├── Utils.gs                # Config readers, date formatting, helpers
│   ├── Analytics.gs            # Chart data computation
│   ├── DriveHelper.gs          # Drive folder/doc management
│   ├── Sidebar.html            # Add Application form
│   ├── InterviewForm.html      # Add Interview Round form
│   ├── StatusForm.html         # Update Status form
│   ├── DeadlineForm.html       # Add Deadline form
│   ├── FormAnswerForm.html     # Log Form Answer form
│   ├── SankeyDialog.html       # Sankey diagram modal
│   ├── Styles.html             # Shared CSS + JS
│   └── appsscript.json         # Manifest
├── docs/
│   └── superpowers/
│       ├── specs/              # Design spec
│       └── plans/              # Implementation plan
├── job-tracker-spec.md         # Original product spec (web app, for reference)
└── README.md
```

## Spreadsheet Tabs

| Tab | Purpose |
|-----|---------|
| Dashboard | Master table — all applications at a glance |
| Analytics | Charts and pipeline visualizations |
| {Company} - {Role} | Per-job detail tab (auto-created) |
| _Template | Hidden — cloned for new jobs |
| _Config | Hidden — dropdown values, colors, settings |

## Setup

1. Create a new Google Spreadsheet
2. Open Extensions > Apps Script
3. Clone locally with clasp:
   ```bash
   npm install -g @google/clasp
   clasp login
   clasp clone {SCRIPT_ID} --rootDir src
   ```
4. Push the code: `clasp push`
5. Run `initialSetup()` from the Apps Script editor (installs triggers + creates charts)
6. Reload the spreadsheet — the JobPilot menu appears

## Menu Actions

| Action | What it does |
|--------|-------------|
| Add Application | Sidebar form — creates dashboard row + job tab |
| Add Interview Round | Sidebar form — adds round card to job tab |
| Update Status | Sidebar form — updates status across dashboard + tab |
| Add Deadline | Sidebar form — sets deadline with urgency coloring |
| Save Job Description | Creates Google Doc in Drive, links to job tab |
| Log Form Answer | Sidebar form — appends Q&A to Google Doc |
| Sort Dashboard | Re-sorts by status priority + deadline urgency |
| Archive Rejected | Dims rejected/withdrawn rows, moves to bottom |
| Refresh Stats | Recalculates summary row + analytics |
| View Sankey Diagram | Opens pipeline flow visualization |

## Design

See [design spec](docs/superpowers/specs/2026-04-15-jobpilot-sheets-design.md) for full details on:
- Dashboard columns and conditional formatting
- Job detail tab sections (8 sections, hide-if-empty)
- Pastel color palette
- Google Drive folder structure
- Analytics charts
- Automation triggers

## Implementation

See [implementation plan](docs/superpowers/plans/2026-04-15-jobpilot-sheets.md) for step-by-step build instructions (17 tasks across 5 chunks).
