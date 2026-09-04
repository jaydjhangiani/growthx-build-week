# Testimonials Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a psychologist add written or image testimonials, choose which appear, arrange them, and show the active format in a manual public-site slider.

**Architecture:** Convex stores a per-user display format and ordered testimonial records; uploaded images remain in Convex object storage. A dashboard form manages both saved sets without deleting the inactive set. The website editor controls whether the section is visible and where it appears, while the public component reads only enabled records for the published owner.

**Tech Stack:** Next.js 16, React 19, TypeScript, Convex, Vitest, CSS.

**Spec:** User-approved testimonial addition in the product scoping conversation.

## Global Constraints

- Support exactly two formats: written testimonials and uploaded testimonial images.
- The psychologist chooses the active format and which entries are displayed.
- Changing format must not delete the other saved set.
- The public slider is manual and accessible; it does not autoplay.
- Testimonial images are stored in object storage and only their IDs are stored in the database.
- Do not add moderation, AI rewriting, patient profiles, or any other feature outside this request.

---

### Task 1: Testimonial data and validation

**Files:**
- Create: `src/lib/testimonials.ts`
- Create: `src/lib/testimonials.test.ts`
- Create: `convex/testimonials.ts`
- Modify: `convex/schema.ts`

**Interfaces:**
- Consumes: authenticated Convex user IDs and Convex object storage.
- Produces: `validateWrittenTestimonial`, `validateTestimonialImage`, and authenticated/public testimonial queries and mutations.

- [ ] Write tests covering missing/long written text, optional attribution, allowed image types, and the 5 MB image limit.
- [ ] Run `npm test -- src/lib/testimonials.test.ts` and confirm the new tests fail.
- [ ] Add pure validation helpers with clear user-facing errors.
- [ ] Add `testimonialSettings` and `testimonials` tables indexed by user.
- [ ] Add queries and mutations to choose format, add written/image records, show/hide, reorder, delete, and read enabled public records.
- [ ] Run `npm test -- src/lib/testimonials.test.ts` and confirm it passes.

### Task 2: Dashboard testimonial form

**Files:**
- Create: `src/app/dashboard/testimonials/page.tsx`
- Create: `src/components/testimonials/testimonial-settings.tsx`
- Modify: `src/components/dashboard/dashboard-shell.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `api.testimonials.get`, `chooseFormat`, `addWritten`, `generateUploadUrl`, `addImage`, `setVisible`, `move`, and `remove`.
- Produces: a dashboard route where the psychologist chooses Written or Image, adds entries, and manages display order and visibility.

- [ ] Add the authenticated route and dashboard navigation link.
- [ ] Build the format switcher; keep the inactive format’s saved records intact.
- [ ] Build the written form with required testimonial text and optional name/context.
- [ ] Build image upload with JPG, PNG, or WebP validation and a 5 MB limit.
- [ ] Add saved-item controls for show/hide, move up/down, and delete with confirmation.
- [ ] Add loading, empty, success, error, disabled, keyboard-focus, and mobile states.
- [ ] Include a plain notice to publish only testimonials the psychologist has permission to share and to avoid private clinical details.

### Task 3: Editor section and public slider

**Files:**
- Create: `src/components/website/public-testimonials.tsx`
- Modify: `src/components/onboarding/preference-studio.tsx`
- Modify: `src/components/website/website-editor.tsx`
- Modify: `src/components/website/published-website.tsx`
- Modify: `convex/preferences.ts`
- Modify: `convex/websiteEditor.ts`
- Modify: `convex/publishing.ts`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `api.testimonials.listPublic({ subdomain })` and the existing section order/background/alignment system.
- Produces: a disabled-by-default Testimonials section that can be enabled, reordered, styled, published, and viewed as a manual slider.

- [ ] Register `testimonials` in every section allowlist and label list without enabling it for existing or new sites by default.
- [ ] Add a representative testimonial placeholder to the editor preview.
- [ ] Add the public slider with one visible item, previous/next buttons, position status, dots, and no autoplay.
- [ ] Render written text or an uploaded image based on the selected format.
- [ ] Respect the site’s fonts, colours, spacing, section background, and text alignment.
- [ ] Keep empty public testimonial data from rendering a blank section.

### Task 4: Deployment and verification

**Files:**
- Modify generated Convex files through `npx convex dev --once`.

**Interfaces:**
- Consumes: all testimonial code from Tasks 1–3.
- Produces: deployed Convex functions and a verified production build.

- [ ] Run `npx convex dev --once` to deploy schema and functions.
- [ ] Run `npm test`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Open the dashboard and public website in a browser at desktop and mobile widths; verify add, upload, hide, reorder, format switching, editor placement, publishing, and slider controls.
- [ ] Record any unavailable browser-only check honestly in the handoff.

## Self-review

- Spec coverage: both input formats, active-format choice, selected entries, ordering, object storage, and public slider are mapped above.
- Placeholder scan: no deferred implementation steps or unspecified error handling remain.
- Type consistency: `written | image` is used for both saved settings and records; public records always expose `id`, `kind`, `attribution`, and either `quote` or `imageUrl`.
