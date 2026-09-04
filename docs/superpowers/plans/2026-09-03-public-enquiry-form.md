# Public Enquiry Form Implementation Plan

> **For agentic workers:** Implement this plan task-by-task in the current session.

**Goal:** Put Diva's configured enquiry form on her published website and save real visitor submissions safely.

**Architecture:** A public Convex query exposes only enabled field configuration and display name. A public mutation resolves the published subdomain to its owner, validates against the saved configuration, deduplicates submissions, stores them, and schedules email delivery. The published React form reuses the existing validation rules and privacy notice.

**Tech Stack:** Next.js 16, React 19, Convex, TypeScript, Vitest

**Spec:** User-provided V1 scoping document, Milestones 7, 8, and 13.

## Global Constraints

- Use only Diva's configured preset fields.
- Validate required fields and consent before submission.
- Disable repeated submissions and deduplicate on the backend.
- Keep the dashboard copy when email delivery fails.
- Do not create patient accounts or clinical records.

### Task 1: Public backend

- [x] Add a public form-config query by published subdomain.
- [x] Add an unauthenticated submission mutation with server validation and deduplication.
- [x] Schedule email delivery without requiring the visitor to sign in.

### Task 2: Published form

- [x] Render the configured fields and standard privacy consent notice.
- [x] Show inline errors and disable the submit button while sending.
- [x] Show a clear confirmation after success.
- [x] Connect published enquiry buttons to the form.

### Task 3: Verification

- [x] Run all unit tests, backend type checks, lint, and production build.
