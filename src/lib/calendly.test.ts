import { describe, expect, it } from "vitest";
import { parseCalendlyUrl } from "./calendly";

describe("Calendly URL validation", () => {
  it("accepts and normalizes a Calendly event link", () => {
    const result = parseCalendlyUrl(" https://www.calendly.com/diva/discovery-call/ ");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.url).toBe("https://calendly.com/diva/discovery-call");
      expect(result.embedUrl).toContain("hide_gdpr_banner=1");
    }
  });

  it.each([
    "",
    "calendly.com/diva/discovery-call",
    "http://calendly.com/diva/discovery-call",
    "https://example.com/diva/discovery-call",
    "https://calendly.com/diva",
  ])("rejects %j", (value) => expect(parseCalendlyUrl(value).ok).toBe(false));
});
