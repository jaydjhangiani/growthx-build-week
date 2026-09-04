import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import {
  normalizeSubdomain,
  suggestSubdomain,
  validateSubdomain,
} from "../src/lib/subdomain";

async function requireUser(ctx: Parameters<typeof getAuthUserId>[0]) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) throw new ConvexError("Sign in to continue.");
  return userId;
}

async function alternatives(ctx: QueryCtx | MutationCtx, base: string) {
  const choices: string[] = [];
  for (let suffix = 2; suffix < 12 && choices.length < 3; suffix += 1) {
    const candidate = `${base.slice(0, 45)}-${suffix}`;
    const existing = await ctx.db
      .query("sitePublications")
      .withIndex("by_subdomain", (q) => q.eq("subdomain", candidate))
      .unique();
    if (!existing) choices.push(candidate);
  }
  return choices;
}

export const getStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUser(ctx);
    const [publication, profile] = await Promise.all([
      ctx.db
        .query("sitePublications")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .unique(),
      ctx.db
        .query("onboardingDrafts")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .unique(),
    ]);
    return {
      status: publication?.status ?? "draft",
      subdomain: publication?.subdomain ?? suggestSubdomain(profile?.fullName),
      publishedAt: publication?.publishedAt,
    };
  },
});

export const checkAvailability = query({
  args: { subdomain: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const subdomain = normalizeSubdomain(args.subdomain);
    const error = validateSubdomain(subdomain);
    if (error) return { available: false, error, alternatives: [] };
    const existing = await ctx.db
      .query("sitePublications")
      .withIndex("by_subdomain", (q) => q.eq("subdomain", subdomain))
      .unique();
    if (!existing || existing.userId === userId)
      return { available: true, error: null, alternatives: [] };
    return {
      available: false,
      error: "That address is already taken.",
      alternatives: await alternatives(ctx, subdomain),
    };
  },
});

