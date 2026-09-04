/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as blog from "../blog.js";
import type * as booking from "../booking.js";
import type * as enquiries from "../enquiries.js";
import type * as http from "../http.js";
import type * as onboarding from "../onboarding.js";
import type * as preferences from "../preferences.js";
import type * as publishing from "../publishing.js";
import type * as setup from "../setup.js";
import type * as substack from "../substack.js";
import type * as testimonials from "../testimonials.js";
import type * as users from "../users.js";
import type * as websiteEditor from "../websiteEditor.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  auth: typeof auth;
  blog: typeof blog;
  booking: typeof booking;
  enquiries: typeof enquiries;
  http: typeof http;
  onboarding: typeof onboarding;
  preferences: typeof preferences;
  publishing: typeof publishing;
  setup: typeof setup;
  substack: typeof substack;
  testimonials: typeof testimonials;
  users: typeof users;
  websiteEditor: typeof websiteEditor;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
