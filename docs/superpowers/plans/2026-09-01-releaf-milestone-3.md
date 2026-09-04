# Releaf Milestone 3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let Diva complete and resume a guided practice profile with inline validation and automatically saved steps.

**Architecture:** A protected client form loads one authenticated Convex draft and saves each valid step through an authorized mutation. Profile photos upload directly to Convex object storage using a short-lived upload URL; the database stores only the storage ID and derived URL.

**Tech Stack:** Next.js 16, React 19, TypeScript, Convex, Zod, Vitest

**Spec:** User-approved scoping document and milestone list in the project conversation.

## Global Constraints

- Build only milestone 3.
- Required fields use the approved minimum set.
- Tone, colours, visual style, sections, and Calendly belong to later milestones.
- Each valid step is saved before the user advances.
- Every backend read and write checks the authenticated user.

---

### Task 1: Persisted profile drafts and photo storage

**Files:**
- Modify: `convex/schema.ts`
- Create: `convex/onboarding.ts`

**Interfaces:**
- Produces: `api.onboarding.getDraft`, `saveStep`, `generatePhotoUploadUrl`, and `saveProfilePhoto`.

- [x] Define the typed draft table and user index.
- [x] Authorize every query and mutation.
- [x] Validate each step again on the backend.
- [x] Store images in Convex storage and return their public URL.

### Task 2: Guided profile form

**Files:**
- Create: `src/lib/onboarding-schema.ts`
- Create: `src/lib/onboarding-schema.test.ts`
- Create: `src/components/onboarding/onboarding-form.tsx`
- Modify: `src/app/onboarding/page.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: Convex onboarding functions.
- Produces: Five validated steps, progress navigation, autosave status, review, and resume behavior.

- [x] Build identity, credentials, practice, services, and review steps.
- [x] Show field-level errors and block invalid progression.
- [x] Save before advancing and restore the last saved step.
- [x] Run tests, lint, build, backend deployment, and authenticated persistence/photo checks.
