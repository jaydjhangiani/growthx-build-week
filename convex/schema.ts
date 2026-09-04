import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  profiles: defineTable({
    userId: v.id("users"),
    onboardingComplete: v.boolean(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
  onboardingDrafts: defineTable({
    userId: v.id("users"),
    currentStep: v.number(),
    completedSteps: v.array(v.number()),
    fullName: v.optional(v.string()),
    city: v.optional(v.string()),
    practiceLocation: v.optional(v.string()),
    languages: v.optional(v.array(v.string())),
    profilePhotoId: v.optional(v.id("_storage")),
    qualifications: v.optional(v.array(v.string())),
    certifications: v.optional(v.array(v.string())),
    yearsExperience: v.optional(v.number()),
    biography: v.optional(v.string()),
    whoYouHelp: v.optional(v.string()),
    specializations: v.optional(v.array(v.string())),
    therapeuticApproach: v.optional(v.string()),
    services: v.optional(
      v.array(
        v.object({
          name: v.string(),
          format: v.union(
            v.literal("online"),
            v.literal("offline"),
            v.literal("hybrid"),
          ),
          durationMinutes: v.number(),
          feeInr: v.number(),
        }),
      ),
    ),
    contactEmail: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
  websitePreferences: defineTable({
    userId: v.id("users"),
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
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
  websiteDrafts: defineTable({
    userId: v.id("users"),
    headline: v.string(),
    heroEyebrow: v.optional(v.string()),
    heroSupport: v.optional(v.string()),
    exploreHeading: v.optional(v.string()),
    biography: v.string(),
    whoYouHelp: v.string(),
    therapeuticApproach: v.string(),
    enabledSections: v.array(v.string()),
    sectionOrder: v.array(v.string()),
    palette: v.string(),
    headingFont: v.optional(
      v.union(
        v.literal("editorial"),
        v.literal("clean"),
        v.literal("humanist"),
      ),
    ),
    headingSize: v.optional(
      v.union(v.literal("small"), v.literal("medium"), v.literal("large")),
    ),
    bodyFont: v.optional(
      v.union(
        v.literal("editorial"),
        v.literal("clean"),
        v.literal("humanist"),
      ),
    ),
    bodySize: v.optional(
      v.union(v.literal("small"), v.literal("medium"), v.literal("large")),
    ),
    testimonialSize: v.optional(
      v.union(v.literal("small"), v.literal("medium"), v.literal("large")),
    ),
    sectionSpacing: v.optional(
      v.union(
        v.literal("compact"),
        v.literal("comfortable"),
        v.literal("spacious"),
      ),
    ),
    navbarLayout: v.optional(
      v.union(
        v.literal("classic"),
        v.literal("centered"),
        v.literal("minimal"),
      ),
    ),
    navbarButtonStyle: v.optional(
      v.union(
        v.literal("solid"),
        v.literal("outline"),
        v.literal("text"),
        v.literal("none"),
      ),
    ),
    imageBorder: v.optional(v.boolean()),
    imageBorderColor: v.optional(
      v.union(v.literal("ink"), v.literal("accent"), v.literal("white")),
    ),
    sectionBackgrounds: v.optional(
      v.array(
        v.object({
          sectionId: v.string(),
          background: v.union(
            v.literal("default"),
            v.literal("white"),
            v.literal("bright"),
            v.literal("soft"),
            v.literal("accent"),
            v.literal("dark"),
          ),
        }),
      ),
    ),
    sectionAlignments: v.optional(
      v.array(
        v.object({
          sectionId: v.string(),
          alignment: v.union(
            v.literal("left"),
            v.literal("center"),
            v.literal("right"),
          ),
        }),
      ),
    ),
    imageShape: v.optional(
      v.union(
        v.literal("arch"),
        v.literal("circle"),
        v.literal("rounded"),
        v.literal("square"),
      ),
    ),
    imageBackground: v.optional(
      v.union(
        v.literal("none"),
        v.literal("soft"),
        v.literal("accent"),
        v.literal("ink"),
      ),
    ),
    imagePadding: v.optional(
      v.union(
        v.literal("compact"),
        v.literal("balanced"),
        v.literal("spacious"),
      ),
    ),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
  sitePublications: defineTable({
    userId: v.id("users"),
    subdomain: v.string(),
    status: v.union(v.literal("draft"), v.literal("published")),
    snapshot: v.object({
      fullName: v.string(),
      city: v.string(),
      profilePhotoId: v.optional(v.id("_storage")),
      qualifications: v.array(v.string()),
      certifications: v.optional(v.array(v.string())),
      specializations: v.optional(v.array(v.string())),
      services: v.array(
        v.object({
          name: v.string(),
          format: v.union(
            v.literal("online"),
            v.literal("offline"),
            v.literal("hybrid"),
          ),
          durationMinutes: v.number(),
          feeInr: v.number(),
        }),
      ),
      contactEmail: v.string(),
      calendlyUrl: v.optional(v.string()),
      headline: v.string(),
      heroEyebrow: v.optional(v.string()),
      heroSupport: v.optional(v.string()),
      exploreHeading: v.optional(v.string()),
      biography: v.string(),
      whoYouHelp: v.string(),
      therapeuticApproach: v.string(),
      enabledSections: v.array(v.string()),
      sectionOrder: v.array(v.string()),
      palette: v.union(
        v.literal("monsoon"),
        v.literal("sage"),
        v.literal("clay"),
        v.literal("lavender"),
      ),
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
      testimonialSize: v.optional(
        v.union(v.literal("small"), v.literal("medium"), v.literal("large")),
      ),
      sectionSpacing: v.union(
        v.literal("compact"),
        v.literal("comfortable"),
        v.literal("spacious"),
      ),
      navbarLayout: v.optional(
        v.union(
          v.literal("classic"),
          v.literal("centered"),
          v.literal("minimal"),
        ),
      ),
      navbarButtonStyle: v.optional(
        v.union(
          v.literal("solid"),
          v.literal("outline"),
          v.literal("text"),
          v.literal("none"),
        ),
      ),
      imageBorder: v.optional(v.boolean()),
      imageBorderColor: v.optional(
        v.union(v.literal("ink"), v.literal("accent"), v.literal("white")),
      ),
      sectionBackgrounds: v.optional(
        v.array(
          v.object({
            sectionId: v.string(),
            background: v.union(
              v.literal("default"),
              v.literal("white"),
              v.literal("bright"),
              v.literal("soft"),
              v.literal("accent"),
              v.literal("dark"),
            ),
          }),
        ),
      ),
      sectionAlignments: v.optional(
        v.array(
          v.object({
            sectionId: v.string(),
            alignment: v.union(
              v.literal("left"),
              v.literal("center"),
              v.literal("right"),
            ),
          }),
        ),
      ),
      imageShape: v.optional(
        v.union(
          v.literal("arch"),
          v.literal("circle"),
          v.literal("rounded"),
          v.literal("square"),
        ),
      ),
      imageBackground: v.optional(
        v.union(
          v.literal("none"),
          v.literal("soft"),
          v.literal("accent"),
          v.literal("ink"),
        ),
      ),
      imagePadding: v.optional(
        v.union(
          v.literal("compact"),
          v.literal("balanced"),
          v.literal("spacious"),
        ),
      ),
    }),
    publishedAt: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_subdomain", ["subdomain"]),
  bookingSettings: defineTable({
    userId: v.id("users"),
    calendlyUrl: v.string(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
  enquiryFormConfigs: defineTable({
    userId: v.id("users"),
    fields: v.array(
      v.object({ id: v.string(), enabled: v.boolean(), required: v.boolean() }),
    ),
    retentionDays: v.optional(
      v.union(v.literal(30), v.literal(90), v.literal(180)),
    ),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
  enquiries: defineTable({
    userId: v.id("users"),
    submissionKey: v.string(),
    responses: v.array(v.object({ fieldId: v.string(), value: v.string() })),
    status: v.union(v.literal("new"), v.literal("read")),
    isTest: v.boolean(),
    emailDelivery: v.optional(
      v.union(v.literal("pending"), v.literal("sent"), v.literal("failed")),
    ),
    emailError: v.optional(v.string()),
    emailSentAt: v.optional(v.number()),
    deleteAt: v.optional(v.number()),
    submittedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_key", ["userId", "submissionKey"]),
  analyticsCounters: defineTable({
    userId: v.id("users"),
    subdomain: v.string(),
    eventType: v.union(
      v.literal("website_view"),
      v.literal("blog_view"),
      v.literal("calendly_click"),
      v.literal("enquiry_start"),
      v.literal("enquiry_complete"),
    ),
    count: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_event", ["userId", "eventType"]),
  substackConnections: defineTable({
    userId: v.id("users"),
    source: v.union(v.literal("native"), v.literal("substack")),
    publicationUrl: v.string(),
    rssUrl: v.string(),
    posts: v.array(
      v.object({
        externalId: v.string(),
        title: v.string(),
        summary: v.string(),
        url: v.string(),
        imageUrl: v.optional(v.string()),
        publishedAt: v.number(),
      }),
    ),
    lastSuccessfulRefresh: v.optional(v.number()),
    lastAttemptAt: v.number(),
    lastError: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
  testimonialSettings: defineTable({
    userId: v.id("users"),
    format: v.union(v.literal("written"), v.literal("image")),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
  testimonials: defineTable({
    userId: v.id("users"),
    kind: v.union(v.literal("written"), v.literal("image")),
    quote: v.optional(v.string()),
    attribution: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
    visible: v.boolean(),
    order: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
  blogPosts: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.string(),
    content: v.string(),
    slug: v.string(),
    seoTitle: v.string(),
    metaDescription: v.string(),
    coverImageId: v.optional(v.id("_storage")),
    status: v.union(v.literal("draft"), v.literal("published")),
    publishedAt: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_slug", ["userId", "slug"]),
});
