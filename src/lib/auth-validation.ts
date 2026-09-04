import { z } from "zod";

const password = z
  .string()
  .min(8, "Use at least 8 characters.")
  .regex(/[A-Za-z]/, "Add at least one letter.")
  .regex(/\d/, "Add at least one number.")
  .regex(/[^A-Za-z0-9]/, "Add at least one symbol.");

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name."),
  email: z.email("Enter a valid email address."),
  password,
});

export const signInSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});
