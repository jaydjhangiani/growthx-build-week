import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation, query, type MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

export const analyticsEvent = v.union(
  v.literal("website_view"),
  v.literal("blog_view"),
  v.literal("calendly_click"),
  v.literal("enquiry_start"),
  v.literal("enquiry_complete"),
);

export type AnalyticsEvent =
  | "website_view"
  | "blog_view"
  | "calendly_click"
  | "enquiry_start"
  | "enquiry_complete";

export async function incrementAnalyticsCounter(
  ctx: MutationCtx,
  userId: Id<"users">,
  subdomain: string,
  eventType: AnalyticsEvent,
) {
  const existing = await ctx.db
    .query("analyticsCounters")
    .withIndex("by_user_event", (q) =>
      q.eq("userId", userId).eq("eventType", eventType),
    )
    .unique();
  const updatedAt = Date.now();
  if (existing) {
    await ctx.db.patch(existing._id, {
      count: existing.count + 1,
      subdomain,
      updatedAt,
    });
    return existing.count + 1;
  }
  await ctx.db.insert("analyticsCounters", {
    userId,
    subdomain,
    eventType,
    count: 1,
    updatedAt,
  });
  return 1;
}

export const record = mutation({
  args: { subdomain: v.string(), eventType: analyticsEvent },
  handler: async (ctx, args) => {
    const publication = await ctx.db
      .query("sitePublications")
      .withIndex("by_subdomain", (q) => q.eq("subdomain", args.subdomain))
      .unique();
    if (!publication || publication.status !== "published") return null;
    return await incrementAnalyticsCounter(
      ctx,
      publication.userId,
      publication.subdomain,
      args.eventType,
    );
  },
});

export const getDashboard = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError("Sign in to continue.");
    const counters = await ctx.db
      .query("analyticsCounters")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const totals: Record<AnalyticsEvent, number> = {
      website_view: 0,
      blog_view: 0,
      calendly_click: 0,
      enquiry_start: 0,
      enquiry_complete: 0,
    };
    for (const counter of counters) totals[counter.eventType] += counter.count;
    return totals;
  },
});
