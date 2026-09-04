# Releaf Product Restyle Implementation Plan

> **For agentic workers:** Implement these tasks in order and verify each task before moving on.

**Goal:** Restyle Releaf’s homepage and builder/dashboard using the bright, approachable visual language of the reference site while leaving psychologist websites unchanged.

**Architecture:** Add product-only design tokens and scoped CSS overrides for `.releaf-home`, `.auth-shell`, and `.dashboard-shell`. Keep `.website-preview`, published psychologist pages, and their palette controls isolated from the product theme.

**Tech Stack:** Next.js 16, React 19, CSS, TypeScript

**Spec:** User request referencing `https://help-releaf.web.app/` in this conversation.

## Global Constraints

- Apply the redesign to Releaf’s main website and builder/dashboard.
- Do not restyle psychologist websites.
- Adapt the reference’s visual language; do not copy its interface exactly.
- Preserve existing functionality and responsive behavior.

---

### Task 1: Product design tokens

**Files:**

- Modify: `src/app/globals.css`

- [ ] Add scoped sky, deep blue, cloud, lavender, white, and coral tokens.
- [ ] Add a friendly geometric display stack and readable body stack.
- [ ] Define consistent radii, borders, focus rings, and soft elevation.

### Task 2: Homepage restyle

**Files:**

- Modify: `src/app/globals.css`

- [ ] Restyle navigation, hero, preview window, process cards, CTA, and footer.
- [ ] Keep the current homepage content and links.
- [ ] Preserve mobile layouts.

### Task 3: Builder and account restyle

**Files:**

- Modify: `src/app/globals.css`

- [ ] Restyle dashboard navigation, headers, cards, inputs, tabs, and primary actions.
- [ ] Apply the same product language to sign-in and onboarding.
- [ ] Keep the live psychologist preview visually isolated.

### Task 4: Verification

- [ ] Run `npm test`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Visually verify homepage, dashboard, editor, and mobile states when browser access is available.
