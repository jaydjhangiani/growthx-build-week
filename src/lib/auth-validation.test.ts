import { describe, expect, it } from "vitest";
import { signInSchema, signUpSchema } from "./auth-validation";

describe("account form validation", () => {
  it("accepts a valid new account", () => {
    expect(signUpSchema.safeParse({ name: "Diva Mehta", email: "diva@example.com", password: "Releaf#24" }).success).toBe(true);
  });

  it("rejects weak passwords and malformed emails", () => {
    expect(signUpSchema.safeParse({ name: "D", email: "diva", password: "password" }).success).toBe(false);
    expect(signInSchema.safeParse({ email: "not-an-email", password: "" }).success).toBe(false);
  });
});
