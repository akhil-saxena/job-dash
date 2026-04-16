# Phase 3: Frontend Shell & Dashboard - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.

**Date:** 2026-04-16
**Phase:** 03-frontend-shell-dashboard
**Areas discussed:** App shell layout, Dashboard card design, Quick-add flow, Routing upgrade
**Mode:** Auto (all areas auto-selected, recommended defaults chosen)

---

## App Shell Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Sidebar + header | Fixed sidebar with nav links, header with user info | ✓ |
| Top nav only | Horizontal navigation bar, no sidebar | |
| Bottom tabs (mobile-first) | Mobile-style tab bar | |

**User's choice:** Sidebar + header — auto-selected (recommended)

---

## Dashboard Card Design

| Option | Description | Selected |
|--------|-------------|----------|
| Stat grid + list sections | 4 stat cards at top, stale apps + interviews below | ✓ |
| Single-column feed | All info in one scrollable feed | |
| Widget-based (draggable) | Customizable widget layout | |

**User's choice:** Stat grid + list sections — auto-selected (recommended)

---

## Quick-Add Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Modal dialog | Overlay form, minimal fields, reusable | ✓ |
| Slide-over panel | Side drawer form | |
| Inline expansion | Expands within the dashboard | |

**User's choice:** Modal dialog — auto-selected (recommended)

---

## Routing Upgrade

| Option | Description | Selected |
|--------|-------------|----------|
| TanStack Router | Type-safe, SPA-optimized, research recommended | ✓ |
| Keep custom router | Current pathname-based, simple but limited | |
| React Router v7 | Popular but SPA mode has type-safety gaps | |

**User's choice:** TanStack Router — auto-selected (recommended)

---

## Claude's Discretion

- TanStack Router config details
- Sidebar width and animations
- Loading skeleton designs
- Dashboard data fetching approach
- Empty state designs

## Deferred Ideas

None
