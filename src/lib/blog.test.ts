import { describe, expect, it } from "vitest";
import { markdownDownload, markdownFilename, slugify } from "./blog";

describe("native blog helpers", () => {
  it("creates clean URL slugs", () => expect(slugify("  What a Boundary Can Sound Like! ")).toBe("what-a-boundary-can-sound-like"));
  it("creates a safe markdown filename", () => expect(markdownFilename("", "My First Post")).toBe("my-first-post.md"));
  it("downloads source with frontmatter", () => expect(markdownDownload("Rest", "A note", "## Begin")).toContain("## Begin"));
});
