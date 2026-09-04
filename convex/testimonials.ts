import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import {
  TESTIMONIAL_ATTRIBUTION_MAX_LENGTH,
  TESTIMONIAL_MAX_LENGTH,
} from "../src/lib/testimonials";

async function requireUser(ctx: Parameters<typeof getAuthUserId>[0]) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) throw new ConvexError("Sign in to continue.");
  return userId;
}

async function userItems(ctx: QueryCtx | MutationCtx, userId: Id<"users">) {
  return await ctx.db
    .query("testimonials")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
}

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUser(ctx);
    const [settings, items] = await Promise.all([
      ctx.db.query("testimonialSettings").withIndex("by_user", (q) => q.eq("userId", userId)).unique(),
      userItems(ctx, userId),
    ]);
    const withUrls = await Promise.all(
      items
        .sort((a, b) => a.order - b.order)
        .map(async (item) => ({
          ...item,
          imageUrl: item.imageId ? await ctx.storage.getUrl(item.imageId) : null,
        })),
    );
    return { format: settings?.format ?? ("written" as const), items: withUrls };
  },
});

export const chooseFormat = mutation({
  args: { format: v.union(v.literal("written"), v.literal("image")) },
  handler: async (ctx, { format }) => {
    const userId = await requireUser(ctx);
    const existing = await ctx.db.query("testimonialSettings").withIndex("by_user", (q) => q.eq("userId", userId)).unique();
    const updatedAt = Date.now();
    if (existing) await ctx.db.patch(existing._id, { format, updatedAt });
    else await ctx.db.insert("testimonialSettings", { userId, format, updatedAt });
    return format;
  },
});

export const addWritten = mutation({
  args: { quote: v.string(), attribution: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const quote = args.quote.trim();
    const attribution = args.attribution.trim();
    if (!quote) throw new ConvexError("Add the testimonial text.");
    if (quote.length > TESTIMONIAL_MAX_LENGTH) throw new ConvexError("Keep the testimonial under 800 characters.");
    if (attribution.length > TESTIMONIAL_ATTRIBUTION_MAX_LENGTH) throw new ConvexError("Keep the name or context under 120 characters.");
    const items = await userItems(ctx, userId);
    const now = Date.now();
    return await ctx.db.insert("testimonials", {
      userId, kind: "written", quote, attribution: attribution || undefined,
      visible: true, order: items.length, createdAt: now, updatedAt: now,
    });
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const addImage = mutation({
  args: { imageId: v.id("_storage"), attribution: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const attribution = args.attribution.trim();
    if (attribution.length > TESTIMONIAL_ATTRIBUTION_MAX_LENGTH) throw new ConvexError("Keep the name or context under 120 characters.");
    const metadata = await ctx.db.system.get(args.imageId);
    if (!metadata) throw new ConvexError("Upload the testimonial image again.");
    if (metadata.size > 5 * 1024 * 1024) throw new ConvexError("Choose an image smaller than 5 MB.");
    if (!metadata.contentType || !["image/jpeg", "image/png", "image/webp"].includes(metadata.contentType)) throw new ConvexError("Choose a JPG, PNG or WebP image.");
    const items = await userItems(ctx, userId);
    const now = Date.now();
    return await ctx.db.insert("testimonials", {
      userId, kind: "image", imageId: args.imageId,
      attribution: attribution || undefined, visible: true, order: items.length,
      createdAt: now, updatedAt: now,
    });
  },
});

export const setVisible = mutation({
  args: { id: v.id("testimonials"), visible: v.boolean() },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const item = await ctx.db.get(args.id);
    if (!item || item.userId !== userId) throw new ConvexError("Testimonial not found.");
    await ctx.db.patch(args.id, { visible: args.visible, updatedAt: Date.now() });
  },
});

export const move = mutation({
  args: { id: v.id("testimonials"), direction: v.union(v.literal("up"), v.literal("down")) },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const allItems = await userItems(ctx, userId);
    const selected = allItems.find((item) => item._id === args.id);
    if (!selected) throw new ConvexError("Testimonial not found.");
    const items = allItems
      .filter((item) => item.kind === selected.kind)
      .sort((a, b) => a.order - b.order);
    const index = items.findIndex((item) => item._id === args.id);
    if (index < 0) throw new ConvexError("Testimonial not found.");
    const targetIndex = args.direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const now = Date.now();
    await Promise.all([
      ctx.db.patch(items[index]._id, { order: items[targetIndex].order, updatedAt: now }),
      ctx.db.patch(items[targetIndex]._id, { order: items[index].order, updatedAt: now }),
    ]);
  },
});

export const remove = mutation({
  args: { id: v.id("testimonials") },
  handler: async (ctx, { id }) => {
    const userId = await requireUser(ctx);
    const item = await ctx.db.get(id);
    if (!item || item.userId !== userId) throw new ConvexError("Testimonial not found.");
    if (item.imageId) await ctx.storage.delete(item.imageId);
    await ctx.db.delete(id);
  },
});

export const listPublic = query({
  args: { subdomain: v.string() },
  handler: async (ctx, { subdomain }) => {
    const publication = await ctx.db.query("sitePublications").withIndex("by_subdomain", (q) => q.eq("subdomain", subdomain.toLowerCase())).unique();
    if (!publication || publication.status !== "published" || !publication.snapshot.enabledSections.includes("testimonials")) return { format: "written" as const, items: [] };
    const settings = await ctx.db.query("testimonialSettings").withIndex("by_user", (q) => q.eq("userId", publication.userId)).unique();
    const format = settings?.format ?? ("written" as const);
    const items = (await userItems(ctx, publication.userId)).filter((item) => item.visible && item.kind === format).sort((a, b) => a.order - b.order);
    return {
      format,
      items: await Promise.all(items.map(async (item) => ({
        id: item._id, kind: item.kind, quote: item.quote, attribution: item.attribution,
        imageUrl: item.imageId ? await ctx.storage.getUrl(item.imageId) : null,
      }))),
    };
  },
});
