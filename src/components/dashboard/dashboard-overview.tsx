"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { publicSitePath } from "@/lib/subdomain";

const analyticsMetrics = [
  {
    key: "website_view",
    label: "Website views",
    note: "People who opened your site",
  },
  { key: "blog_view", label: "Blog views", note: "Published articles opened" },
  {
    key: "calendly_click",
    label: "Calendly clicks",
    note: "Booking links selected",
  },
  {
    key: "enquiry_start",
    label: "Form starts",
    note: "Visitors who began an enquiry",
  },
  {
    key: "enquiry_complete",
    label: "Completed enquiries",
    note: "Enquiries safely received",
  },
] as const;

export function DashboardOverview() {
  const publication = useQuery(api.publishing.getStatus);
  const analytics = useQuery(api.analytics.getDashboard);
  if (publication === undefined)
    return (
      <section className="dashboard-empty">
        Loading your website status…
      </section>
    );
  const isPublished = publication.status === "published";
  return (
    <section className="dashboard-overview">
      <header>
        <p className="auth-kicker">Your website workspace</p>
        <h1>
          Your practice,
          <br />
          <em>ready to grow.</em>
        </h1>
        <p>Your website, blog, bookings, and enquiries all live here.</p>
      </header>
      <article className="website-status-card">
        <div>
          <span
            className={`publication-status ${isPublished ? "live" : "draft"}`}
          >
            <i />
            {isPublished ? "Published" : "Draft"}
          </span>
          <h2>
            {isPublished
              ? "Your website is live."
              : "Your website is not published yet."}
          </h2>
          <p>
            {isPublished
              ? `localhost:3000/${publication.subdomain}`
              : "Choose an address and review your final website before publishing."}
          </p>
        </div>
        <div>
          <Link
            className="button button-primary"
            href="/dashboard/website?panel=publish"
          >
            {isPublished ? "Manage publishing →" : "Publish website →"}
          </Link>
          {isPublished ? (
            <Link
              className="text-link"
              href={publicSitePath(publication.subdomain)}
              target="_blank"
            >
              Open website ↗
            </Link>
          ) : null}
        </div>
      </article>
      <section
        className="dashboard-analytics"
        aria-labelledby="analytics-title"
      >
        <header>
          <div>
            <p>Anonymous totals</p>
            <h2 id="analytics-title">Website activity</h2>
          </div>
          <span>No visitor profiles are created.</span>
        </header>
        <div>
          {analyticsMetrics.map((metric, index) => (
            <article className={index === 0 ? "primary" : ""} key={metric.key}>
              <span>{metric.label}</span>
              <strong>
                {analytics
                  ? analytics[metric.key].toLocaleString("en-IN")
                  : "—"}
              </strong>
              <small>{metric.note}</small>
            </article>
          ))}
        </div>
      </section>
      <RetentionSettings />
    </section>
  );
}

const retentionOptions = [
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
  { days: 180, label: "6 months" },
] as const;

function RetentionSettings() {
  const savedRetention = useQuery(api.enquiries.getRetention);
  const saveRetention = useMutation(api.enquiries.saveRetention);
  const [saving, setSaving] = useState<number | null>(null);

  async function choose(retentionDays: 30 | 90 | 180) {
    if (saving !== null || savedRetention === retentionDays) return;
    setSaving(retentionDays);
    try {
      await saveRetention({ retentionDays });
    } finally {
      setSaving(null);
    }
  }

  return (
    <section className="dashboard-retention" aria-labelledby="retention-title">
      <div>
        <p>Enquiry privacy</p>
        <h2 id="retention-title">How long should enquiries stay?</h2>
        <span>
          New enquiries are automatically removed after the chosen period. Email
          delivery does not change this date.
        </span>
      </div>
      <div className="retention-options">
        {retentionOptions.map((option) => (
          <button
            type="button"
            key={option.days}
            className={savedRetention === option.days ? "selected" : ""}
            disabled={saving !== null || savedRetention === undefined}
            onClick={() => void choose(option.days)}
          >
            {saving === option.days ? "Saving…" : option.label}
          </button>
        ))}
      </div>
    </section>
  );
}
