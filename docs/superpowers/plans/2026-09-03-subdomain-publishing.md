# Subdomain Publishing Implementation Plan

> **For agentic workers:** Implement this plan task-by-task in the current session.

**Goal:** Let a signed-in psychologist choose an available Releaf subdomain, preview the final website, publish it, and retain its status.

**Architecture:** Convex stores one publication per user and enforces unique subdomains. The dashboard provides validation, availability feedback, preview, and publishing. A public path mirrors the future subdomain locally until the Releaf domain is purchased.

**Tech Stack:** Next.js 16, React 19, Convex, TypeScript, Vitest

**Spec:** User-provided V1 scoping document and Milestone 12.

## Global Constraints

- Product-owned subdomains only; no custom domains.
- Invalid or unavailable names must be rejected on both client and server.
- Publishing must preserve the selected website and status.
- Do not add payments, analytics, or domain purchase work.

---

### Task 1: Publication data and validation

**Files:**
- Modify: `convex/schema.ts`
- Create: `convex/publishing.ts`
- Create: `src/lib/subdomain.ts`
- Test: `src/lib/subdomain.test.ts`

**Interfaces:**
- Produces `normalizeSubdomain`, `validateSubdomain`, availability query, publication query, and publish mutation.

- [x] Add a `sitePublications` table indexed by user and subdomain.
- [x] Test valid, invalid, normalized, and reserved names.
- [x] Enforce the same rules and uniqueness in the publish mutation.

### Task 2: Publish dashboard

**Files:**
- Create: `src/app/dashboard/publish/page.tsx`
- Create: `src/components/publishing/publish-studio.tsx`
- Modify: `src/components/dashboard/dashboard-shell.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes publication queries/mutation and the shared `WebsitePreview`.
- Produces an editable subdomain field, availability states, final preview, and publish button.

- [x] Suggest a subdomain from the saved psychologist name.
- [x] Show inline validation and availability feedback.
- [x] Disable duplicate publish requests and show clear success/error states.
- [x] Show saved draft or published status after reopening.

### Task 3: Local published website and verification

**Files:**
- Create: `src/app/site/[subdomain]/page.tsx`
- Create: `src/components/website/published-website.tsx`

**Interfaces:**
- Consumes the public publication query.
- Produces `/site/{subdomain}` as the local equivalent of `{subdomain}.releaf...` until a domain is connected.

- [x] Render only published websites.
- [x] Run unit tests, lint, and production build.
- [ ] Verify valid publication and duplicate/invalid rejection in the UI (requires a signed-in browser session).
