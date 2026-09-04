"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { MarkdownPreview } from "@/components/blog/markdown-preview";

export default function PublicArticlePage() {
  const { subdomain, slug } = useParams<{ subdomain: string; slug: string }>();
  const post = useQuery(api.blog.getPublic, { subdomain, slug });
  const record = useMutation(api.analytics.record);
  const viewRecorded = useRef(false);
  useEffect(() => {
    if (!post || viewRecorded.current) return;
    viewRecorded.current = true;
    void record({ subdomain, eventType: "blog_view" });
  }, [post, record, subdomain]);
  if (post === undefined)
    return <main className="public-site-state">Opening article…</main>;
  if (post === null)
    return (
      <main className="public-site-state">
        <h1>Article not found</h1>
        <Link href={`/${subdomain}`}>Return to website</Link>
      </main>
    );
  return (
    <main className="public-article-page">
      <nav>
        <Link href={`/${subdomain}`}>← {post.practitionerName}</Link>
      </nav>
      <header>
        {post.coverImageUrl ? (
          <div>
            <Image
              src={post.coverImageUrl}
              alt=""
              fill
              sizes="100vw"
              unoptimized
            />
          </div>
        ) : null}
        <time>
          {post.publishedAt
            ? new Intl.DateTimeFormat("en-IN", { dateStyle: "long" }).format(
                post.publishedAt,
              )
            : "Published"}
        </time>
        <h1>{post.title}</h1>
        <p>{post.description}</p>
      </header>
      <MarkdownPreview content={post.content} />
    </main>
  );
}
