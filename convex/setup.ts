import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import { query } from "./_generated/server";

export const getChecklist = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError("Sign in to continue.");

    const [
      profile,
      posts,
      substack,
      testimonials,
      booking,
      enquiryForm,
      websiteDraft,
      publication,
    ] = await Promise.all([
      ctx.db
        .query("onboardingDrafts")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .unique(),
      ctx.db
        .query("blogPosts")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("substackConnections")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .unique(),
      ctx.db
        .query("testimonials")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("bookingSettings")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .unique(),
      ctx.db
        .query("enquiryFormConfigs")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .unique(),
      ctx.db
        .query("websiteDrafts")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .unique(),
      ctx.db
        .query("sitePublications")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .unique(),
    ]);

    const nativeBlogReady = posts.some((post) => post.status === "published");
    const substackReady =
      substack?.source === "substack" &&
      Boolean(substack.lastSuccessfulRefresh) &&
      substack.posts.length > 0;

    return {
      profile: [1, 2, 3, 4].every((step) =>
        profile?.completedSteps.includes(step),
      ),
      blog: nativeBlogReady || substackReady,
      testimonials: testimonials.some((item) => item.visible),
      calendly: Boolean(booking?.calendlyUrl),
      enquiry: Boolean(enquiryForm),
      website: Boolean(websiteDraft),
      publish: publication?.status === "published",
    };
  },
});
