import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

const serviceValidator = v.object({
  name: v.string(),
  format: v.union(v.literal("online"), v.literal("offline"), v.literal("hybrid")),
  durationMinutes: v.number(),
  feeInr: v.number(),
});
const certificationValidator = v.union(
  v.string(),
  v.object({ name: v.string(), place: v.string() }),
);

async function requireUserId(ctx: { auth: { getUserIdentity(): Promise<unknown> } }) {
  const userId = await getAuthUserId(ctx as never);
  if (userId === null) throw new ConvexError("Sign in to continue.");
  return userId;
}

function required(value: string, label: string, minimum = 1) {
  const cleaned = value.trim();
  if (cleaned.length < minimum) throw new ConvexError(`${label} is required.`);
  return cleaned;
}

function cleanList(values: string[], label: string) {
  const cleaned = values.map((value) => value.trim()).filter(Boolean);
  if (cleaned.length === 0) throw new ConvexError(`Add at least one ${label}.`);
  return cleaned;
}

export const getDraft = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const draft = await ctx.db.query("onboardingDrafts").withIndex("by_user", (q) => q.eq("userId", userId)).unique();
    if (draft === null) return null;
    const profilePhotoUrl = draft.profilePhotoId ? await ctx.storage.getUrl(draft.profilePhotoId) : null;
    return { ...draft, profilePhotoUrl };
  },
});

export const getAvailability = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const draft = await ctx.db
      .query("onboardingDrafts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    return draft?.acceptingNewClients !== false;
  },
});

export const setAvailability = mutation({
  args: { acceptingNewClients: v.boolean() },
  handler: async (ctx, { acceptingNewClients }) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db
      .query("onboardingDrafts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    const updatedAt = Date.now();
    if (existing)
      await ctx.db.patch(existing._id, { acceptingNewClients, updatedAt });
    else
      await ctx.db.insert("onboardingDrafts", {
        userId,
        currentStep: 1,
        completedSteps: [],
        acceptingNewClients,
        updatedAt,
      });
    return acceptingNewClients;
  },
});

export const saveStep = mutation({
  args: {
    step: v.number(),
    data: v.union(
      v.object({ fullName: v.string(), city: v.string(), practiceLocation: v.string(), languages: v.array(v.string()) }),
      v.object({ qualifications: v.array(v.string()), certifications: v.array(certificationValidator), yearsExperience: v.number() }),
      v.object({ biography: v.string(), whoYouHelp: v.string(), specializations: v.array(v.string()), therapeuticApproach: v.string() }),
      v.object({ services: v.array(serviceValidator), contactEmail: v.string() }),
    ),
  },
  handler: async (ctx, { step, data }) => {
    const userId = await requireUserId(ctx);
    if (![1, 2, 3, 4].includes(step)) throw new ConvexError("This profile step is not valid.");

    let cleaned: Record<string, unknown>;
    if (step === 1 && "fullName" in data) {
      cleaned = { fullName: required(data.fullName, "Name", 2), city: required(data.city, "City", 2), practiceLocation: required(data.practiceLocation, "Practice location", 2), languages: cleanList(data.languages, "language") };
    } else if (step === 2 && "qualifications" in data) {
      if (!Number.isInteger(data.yearsExperience) || data.yearsExperience < 0 || data.yearsExperience > 60) throw new ConvexError("Enter years of experience between 0 and 60.");
      cleaned = {
        qualifications: cleanList(data.qualifications, "qualification"),
        certifications: data.certifications.flatMap((item) => {
          if (typeof item === "string") {
            const name = item.trim();
            return name ? [{ name, place: "" }] : [];
          }
          const name = item.name.trim();
          if (!name) return [];
          return [{ name, place: item.place.trim() }];
        }),
        yearsExperience: data.yearsExperience,
      };
    } else if (step === 3 && "biography" in data) {
      const specializations = cleanList(data.specializations, "specialization");
      if (specializations.length > 5)
        throw new ConvexError("Add up to 5 specializations.");
      cleaned = { biography: required(data.biography, "Biography", 40), whoYouHelp: required(data.whoYouHelp, "Who you help", 20), specializations, therapeuticApproach: required(data.therapeuticApproach, "Therapeutic approach", 30) };
    } else if (step === 4 && "services" in data) {
      const email = data.contactEmail.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ConvexError("Enter a valid contact email.");
      if (data.services.length === 0) throw new ConvexError("Add at least one service.");
      const services = data.services.map((service) => ({ name: required(service.name, "Service name", 2), format: service.format, durationMinutes: service.durationMinutes, feeInr: service.feeInr }));
      if (services.some((service) => !Number.isInteger(service.durationMinutes) || service.durationMinutes < 10 || service.durationMinutes > 240 || !Number.isFinite(service.feeInr) || service.feeInr < 0)) throw new ConvexError("Check each service duration and fee.");
      cleaned = { services, contactEmail: email };
    } else {
      throw new ConvexError("The profile data does not match this step.");
    }

    const existing = await ctx.db.query("onboardingDrafts").withIndex("by_user", (q) => q.eq("userId", userId)).unique();
    const completedSteps = Array.from(new Set([...(existing?.completedSteps ?? []), step])).sort();
    const patch = { ...cleaned, currentStep: Math.min(step + 1, 5), completedSteps, updatedAt: Date.now() };
    if (existing) await ctx.db.patch(existing._id, patch);
    else await ctx.db.insert("onboardingDrafts", { userId, ...patch });
    return { currentStep: patch.currentStep, completedSteps };
  },
});

export const generatePhotoUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireUserId(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveProfilePhoto = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db.query("onboardingDrafts").withIndex("by_user", (q) => q.eq("userId", userId)).unique();
    if (existing?.profilePhotoId && existing.profilePhotoId !== storageId) await ctx.storage.delete(existing.profilePhotoId);
    if (existing) await ctx.db.patch(existing._id, { profilePhotoId: storageId, updatedAt: Date.now() });
    else await ctx.db.insert("onboardingDrafts", { userId, currentStep: 1, completedSteps: [], profilePhotoId: storageId, updatedAt: Date.now() });
  },
});
