---
phase: "07"
plan: "01"
subsystem: jd-snapshots-documents
tags: [jd, markdown, documents, r2-metadata, schema, api, frontend]
dependency_graph:
  requires: [application-schema, detail-page-tabs]
  provides: [jd-text-storage, document-metadata-api, markdown-jd-render]
  affects: [application-table, detail-page]
tech_stack:
  added: [react-markdown]
  patterns: [markdown-paste-and-render, document-metadata-crud, tab-count-badges]
key_files:
  created:
    - src/db/schema/document.ts
    - src/db/migrations/0004_spotty_madame_masque.sql
    - src/server/services/document.ts
    - src/server/routes/documents.ts
    - src/shared/validators/document.ts
    - src/client/hooks/useDocuments.ts
  modified:
    - src/db/schema/application.ts
    - src/db/schema/index.ts
    - src/shared/validators/application.ts
    - src/server/services/application.ts
    - src/client/hooks/useApplicationDetail.ts
    - src/client/components/detail/JDTab.tsx
    - src/client/components/detail/DocsTab.tsx
    - src/client/components/detail/DetailPage.tsx
    - src/client/index.css
    - worker/index.ts
    - package.json
decisions:
  - Used react-markdown for JD rendering (lightweight, standard, ESM-native)
  - Stored jdText as TEXT column on application table (no separate table since versioning is deferred)
  - Document upload button disabled with tooltip (R2 binding not yet configured)
  - SNAP-02 (URL scraping) and SNAP-03 (versioning) deferred per plan instructions
metrics:
  duration: 4min
  completed: "2026-04-18"
  tasks: 3
  files: 17
---

# Phase 7 Plan 1: JD Snapshots & Documents Summary

Markdown JD paste/render with react-markdown, document metadata table for R2, and API wiring for both JD and docs tabs.

## What Was Done

### Task 1: DB Schema + Migration (ed9d288)
- Added `jd_text TEXT` column to the `application` table for storing pasted markdown job descriptions
- Created `document` table with columns: id, application_id, user_id, file_name, file_type, file_size, r2_key, created_at, updated_at
- Generated migration 0004 (`ALTER TABLE application ADD jd_text text` + `CREATE TABLE document`)
- Exported document schema from db/schema/index.ts

### Task 2: API Layer (db64117)
- Added `jdText` to application create/update validators and service layer
- Created document service with full CRUD: createDocument, listDocuments, countDocuments, deleteDocument
- Created document routes: POST/GET for /api/applications/:appId/documents, GET for document-count, DELETE for /api/documents/:docId
- Wired document routes into the worker entry point
- Added `jdText` to the `ApplicationDetail` frontend type

### Task 3: Frontend Wiring (1d1258f)
- Rewrote JDTab from static stub to functional component with:
  - Edit mode: textarea for pasting markdown JD text
  - Read mode: rendered markdown via react-markdown
  - Save/Cancel buttons with optimistic mutation
  - Empty state when no JD saved
  - Live preview while editing
- Rewrote DocsTab from static stub to API-backed component with:
  - Real document listing from API
  - Delete functionality with confirmation
  - Loading and empty states
  - Upload button disabled (R2 not yet configured)
- Created useDocuments hook with list, count, create, delete mutations
- Wired document count badge in DetailPage tabs from API (replaced hardcoded 3)
- Added jd-markdown CSS styles for rendered markdown content (headings, lists, code, blockquotes)
- Installed react-markdown v10.1.0

## Deviations from Plan

None - executed based on requirements SNAP-01 and SNAP-04 with SNAP-02/SNAP-03 deferred as instructed.

## Known Stubs

- **DocsTab upload button** (src/client/components/detail/DocsTab.tsx, line ~67): Upload button is disabled with "R2 binding not yet configured" tooltip. R2 presigned URL upload flow requires R2 binding in wrangler.jsonc which is a Phase 8 concern. Document metadata API is fully functional; only the actual file upload to R2 is not yet wired.
- **OverviewTab "About the role" section** (src/client/components/detail/OverviewTab.tsx, lines 130-152): Still shows static bullet points. This is pre-existing from Phase 10 and not part of this plan's scope.

## Self-Check: PASSED

- All 6 created files verified present
- All 3 task commits verified in git log (ed9d288, db64117, 1d1258f)
- TypeScript type-check passes (npx tsc --noEmit)
- Vite build passes successfully
