import { describe, expect, it } from "vitest";
import { visibleWebsiteFaqs } from "./website-faqs";

describe("website FAQs", () => {
  it("keeps only complete questions and answers", () => {
    expect(
      visibleWebsiteFaqs([
        { question: "  How often will we meet? ", answer: " Weekly. " },
        { question: "Unfinished", answer: "" },
      ]),
    ).toEqual([{ question: "How often will we meet?", answer: "Weekly." }]);
  });
});
