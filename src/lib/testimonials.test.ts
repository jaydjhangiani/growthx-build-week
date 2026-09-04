import { describe, expect, it } from "vitest";
import {
  TESTIMONIAL_ATTRIBUTION_MAX_LENGTH,
  TESTIMONIAL_IMAGE_MAX_BYTES,
  TESTIMONIAL_MAX_LENGTH,
  validateTestimonialImage,
  validateWrittenTestimonial,
} from "./testimonials";

describe("testimonial validation", () => {
  it("requires written testimonial text", () => {
    expect(validateWrittenTestimonial("   ", "Anonymous")).toBe(
      "Add the testimonial text.",
    );
  });

  it("accepts text with optional attribution", () => {
    expect(validateWrittenTestimonial("I felt heard.", "")).toBeNull();
  });

  it("limits testimonial and attribution length", () => {
    expect(validateWrittenTestimonial("x".repeat(TESTIMONIAL_MAX_LENGTH + 1), "")).toContain("800");
    expect(validateWrittenTestimonial("Helpful", "x".repeat(TESTIMONIAL_ATTRIBUTION_MAX_LENGTH + 1))).toContain("120");
  });

  it("accepts supported images within 5 MB", () => {
    expect(validateTestimonialImage({ type: "image/webp", size: 1024 })).toBeNull();
  });

  it("rejects unsupported and oversized images", () => {
    expect(validateTestimonialImage({ type: "image/gif", size: 1024 })).toContain("JPG");
    expect(validateTestimonialImage({ type: "image/png", size: TESTIMONIAL_IMAGE_MAX_BYTES + 1 })).toContain("5 MB");
  });
});
