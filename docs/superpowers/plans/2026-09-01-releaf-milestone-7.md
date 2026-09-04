# Releaf Milestone 7 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let Diva configure preset enquiry fields and safely test a patient enquiry form.

**Architecture:** A shared field definition validates responses in both React and Convex. Convex stores one configuration per psychologist and uses a client-generated submission key to make repeated submits idempotent.

**Tech Stack:** Next.js 16, React 19, TypeScript, Convex, Vitest, CSS

**Spec:** User-provided scoping document, Milestone 7

## Global Constraints

- Preset fields are name, email, phone number, preferred contact method, preferred appointment format, and short message.
- Each enabled field can be required or optional.
- A standard privacy and consent notice appears before submission.
- Required fields are validated and repeated taps create one submission.
- Email delivery and the enquiries dashboard belong to Milestone 8.

---

### Task 1: Field model and validation

**Files:**
- Create: `src/lib/enquiry.ts`
- Test: `src/lib/enquiry.test.ts`

**Interfaces:**
- Produces: preset field definitions and `validateEnquiryResponses`.

- [ ] Test required, optional, and email validation.
- [ ] Implement the shared validation functions.
- [ ] Run the focused tests.

### Task 2: Convex persistence and duplicate protection

**Files:**
- Modify: `convex/schema.ts`
- Create: `convex/enquiries.ts`

**Interfaces:**
- Produces: `api.enquiries.getConfig`, `saveConfig`, and `submitTest`.

- [ ] Store one field configuration per authenticated user.
- [ ] Store test submissions with a unique submission key.
- [ ] Return the existing submission for a repeated key.
- [ ] Deploy the schema and functions.

### Task 3: Form builder and patient preview

**Files:**
- Create: `src/app/dashboard/enquiry-form/page.tsx`
- Create: `src/components/enquiries/enquiry-builder.tsx`
- Modify: `src/components/dashboard/dashboard-shell.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: enquiry helpers and Convex functions.
- Produces: `/dashboard/enquiry-form`.

- [ ] Add preset-field enable and required controls.
- [ ] Add a patient preview using the saved configuration.
- [ ] Show inline errors and privacy consent.
- [ ] Disable submit in flight and reuse one submission key.
- [ ] Show confirmation after one stored submission.

### Task 4: Verification

**Files:**
- Verify only.

**Interfaces:**
- Produces: Milestone 7 handoff.

- [ ] Run tests, lint, and production build.
- [ ] Confirm the new route responds locally.
