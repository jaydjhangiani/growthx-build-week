import { z } from "zod";

const list = (label: string) => z.array(z.string().trim()).transform((items) => items.filter(Boolean)).refine((items) => items.length > 0, `Add at least one ${label}.`);

export const identitySchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name."),
  city: z.string().trim().min(2, "Enter your city."),
  practiceLocation: z.string().trim().min(2, "Enter your practice location."),
  languages: list("language"),
});

export const credentialsSchema = z.object({
  qualifications: list("qualification"),
  certifications: z.array(z.string().trim()).transform((items) => items.filter(Boolean)),
  yearsExperience: z.number().int().min(0, "Enter 0 or more years.").max(60, "Enter 60 years or fewer."),
});

export const practiceSchema = z.object({
  biography: z.string().trim().min(40, "Write at least 40 characters about yourself."),
  whoYouHelp: z.string().trim().min(20, "Write at least 20 characters about who you help."),
  specializations: list("specialization"),
  therapeuticApproach: z.string().trim().min(30, "Write at least 30 characters about your approach."),
});

export const serviceSchema = z.object({
  name: z.string().trim().min(2, "Enter a service name."),
  format: z.enum(["online", "offline", "hybrid"]),
  durationMinutes: z.number().int().min(10, "Use at least 10 minutes.").max(240, "Use 240 minutes or fewer."),
  feeInr: z.number().min(0, "Fee cannot be negative."),
});

export const servicesSchema = z.object({
  services: z.array(serviceSchema).min(1, "Add at least one service."),
  contactEmail: z.email("Enter a valid contact email.").transform((value) => value.trim().toLowerCase()),
});

export const onboardingStepSchemas = [identitySchema, credentialsSchema, practiceSchema, servicesSchema] as const;
