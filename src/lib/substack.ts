export type ImportedSubstackPost = {
  externalId: string;
  title: string;
  summary: string;
  url: string;
  imageUrl?: string;
  publishedAt: number;
};

export type SubstackUrlResult =
  | { ok: true; publicationUrl: string; rssUrl: string }
  | { ok: false; error: string };

const itemPattern = /<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi;

export function normalizeSubstackUrl(value: string): SubstackUrlResult {
  const input = value.trim();
  if (!input) return { ok: false, error: "Add your Substack publication URL." };
  let url: URL;
  try {
    url = new URL(input.includes("://") ? input : `https://${input}`);
  } catch {
    return { ok: false, error: "Enter a valid Substack publication URL." };
  }
  const hostname = url.hostname.toLowerCase();
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.port ||
    !hostname.endsWith(".substack.com") ||
    hostname === "www.substack.com"
  ) {
    return {
      ok: false,
      error: "Use a public address like publication.substack.com.",
    };
  }
  const path = url.pathname.replace(/\/+$/, "") || "/";
  if (path !== "/" && path !== "/feed") {
    return {
      ok: false,
      error: "Paste the publication homepage, not an individual article.",
    };
  }
  const publicationUrl = `https://${hostname}`;
  return {
    ok: true,
    publicationUrl,
    rssUrl: `${publicationUrl}/feed`,
  };
}

export function parseSubstackFeed(xml: string): ImportedSubstackPost[] {
  const posts: ImportedSubstackPost[] = [];
  for (const match of xml.matchAll(itemPattern)) {
    const item = match[1];
    const title = cleanText(readTag(item, "title")).slice(0, 200);
    const url = safeArticleUrl(cleanText(readTag(item, "link")));
    if (!title || !url) continue;
    const description = readTag(item, "description");
    const content = readTag(item, "content:encoded");
    const summary = cleanText(description || content).slice(0, 320);
    const guid = cleanText(readTag(item, "guid"));
    const published = Date.parse(cleanText(readTag(item, "pubDate")));
    const imageUrl = findImage(item, description, content);
    posts.push({
      externalId: (guid || url).slice(0, 500),
      title,
      summary,
      url,
      ...(imageUrl ? { imageUrl } : {}),
      publishedAt: Number.isFinite(published) ? published : 0,
    });
    if (posts.length === 12) break;
  }
  return posts;
}

function readTag(xml: string, name: string) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return (
    xml.match(
      new RegExp(`<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escaped}>`, "i"),
    )?.[1] ?? ""
  );
}

function cleanText(value: string) {
  return decodeXml(
    value
      .replace(/^\s*<!\[CDATA\[([\s\S]*)\]\]>\s*$/, "$1")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function decodeXml(value: string) {
  const named: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    quot: '"',
    nbsp: " ",
  };
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, code: string) => {
    if (code.startsWith("#")) {
      const hex = code[1]?.toLowerCase() === "x";
      const point = Number.parseInt(code.slice(hex ? 2 : 1), hex ? 16 : 10);
      return Number.isFinite(point) ? String.fromCodePoint(point) : entity;
    }
    return named[code.toLowerCase()] ?? entity;
  });
}

function safeArticleUrl(value: string) {
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      !url.hostname.toLowerCase().endsWith(".substack.com")
    )
      return "";
    return url.toString();
  } catch {
    return "";
  }
}

function findImage(item: string, description: string, content: string) {
  const candidate =
    item.match(/<enclosure\b[^>]*\burl=["']([^"']+)["'][^>]*>/i)?.[1] ??
    item.match(/<media:content\b[^>]*\burl=["']([^"']+)["'][^>]*>/i)?.[1] ??
    `${description} ${content}`.match(
      /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/i,
    )?.[1];
  if (!candidate) return undefined;
  try {
    const url = new URL(decodeXml(candidate));
    return url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}
