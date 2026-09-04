# Milestone 14 Analytics Implementation Plan

> **For agentic workers:** Implement these tasks in order and verify each task before moving on.

**Goal:** Record and display anonymous totals for website views, blog views, Calendly clicks, enquiry-form starts, and completed enquiries.

**Architecture:** Store one aggregate counter per published website and event type. Public components call one narrow mutation; enquiry completion increments inside the existing submission mutation. The dashboard reads only totals, so no visitor identity or detailed patient profile is created.

**Tech Stack:** Next.js 16, React 19, Convex, TypeScript, Vitest

**Spec:** User-provided V1 milestone 14 and scoping document in this conversation.

## Global Constraints

- Analytics must be aggregated and must not create detailed patient profiles.
- Track exactly the five milestone events.
- Do not add external analytics services.

---

### Task 1: Anonymous counters

**Files:**

- Modify: `convex/schema.ts`
- Create: `convex/analytics.ts`

**Interfaces:**

- Produces: `analytics.record({ subdomain, eventType })` and `analytics.getDashboard()`.

- [ ] Add an `analyticsCounters` table keyed by website owner and event type.
- [ ] Add a public mutation that resolves a published subdomain and increments its matching counter.
- [ ] Add an authenticated dashboard query returning all five totals with zeroes for missing counters.
- [ ] Run `npx convex dev --once` and confirm function generation succeeds.

### Task 2: Public event recording

**Files:**

- Modify: `src/components/website/published-website.tsx`
- Modify: `src/components/onboarding/preference-studio.tsx`
- Modify: `src/components/enquiries/public-enquiry-form.tsx`
- Modify: `src/components/website/public-journal.tsx`
- Modify: public article component discovered under `src/components` or `src/app/[subdomain]`.

**Interfaces:**

- Consumes: `analytics.record({ subdomain, eventType })`.

- [ ] Record one website view when a published website mounts.
- [ ] Record one blog view when a published article mounts.
- [ ] Record Calendly CTA clicks before navigation.
- [ ] Record the first enquiry-form interaction once per mounted form.
- [ ] Increment completed enquiries only after the existing backend accepts a submission.

### Task 3: Dashboard totals

**Files:**

- Modify: `src/components/dashboard/dashboard-overview.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**

- Consumes: `analytics.getDashboard()`.

- [ ] Add a calm five-metric analytics panel beneath website status.
- [ ] Show zero for events that have not occurred and a loading state while totals load.
- [ ] Keep the existing responsive dashboard layout.

### Task 4: Verification

**Files:**

- Test: existing Vitest suite and production build.

- [ ] Run `npm test` and confirm all tests pass.
- [ ] Run `npm run lint` and confirm no lint errors.
- [ ] Run `npm run build` and confirm TypeScript and production compilation pass.
- [ ] Verify public actions and dashboard totals in the browser when a browser connection is available.
