import { describe, expect, it } from "vitest";
import { formatMarkdown } from "./markdown-format";

describe("Markdown toolbar formatting", () => {
  it("wraps selected text in bold marks", () => {
    expect(formatMarkdown("Make this clear", 5, 9, "bold").content).toBe("Make **this** clear");
  });

  it("adds a heading to placeholder text when nothing is selected", () => {
    expect(formatMarkdown("", 0, 0, "heading-one").content).toBe("# Heading");
  });

  it("turns multiple lines into a numbered list", () => {
    expect(formatMarkdown("First\nSecond", 0, 12, "numbered-list").content).toBe("1. First\n2. Second");
  });

  it("creates a link and selects its editable label", () => {
    const result = formatMarkdown("", 0, 0, "link");
    expect(result.content).toBe("[link text](https://example.com)");
    expect(result.content.slice(result.selectionStart, result.selectionEnd)).toBe("link text");
  });
});
