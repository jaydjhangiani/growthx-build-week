import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { defaultWebsiteFaqs } from "../src/lib/website-faqs";

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
];
const validSections = new Set(sectionIds);
const validPalettes = new Set(["monsoon", "sage", "clay", "lavender"]);
const naturallySoftSections = new Set([
  "about",
  "approach",
  "faqs",
  "blog",
  "enquiry",
  "testimonials",
]);

async function requireUser(ctx: Parameters<typeof getAuthUserId>[0]) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) throw new ConvexError("Sign in to continue.");
  return userId;
}

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUser(ctx);
    const [draft, profile, preferences, booking] = await Promise.all([
      ctx.db
        .query("websiteDrafts")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .unique(),
      ctx.db
        .query("onboardingDrafts")
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
    const enabledSections = (
      preferences?.enabledSections ?? sectionIds.filter((id) => id !== "testimonials")
    ).filter((id) =>
      validSections.has(id) &&
      (id !== "booking" || Boolean(booking?.calendlyUrl && booking.enabled !== false)),
    );
    const sectionOrder = (draft?.sectionOrder ?? sectionIds).filter((id) =>
      validSections.has(id),
    );
    for (const id of sectionIds)
      if (!sectionOrder.includes(id)) sectionOrder.push(id);
    const sectionBackgrounds = sectionIds.map((sectionId) => {
      const saved = draft?.sectionBackgrounds?.find(
        (item) => item.sectionId === sectionId,
      )?.background;
      const background =
        saved === "bright" || saved === "accent"
          ? ("accent" as const)
          : saved === "dark"
            ? ("dark" as const)
            : saved === "white"
              ? ("white" as const)
              : naturallySoftSections.has(sectionId)
                ? ("soft" as const)
                : ("white" as const);
      return { sectionId, background };
    });
    const sectionAlignments = sectionIds.map((sectionId) => ({
      sectionId,
      alignment:
        draft?.sectionAlignments?.find((item) => item.sectionId === sectionId)
          ?.alignment ?? ("left" as const),
    }));
    return {
      headline: draft?.headline ?? profile?.fullName ?? "My practice",
      heroEyebrow:
        draft?.heroEyebrow ??
        `Counselling psychologist · ${profile?.city || "Your city"}`,
      heroSupport:
        draft?.heroSupport ??
        `Support for people navigating ${profile?.specializations?.[0]?.toLowerCase() || "what matters to you"} and life’s quieter pressures.`,
      exploreHeading:
        draft?.exploreHeading ?? "You don’t have to carry it alone.",
      biography: draft?.biography ?? profile?.biography ?? "",
      whoYouHelp: draft?.whoYouHelp ?? profile?.whoYouHelp ?? "",
      therapeuticApproach:
        draft?.therapeuticApproach ?? profile?.therapeuticApproach ?? "",
      faqs: draft?.faqs ?? defaultWebsiteFaqs,
      calendlyUrl:
        booking?.calendlyUrl && booking.enabled !== false
          ? booking.calendlyUrl
          : "",
      enabledSections,
      sectionOrder,
      palette: preferences?.palette ?? draft?.palette ?? "monsoon",
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
      sectionBackgrounds,
      sectionAlignments,
      imageShape: draft?.imageShape ?? "arch",
      imageBackground: draft?.imageBackground ?? "soft",
      imagePadding: draft?.imagePadding ?? "balanced",
      tone: preferences?.tone ?? "warm",
      visualStyle: preferences?.visualStyle ?? "organic",
      profile: profile
        ? {
            fullName: profile.fullName,
            city: profile.city,
            practiceLocation: profile.practiceLocation,
            qualifications: profile.qualifications,
            certifications: profile.certifications,
            yearsExperience: profile.yearsExperience,
            languages: profile.languages,
            specializations: profile.specializations,
            services: profile.services,
            acceptingNewClients: profile.acceptingNewClients !== false,
            contactEmail: profile.contactEmail,
            profilePhotoUrl: profile.profilePhotoId
              ? await ctx.storage.getUrl(profile.profilePhotoId)
              : null,
          }
        : null,
    };
  },
});

