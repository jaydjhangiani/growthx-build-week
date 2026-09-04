# Polished Psychologist Template Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the polished Diva demo the real website template used by the builder preview and every published psychologist website.

**Architecture:** Create one presentation component that accepts the existing profile, content, appearance, ordering, and interactive section slots. The demo, editor preview, and published route will all render that component so their structure cannot drift again. Keep data fetching and mutations in the existing public wrapper components.

**Tech Stack:** Next.js 16, React 19, TypeScript, Convex, CSS

**Spec:** `docs/superpowers/plans/2026-09-04-unified-website-editor.md` plus the current psychologist website builder scoping document.

## Global Constraints

- Only use fields and features already present in the V1 scoping document.
- Preserve section hiding, ordering, backgrounds, alignment, typography, spacing, image, and navbar controls.
- Preserve real blog, Calendly, enquiry, testimonial, and analytics behaviour on published sites.
- The builder preview and published website must share the same markup.
- Keep the page responsive and keyboard accessible.

---

### Task 1: Shared template model

**Files:**
- Create: `src/lib/site-template.ts`
- Create: `src/lib/site-template.test.ts`

**Interfaces:**
- Consumes: enabled section IDs, section order, and service details.
- Produces: `orderedEnabledSections`, `navigationForSections`, and `formatServiceDetails`.

- [ ] **Step 1: Write failing tests**

Test that disabled sections are removed without changing order, navigation only links to visible destinations, and service duration, format, and fee are formatted consistently.

- [ ] **Step 2: Run the focused test**

Run: `npm test -- src/lib/site-template.test.ts`

Expected: FAIL because the helpers do not exist.

- [ ] **Step 3: Implement the helpers**

Use pure functions with no React or browser dependency so editor and published rendering use identical decisions.

- [ ] **Step 4: Run the focused test**

Run: `npm test -- src/lib/site-template.test.ts`

Expected: PASS.

### Task 2: Real polished template component

**Files:**
- Create: `src/components/website/polished-site-template.tsx`
- Modify: `src/components/onboarding/preference-studio.tsx`

**Interfaces:**
- Consumes: existing `Profile`, `Preferences`, `PreviewContent`, `PreviewAppearance`, section order, interactive content slots, Calendly URL, and booking callback.
- Produces: `PolishedSiteTemplate`, used through the existing `WebsitePreview` public API.

- [ ] **Step 1: Extract the demo’s visual structure**

Build the introduction, therapy types, services, qualifications, journal, discovery call, enquiry, FAQ, testimonials, contact, and footer as ordered template sections.

- [ ] **Step 2: Connect real builder data**

Map psychologist name, city, image, headline, biography, who-I-help copy, approach, qualifications, services, fees, and contact details into the design. Use restrained template copy only for labels and calls to action.

- [ ] **Step 3: Preserve interactive slots**

Render existing `PublicJournal`, `PublicCalendly`, `PublicEnquiryForm`, and `PublicTestimonials` nodes inside the polished section frames when `interactive` is true. Keep preview-only representations otherwise.

- [ ] **Step 4: Preserve controls**

Apply existing palettes, type choices, sizes, spacing, section backgrounds, section alignment, image shape, image background, image padding, image border, navbar layout, and navbar button style.

### Task 3: One renderer everywhere

**Files:**
- Modify: `src/app/demo/page.tsx`
- Modify: `src/components/website/published-website.tsx`

**Interfaces:**
- Consumes: `WebsitePreview` and existing sample or public data.
- Produces: identical page structure in demo, editor preview, and published websites.

- [ ] **Step 1: Replace hardcoded demo markup**

Map `samplePractice` into the same props used by the builder and render `WebsitePreview`.

- [ ] **Step 2: Confirm published data mapping**

Keep the current Convex queries, analytics mutation, and public content components; only the shared presentation layer changes.

### Task 4: Polished responsive styling

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `.website-preview` appearance classes and polished template section classes.
- Produces: full-size public layouts and compact but faithful editor previews.

- [ ] **Step 1: Scope the visual system**

Use the existing palette variables as the source for ink, paper, soft, and accent colours. Scope selectors under `.website-preview` to avoid changing the Releaf builder dashboard.

- [ ] **Step 2: Match the demo’s hierarchy**

Implement the two-column hero, focus-area strip, editorial about section, numbered therapy list, service cards, journal grid, framed booking area, split enquiry layout, and expandable FAQ list.

- [ ] **Step 3: Make previews faithful**

Use container-aware sizing so the editor preview shows the same design at a smaller scale without separate markup.

- [ ] **Step 4: Add mobile behaviour**

Collapse grids, keep tap targets usable, preserve readable type, and avoid horizontal overflow below 700px.

### Task 5: Verification and deployment

**Files:**
- Modify only files required by fixes found during verification.

**Interfaces:**
- Consumes: completed shared template.
- Produces: a tested GitHub commit and automatic Vercel/Convex deployment.

- [ ] **Step 1: Run all automated checks**

Run: `npm test && npm run lint && npm run build`

Expected: all tests pass, lint exits cleanly, and all Next.js routes build.

- [ ] **Step 2: Check the public routes**

Verify `/demo`, `/sign-in`, and `/sign-up` return HTTP 200 after deployment.

- [ ] **Step 3: Commit and push**

Commit the shared renderer and push `main`; confirm Vercel runs `npx convex deploy --cmd 'npm run build'` successfully.

- [ ] **Step 4: Manual visual check**

Compare `/demo`, the website editor preview, and a newly published production site at desktop and mobile sizes. Confirm the journal, Calendly, enquiry, and FAQ interactions work.

