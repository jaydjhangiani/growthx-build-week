"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { publicSitePath } from "@/lib/subdomain";

const setupSteps = [
  {
    key: "profile",
    label: "Practice profile",
    note: "Your background, approach and services",
    href: "/onboarding",
    essential: true,
  },
  {
    key: "blog",
    label: "Blog",
    note: "Publish in Releaf or connect Substack",
    href: "/dashboard/blog",
    essential: true,
  },
  {
    key: "testimonials",
    label: "Testimonials",
    note: "Add written or image trust signals",
    href: "/dashboard/testimonials",
    essential: false,
  },
  {
    key: "calendly",
    label: "Calendly",
    note: "Offer discovery calls when you are ready",
    href: "/dashboard/calendly",
    essential: false,
  },
  {
    key: "enquiry",
    label: "Enquiry form",
    note: "Review and save the questions visitors see",
    href: "/dashboard/enquiry-form",
    essential: true,
  },
  {
    key: "website",
    label: "Website builder",
    note: "Review your content and design",
    href: "/dashboard/website",
    essential: true,
  },
  {
    key: "publish",
    label: "Publish",
    note: "Choose your address and make the site public",
    href: "/dashboard/website?panel=publish",
    essential: true,
  },
] as const;

export function DashboardOverview() {
  const publication = useQuery(api.publishing.getStatus);
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
      <LaunchChecklist />
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
      <AvailabilitySetting />
      <RetentionSettings />
    </section>
  );
}

function LaunchChecklist() {
  const setup = useQuery(api.setup.getChecklist);
  const essentialSteps = setupSteps.filter((step) => step.essential);
  const completedEssentials = setup
    ? essentialSteps.filter((step) => setup[step.key]).length
    : 0;
  const completion = Math.round(
    (completedEssentials / essentialSteps.length) * 100,
  );

  return (
    <section className="launch-checklist" aria-labelledby="launch-checklist-title">
      <header>
        <div>
          <p>Setup guide</p>
          <h2 id="launch-checklist-title">
            {completion === 100 ? "Your essentials are ready" : "Prepare your website"}
          </h2>
        </div>
        <strong>{completedEssentials} of {essentialSteps.length}</strong>
      </header>
      <div className="launch-progress" aria-label={`${completion}% complete`}>
        <span style={{ width: `${completion}%` }} />
      </div>
      <div className="launch-steps">
        {setupSteps.map((step, index) => {
          const complete = Boolean(setup?.[step.key]);
          return (
            <Link href={step.href} key={step.key}>
              <span className={complete ? "complete" : ""}>
                {complete ? "✓" : String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <b>{step.label}</b>
                <small>{step.note}</small>
              </div>
              <i>{complete ? "Ready" : step.essential ? "Set up →" : "Optional →"}</i>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function AvailabilitySetting() {
  const acceptingNewClients = useQuery(api.onboarding.getAvailability);
  const setAvailability = useMutation(api.onboarding.setAvailability);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function toggle(nextValue: boolean) {
    if (saving || acceptingNewClients === undefined) return;
    setSaving(true);
    setError("");
    try {
      await setAvailability({ acceptingNewClients: nextValue });
    } catch {
      setError("Your availability could not be changed. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="dashboard-availability" aria-labelledby="availability-title">
      <div>
        <p>Website availability</p>
        <h2 id="availability-title">Accepting new clients</h2>
        <span>
          When this is off, the availability message is hidden from your
          website. Your enquiry form stays available.
        </span>
        {error ? <small role="alert">{error}</small> : null}
      </div>
      <label className="dashboard-switch">
        <input
          type="checkbox"
          checked={acceptingNewClients ?? true}
          disabled={saving || acceptingNewClients === undefined}
          onChange={(event) => void toggle(event.target.checked)}
        />
        <span aria-hidden="true" />
        <b>{acceptingNewClients === false ? "Not accepting" : "Accepting"}</b>
      </label>
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
