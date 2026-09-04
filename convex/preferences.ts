import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

const sectionIds = [
  "introduction",
  "about",
  "who-i-help",
  "approach",
  "qualifications",
  "services",
  "testimonials",
  "faqs",
  "blog",
  "booking",
  "enquiry",
  "contact",
] as const;
const sectionSet = new Set<string>(sectionIds);
const defaults = {
  enabledSections: sectionIds.filter((id) => id !== "testimonials"),
  tone: "warm" as const,
  palette: "monsoon" as const,
  visualStyle: "organic" as const,
};

async function userIdOrThrow(ctx: Parameters<typeof getAuthUserId>[0]) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) throw new ConvexError("Sign in to continue.");
  return userId;
}

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await userIdOrThrow(ctx);
    const saved = await ctx.db
      .query("websitePreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    return saved
      ? {
          enabledSections: saved.enabledSections.filter((id) =>
            sectionSet.has(id),
          ),
          tone: saved.tone,
          palette: saved.palette,
          visualStyle: saved.visualStyle,
        }
      : defaults;
  },
});

export const save = mutation({
  args: {
    enabledSections: v.array(v.string()),
    tone: v.union(
      v.literal("warm"),
      v.literal("grounded"),
      v.literal("professional"),
    ),
    palette: v.union(
      v.literal("monsoon"),
      v.literal("sage"),
      v.literal("clay"),
      v.literal("lavender"),
    ),
    visualStyle: v.union(
      v.literal("organic"),
      v.literal("editorial"),
      v.literal("structured"),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await userIdOrThrow(ctx);
    const enabledSections = Array.from(
      new Set(args.enabledSections.filter((id) => sectionSet.has(id))),
    );
    if (!enabledSections.includes("blog")) enabledSections.push("blog");
    if (enabledSections.length === 0)
      throw new ConvexError("Choose at least one website section.");
    const value = { ...args, enabledSections, updatedAt: Date.now() };
    const existing = await ctx.db
      .query("websitePreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (existing) await ctx.db.patch(existing._id, value);
    else await ctx.db.insert("websitePreferences", { userId, ...value });
    const websiteDraft = await ctx.db
      .query("websiteDrafts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (websiteDraft)
      await ctx.db.patch(websiteDraft._id, {
        enabledSections,
        palette: args.palette,
        updatedAt: value.updatedAt,
      });
    return { savedAt: value.updatedAt, enabledSections };
  },
});
