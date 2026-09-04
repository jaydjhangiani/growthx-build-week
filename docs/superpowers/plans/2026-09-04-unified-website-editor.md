# Unified Website Editor Implementation Plan

> **For agentic workers:** Implement this plan task-by-task in the current session.

**Goal:** Replace separate Preferences, Editor, and Publish workflows with one website editor containing Content, Design, Sections, and Publish tabs.

**Architecture:** Extend the existing editor query and save mutation so design settings share the same save action. Keep the polished shared preview fixed beside tab-specific controls. Reuse the existing publication queries and mutation inside the Publish tab, and redirect old routes for compatibility.

**Tech Stack:** Next.js 16, React 19, Convex, TypeScript

**Spec:** User-approved workflow consolidation before Milestone 14.

### Task 1: One saved editor model

- [x] Save tone and visual style through the editor mutation.
- [x] Keep Website Preferences synchronized for existing data.

### Task 2: Four-tab editor

- [x] Build Content, Design, Sections, and Publish tabs.
- [x] Keep one live desktop/mobile preview visible.
- [x] Reuse subdomain validation, availability, status, and publishing.

### Task 3: Remove duplicate navigation

- [x] Remove Preferences and Publish from the main sidebar.
- [x] Redirect old routes to their editor tabs.

### Task 4: Verification

- [x] Run backend checks, tests, lint, and production build.
