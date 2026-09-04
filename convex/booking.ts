import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { parseCalendlyUrl } from "../src/lib/calendly";
import { mutation, query } from "./_generated/server";

async function userIdOrThrow(ctx: Parameters<typeof getAuthUserId>[0]) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) throw new ConvexError("Sign in to continue.");
  return userId;
}

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await userIdOrThrow(ctx);
    const saved = await ctx.db.query("bookingSettings").withIndex("by_user", (q) => q.eq("userId", userId)).unique();
    return {
      calendlyUrl: saved?.calendlyUrl ?? "",
      enabled: Boolean(saved?.calendlyUrl) && saved?.enabled !== false,
    };
  },
});

export const save = mutation({
  args: { calendlyUrl: v.string() },
  handler: async (ctx, args) => {
    const userId = await userIdOrThrow(ctx);
    const parsed = parseCalendlyUrl(args.calendlyUrl);
    if (!parsed.ok) throw new ConvexError(parsed.error);
    const updatedAt = Date.now();
    const existing = await ctx.db.query("bookingSettings").withIndex("by_user", (q) => q.eq("userId", userId)).unique();
    if (existing)
      await ctx.db.patch(existing._id, {
        calendlyUrl: parsed.url,
        enabled: true,
        updatedAt,
      });
    else
      await ctx.db.insert("bookingSettings", {
        userId,
        calendlyUrl: parsed.url,
        enabled: true,
        updatedAt,
      });
    return { calendlyUrl: parsed.url, enabled: true, updatedAt };
  },
});

export const setEnabled = mutation({
  args: { enabled: v.boolean() },
  handler: async (ctx, { enabled }) => {
    const userId = await userIdOrThrow(ctx);
    const existing = await ctx.db
      .query("bookingSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!existing)
      throw new ConvexError("Add a Calendly event link before turning this on.");
    await ctx.db.patch(existing._id, { enabled, updatedAt: Date.now() });
    return { enabled };
  },
});
