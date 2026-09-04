# Releaf Milestone 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let psychologists create an account with email and password, sign in, sign out, and enter protected onboarding or dashboard routes.

**Architecture:** Convex Auth owns password hashing, sessions, and user identity. A profile record stores whether onboarding is complete; protected client gates route new accounts to onboarding and returning completed accounts to the dashboard.

**Tech Stack:** Next.js 16, React 19, TypeScript, Convex, Convex Auth, Zod, Vitest

**Spec:** User-approved scoping document and milestone list in the project conversation.

## Global Constraints

- Build only milestone 2.
- Authentication uses email and password.
- New users enter onboarding; completed users enter the dashboard.
- Passwords must never be stored or handled by application tables.
- Onboarding fields belong to milestone 3.

---

### Task 1: Convex password authentication

**Files:**
- Create: `convex/auth.ts`
- Create: `convex/auth.config.ts`
- Create: `convex/http.ts`
- Create: `convex/schema.ts`
- Create: `convex/users.ts`

**Interfaces:**
- Consumes: Convex Auth password provider.
- Produces: Auth endpoints, profile creation, and `api.users.me`.

- [x] Configure password authentication and required auth tables.
- [x] Create a profile once for each new account.
- [x] Expose the current user and onboarding status.

### Task 2: Account and protected product screens

**Files:**
- Create: `src/components/providers.tsx`
- Create: `src/components/auth/auth-form.tsx`
- Create: `src/components/auth/auth-gate.tsx`
- Create: `src/components/auth/sign-out-button.tsx`
- Create: `src/app/(auth)/layout.tsx`
- Create: `src/app/(auth)/sign-up/page.tsx`
- Create: `src/app/(auth)/sign-in/page.tsx`
- Create: `src/app/page.tsx`
- Move: `src/app/page.tsx` to `src/app/demo/page.tsx` for the sample output
- Create: `src/app/onboarding/page.tsx`
- Create: `src/app/dashboard/page.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `useAuthActions`, `useConvexAuth`, and `api.users.me`.
- Produces: `/sign-up`, `/sign-in`, `/onboarding`, and `/dashboard`.

- [x] Build account forms with clear validation and pending/error states.
- [x] Connect the Releaf landing page to signup and preserve Diva's site at `/demo`.
- [x] Route successful sign-up to onboarding and sign-in by profile state.
- [x] Protect onboarding and dashboard and add sign-out.
- [x] Run automated checks and verify a real account round trip.
