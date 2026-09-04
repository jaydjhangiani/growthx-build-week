"use client";

import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import {
  WebsitePreview,
  type Palette,
  type Tone,
  type VisualStyle,
} from "@/components/onboarding/preference-studio";
import {
  normalizeSubdomain,
  publicSitePath,
  validateSubdomain,
} from "@/lib/subdomain";

export function PublishStudio() {
  const status = useQuery(api.publishing.getStatus);
  const draft = useQuery(api.websiteEditor.get);
  if (status === undefined || draft === undefined)
    return <div className="publish-loading">Preparing your final website…</div>;
  return (
    <PublishWorkspace
      key={`${status.subdomain}-${status.status}`}
      initialStatus={status}
      draft={draft}
    />
  );
}

function PublishWorkspace({
  initialStatus,
  draft,
}: {
  initialStatus: {
    status: "draft" | "published";
    subdomain: string;
    publishedAt?: number;
  };
  draft: NonNullable<ReturnType<typeof useQuery<typeof api.websiteEditor.get>>>;
}) {
  const publish = useMutation(api.publishing.publish);
  const [subdomain, setSubdomain] = useState(initialStatus.subdomain);
  const [publishState, setPublishState] = useState<
    "idle" | "publishing" | "published" | "error"
  >(initialStatus.status === "published" ? "published" : "idle");
  const [message, setMessage] = useState("");
  const validationError = validateSubdomain(subdomain);
  const availability = useQuery(
    api.publishing.checkAvailability,
    validationError ? "skip" : { subdomain },
  );
  const canPublish =
    !validationError &&
    availability?.available === true &&
    publishState !== "publishing";

  function changeAddress(value: string) {
    setSubdomain(normalizeSubdomain(value));
    setPublishState("idle");
    setMessage("");
  }

  async function handlePublish() {
    if (!canPublish) return;
    setPublishState("publishing");
    setMessage("");
    try {
      const result = await publish({ subdomain });
      setSubdomain(result.subdomain);
      setPublishState("published");
      setMessage("Your website is live.");
    } catch (error) {
      setPublishState("error");
      setMessage(
        error instanceof Error
          ? error.message.replace(/^.*ConvexError:\s*/, "")
          : "We couldn’t publish your website. Try again.",
      );
    }
  }

  const feedback = validationError ?? availability?.error;
  return (
    <main className="publish-studio">
      <header>
        <div>
          <p>Publish website</p>
          <h1>
            Give your practice
            <br />
            <em>one place to live.</em>
          </h1>
          <span>
            Choose your address, review the final website, and publish when it
            feels ready.
          </span>
        </div>
        <div
          className={`publication-status ${publishState === "published" ? "live" : "draft"}`}
        >
          <i />
          {publishState === "published" ? "Published" : "Draft"}
        </div>
      </header>
      <div className="publish-layout">
        <aside className="publish-controls">
          <section>
            <span className="publish-step">01</span>
            <div>
              <h2>Choose your address</h2>
              <p>Your website will open directly after localhost.</p>
            </div>
          </section>
          <label className="subdomain-field">
            <span>Website address</span>
            <div>
              <b>localhost:3000/</b>
              <input
                value={subdomain}
                onChange={(event) => changeAddress(event.target.value)}
                aria-invalid={Boolean(feedback)}
                aria-describedby="subdomain-feedback"
              />
            </div>
          </label>
          <div
            id="subdomain-feedback"
            className={`subdomain-feedback ${feedback ? "error" : availability?.available ? "available" : "checking"}`}
          >
            {feedback
              ? feedback
              : availability?.available
                ? "This address is available ✓"
                : "Checking availability…"}
          </div>
          {availability?.alternatives.length ? (
            <div className="subdomain-alternatives">
              <span>Available alternatives</span>
              {availability.alternatives.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => changeAddress(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          ) : null}
          <section className="publish-review-note">
            <span className="publish-step">02</span>
            <div>
              <h2>Review your website</h2>
              <p>
                The preview shows the saved copy, colours, typography, spacing,
                and section order that will be published.
              </p>
            </div>
          </section>
          <button
            className="publish-action"
            type="button"
            disabled={!canPublish}
            onClick={() => void handlePublish()}
          >
            {publishState === "publishing"
              ? "Publishing…"
              : publishState === "published"
                ? "Publish updates →"
                : "Publish website →"}
          </button>
          {message ? (
            <p className={`publish-message ${publishState}`}>{message}</p>
          ) : null}
          {publishState === "published" ? (
            <Link
              className="view-published-site"
              href={publicSitePath(subdomain)}
              target="_blank"
            >
              Open published website ↗
            </Link>
          ) : null}
          <small className="local-address-note">
            Public path: localhost:3000/{subdomain}
          </small>
        </aside>
        <section className="publish-preview">
          <div className="preview-label">
            <span>Final preview</span>
            <Link href="/dashboard/website">Edit website →</Link>
          </div>
          <WebsitePreview
            profile={{
              ...draft.profile,
              biography: draft.biography,
              whoYouHelp: draft.whoYouHelp,
              therapeuticApproach: draft.therapeuticApproach,
            }}
            preferences={{
              enabledSections: draft.enabledSections,
              palette: draft.palette as Palette,
              tone: draft.tone as Tone,
              visualStyle: draft.visualStyle as VisualStyle,
            }}
            appearance={{
              headingFont: draft.headingFont,
              headingSize: draft.headingSize,
              bodyFont: draft.bodyFont,
              bodySize: draft.bodySize,
              testimonialSize: draft.testimonialSize,
              sectionSpacing: draft.sectionSpacing,
              navbarLayout: draft.navbarLayout,
              navbarButtonStyle: draft.navbarButtonStyle,
              imageBorder: draft.imageBorder,
              imageBorderColor: draft.imageBorderColor,
              sectionBackgrounds: draft.sectionBackgrounds,
              sectionAlignments: draft.sectionAlignments ?? [],
              imageShape: draft.imageShape,
              imageBackground: draft.imageBackground,
              imagePadding: draft.imagePadding,
            }}
            content={{
              headline: draft.headline,
              biography: draft.biography,
              whoYouHelp: draft.whoYouHelp,
              therapeuticApproach: draft.therapeuticApproach,
            }}
            sectionOrder={draft.sectionOrder}
          />
        </section>
      </div>
    </main>
  );
}
