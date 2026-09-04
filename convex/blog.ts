import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

const statusValidator = v.union(v.literal("draft"), v.literal("published"));
const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

async function requireUser(ctx: Parameters<typeof getAuthUserId>[0]) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) throw new ConvexError("Sign in to continue.");
  return userId;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUser(ctx);
    const posts = await ctx.db
      .query("blogPosts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
    return await Promise.all(
      posts.map(async (post) => ({
        ...post,
        coverImageUrl: post.coverImageId
          ? await ctx.storage.getUrl(post.coverImageId)
          : null,
      })),
    );
  },
});

export const get = query({
  args: { postId: v.id("blogPosts") },
  handler: async (ctx, { postId }) => {
    const userId = await requireUser(ctx);
    const post = await ctx.db.get(postId);
    if (!post || post.userId !== userId) return null;
    return {
      ...post,
      coverImageUrl: post.coverImageId
        ? await ctx.storage.getUrl(post.coverImageId)
        : null,
    };
  },
});

export const listPublic = query({
  args: { subdomain: v.string() },
  handler: async (ctx, { subdomain }) => {
    const publication = await ctx.db
      .query("sitePublications")
      .withIndex("by_subdomain", (q) => q.eq("subdomain", subdomain))
      .unique();
    if (
      !publication ||
      publication.status !== "published" ||
      !publication.snapshot.enabledSections.includes("blog")
    )
      return null;
    const connection = await ctx.db
      .query("substackConnections")
      .withIndex("by_user", (q) => q.eq("userId", publication.userId))
      .unique();
    if (connection?.source === "substack") {
      return connection.posts
        .toSorted((a, b) => b.publishedAt - a.publishedAt)
        .map((post) => ({
          id: `substack:${post.externalId}`,
          source: "substack" as const,
          title: post.title,
          description: post.summary,
          publishedAt: post.publishedAt,
          coverImageUrl: post.imageUrl ?? null,
          href: post.url,
        }));
    }
    const posts = await ctx.db
      .query("blogPosts")
      .withIndex("by_user", (q) => q.eq("userId", publication.userId))
      .order("desc")
      .collect();
    return await Promise.all(
      posts
        .filter((post) => post.status === "published")
        .map(async (post) => ({
          id: String(post._id),
          source: "native" as const,
          title: post.title,
          description: post.description,
          publishedAt: post.publishedAt ?? 0,
          coverImageUrl: post.coverImageId
            ? await ctx.storage.getUrl(post.coverImageId)
            : null,
          href: `/${subdomain}/journal/${post.slug}`,
        })),
    );
  },
});

export const getPublic = query({
  args: { subdomain: v.string(), slug: v.string() },
  handler: async (ctx, { subdomain, slug }) => {
    const publication = await ctx.db
      .query("sitePublications")
      .withIndex("by_subdomain", (q) => q.eq("subdomain", subdomain))
      .unique();
    if (
      !publication ||
      publication.status !== "published" ||
      !publication.snapshot.enabledSections.includes("blog")
    )
      return null;
    const post = await ctx.db
      .query("blogPosts")
      .withIndex("by_user_slug", (q) =>
        q.eq("userId", publication.userId).eq("slug", slug),
      )
      .unique();
    if (!post || post.status !== "published") return null;
    return {
      title: post.title,
      description: post.description,
      content: post.content,
      seoTitle: post.seoTitle,
      metaDescription: post.metaDescription,
      publishedAt: post.publishedAt,
      coverImageUrl: post.coverImageId
        ? await ctx.storage.getUrl(post.coverImageId)
        : null,
      practitionerName: publication.snapshot.fullName,
    };
  },
});

export const save = mutation({
  args: {
    postId: v.optional(v.id("blogPosts")),
    title: v.string(),
    description: v.string(),
    content: v.string(),
    slug: v.string(),
    seoTitle: v.string(),
    metaDescription: v.string(),
    coverImageId: v.optional(v.id("_storage")),
    status: statusValidator,
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const existing = args.postId ? await ctx.db.get(args.postId) : null;
    if (args.postId && (!existing || existing.userId !== userId))
      throw new ConvexError("Article not found.");
    const title = args.title.trim();
    const content = args.content.trim();
    const slug = slugify(args.slug || title);
    const errors: Record<string, string> = {};
    if (args.status === "published" && !title)
      errors.title = "Add a title before publishing.";
    if (args.status === "published" && !content)
      errors.content = "Add article content before publishing.";
    if (args.status === "published" && !slug)
      errors.slug = "Add a URL slug before publishing.";
    if (Object.keys(errors).length)
      return { ok: false as const, errors, suggestions: [] as string[] };

    if (slug) {
      const duplicate = await ctx.db
        .query("blogPosts")
        .withIndex("by_user_slug", (q) =>
          q.eq("userId", userId).eq("slug", slug),
        )
        .unique();
      if (duplicate && duplicate._id !== args.postId) {
        const suggestions = [
          `${slug}-2`,
          `${slug}-3`,
          `${slug}-${new Date().getFullYear()}`,
        ];
        return {
          ok: false as const,
          errors: { slug: "This URL slug is already in use." },
          suggestions,
        };
      }
    }

    const now = Date.now();
    const value = {
      title,
      description: args.description.trim(),
      content: args.content,
      slug,
      seoTitle: args.seoTitle.trim(),
      metaDescription: args.metaDescription.trim(),
      coverImageId: args.coverImageId,
      status: args.status,
      publishedAt:
        args.status === "published"
          ? (existing?.publishedAt ?? now)
          : existing?.publishedAt,
      updatedAt: now,
    };
    let postId = args.postId;
    if (postId) await ctx.db.patch(postId, value);
    else postId = await ctx.db.insert("blogPosts", { userId, ...value });
    return {
      ok: true as const,
      postId,
      errors: {},
      suggestions: [] as string[],
    };
  },
});

export const generateCoverUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});
