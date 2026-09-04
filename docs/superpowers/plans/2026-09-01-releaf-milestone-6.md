# Releaf Milestone 6 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let Diva save a valid Calendly event link and preview the embedded scheduler while showing a useful inline error for invalid links.

**Architecture:** Keep URL parsing in a shared pure helper so the browser and backend enforce the same rule. Store one booking setting per signed-in user in Convex, and expose it through a focused dashboard page that uses a native iframe only after validation.

**Tech Stack:** Next.js 16, React 19, TypeScript, Convex, Vitest, CSS

**Spec:** User-provided scoping document, Milestone 6

## Global Constraints

- Only Calendly event links are accepted in V1.
- Invalid links show an inline error and are not embedded or saved.
- Calendly manages appointments, reminders, rescheduling, and calendar conflicts.
- Do not add native scheduling, payments, or calendar synchronization.

---

### Task 1: Shared Calendly validation

**Files:**
- Create: `src/lib/calendly.ts`
- Test: `src/lib/calendly.test.ts`

**Interfaces:**
- Produces: `parseCalendlyUrl(value: string): { ok: true; url: string; embedUrl: string } | { ok: false; error: string }`

- [ ] Write tests for valid HTTPS Calendly event URLs and invalid hosts, protocols, and incomplete paths.
- [ ] Run the focused test and confirm it fails before implementation.
- [ ] Implement normalization and validation without network calls.
- [ ] Run the focused test and confirm it passes.

### Task 2: Persist booking settings

**Files:**
- Modify: `convex/schema.ts`
- Create: `convex/booking.ts`

**Interfaces:**
- Consumes: authenticated Convex user identity.
- Produces: `api.booking.get` and `api.booking.save`.

- [ ] Add a one-row-per-user `bookingSettings` table.
- [ ] Add an authenticated query returning the saved URL or an empty value.
- [ ] Add an authenticated mutation that repeats the URL validation and saves only valid links.
- [ ] Deploy the Convex schema and functions to the connected development backend.

### Task 3: Calendly settings and preview page

**Files:**
- Create: `src/app/dashboard/calendly/page.tsx`
- Create: `src/components/booking/calendly-settings.tsx`
- Modify: `src/components/dashboard/dashboard-shell.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `api.booking.get`, `api.booking.save`, and `parseCalendlyUrl`.
- Produces: `/dashboard/calendly` settings route with inline validation, save state, and scheduler iframe.

- [ ] Add Calendly to dashboard navigation.
- [ ] Build an accessible URL form with an example and a clear ownership note.
- [ ] Show an inline error without rendering an iframe when invalid.
- [ ] Render the normalized Calendly scheduling page after successful validation.
- [ ] Save the valid URL and show a clear saved state.
- [ ] Check the layout at desktop and mobile widths where browser access is available.

### Task 4: Milestone verification

**Files:**
- Modify: `docs/superpowers/plans/2026-09-01-releaf-milestone-6.md`

**Interfaces:**
- Consumes: the completed validation, persistence, and page work.
- Produces: a verified Milestone 6 handoff.

- [ ] Run `npm test`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Confirm `/dashboard/calendly` responds from the local app.
- [ ] Record what was built, how the user verifies it, and assumptions made.
