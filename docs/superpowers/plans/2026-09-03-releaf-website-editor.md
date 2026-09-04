# Releaf Website Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let Diva edit and preview a website built from her own saved onboarding content and preferences.

**Architecture:** Convex combines onboarding data with website preferences to create a persistent editable draft. A focused React editor changes structured fields only and renders the same draft in desktop or mobile preview mode.

**Tech Stack:** Next.js 16, React 19, TypeScript, Convex, CSS

**Spec:** Revised V1 decision: no AI copy generation; use the psychologist’s own content.

## Global Constraints

- No AI copy generation or section regeneration.
- No unrestricted drag-and-drop builder.
- Allow direct text editing, photo replacement, palette changes, section hiding and reordering, and desktop/mobile preview.
- Keep Blog mandatory in V1.
- Save edits so they survive refresh.

---

### Task 1: Persistent website draft

**Files:** Modify `convex/schema.ts`; create `convex/websiteEditor.ts`.

- [ ] Store editable copy, palette, enabled sections, and section order per user.
- [ ] Seed unsaved values from onboarding and website preferences.
- [ ] Validate supported palettes and section IDs on save.

### Task 2: Website editor and preview

**Files:** Create `/dashboard/website` page and editor component; modify navigation and CSS.

- [ ] Add direct text fields for headline, biography, who Diva helps, and therapeutic approach.
- [ ] Add profile-photo replacement.
- [ ] Add palette selection and section show/hide controls.
- [ ] Add accessible up/down ordering buttons.
- [ ] Add desktop/mobile preview modes.
- [ ] Save the complete structured draft.

### Task 3: Verification

- [ ] Deploy Convex schema and functions.
- [ ] Run tests, lint, and production build.
- [ ] Confirm `/dashboard/website` responds locally.
