const reservedSubdomains = new Set([
  "admin", "api", "app", "blog", "dashboard", "demo", "help", "mail",
  "onboarding", "releaf", "sign-in", "sign-up", "site", "status", "support", "www",
]);

export function normalizeSubdomain(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/g, "");
}

export function suggestSubdomain(name?: string) {
  return normalizeSubdomain(name || "my-practice") || "my-practice";
}

export function validateSubdomain(value: string) {
  if (value.length < 3) return "Use at least 3 characters.";
  if (value.length > 48) return "Use no more than 48 characters.";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) return "Use lowercase letters, numbers, and single hyphens only.";
  if (reservedSubdomains.has(value)) return "This name is reserved. Choose another.";
  return null;
}

export function publicSitePath(subdomain: string) {
  return `/${subdomain}`;
}
