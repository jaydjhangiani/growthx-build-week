"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const metrics = [
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

export function ActivitySummary() {
  const analytics = useQuery(api.analytics.getDashboard);

  return (
    <section className="dashboard-analytics" aria-labelledby="analytics-title">
      <header>
        <div>
          <p>Anonymous totals</p>
          <h2 id="analytics-title">Website activity</h2>
        </div>
        <span>No visitor profiles are created.</span>
      </header>
      <div>
        {metrics.map((metric, index) => (
          <article className={index === 0 ? "primary" : ""} key={metric.key}>
            <span>{metric.label}</span>
            <strong>
              {analytics ? analytics[metric.key].toLocaleString("en-IN") : "—"}
            </strong>
            <small>{metric.note}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
