import { describe, expect, it } from "vitest";
import { normalizeSubstackUrl, parseSubstackFeed } from "./substack";

describe("normalizeSubstackUrl", () => {
  it("normalizes a publication homepage", () => {
    expect(normalizeSubstackUrl("calmnotes.substack.com")).toEqual({
      ok: true,
      publicationUrl: "https://calmnotes.substack.com",
      rssUrl: "https://calmnotes.substack.com/feed",
    });
  });

  it("accepts the publication feed URL", () => {
    expect(normalizeSubstackUrl("https://calmnotes.substack.com/feed")).toEqual(
      {
        ok: true,
        publicationUrl: "https://calmnotes.substack.com",
        rssUrl: "https://calmnotes.substack.com/feed",
      },
    );
  });

  it("rejects unsafe and non-Substack URLs", () => {
    expect(normalizeSubstackUrl("http://calmnotes.substack.com").ok).toBe(
      false,
    );
    expect(normalizeSubstackUrl("https://example.com").ok).toBe(false);
    expect(
      normalizeSubstackUrl("https://calmnotes.substack.com/p/a-post").ok,
    ).toBe(false);
  });
});

describe("parseSubstackFeed", () => {
  it("extracts safe public post metadata", () => {
    const xml = `<?xml version="1.0"?>
      <rss><channel><title>Calm Notes</title>
        <item>
          <title><![CDATA[Making room for uncertainty]]></title>
          <link>https://calmnotes.substack.com/p/uncertainty</link>
          <guid>post-123</guid>
          <pubDate>Tue, 01 Sep 2026 10:00:00 GMT</pubDate>
          <description><![CDATA[<p>A short &amp; useful reflection.</p>]]></description>
          <enclosure url="https://images.example.com/cover.jpg" type="image/jpeg" />
        </item>
      </channel></rss>`;

    expect(parseSubstackFeed(xml)).toEqual([
      {
        externalId: "post-123",
        title: "Making room for uncertainty",
        summary: "A short & useful reflection.",
        url: "https://calmnotes.substack.com/p/uncertainty",
        imageUrl: "https://images.example.com/cover.jpg",
        publishedAt: Date.parse("Tue, 01 Sep 2026 10:00:00 GMT"),
      },
    ]);
  });

  it("uses an article image and link as fallbacks", () => {
    const xml = `<rss><channel><item>
      <title>Grounding</title>
      <link>https://calmnotes.substack.com/p/grounding</link>
      <description><![CDATA[<img src="https://images.example.com/grounding.png"><p>Try this today.</p>]]></description>
    </item></channel></rss>`;

    const [post] = parseSubstackFeed(xml);
    expect(post.externalId).toBe("https://calmnotes.substack.com/p/grounding");
    expect(post.imageUrl).toBe("https://images.example.com/grounding.png");
    expect(post.summary).toBe("Try this today.");
  });

  it("ignores malformed items", () => {
    expect(
      parseSubstackFeed(
        "<rss><channel><item><title>No link</title></item></channel></rss>",
      ),
    ).toEqual([]);
  });
});
