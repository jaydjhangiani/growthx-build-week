export function slugify(value: string) {
  return value.toLowerCase().trim().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

export function markdownFilename(slug: string, title: string) {
  return `${slugify(slug || title) || "untitled-article"}.md`;
}

export function markdownDownload(title: string, description: string, content: string) {
  const escapedTitle = title.replace(/"/g, '\\"');
  const escapedDescription = description.replace(/"/g, '\\"');
  return `---\ntitle: "${escapedTitle}"\ndescription: "${escapedDescription}"\n---\n\n${content}`;
}