export const publish = mutation({
  args: { subdomain: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const subdomain = normalizeSubdomain(args.subdomain);
    const error = validateSubdomain(subdomain);
    if (error) throw new ConvexError(error);
    const claimed = await ctx.db
      .query("sitePublications")
      .withIndex("by_subdomain", (q) => q.eq("subdomain", subdomain))
      .unique();
    if (claimed && claimed.userId !== userId)
      throw new ConvexError("That address is already taken.");

    const [existing, profile, draft, preferences, booking] = await Promise.all([
      ctx.db
        .query("sitePublications")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .unique(),
      ctx.db
        .query("onboardingDrafts")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .unique(),
      ctx.db
        .query("websiteDrafts")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .unique(),
      ctx.db
        .query("websitePreferences")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .unique(),
      ctx.db
        .query("bookingSettings")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .unique(),
    ]);
    if (!profile?.fullName)
      throw new ConvexError(
        "Complete your practice profile before publishing.",
      );
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
    ];
    const snapshot = {
      fullName: profile.fullName,
      city: profile.city ?? "",
      profilePhotoId: profile.profilePhotoId,
      qualifications: profile.qualifications ?? [],
      certifications: profile.certifications ?? [],
      specializations: profile.specializations ?? [],
      services: profile.services ?? [],
      contactEmail: profile.contactEmail ?? "",
      calendlyUrl: booking?.calendlyUrl || undefined,
      headline: draft?.headline ?? profile.fullName,
      heroEyebrow:
        draft?.heroEyebrow ??
        `Counselling psychologist · ${profile.city || "Your city"}`,
      heroSupport:
        draft?.heroSupport ??
        `Support for people navigating ${profile.specializations?.[0]?.toLowerCase() || "what matters to you"} and life’s quieter pressures.`,
      biography: draft?.biography ?? profile.biography ?? "",
      whoYouHelp: draft?.whoYouHelp ?? profile.whoYouHelp ?? "",
      therapeuticApproach:
        draft?.therapeuticApproach ?? profile.therapeuticApproach ?? "",
      enabledSections: (
        preferences?.enabledSections ??
        draft?.enabledSections ??
        sectionIds.filter((id) => id !== "testimonials")
      ).filter((id) => id !== "fees"),
      sectionOrder: (draft?.sectionOrder ?? sectionIds).filter(
        (id) => id !== "fees",
      ),
      palette: (preferences?.palette ?? draft?.palette ?? "monsoon") as
        "monsoon" | "sage" | "clay" | "lavender",
      tone: preferences?.tone ?? "warm",
      visualStyle: preferences?.visualStyle ?? "organic",
      headingFont: draft?.headingFont ?? "editorial",
      headingSize: draft?.headingSize ?? "medium",
      bodyFont: draft?.bodyFont ?? "clean",
      bodySize: draft?.bodySize ?? "medium",
      testimonialSize: draft?.testimonialSize ?? "medium",
      sectionSpacing: draft?.sectionSpacing ?? "comfortable",
      navbarLayout: draft?.navbarLayout ?? "classic",
      navbarButtonStyle: draft?.navbarButtonStyle ?? "solid",
      imageBorder: draft?.imageBorder ?? false,
      imageBorderColor: draft?.imageBorderColor ?? "ink",
      sectionBackgrounds: sectionIds.map((sectionId) => {
        const saved = draft?.sectionBackgrounds?.find(
          (item) => item.sectionId === sectionId,
        )?.background;
        return {
          sectionId,
          background:
            saved === "bright" || saved === "accent"
              ? ("accent" as const)
              : saved === "dark"
                ? ("dark" as const)
                : saved === "white"
                  ? ("white" as const)
                  : ["about", "approach", "faqs", "blog", "enquiry", "testimonials"].includes(
                        sectionId,
                      )
                    ? ("soft" as const)
                    : ("white" as const),
        };
      }),
      sectionAlignments: sectionIds.map((sectionId) => ({
        sectionId,
        alignment:
          draft?.sectionAlignments?.find((item) => item.sectionId === sectionId)
            ?.alignment ?? ("left" as const),
      })),
      imageShape: draft?.imageShape ?? "arch",
      imageBackground: draft?.imageBackground ?? "soft",
      imagePadding: draft?.imagePadding ?? "balanced",
    };
    const now = Date.now();
    const value = {
      subdomain,
      status: "published" as const,
      snapshot,
      publishedAt: existing?.publishedAt ?? now,
      updatedAt: now,
    };
    if (existing) await ctx.db.patch(existing._id, value);
    else await ctx.db.insert("sitePublications", { userId, ...value });
    return { subdomain, publishedAt: value.publishedAt };
  },
});

export const getPublicSite = query({
  args: { subdomain: v.string() },
  handler: async (ctx, args) => {
    const publication = await ctx.db
      .query("sitePublications")
      .withIndex("by_subdomain", (q) =>
        q.eq("subdomain", normalizeSubdomain(args.subdomain)),
      )
      .unique();
    if (!publication || publication.status !== "published") return null;
    return {
      ...publication.snapshot,
      sectionBackgrounds: (publication.snapshot.sectionBackgrounds ?? []).map(
        (item) => ({
          sectionId: item.sectionId,
          background:
            item.background === "bright" || item.background === "accent"
              ? ("accent" as const)
              : item.background === "dark"
                ? ("dark" as const)
                : item.background === "white"
                  ? ("white" as const)
                  : ["about", "approach", "faqs", "blog", "enquiry", "testimonials"].includes(
                        item.sectionId,
                      )
                    ? ("soft" as const)
                    : ("white" as const),
        }),
      ),
      subdomain: publication.subdomain,
      profilePhotoUrl: publication.snapshot.profilePhotoId
        ? await ctx.storage.getUrl(publication.snapshot.profilePhotoId)
        : null,
      publishedAt: publication.publishedAt,
    };
  },
});
