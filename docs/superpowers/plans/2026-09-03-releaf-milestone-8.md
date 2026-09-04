# Releaf Milestone 8 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show stored enquiries in Diva’s dashboard and deliver a copy by email without losing the dashboard copy when delivery fails.

**Architecture:** Convex remains the source of truth: the enquiry is stored before email is attempted. A Convex action calls Resend, records sent or failed delivery state, and the authenticated inbox reads only the current psychologist’s enquiries.

**Tech Stack:** Next.js 16, React 19, TypeScript, Convex actions, Resend HTTP API, Vitest, CSS

**Spec:** User-provided scoping document, Milestone 8

## Global Constraints

- Store the enquiry before attempting email.
- Preserve the dashboard copy if email delivery fails.
- Show new and read enquiry states.
- Do not add a patient CRM or clinical-record features.
- Use `onboarding@resend.dev` only for test delivery until a sending domain is verified.

---

### Task 1: Delivery state and inbox queries

**Files:** Modify `convex/schema.ts` and `convex/enquiries.ts`.

- [ ] Add optional email delivery fields without invalidating saved enquiries.
- [ ] Add authenticated list and mark-read functions.
- [ ] Add private delivery-data and delivery-result functions.

### Task 2: Resend delivery action

**Files:** Modify `convex/enquiries.ts`.

- [ ] Read the stored enquiry and practice contact email.
- [ ] Call Resend with an idempotency key.
- [ ] Record sent or failed delivery state without deleting the enquiry.

### Task 3: Enquiries dashboard

**Files:** Create `src/app/dashboard/enquiries/page.tsx`, `src/components/enquiries/enquiry-inbox.tsx`; modify dashboard navigation and CSS.

- [ ] Show enquiry summaries, test labels, dates, and email status.
- [ ] Open an enquiry and show all configured answers.
- [ ] Mark opened enquiries read.
- [ ] Explain delivery failure without hiding the saved response.

### Task 4: Verification

- [ ] Deploy Convex functions.
- [ ] Run tests, lint, and production build.
- [ ] Confirm the inbox route responds locally.
