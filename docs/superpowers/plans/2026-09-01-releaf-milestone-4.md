# Releaf Milestone 4 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let Diva choose website sections, tone, colours, and visual style while seeing and saving a live preview.

**Architecture:** Authenticated Convex preferences store constrained design tokens and enabled section IDs. A client-side studio applies those structured settings immediately to a representative preview while each change persists through an authorized mutation.

**Tech Stack:** Next.js 16, React 19, TypeScript, Convex, CSS, Vitest

**Spec:** User-approved scoping document and milestone list in the project conversation.

## Global Constraints

- Build only milestone 4.
- Preferences are structured values, never unrestricted CSS or code.
- Blog remains enabled because blogging is mandatory in V1.
- Section reordering and full desktop/mobile previews belong to milestone 11.

---

### Task 1: Saved website preferences

**Files:**
- Modify: `convex/schema.ts`
- Create: `convex/preferences.ts`

**Interfaces:**
- Produces: `api.preferences.get` and `api.preferences.save`.

- [x] Define constrained tone, palette, style, and section values.
- [x] Authorize reads and writes and enforce mandatory Blog.

### Task 2: Live preference studio

**Files:**
- Create: `src/components/onboarding/preference-studio.tsx`
- Create: `src/app/onboarding/preferences/page.tsx`
- Modify: `src/components/onboarding/onboarding-form.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: saved profile data and preference functions.
- Produces: section toggles, tone cards, palettes, styles, save status, and live preview.

- [x] Connect profile review to website preferences.
- [x] Apply every selection immediately to the preview.
- [x] Save every change and restore it after reopening.
- [x] Deploy and run tests, lint, build, and authenticated persistence checks.
