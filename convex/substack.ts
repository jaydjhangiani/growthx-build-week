import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import { action, internalMutation, mutation, query } from "./_generated/server";
import { normalizeSubstackUrl, parseSubstackFeed } from "../src/lib/substack";

const postValidator = v.object({
  externalId: v.string(),
  title: v.string(),
  summary: v.string(),
  url: v.string(),
  imageUrl: v.optional(v.string()),
  publishedAt: v.number(),
});

async function requireUser(ctx: Parameters<typeof getAuthUserId>[0]) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) throw new ConvexError("Sign in to continue.");
  return userId;
}

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUser(ctx);
    const connection = await ctx.db
      .query("substackConnections")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    return (
      connection ?? {
        source: "native" as const,
        publicationUrl: "",
        rssUrl: "",
        posts: [],
        lastSuccessfulRefresh: undefined,
        lastAttemptAt: 0,
        lastError: undefined,
      }
    );
  },
});

export const chooseSource = mutation({
  args: { source: v.union(v.literal("native"), v.literal("substack")) },
  handler: async (ctx, { source }) => {
    const userId = await requireUser(ctx);
    const connection = await ctx.db
      .query("substackConnections")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (source === "substack" && !connection?.lastSuccessfulRefresh)
      throw new ConvexError("Connect a Substack publication first.");
    if (!connection) {
      const now = Date.now();
      await ctx.db.insert("substackConnections", {
        userId,
        source: "native",
        publicationUrl: "",
        rssUrl: "",
        posts: [],
        lastAttemptAt: now,
        updatedAt: now,
      });
      return "native" as const;
    }
    await ctx.db.patch(connection._id, { source, updatedAt: Date.now() });
    return source;
  },
});

export const refresh = action({
  args: { publicationUrl: v.string(), activate: v.optional(v.boolean()) },
  handler: async (ctx, { publicationUrl, activate }) => {
    const userId = await requireUser(ctx);
    const normalized = normalizeSubstackUrl(publicationUrl);
    if (!normalized.ok) throw new ConvexError(normalized.error);
    try {
      const response = await fetch(normalized.rssUrl, {
        headers: { Accept: "application/rss+xml, application/xml, text/xml" },
        signal: AbortSignal.timeout(12_000),
      });
      if (!response.ok)
        throw new Error(`Substack returned ${response.status}. Try again.`);
      const declaredSize = Number(response.headers.get("content-length") ?? 0);
      if (declaredSize > 2_000_000)
        throw new Error("This Substack feed is too large to import.");
      const xml = await response.text();
      if (new TextEncoder().encode(xml).byteLength > 2_000_000)
        throw new Error("This Substack feed is too large to import.");
      const posts = parseSubstackFeed(xml);
      if (!posts.length)
        throw new Error("No public posts were found in this Substack feed.");
      const refreshedAt = Date.now();
      await ctx.runMutation(internal.substack.storeSuccess, {
        userId,
        publicationUrl: normalized.publicationUrl,
        rssUrl: normalized.rssUrl,
        posts,
        activate: activate ?? false,
        refreshedAt,
      });
      return { postCount: posts.length, refreshedAt };
    } catch (error) {
      const message =
        error instanceof Error && error.name === "TimeoutError"
          ? "Substack took too long to respond. Try again."
          : error instanceof Error
            ? error.message
            : "The Substack feed could not be refreshed.";
      await ctx.runMutation(internal.substack.storeFailure, {
        userId,
        publicationUrl: normalized.publicationUrl,
        rssUrl: normalized.rssUrl,
        error: message,
        attemptedAt: Date.now(),
      });
      throw new ConvexError(message);
    }
  },
});

export const storeSuccess = internalMutation({
  args: {
    userId: v.id("users"),
    publicationUrl: v.string(),
    rssUrl: v.string(),
    posts: v.array(postValidator),
    activate: v.boolean(),
    refreshedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("substackConnections")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
    const value = {
      publicationUrl: args.publicationUrl,
      rssUrl: args.rssUrl,
      posts: args.posts,
      source:
        args.activate || !existing ? ("substack" as const) : existing.source,
      lastSuccessfulRefresh: args.refreshedAt,
      lastAttemptAt: args.refreshedAt,
      lastError: undefined,
      updatedAt: args.refreshedAt,
    };
    if (existing) await ctx.db.patch(existing._id, value);
    else
      await ctx.db.insert("substackConnections", {
        userId: args.userId,
        ...value,
      });
  },
});

export const storeFailure = internalMutation({
  args: {
    userId: v.id("users"),
    publicationUrl: v.string(),
    rssUrl: v.string(),
    error: v.string(),
    attemptedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("substackConnections")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
    const failure = {
      publicationUrl: args.publicationUrl,
      rssUrl: args.rssUrl,
      lastAttemptAt: args.attemptedAt,
      lastError: args.error,
      updatedAt: args.attemptedAt,
    };
    if (existing) await ctx.db.patch(existing._id, failure);
    else
      await ctx.db.insert("substackConnections", {
        userId: args.userId,
        source: "native",
        posts: [],
        ...failure,
      });
  },
});
