"use client";

import { useQuery } from "convex/react";
import Image from "next/image";
import Link from "next/link";
import { api } from "../../../convex/_generated/api";

export function BlogList() {
  const posts = useQuery(api.blog.list);
  if (posts === undefined) return <div className="blog-loading">Opening your writing desk…</div>;

  return <div className="blog-library"><header><div><p>Native blog</p><h1>Articles</h1><span>Write educational content in your own voice and publish it on your website.</span></div><Link href="/dashboard/blog/new">Write a new article <b>＋</b></Link></header>{posts.length === 0 ? <section className="blog-empty"><div className="empty-page"><span>R</span><i /><i /><i /></div><div><p>Your journal is ready</p><h2>Begin with one idea<br />you often share in sessions.</h2><span>Draft in Markdown, preview the final article, and publish when it feels right.</span><Link href="/dashboard/blog/new">Write your first article →</Link></div></section> : <div className="post-list"><div className="post-list-head"><span>Article</span><span>Status</span><span>Last changed</span><span /></div>{posts.map((post) => <article key={post._id}><div className="post-list-title">{post.coverImageUrl ? <Image src={post.coverImageUrl} alt="" width={64} height={48} unoptimized /> : <span className="post-thumb">Aa</span>}<div><b>{post.title || "Untitled article"}</b><small>/{post.slug || "no-slug-yet"}</small></div></div><span className={`post-status ${post.status}`}>{post.status}</span><time>{new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(post.updatedAt)}</time><Link href={`/dashboard/blog/${post._id}`}>Edit →</Link></article>)}</div>}</div>;
}
