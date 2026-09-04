import { describe, expect, it } from "vitest";
import { primaryNavigation, samplePractice } from "./sample-practice";

describe("sample psychologist website content", () => {
  it("links visitors to every milestone-one destination", () => {
    const links = primaryNavigation.map((item) => item.href);
    expect(links).toEqual(expect.arrayContaining(["#services", "#blog", "#booking", "#enquiry"]));
  });

  it("provides useful service and article previews", () => {
    expect(samplePractice.services.length).toBeGreaterThan(0);
    expect(samplePractice.services.every((service) => service.fee && service.format)).toBe(true);
    expect(samplePractice.posts.length).toBeGreaterThanOrEqual(3);
  });
});
