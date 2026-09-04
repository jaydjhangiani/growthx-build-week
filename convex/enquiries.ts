import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import {
  defaultEnquiryConfig,
  presetEnquiryFields,
  validateEnquiryResponses,
  type EnquiryFieldConfig,
  type EnquiryFieldId,
  type EnquiryResponses,
} from "../src/lib/enquiry";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { incrementAnalyticsCounter } from "./analytics";

const validIds = new Set<string>(presetEnquiryFields.map((field) => field.id));
const retentionValidator = v.union(
  v.literal(30),
  v.literal(90),
  v.literal(180),
);

async function userIdOrThrow(ctx: Parameters<typeof getAuthUserId>[0]) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) throw new ConvexError("Sign in to continue.");
  return userId;
}

export const getConfig = query({
  args: {},
  handler: async (ctx) => {
    const userId = await userIdOrThrow(ctx);
    const saved = await ctx.db
      .query("enquiryFormConfigs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    return {
      fields: (saved?.fields ?? defaultEnquiryConfig) as EnquiryFieldConfig[],
    };
  },
});

export const saveConfig = mutation({
  args: {
    fields: v.array(
      v.object({ id: v.string(), enabled: v.boolean(), required: v.boolean() }),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await userIdOrThrow(ctx);
    const fields = args.fields
      .filter((field) => validIds.has(field.id))
      .map((field) => ({
        ...field,
        required: field.enabled && field.required,
      }));
    if (!fields.some((field) => field.enabled))
      throw new ConvexError("Keep at least one enquiry field enabled.");
    const updatedAt = Date.now();
    const existing = await ctx.db
      .query("enquiryFormConfigs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (existing) await ctx.db.patch(existing._id, { fields, updatedAt });
    else
      await ctx.db.insert("enquiryFormConfigs", { userId, fields, updatedAt });
    return { fields, updatedAt };
  },
});

export const getRetention = query({
  args: {},
  handler: async (ctx) => {
    const userId = await userIdOrThrow(ctx);
    const saved = await ctx.db
      .query("enquiryFormConfigs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    return saved?.retentionDays ?? 90;
  },
});

export const saveRetention = mutation({
  args: { retentionDays: retentionValidator },
  handler: async (ctx, { retentionDays }) => {
    const userId = await userIdOrThrow(ctx);
    const saved = await ctx.db
      .query("enquiryFormConfigs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    const updatedAt = Date.now();
    if (saved) await ctx.db.patch(saved._id, { retentionDays, updatedAt });
    else
      await ctx.db.insert("enquiryFormConfigs", {
        userId,
        fields: defaultEnquiryConfig,
        retentionDays,
        updatedAt,
      });
    return retentionDays;
  },
});

export const submitTest = mutation({
  args: {
    submissionKey: v.string(),
    responses: v.array(v.object({ fieldId: v.string(), value: v.string() })),
  },
  handler: async (ctx, args) => {
    const userId = await userIdOrThrow(ctx);
    const duplicate = await ctx.db
      .query("enquiries")
      .withIndex("by_user_key", (q) =>
        q.eq("userId", userId).eq("submissionKey", args.submissionKey),
      )
      .unique();
    if (duplicate) return { enquiryId: duplicate._id, duplicate: true };
    const saved = await ctx.db
      .query("enquiryFormConfigs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    const config = (saved?.fields ??
      defaultEnquiryConfig) as EnquiryFieldConfig[];
    const responses = Object.fromEntries(
      args.responses
        .filter((item) => validIds.has(item.fieldId))
        .map((item) => [item.fieldId, item.value]),
    ) as EnquiryResponses;
    const errors = validateEnquiryResponses(config, responses);
    if (Object.keys(errors).length)
      throw new ConvexError("Complete all required fields before submitting.");
    const enquiryId = await ctx.db.insert("enquiries", {
      userId,
      submissionKey: args.submissionKey,
      responses: Object.entries(responses).map(([fieldId, value]) => ({
        fieldId,
        value: value ?? "",
      })),
      status: "new",
      isTest: true,
      emailDelivery: "pending",
      submittedAt: Date.now(),
    });
    return { enquiryId, duplicate: false };
  },
});

export const getPublicConfig = query({
  args: { subdomain: v.string() },
  handler: async (ctx, { subdomain }) => {
    const publication = await ctx.db
      .query("sitePublications")
      .withIndex("by_subdomain", (q) => q.eq("subdomain", subdomain))
      .unique();
    if (
      !publication ||
      publication.status !== "published" ||
      !publication.snapshot.enabledSections.includes("enquiry")
    )
      return null;
    const saved = await ctx.db
      .query("enquiryFormConfigs")
      .withIndex("by_user", (q) => q.eq("userId", publication.userId))
      .unique();
    return {
      practitionerName: publication.snapshot.fullName,
      fields: (saved?.fields ?? defaultEnquiryConfig).filter(
        (field) => field.enabled,
      ) as EnquiryFieldConfig[],
    };
  },
});

export const submitPublic = mutation({
  args: {
    subdomain: v.string(),
    submissionKey: v.string(),
    consented: v.boolean(),
    responses: v.array(v.object({ fieldId: v.string(), value: v.string() })),
  },
  handler: async (ctx, args) => {
    if (!args.consented)
      throw new ConvexError("Confirm the privacy notice before sending.");
    const publication = await ctx.db
      .query("sitePublications")
      .withIndex("by_subdomain", (q) => q.eq("subdomain", args.subdomain))
      .unique();
    if (
      !publication ||
      publication.status !== "published" ||
      !publication.snapshot.enabledSections.includes("enquiry")
    )
      throw new ConvexError("This enquiry form is not available.");
    const userId = publication.userId;
    const duplicate = await ctx.db
      .query("enquiries")
      .withIndex("by_user_key", (q) =>
        q.eq("userId", userId).eq("submissionKey", args.submissionKey),
      )
      .unique();
    if (duplicate) return { enquiryId: duplicate._id, duplicate: true };
    const saved = await ctx.db
      .query("enquiryFormConfigs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    const config = (saved?.fields ??
      defaultEnquiryConfig) as EnquiryFieldConfig[];
    const responses = Object.fromEntries(
      args.responses
        .filter((item) => validIds.has(item.fieldId))
        .map((item) => [item.fieldId, item.value]),
    ) as EnquiryResponses;
    const errors = validateEnquiryResponses(config, responses);
    if (Object.keys(errors).length)
      throw new ConvexError("Complete all required fields before submitting.");
    const retentionDays = saved?.retentionDays ?? 90;
    const deleteAt = Date.now() + retentionDays * 24 * 60 * 60 * 1000;
    const enquiryId = await ctx.db.insert("enquiries", {
      userId,
      submissionKey: args.submissionKey,
      responses: Object.entries(responses).map(([fieldId, value]) => ({
        fieldId,
        value: value ?? "",
      })),
      status: "new",
      isTest: false,
      emailDelivery: "pending",
      deleteAt,
      submittedAt: Date.now(),
    });
    await incrementAnalyticsCounter(
      ctx,
      userId,
      publication.subdomain,
      "enquiry_complete",
    );
    await ctx.scheduler.runAfter(0, internal.enquiries.deliverPublicEmail, {
      enquiryId,
      userId,
    });
    await ctx.scheduler.runAt(deleteAt, internal.enquiries.deleteExpired, {
      enquiryId,
      userId,
    });
    return { enquiryId, duplicate: false };
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await userIdOrThrow(ctx);
    return await ctx.db
      .query("enquiries")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const markRead = mutation({
  args: { enquiryId: v.id("enquiries") },
  handler: async (ctx, { enquiryId }) => {
    const userId = await userIdOrThrow(ctx);
    const enquiry = await ctx.db.get(enquiryId);
    if (!enquiry || enquiry.userId !== userId)
      throw new ConvexError("Enquiry not found.");
    if (enquiry.status === "new")
      await ctx.db.patch(enquiryId, { status: "read" });
  },
});

export const deleteExpired = internalMutation({
  args: { enquiryId: v.id("enquiries"), userId: v.id("users") },
  handler: async (ctx, { enquiryId, userId }) => {
    const enquiry = await ctx.db.get(enquiryId);
    if (
      enquiry &&
      enquiry.userId === userId &&
      enquiry.deleteAt !== undefined &&
      enquiry.deleteAt <= Date.now()
    )
      await ctx.db.delete(enquiryId);
  },
});

export const getForDelivery = internalQuery({
  args: { enquiryId: v.id("enquiries"), userId: v.id("users") },
  handler: async (ctx, { enquiryId, userId }) => {
    const enquiry = await ctx.db.get(enquiryId);
    if (!enquiry || enquiry.userId !== userId) return null;
    const profile = await ctx.db
      .query("onboardingDrafts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    return { enquiry, recipient: profile?.contactEmail ?? null };
  },
});

export const recordDelivery = internalMutation({
  args: {
    enquiryId: v.id("enquiries"),
    status: v.union(v.literal("sent"), v.literal("failed")),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.enquiryId, {
      emailDelivery: args.status,
      emailError: args.error,
      ...(args.status === "sent" ? { emailSentAt: Date.now() } : {}),
    });
  },
});

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] ?? character,
  );
}

export const deliverEmail = action({
  args: { enquiryId: v.id("enquiries") },
  handler: async (ctx, { enquiryId }): Promise<{ sent: boolean }> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError("Sign in to continue.");
    return await ctx.runAction(internal.enquiries.deliverPublicEmail, {
      enquiryId,
      userId,
    });
  },
});

export const deliverPublicEmail = internalAction({
  args: { enquiryId: v.id("enquiries"), userId: v.id("users") },
  handler: async (ctx, { enquiryId, userId }): Promise<{ sent: boolean }> => {
    const data = await ctx.runQuery(internal.enquiries.getForDelivery, {
      enquiryId,
      userId,
    });
    if (!data) throw new ConvexError("Enquiry not found.");
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || !data.recipient) {
      await ctx.runMutation(internal.enquiries.recordDelivery, {
        enquiryId,
        status: "failed",
        error: !apiKey
          ? "Resend API key is not configured."
          : "Practice contact email is missing.",
      });
      return { sent: false };
    }
    const rows = data.enquiry.responses
      .map(({ fieldId, value }) => {
        const label =
          presetEnquiryFields.find((field) => field.id === fieldId)?.label ??
          fieldId;
        return `<p><strong>${escapeHtml(label)}</strong><br>${escapeHtml(value)}</p>`;
      })
      .join("");
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `enquiry/${enquiryId}`,
        },
        body: JSON.stringify({
          from: "Releaf <onboarding@resend.dev>",
          to: [data.recipient],
          subject: "New enquiry from your Releaf website",
          html: `<h1>New website enquiry</h1>${rows}<p>This response is also saved in your Releaf dashboard.</p>`,
        }),
      });
      if (!response.ok) throw new Error(`Resend returned ${response.status}.`);
      await ctx.runMutation(internal.enquiries.recordDelivery, {
        enquiryId,
        status: "sent",
      });
      return { sent: true };
    } catch (error) {
      await ctx.runMutation(internal.enquiries.recordDelivery, {
        enquiryId,
        status: "failed",
        error:
          error instanceof Error ? error.message : "Email delivery failed.",
      });
      return { sent: false };
    }
  },
});
