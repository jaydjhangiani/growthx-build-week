# Public Blog and Calendly Implementation Plan

> **For agentic workers:** Implement this plan task-by-task in the current session.

**Goal:** Finish Milestone 13 locally by showing published native articles and Diva's embedded Calendly scheduler on the public website.

**Architecture:** Public Convex queries resolve a published subdomain to its owner and return only published posts. Focused React components render journal cards, article pages, and the validated Calendly embed beneath the shared website design.

**Tech Stack:** Next.js 16, React 19, Convex, TypeScript, React Markdown

**Spec:** User-provided V1 scoping document, Milestone 13.

### Task 1: Public blog data

- [x] Query published posts by public subdomain.
- [x] Query one published post by subdomain and slug.

### Task 2: Public journal

- [x] Render real post cards with title, description, image, and date.
- [x] Add public article pages with Markdown content and metadata.

### Task 3: Public Calendly

- [x] Embed the validated saved event URL when booking is enabled.
- [x] Keep buttons linked to the same event.

### Task 4: Verification

- [x] Run backend checks, all tests, lint, and production build.
