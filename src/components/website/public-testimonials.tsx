"use client";

import Image from "next/image";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function PublicTestimonials({ subdomain }: { subdomain: string }) {
  const data = useQuery(api.testimonials.listPublic, { subdomain });
  const [index, setIndex] = useState(0);
  const count = data?.items.length ?? 0;
  if (!data?.items.length) return null;
  const activeIndex = Math.min(index, count - 1);
  const item = data.items[activeIndex];

  return (
    <div className="public-testimonials">
      <header>
        <small>Kind words</small>
      </header>
      <div className={`public-testimonial-stage ${data.format}`} aria-live="polite">
        {item.kind === "image" && item.imageUrl ? (
          <figure>
            <Image
              src={item.imageUrl}
              alt={`Testimonial${item.attribution ? ` from ${item.attribution}` : ""}`}
              width={900}
              height={620}
              sizes="(max-width: 720px) 90vw, 720px"
              unoptimized
            />
            {item.attribution ? <figcaption>{item.attribution}</figcaption> : null}
          </figure>
        ) : (
          <figure>
            <blockquote>“{item.quote}”</blockquote>
            {item.attribution ? <figcaption>— {item.attribution}</figcaption> : null}
          </figure>
        )}
      </div>
      {count > 1 ? (
        <div className="public-testimonial-controls">
          <button
            type="button"
            onClick={() => setIndex((activeIndex - 1 + count) % count)}
            aria-label="Previous testimonial"
          >
            ←
          </button>
          <div aria-label={`Testimonial ${activeIndex + 1} of ${count}`}>
            {data.items.map((entry, dotIndex) => (
              <button
                key={entry.id}
                type="button"
                className={dotIndex === activeIndex ? "active" : ""}
                aria-label={`Show testimonial ${dotIndex + 1}`}
                aria-current={dotIndex === activeIndex ? "true" : undefined}
                onClick={() => setIndex(dotIndex)}
              />
            ))}
          </div>
          <span>
            {String(activeIndex + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
          </span>
          <button
            type="button"
            onClick={() => setIndex((activeIndex + 1) % count)}
            aria-label="Next testimonial"
          >
            →
          </button>
        </div>
      ) : null}
    </div>
  );
}
