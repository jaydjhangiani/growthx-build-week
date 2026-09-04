import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownPreview({ content }: { content: string }) {
  if (!content.trim()) return <div className="markdown-empty"><span>✎</span><p>Your article preview will appear here as you write.</p></div>;
  return <article className="markdown-article"><ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown></article>;
}
