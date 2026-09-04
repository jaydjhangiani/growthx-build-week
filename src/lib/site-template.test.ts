import { describe, expect, it } from "vitest";
import {
  formatServiceDetails,
  navigationForSections,
  orderedEnabledSections,
} from "./site-template";

describe("orderedEnabledSections", () => {
  it("keeps the chosen order and removes hidden or duplicate sections", () => {
    expect(
      orderedEnabledSections(
        ["services", "introduction", "blog", "services", "booking"],
        ["introduction", "services", "booking"],
      ),
    ).toEqual(["services", "introduction", "booking"]);
  });
});

describe("navigationForSections", () => {
  it("only returns links for visible page destinations", () => {
    expect(
      navigationForSections(["introduction", "who-i-help", "blog", "enquiry"]),
    ).toEqual([
      { label: "Therapy", href: "#who-i-help" },
      { label: "Journal", href: "#blog" },
      { label: "Enquire", href: "#enquiry" },
    ]);
  });
});

describe("formatServiceDetails", () => {
  it("formats format, duration, and fee for a service card", () => {
    expect(
      formatServiceDetails({
        format: "online",
        durationMinutes: 50,
        feeInr: 2000,
      }),
    ).toEqual({ format: "Online · 50 minutes", fee: "₹2,000 per session" });
  });
});
