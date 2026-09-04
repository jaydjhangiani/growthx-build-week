# Substack RSS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a psychologist choose Substack as her blog source, import public RSS posts, refresh them safely, and display cached posts on her published website.

**Architecture:** A pure TypeScript module validates `*.substack.com` publication URLs and parses RSS into safe metadata. A Convex action fetches the feed, while mutations store the connection and latest successful post snapshot; failed refreshes update an error without deleting cached posts. The public journal returns one shared card shape for native and Substack posts.

**Tech Stack:** Next.js 16, React 19, TypeScript, Convex, Vitest, CSS

**Spec:** Original V1 scoping document in the active conversation; official Substack RSS format at `https://support.substack.com/hc/en-us/articles/360038239391-Is-there-an-RSS-feed-for-my-publication`.

## Global Constraints

- Blogging remains mandatory and has exactly two sources: Native blog or Substack.
- Only public `*.substack.com/feed` URLs are fetched.
- Imported cards contain title, summary, image, publication date, and original article URL.
- Refresh failure must preserve the latest successful posts.
- Releaf does not edit or publish Substack posts.

---

### Task 1: Validate and parse Substack feeds

**Files:**
- Create: `src/lib/substack.ts`
- Test: `src/lib/substack.test.ts`

**Interfaces:**
- Produces: `normalizeSubstackUrl(value)`, `parseSubstackFeed(xml)`, and `ImportedSubstackPost`.

- [x] Test valid publication URLs, `/feed` normalization, non-HTTPS URLs, and non-Substack hosts.
- [x] Test RSS parsing for title, summary, image, date, GUID, and original URL.
- [x] Implement URL normalization restricted to HTTPS Substack publication subdomains.
- [x] Implement bounded RSS metadata parsing with HTML removal and XML entity decoding.
- [x] Run `npm test -- src/lib/substack.test.ts` and confirm it passes.

### Task 2: Store and refresh the connection

**Files:**
- Modify: `convex/schema.ts`
- Create: `convex/substack.ts`

**Interfaces:**
- Consumes: `normalizeSubstackUrl` and `parseSubstackFeed` from Task 1.
- Produces: `api.substack.get`, `api.substack.refresh`, and `api.substack.chooseSource`.

- [x] Add a `substackConnections` table indexed by user with source, URLs, cached posts, refresh timestamps, and last error.
- [x] Add an authenticated query that defaults new users to the Native source.
- [x] Add an authenticated action with timeout and response-size checks that fetches the normalized feed.
- [x] Store successful post snapshots atomically and clear the last error.
- [x] On failure, retain cached posts, record a useful error, and return that error to the dashboard.
- [x] Add a source mutation that rejects Substack selection until a feed has connected successfully.

### Task 3: Build the Blog source dashboard

**Files:**
- Create: `src/app/dashboard/substack/page.tsx`
- Create: `src/components/blog/substack-settings.tsx`
- Modify: `src/components/dashboard/dashboard-shell.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: Task 2 APIs.
- Produces: a Blog source navigation item and connection/refresh/source controls.

- [x] Add Native and Substack source choices with a clear active state.
- [x] Add a publication URL form with inline validation and disabled duplicate submissions.
- [x] Show the connected URL, last successful refresh, cached post count, and retry-safe errors.
- [x] Show cached post previews and link them to their original Substack pages.
- [x] Add neutral Releaf dashboard styling with responsive layout and accessible 44px controls.

### Task 4: Render the selected source publicly

**Files:**
- Modify: `convex/blog.ts`
- Modify: `src/components/website/public-journal.tsx`

**Interfaces:**
- Consumes: cached Substack posts and selected source from Task 2.
- Produces: one public journal card model with `source`, `href`, and metadata.

- [x] Return cached Substack posts when the selected source is Substack.
- [x] Keep the existing native post query when the selected source is Native.
- [x] Open Substack posts at the original article URL in a new tab.
- [x] Preserve native internal article links and existing analytics behavior.
- [x] Run Convex code generation, all tests, lint, and the production build.