export const save = mutation({
  args: {
    headline: v.string(),
    heroEyebrow: v.string(),
    heroSupport: v.string(),
    exploreHeading: v.string(),
    biography: v.string(),
    whoYouHelp: v.string(),
    therapeuticApproach: v.string(),
    faqs: v.array(v.object({ question: v.string(), answer: v.string() })),
    enabledSections: v.array(v.string()),
    sectionOrder: v.array(v.string()),
    palette: v.string(),
    tone: v.union(
      v.literal("warm"),
      v.literal("grounded"),
      v.literal("professional"),
    ),
    visualStyle: v.union(
      v.literal("organic"),
      v.literal("editorial"),
      v.literal("structured"),
    ),
    headingFont: v.union(
      v.literal("editorial"),
      v.literal("clean"),
      v.literal("humanist"),
    ),
    headingSize: v.union(
      v.literal("small"),
      v.literal("medium"),
      v.literal("large"),
    ),
    bodyFont: v.union(
      v.literal("editorial"),
      v.literal("clean"),
      v.literal("humanist"),
    ),
    bodySize: v.union(
      v.literal("small"),
      v.literal("medium"),
      v.literal("large"),
    ),
    testimonialSize: v.union(
      v.literal("small"),
      v.literal("medium"),
      v.literal("large"),
    ),
    sectionSpacing: v.union(
      v.literal("compact"),
      v.literal("comfortable"),
      v.literal("spacious"),
    ),
    navbarLayout: v.union(
      v.literal("classic"),
      v.literal("centered"),
      v.literal("minimal"),
    ),
    navbarButtonStyle: v.union(
      v.literal("solid"),
      v.literal("outline"),
      v.literal("text"),
      v.literal("none"),
    ),
    imageBorder: v.boolean(),
    imageBorderColor: v.union(
      v.literal("ink"),
      v.literal("accent"),
      v.literal("white"),
    ),
    sectionBackgrounds: v.array(
      v.object({
        sectionId: v.string(),
        background: v.union(
          v.literal("white"),
          v.literal("soft"),
          v.literal("accent"),
          v.literal("dark"),
        ),
      }),
    ),
    sectionAlignments: v.array(
      v.object({
        sectionId: v.string(),
        alignment: v.union(
          v.literal("left"),
          v.literal("center"),
          v.literal("right"),
        ),
      }),
    ),
    imageShape: v.union(
      v.literal("arch"),
      v.literal("circle"),
      v.literal("rounded"),
      v.literal("square"),
    ),
    imageBackground: v.union(
      v.literal("none"),
      v.literal("soft"),
      v.literal("accent"),
      v.literal("ink"),
    ),
    imagePadding: v.union(
      v.literal("compact"),
      v.literal("balanced"),
      v.literal("spacious"),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const booking = await ctx.db
      .query("bookingSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    const sectionOrder = Array.from(
      new Set(args.sectionOrder.filter((id) => validSections.has(id))),
    );
    for (const id of sectionIds)
      if (!sectionOrder.includes(id)) sectionOrder.push(id);
    const enabledSections = Array.from(
      new Set(
        args.enabledSections.filter(
          (id) =>
            validSections.has(id) &&
            (id !== "booking" ||
              Boolean(booking?.calendlyUrl && booking.enabled !== false)),
        ),
      ),
    );
    if (!enabledSections.includes("blog")) enabledSections.push("blog");
    if (!validPalettes.has(args.palette))
      throw new ConvexError("Choose a supported colour palette.");
    const palette = args.palette as "monsoon" | "sage" | "clay" | "lavender";
    const value = {
      headline: args.headline.trim(),
      heroEyebrow: args.heroEyebrow.trim(),
      heroSupport: args.heroSupport.trim(),
      exploreHeading:
        args.exploreHeading.trim() || "You don’t have to carry it alone.",
      biography: args.biography.trim(),
      whoYouHelp: args.whoYouHelp.trim(),
      therapeuticApproach: args.therapeuticApproach.trim(),
      faqs: args.faqs.map((faq) => ({
        question: faq.question.trim(),
        answer: faq.answer.trim(),
      })),
      enabledSections,
      sectionOrder,
      palette,
      headingFont: args.headingFont,
      headingSize: args.headingSize,
      bodyFont: args.bodyFont,
      bodySize: args.bodySize,
      testimonialSize: args.testimonialSize,
      sectionSpacing: args.sectionSpacing,
      navbarLayout: args.navbarLayout,
      navbarButtonStyle: args.navbarButtonStyle,
      imageBorder: args.imageBorder,
      imageBorderColor: args.imageBorderColor,
      sectionBackgrounds: args.sectionBackgrounds.filter((item) =>
        validSections.has(item.sectionId),
      ),
      sectionAlignments: args.sectionAlignments.filter((item) =>
        validSections.has(item.sectionId),
      ),
      imageShape: args.imageShape,
      imageBackground: args.imageBackground,
      imagePadding: args.imagePadding,
      updatedAt: Date.now(),
    };
    const existing = await ctx.db
      .query("websiteDrafts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (existing) await ctx.db.patch(existing._id, value);
    else await ctx.db.insert("websiteDrafts", { userId, ...value });
    const preferences = await ctx.db
      .query("websitePreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (preferences)
      await ctx.db.patch(preferences._id, {
        enabledSections,
        palette,
        tone: args.tone,
        visualStyle: args.visualStyle,
        updatedAt: value.updatedAt,
      });
    else
      await ctx.db.insert("websitePreferences", {
        userId,
        enabledSections,
        palette,
        tone: args.tone,
        visualStyle: args.visualStyle,
        updatedAt: value.updatedAt,
      });
    return { savedAt: value.updatedAt };
  },
});
