"use client";

import { useMutation, useQuery } from "convex/react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChangeEvent, useRef, useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { markdownDownload, markdownFilename, slugify } from "@/lib/blog";
import { formatMarkdown, type MarkdownFormat } from "@/lib/markdown-format";
import { MarkdownPreview } from "./markdown-preview";

type Post = { _id?: Id<"blogPosts">; title: string; description: string; content: string; slug: string; seoTitle: string; metaDescription: string; coverImageId?: Id<"_storage">; coverImageUrl?: string | null; status: "draft" | "published" };
const emptyPost: Post = { title: "", description: "", content: "", slug: "", seoTitle: "", metaDescription: "", status: "draft" };
const previewDate = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "long", year: "numeric" }).format(new Date());

export function BlogEditor() {
  const params = useParams<{ postId: string }>();
  const isNew = params.postId === "new";
  const existing = useQuery(api.blog.get, isNew ? "skip" : { postId: params.postId as Id<"blogPosts"> });
  if (!isNew && existing === undefined) return <div className="editor-loading">Opening your draft…</div>;
  if (!isNew && existing === null) return <main className="editor-missing"><h1>Article not found</h1><Link href="/dashboard/blog">Return to articles</Link></main>;
  return <EditorWorkspace key={existing?._id ?? "new"} initialPost={existing ?? emptyPost} />;
}

