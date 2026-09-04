export type CalendlyUrlResult =
  | { ok: true; url: string; embedUrl: string }
  | { ok: false; error: string };

export function parseCalendlyUrl(value: string): CalendlyUrlResult {
  const input = value.trim();
  if (!input) return { ok: false, error: "Add your Calendly event link." };

  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    return { ok: false, error: "Enter a full link, such as https://calendly.com/your-name/discovery-call." };
  }

  const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
  const pathParts = parsed.pathname.split("/").filter(Boolean);
  if (parsed.protocol !== "https:" || hostname !== "calendly.com" || pathParts.length < 2) {
    return { ok: false, error: "Use a Calendly event link, such as https://calendly.com/your-name/discovery-call." };
  }

  parsed.hostname = "calendly.com";
  parsed.hash = "";
  parsed.pathname = `/${pathParts.join("/")}`;
  const url = parsed.toString().replace(/\/$/, "");
  const embed = new URL(url);
  embed.searchParams.set("hide_gdpr_banner", "1");
  embed.searchParams.set("background_color", "faf9f5");
  embed.searchParams.set("text_color", "17313d");
  embed.searchParams.set("primary_color", "b56f32");
  return { ok: true, url, embedUrl: embed.toString() };
}
