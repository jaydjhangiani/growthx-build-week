"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";

export function PublicJournal({ subdomain }: { subdomain: string }) {
  const posts = useQuery(api.blog.listPublic, { subdomain });
  const [visibleCount, setVisibleCount] = useState(3);
  if (posts === undefined)
    return <p className="public-section-loading">Opening the journal…</p>;
  if (!posts?.length)
    return (
      <div className="public-journal-empty">
        <small>From the journal</small>
        <h2>New writing will appear here.</h2>
      </div>
    );
  const imageCounts = new Map<string, number>();
  for (const post of posts) {
    if (!post.coverImageUrl) continue;
    imageCounts.set(
      post.coverImageUrl,
      (imageCounts.get(post.coverImageUrl) ?? 0) + 1,
    );
  }
  const visiblePosts = posts.slice(0, visibleCount);
  const hasMore = visibleCount < posts.length;
  return (
    <>
      <header>
        <small>From the journal</small>
        <h2>
          Notes for understanding
          <br />
          what you’re carrying.
        </h2>
      </header>
      <div className="public-post-grid">
        {visiblePosts.map((post) => (
          <article key={post.id} className={`public-post-card ${post.source}`}>
            <PostImage
              src={
                post.coverImageUrl && imageCounts.get(post.coverImageUrl) === 1
                  ? post.coverImageUrl
                  : null
              }
            />
            <time>
              {post.publishedAt
                ? new Intl.DateTimeFormat("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }).format(post.publishedAt)
                : "Published"}
            </time>
            <h3>{post.title}</h3>
            <p>{post.description}</p>
            {post.source === "substack" ? (
              <a href={post.href} target="_blank" rel="noreferrer">
                Read on Substack ↗
              </a>
            ) : (
              <Link href={post.href}>Read article →</Link>
            )}
          </article>
        ))}
      </div>
      {hasMore ? (
        <button
          className="public-journal-more"
          type="button"
          onClick={() => setVisibleCount((count) => count + 3)}
        >
          Show more articles ↓
        </button>
      ) : null}
    </>
  );
}

function PostImage({ src }: { src: string | null }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;

  return (
    <div className="public-post-image">
      {/* eslint-disable-next-line @next/next/no-img-element -- RSS images must load directly from their source. */}
      <img
        src={src}
        alt=""
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
