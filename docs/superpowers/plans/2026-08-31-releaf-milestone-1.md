# Releaf Milestone 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a responsive sample psychologist website where visitors can reach services, blog, booking, and enquiry sections.

**Architecture:** A Next.js App Router page renders typed sample practice content on the server. The page uses semantic anchor sections and CSS-only responsive navigation so the first milestone ships without unnecessary client JavaScript.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS, Vitest

**Spec:** User-approved scoping document and milestone list in the project conversation.

## Global Constraints

- Build only milestone 1.
- The sample psychologist is fictional.
- The page must work on mobile and desktop.
- Services, blog, booking, and enquiry must be directly reachable.
- No authentication, database, AI generation, or live integrations in this milestone.

---

### Task 1: Responsive sample practice website

**Files:**
- Create: `package.json`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Create: `src/content/sample-practice.ts`
- Create: `src/content/sample-practice.test.ts`
- Create: `public/diva-mehta.png`

**Interfaces:**
- Consumes: The approved milestone and fictional Diva persona.
- Produces: `samplePractice`, `primaryNavigation`, and the `/` sample website.

- [x] **Step 1: Write a content-contract test**

  Assert that navigation exposes `#services`, `#blog`, `#booking`, and `#enquiry`, and that sample cards contain usable content.

- [x] **Step 2: Implement typed sample content**

  Export the practice profile, services, posts, and navigation from one server-safe module.

- [x] **Step 3: Build the semantic page**

  Render introduction, about, focus areas, approach, qualifications, services, fees, FAQs, blog, booking, enquiry, and contact sections.

- [x] **Step 4: Apply responsive styling**

  Use the monsoon-blue practice-journal direction, visible focus states, reduced-motion support, and phone layouts.

- [ ] **Step 5: Verify**

  `npm test`, `npm run lint`, and `npm run build` pass. Desktop and mobile browser inspection remains pending because no in-app browser is connected.
