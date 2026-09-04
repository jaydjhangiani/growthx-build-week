"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function PublicJournal({ subdomain }: { subdomain: string }) {
  const posts = useQuery(api.blog.listPublic, { subdomain });
  if (posts === undefined)
    return <p className="public-section-loading">Opening the journal…</p>;
  if (!posts?.length)
    return (
      <div className="public-journal-empty">
        <small>From the journal</small>
        <h2>New writing will appear here.</h2>
      </div>
    );
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
        {posts.map((post) => (
          <article key={post.id} className={`public-post-card ${post.source}`}>
            {post.coverImageUrl ? (
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element -- RSS images must not be fetched by Releaf's server. */}
                <img
                  src={post.coverImageUrl}
                  alt=""
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="public-post-placeholder">R</div>
            )}
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
    </>
  );
}
