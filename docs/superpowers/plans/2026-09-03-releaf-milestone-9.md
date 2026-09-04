# Releaf Milestone 9 Implementation Plan

> **Status:** Deferred from V1 by product decision on 3 September 2026. V1 will use the psychologist's own onboarding copy inside the selected template.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate and save three distinct structured website options from Diva’s saved practice information.

**Architecture:** An authenticated Convex action loads the profile and website preferences, calls the OpenAI Responses API with strict JSON Schema output, and stores the three options in Convex. React displays saved results as three comparable preview cards.

**Tech Stack:** Next.js 16, React 19, TypeScript, Convex, OpenAI Responses API, CSS

**Spec:** User-provided scoping document, Milestone 9

## Global Constraints

- Generate exactly three directions: Warm and approachable, Calm and minimal, Professional and credibility-focused.
- Generate structured content and branding settings, not website code.
- Each option includes template, palette, headline, biography, service descriptions, therapeutic approach, FAQs, and calls to action.
- Use only facts found in Diva’s saved information; do not invent qualifications, experience, services, or fees.
- Save generated options for later selection and editing.

---

### Task 1: Generation storage and backend action

**Files:** Modify `convex/schema.ts`; create `convex/generation.ts`.

- [ ] Add a website generation table with structured option fields.
- [ ] Load the authenticated psychologist’s saved profile and preferences.
- [ ] Call OpenAI with strict JSON Schema and response storage disabled.
- [ ] Validate exactly three named directions and persist them.

### Task 2: Generation studio

**Files:** Create `src/app/dashboard/generate/page.tsx` and `src/components/generation/generation-studio.tsx`; modify navigation and CSS.

- [ ] Add a review summary and one Generate button.
- [ ] Disable the button while the request runs.
- [ ] Display three distinct saved options with their content and branding.
- [ ] Show a clear error without clearing saved profile information.

### Task 3: Verification

- [ ] Deploy Convex functions.
- [ ] Run tests, lint, and production build.
- [ ] Confirm the generation route responds locally.
- [ ] Run one real generation if the configured OpenAI account permits it.
