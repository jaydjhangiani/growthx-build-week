import { describe, expect, it } from "vitest";
import { credentialsSchema, identitySchema, practiceSchema, servicesSchema } from "./onboarding-schema";

describe("guided profile validation", () => {
  it("rejects empty required identity fields", () => {
    expect(identitySchema.safeParse({ fullName: "", city: "", practiceLocation: "", languages: [] }).success).toBe(false);
  });

  it("accepts Diva's complete profile steps", () => {
    expect(credentialsSchema.safeParse({ qualifications: ["M.A. Counselling Psychology"], certifications: [], yearsExperience: 5 }).success).toBe(true);
    expect(practiceSchema.safeParse({ biography: "I offer a warm and thoughtful space for young adults in Mumbai.", whoYouHelp: "Young adults navigating anxiety and relationships.", specializations: ["Anxiety"], therapeuticApproach: "Collaborative, trauma-informed, and paced around each person." }).success).toBe(true);
    expect(servicesSchema.safeParse({ services: [{ name: "Individual therapy", format: "online", durationMinutes: 50, feeInr: 2000 }], contactEmail: "diva@example.com" }).success).toBe(true);
  });

  it("rejects an invalid service", () => {
    expect(servicesSchema.safeParse({ services: [{ name: "", format: "online", durationMinutes: 5, feeInr: -1 }], contactEmail: "bad" }).success).toBe(false);
  });
});
