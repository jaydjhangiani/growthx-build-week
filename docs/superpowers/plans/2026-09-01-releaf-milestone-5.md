# Releaf Milestone 5 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let Diva write, preview, save, publish, edit, and download native Markdown articles.

**Architecture:** Authenticated Convex functions own post drafts, publication state, per-user slug uniqueness, and cover-image storage. The editor keeps Markdown local while writing, renders a safe React preview, and explicitly saves drafts or publishes validated content.

**Tech Stack:** Next.js 16, React 19, TypeScript, Convex, React Markdown, remark-gfm, Vitest

**Spec:** User-approved scoping document and milestone list in the project conversation.

## Global Constraints

- Build only milestone 5.
- Empty titles and bodies cannot publish.
- Duplicate slugs return alternative suggestions.
- Markdown downloads include source content, not generated HTML.
- Cover images use object storage; the database stores their IDs and URLs.

---

### Task 1: Native blog storage and rules

**Files:**
- Modify: `convex/schema.ts`
- Create: `convex/blog.ts`
- Create: `src/lib/blog.ts`
- Create: `src/lib/blog.test.ts`

**Interfaces:**
- Produces: post list/read/save and cover upload functions.

- [x] Store drafts and published posts per authenticated user.
- [x] Enforce publish requirements and unique slugs.
- [x] Suggest alternative slugs and preserve drafts on validation failure.

### Task 2: Blog library and Markdown editor

**Files:**
- Create: `src/components/dashboard/dashboard-shell.tsx`
- Create: `src/components/blog/blog-list.tsx`
- Create: `src/components/blog/blog-editor.tsx`
- Create: `src/components/blog/markdown-preview.tsx`
- Create: `src/app/dashboard/blog/page.tsx`
- Create: `src/app/dashboard/blog/[postId]/page.tsx`
- Modify: `src/app/dashboard/page.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: native blog functions.
- Produces: library, editor, preview, cover upload, SEO fields, publish controls, and `.md` download.

- [x] Build draft/published library and empty state.
- [x] Build Markdown writing and preview modes.
- [x] Add save, publish, edit, slug suggestions, SEO, cover upload, and download.
- [x] Deploy and run tests, lint, build, and authenticated lifecycle checks.
