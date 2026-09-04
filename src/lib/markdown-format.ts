export type MarkdownFormat =
  | "heading-one"
  | "heading-two"
  | "bold"
  | "italic"
  | "link"
  | "quote"
  | "bullet-list"
  | "numbered-list"
  | "task-list"
  | "inline-code";

type FormattedMarkdown = {
  content: string;
  selectionStart: number;
  selectionEnd: number;
};

const wrappedFormats: Partial<Record<MarkdownFormat, [string, string, string]>> = {
  bold: ["**", "**", "bold text"],
  italic: ["_", "_", "italic text"],
  link: ["[", "](https://example.com)", "link text"],
  "inline-code": ["`", "`", "code"],
};

export function formatMarkdown(
  content: string,
  selectionStart: number,
  selectionEnd: number,
  format: MarkdownFormat,
): FormattedMarkdown {
  const selected = content.slice(selectionStart, selectionEnd);
  const wrapped = wrappedFormats[format];

  if (wrapped) {
    const [beforeMark, afterMark, placeholder] = wrapped;
    const inner = selected || placeholder;
    const replacement = `${beforeMark}${inner}${afterMark}`;
    return {
      content: content.slice(0, selectionStart) + replacement + content.slice(selectionEnd),
      selectionStart: selectionStart + beforeMark.length,
      selectionEnd: selectionStart + beforeMark.length + inner.length,
    };
  }

  const fallback: Record<Exclude<MarkdownFormat, keyof typeof wrappedFormats>, string> = {
    "heading-one": "Heading",
    "heading-two": "Subheading",
    quote: "Quote",
    "bullet-list": "List item",
    "numbered-list": "List item",
    "task-list": "Task",
  };
  const source = selected || fallback[format as keyof typeof fallback];
  const lines = source.split("\n");
  const formattedLines = lines.map((line, index) => {
    if (format === "heading-one") return `# ${line}`;
    if (format === "heading-two") return `## ${line}`;
    if (format === "quote") return `> ${line}`;
    if (format === "numbered-list") return `${index + 1}. ${line}`;
    if (format === "task-list") return `- [ ] ${line}`;
    return `- ${line}`;
  });
  const replacement = formattedLines.join("\n");

  return {
    content: content.slice(0, selectionStart) + replacement + content.slice(selectionEnd),
    selectionStart,
    selectionEnd: selectionStart + replacement.length,
  };
}
