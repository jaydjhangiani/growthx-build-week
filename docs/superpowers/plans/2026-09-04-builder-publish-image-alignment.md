# Builder Publish, Image, and Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make publishing easier to find, reduce the public portrait size, and let psychologists align each website section left, centre, or right.

**Architecture:** Keep the existing Publish tab and add a header shortcut that opens it, because publishing still needs address validation. Store section alignment beside the existing per-section background choices, include it in publication snapshots, and let the shared preview renderer apply the same alignment in editor and public views.

**Tech Stack:** Next.js 16, React 19, TypeScript, Convex, CSS

**Spec:** User request in the active conversation on 2026-09-04.

## Global Constraints

- Keep the current Publish tab and subdomain checks.
- Alignment is selected separately for each website section.
- Existing drafts and published sites default to left alignment.
- The portrait must remain responsive on mobile.

---

### Task 1: Persist section alignment

**Files:**

- Modify: `convex/schema.ts`
- Modify: `convex/websiteEditor.ts`
- Modify: `convex/publishing.ts`

**Interfaces:**

- Produces: `sectionAlignments: Array<{ sectionId: string; alignment: "left" | "center" | "right" }>`

- [x] Add optional alignment arrays to website drafts and publication snapshots so old records remain valid.
- [x] Return one alignment entry per supported section, defaulting missing entries to `left`.
- [x] Validate and save alignments only for supported sections.
- [x] Copy alignments into each published snapshot and public-site response.
- [x] Run `npx convex codegen` and confirm generated types compile.

### Task 2: Add builder controls and publishing shortcut

**Files:**

- Modify: `src/components/website/website-editor.tsx`
- Modify: `src/components/publishing/publish-studio.tsx`
- Modify: `src/components/website/published-website.tsx`

**Interfaces:**

- Consumes: `sectionAlignments` from Task 1.
- Produces: a Publish header button and a per-section alignment selector.

- [x] Include `sectionAlignments` in editor saves and both preview call sites.
- [x] Add an accessible Left/Centre/Right selector to every row in the Sections tab.
- [x] Add a `Publish website` header button that opens the existing Publish tab.
- [x] Keep the existing Publish tab as the place where the public address is checked and publishing is confirmed.

### Task 3: Render alignment and compact portrait

**Files:**

- Modify: `src/components/onboarding/preference-studio.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**

- Consumes: `PreviewAppearance.sectionAlignments`.
- Produces: `section-align-left`, `section-align-center`, and `section-align-right` classes.

- [x] Add the selected alignment class in the shared section renderer.
- [x] Align headings, body copy, buttons, service cards, and public integration content without changing section order or colour.
- [x] Reduce the public hero portrait to a centred portrait frame with a responsive maximum size.
- [x] Keep the mobile hero in one column and prevent the portrait from overflowing.
- [x] Run tests, lint, and the production build.
