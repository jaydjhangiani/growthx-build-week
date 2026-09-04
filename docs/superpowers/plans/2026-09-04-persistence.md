# Milestone 15 Persistence Implementation Plan

> **For agentic workers:** Implement these tasks in order and verify each task before moving on.

**Goal:** Ensure Diva’s account, onboarding, website, blog, enquiry, analytics, subdomain, and retention data survive closing and reopening Releaf.

**Architecture:** Keep Convex as the single long-term data store. Add debounced editor saving for website changes and store enquiry retention beside the form configuration; schedule each public enquiry for deletion at its saved expiry date.

**Tech Stack:** Next.js 16, React 19, Convex, TypeScript, Vitest

**Spec:** User-provided V1 milestone 15 and scoping document in this conversation.

## Global Constraints

- Retention choices are 30 days, 90 days, or 6 months (180 days).
- Existing enquiries without an expiry date remain available.
- Email failure must not remove the dashboard copy before its retention date.
- Do not store product data only in browser storage.

---

### Task 1: Audit existing persistence

**Files:**

- Inspect: `convex/schema.ts`
- Inspect: `convex/onboarding.ts`
- Inspect: `convex/websiteEditor.ts`
- Inspect: `convex/blog.ts`
- Inspect: `convex/enquiries.ts`
- Inspect: `convex/analytics.ts`
- Inspect: `convex/publishing.ts`

- [x] Map every milestone item to its Convex table and authenticated query.
- [x] Search for browser-only storage and unsaved component state.

### Task 2: Website editor auto-save

**Files:**

- Modify: `src/components/website/website-editor.tsx`

- [x] Debounce website draft saves after edits.
- [x] Prevent an older save response from marking newer edits as saved.
- [x] Preserve the manual Save button and publishing’s save-before-publish behavior.

### Task 3: Enquiry retention persistence

**Files:**

- Modify: `convex/schema.ts`
- Modify: `convex/enquiries.ts`
- Modify: `src/components/dashboard/dashboard-overview.tsx`
- Modify: `src/app/globals.css`

- [x] Store a 30, 90, or 180-day retention setting per user.
- [x] Save an expiry time on each accepted public enquiry.
- [x] Schedule deletion at expiry without depending on email success.
- [x] Show and save the retention choice in the dashboard.

### Task 4: Verification

- [x] Run `npx convex dev --once`.
- [x] Run `npm test`.
- [x] Run `npm run lint`.
- [x] Run `npm run build`.
- [ ] Reopen each product area in a browser when browser access is available.
