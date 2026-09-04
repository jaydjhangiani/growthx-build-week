import { describe, expect, it } from "vitest";
import { normalizeSubdomain, suggestSubdomain, validateSubdomain } from "./subdomain";

describe("subdomain helpers", () => {
  it("normalizes a practice name", () => {
    expect(suggestSubdomain("Dr. Diva Mehta")).toBe("dr-diva-mehta");
    expect(normalizeSubdomain("  Diva's Practice  ")).toBe("divas-practice");
  });

  it("accepts a valid subdomain", () => {
    expect(validateSubdomain("diva-mehta")).toBeNull();
  });

  it("rejects malformed and reserved subdomains", () => {
    expect(validateSubdomain("ab")).toMatch(/3 characters/);
    expect(validateSubdomain("diva--mehta")).toMatch(/single hyphens/);
    expect(validateSubdomain("dashboard")).toMatch(/reserved/);
    expect(validateSubdomain("sign-in")).toMatch(/reserved/);
  });
});
