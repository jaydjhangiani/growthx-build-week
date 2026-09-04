import { describe, expect, it } from "vitest";
import { defaultEnquiryConfig, validateEnquiryResponses } from "./enquiry";

describe("enquiry validation", () => {
  it("requires enabled required fields", () => expect(validateEnquiryResponses(defaultEnquiryConfig, {})).toEqual({ name: "Name is required.", email: "Email is required." }));
  it("rejects an invalid email", () => expect(validateEnquiryResponses(defaultEnquiryConfig, { name: "Diva", email: "wrong" }).email).toBe("Enter a valid email address."));
  it("ignores disabled fields", () => expect(validateEnquiryResponses([{ id: "name", enabled: false, required: true }], {})).toEqual({}));
});