function EditorWorkspace({ initialPost }: { initialPost: Post }) {
  const savePost = useMutation(api.blog.save);
  const generateCoverUploadUrl = useMutation(api.blog.generateCoverUploadUrl);
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const contentInput = useRef<HTMLTextAreaElement>(null);
  const contentSelection = useRef({ start: 0, end: 0 });
  const [post, setPost] = useState(initialPost);
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("saved");
  const [coverUploading, setCoverUploading] = useState(false);

  function update(field: keyof Post, value: string) {
    setPost((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setSaveState("idle");
    if (field === "title" && !post.slug && !initialPost.slug) setPost((current) => ({ ...current, title: value, slug: slugify(value) }));
  }

  async function persist(status: "draft" | "published") {
    if (saveState === "saving") return;
    setSaveState("saving");
    setErrors({});
    setSuggestions([]);
    try {
      const result = await savePost({ postId: post._id, title: post.title, description: post.description, content: post.content, slug: post.slug, seoTitle: post.seoTitle, metaDescription: post.metaDescription, coverImageId: post.coverImageId, status });
      if (!result.ok) {
        setErrors(result.errors);
        setSuggestions(result.suggestions);
        setSaveState("error");
        return;
      }
      setPost((current) => ({ ...current, _id: result.postId, status }));
      setSaveState("saved");
      if (!post._id) router.replace(`/dashboard/blog/${result.postId}`);
    } catch {
      setErrors({ form: "Your article could not be saved. Try again." });
      setSaveState("error");
    }
  }

  async function uploadCover(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 8 * 1024 * 1024) {
      setErrors((current) => ({ ...current, cover: "Choose an image smaller than 8 MB." }));
      return;
    }
    setCoverUploading(true);
    try {
      const url = await generateCoverUploadUrl({});
      const response = await fetch(url, { method: "POST", headers: { "Content-Type": file.type }, body: file });
      if (!response.ok) throw new Error();
      const { storageId } = await response.json() as { storageId: Id<"_storage"> };
      setPost((current) => ({ ...current, coverImageId: storageId, coverImageUrl: URL.createObjectURL(file) }));
      setSaveState("idle");
    } catch {
      setErrors((current) => ({ ...current, cover: "The cover image could not be uploaded." }));
    } finally { setCoverUploading(false); }
  }

  function downloadSource() {
    const blob = new Blob([markdownDownload(post.title, post.description, post.content)], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = markdownFilename(post.slug, post.title);
    link.click();
    URL.revokeObjectURL(url);
  }

  function applyMarkdown(format: MarkdownFormat) {
    const input = contentInput.current;
    if (!input) return;
    const { start, end } = contentSelection.current;
    const result = formatMarkdown(post.content, start, end, format);
    update("content", result.content);
    contentSelection.current = { start: result.selectionStart, end: result.selectionEnd };
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  }

  function rememberContentSelection() {
    const input = contentInput.current;
    if (input) contentSelection.current = { start: input.selectionStart, end: input.selectionEnd };
  }

  return <main className="blog-editor"><header className="editor-topbar"><Link href="/dashboard/blog">← Articles</Link><div className="editor-state"><span className={saveState}>{saveState === "saving" ? "Saving…" : saveState === "saved" ? post.status === "published" ? "Published" : "Draft saved" : saveState === "error" ? "Not saved" : "Unsaved changes"}</span><button type="button" onClick={downloadSource}>Download .md</button><button type="button" className="save-draft" onClick={() => void persist("draft")} disabled={saveState === "saving"}>Save draft</button><button type="button" className="publish-post" onClick={() => void persist("published")} disabled={saveState === "saving"}>{post.status === "published" ? "Update" : "Publish"} →</button></div></header><div className="editor-layout"><section className="writing-desk"><div className="writing-meta"><input className="article-title-input" value={post.title} onChange={(event) => update("title", event.target.value)} placeholder="Article title" aria-label="Article title" aria-invalid={Boolean(errors.title)} />{errors.title ? <span className="editor-error">{errors.title}</span> : null}<textarea className="article-description-input" value={post.description} onChange={(event) => update("description", event.target.value)} placeholder="A short description that helps readers decide to open it" aria-label="Article description" rows={2} /></div><div className="editor-tabs" role="tablist"><button role="tab" aria-selected={mode === "write"} onClick={() => setMode("write")}>Write</button><button role="tab" aria-selected={mode === "preview"} onClick={() => setMode("preview")}>Preview</button><span>Markdown supported</span></div>{mode === "write" ? <div className="markdown-write"><div className="markdown-toolbar" aria-label="Markdown formatting tools" onMouseDown={(event) => event.preventDefault()}><button type="button" onClick={() => applyMarkdown("heading-one")} title="Heading 1">H1</button><button type="button" onClick={() => applyMarkdown("heading-two")} title="Heading 2">H2</button><button type="button" onClick={() => applyMarkdown("bold")} title="Bold"><b>B</b></button><button type="button" onClick={() => applyMarkdown("italic")} title="Italic"><i>I</i></button><button type="button" onClick={() => applyMarkdown("link")} title="Link">↗ Link</button><button type="button" onClick={() => applyMarkdown("quote")} title="Quote">“ Quote</button><button type="button" onClick={() => applyMarkdown("bullet-list")} title="Bullet list">• List</button><button type="button" onClick={() => applyMarkdown("numbered-list")} title="Numbered list">1. List</button><button type="button" onClick={() => applyMarkdown("task-list")} title="Checklist">☐ Task</button><button type="button" onClick={() => applyMarkdown("inline-code")} title="Inline code">&lt;/&gt;</button></div><details className="markdown-guide"><summary>Markdown rule guide</summary><div><p><code># Heading 1</code><span>Largest heading</span></p><p><code>## Heading 2</code><span>Smaller heading</span></p><p><code>**bold**</code><span>Bold text</span></p><p><code>_italic_</code><span>Italic text</span></p><p><code>[text](https://site.com)</code><span>Link</span></p><p><code>&gt; Quote</code><span>Quote</span></p><p><code>- Item</code><span>Bullet list</span></p><p><code>1. Item</code><span>Numbered list</span></p><p><code>- [ ] Task</code><span>Checklist</span></p><p><code>`code`</code><span>Inline code</span></p><p><code>~~removed~~</code><span>Strikethrough</span></p><p><code>---</code><span>Divider line</span></p></div></details><textarea ref={contentInput} value={post.content} onChange={(event) => { update("content", event.target.value); rememberContentSelection(); }} onSelect={rememberContentSelection} placeholder={"Begin writing…\n\n## A heading\n\nYour words here."} aria-label="Markdown article content" aria-invalid={Boolean(errors.content)} />{errors.content ? <span className="editor-error">{errors.content}</span> : null}</div> : <div className="article-preview"><PreviewHeader post={post} /><MarkdownPreview content={post.content} /></div>}</section><aside className="publishing-panel"><section><h2>Cover image</h2><button className="cover-control" type="button" onClick={() => fileInput.current?.click()} disabled={coverUploading}>{post.coverImageUrl ? <Image src={post.coverImageUrl} alt="Article cover" fill sizes="300px" unoptimized /> : <span><b>＋</b>{coverUploading ? "Uploading…" : "Add a cover image"}</span>}</button><input ref={fileInput} type="file" accept="image/*" onChange={uploadCover} hidden />{errors.cover ? <span className="editor-error">{errors.cover}</span> : null}</section><section><h2>Article URL</h2><label><span>Slug</span><div className="slug-input"><small>/journal/</small><input value={post.slug} onChange={(event) => update("slug", slugify(event.target.value))} placeholder="your-article" /></div></label>{errors.slug ? <span className="editor-error">{errors.slug}</span> : null}{suggestions.length ? <div className="slug-suggestions"><small>Try one of these:</small>{suggestions.map((slug) => <button type="button" key={slug} onClick={() => update("slug", slug)}>{slug}</button>)}</div> : null}</section><section><h2>Search details</h2><label><span>SEO title <i>{post.seoTitle.length}/60</i></span><input value={post.seoTitle} maxLength={60} onChange={(event) => update("seoTitle", event.target.value)} placeholder={post.title || "Search result title"} /></label><label><span>Meta description <i>{post.metaDescription.length}/160</i></span><textarea value={post.metaDescription} maxLength={160} onChange={(event) => update("metaDescription", event.target.value)} rows={4} placeholder={post.description || "Short search result description"} /></label></section>{errors.form ? <p className="editor-form-error">{errors.form}</p> : null}</aside></div></main>;
}

function PreviewHeader({ post }: { post: Post }) {
  return <header className="article-preview-header">{post.coverImageUrl ? <div><Image src={post.coverImageUrl} alt="" fill sizes="700px" unoptimized /></div> : null}<p>Journal · {previewDate}</p><h1>{post.title || "Untitled article"}</h1>{post.description ? <span>{post.description}</span> : null}</header>;
}
