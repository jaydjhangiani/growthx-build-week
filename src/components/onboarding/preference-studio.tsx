"use client";

import { useMutation } from "convex/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";

export type Tone = "warm" | "grounded" | "professional";
export type Palette = "monsoon" | "sage" | "clay" | "lavender";
export type VisualStyle = "organic" | "editorial" | "structured";
export type Preferences = {
  enabledSections: string[];
  tone: Tone;
  palette: Palette;
  visualStyle: VisualStyle;
};
export type Profile = {
  fullName?: string;
  city?: string;
  biography?: string;
  whoYouHelp?: string;
  specializations?: string[];
  therapeuticApproach?: string;
  profilePhotoUrl?: string | null;
  qualifications?: string[];
  yearsExperience?: number;
  languages?: string[];
  contactEmail?: string;
  services?: Array<{
    name: string;
    format: string;
    durationMinutes: number;
    feeInr: number;
  }>;
} | null;
type PreviewContent = {
  headline?: string;
  heroEyebrow?: string;
  heroSupport?: string;
  biography?: string;
  whoYouHelp?: string;
  therapeuticApproach?: string;
};
export type PreviewAppearance = {
  headingFont: "editorial" | "clean" | "humanist";
  headingSize: "small" | "medium" | "large";
  bodyFont: "editorial" | "clean" | "humanist";
  bodySize: "small" | "medium" | "large";
  testimonialSize: "small" | "medium" | "large";
  sectionSpacing: "compact" | "comfortable" | "spacious";
  navbarLayout: "classic" | "centered" | "minimal";
  navbarButtonStyle: "solid" | "outline" | "text" | "none";
  imageBorder: boolean;
  imageBorderColor: "ink" | "accent" | "white";
  sectionBackgrounds: Array<{
    sectionId: string;
    background: "white" | "soft" | "accent" | "dark";
  }>;
  sectionAlignments: Array<{
    sectionId: string;
    alignment: "left" | "center" | "right";
  }>;
  imageShape: "arch" | "circle" | "rounded" | "square";
  imageBackground: "none" | "soft" | "accent" | "ink";
  imagePadding: "compact" | "balanced" | "spacious";
};

const sections = [
  ["introduction", "Introduction"],
  ["about", "About me"],
  ["who-i-help", "Who I help"],
  ["approach", "Therapeutic approach"],
  ["qualifications", "Qualifications"],
  ["services", "Services"],
  ["testimonials", "Testimonials"],
  ["faqs", "FAQs"],
  ["blog", "Blog"],
  ["booking", "Calendly booking"],
  ["enquiry", "Enquiry form"],
  ["contact", "Contact information"],
] as const;

const tones: Array<{ id: Tone; name: string; sample: string }> = [
  {
    id: "warm",
    name: "Warm & reassuring",
    sample: "You don’t have to navigate this alone.",
  },
  {
    id: "grounded",
    name: "Grounded & conversational",
    sample: "We can make sense of what feels difficult.",
  },
  {
    id: "professional",
    name: "Clear & professional",
    sample: "Evidence-informed support, shaped around you.",
  },
];

const palettes: Array<{ id: Palette; name: string; colors: string[] }> = [
  {
    id: "monsoon",
    name: "Monsoon",
    colors: ["#173847", "#dfe9eb", "#d99a2b", "#fbfaf6"],
  },
  {
    id: "sage",
    name: "Sage",
    colors: ["#314c42", "#e3ebe2", "#c7a76a", "#fbfaf5"],
  },
  {
    id: "clay",
    name: "Clay",
    colors: ["#5b3e36", "#efe4dc", "#c97555", "#fcf8f3"],
  },
  {
    id: "lavender",
    name: "Lavender",
    colors: ["#403e59", "#e8e5ef", "#9a86b5", "#fbf9fc"],
  },
];

const styles: Array<{ id: VisualStyle; name: string; description: string }> = [
  {
    id: "organic",
    name: "Soft & organic",
    description: "Curved images, generous space, gentle rhythm",
  },
  {
    id: "editorial",
    name: "Airy editorial",
    description: "Expressive type, offset columns, journal feel",
  },
  {
    id: "structured",
    name: "Quietly structured",
    description: "Clear divisions, balanced grid, crisp details",
  },
];

export function PreferenceStudio({
  profile,
  initialPreferences,
}: {
  profile: Profile;
  initialPreferences: Preferences;
}) {
  const save = useMutation(api.preferences.save);
  const [preferences, setPreferences] = useState(initialPreferences);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">(
    "saved",
  );

  async function update(patch: Partial<Preferences>) {
    const next = { ...preferences, ...patch };
    setPreferences(next);
    setSaveState("saving");
    try {
      const result = await save(next);
      setPreferences((current) => ({
        ...current,
        enabledSections: result.enabledSections,
      }));
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }

  function toggleSection(id: string) {
    if (id === "blog") return;
    const enabledSections = preferences.enabledSections.includes(id)
      ? preferences.enabledSections.filter((item) => item !== id)
      : [...preferences.enabledSections, id];
    void update({ enabledSections });
  }

  return (
    <main className="preference-studio">
      <header className="studio-header studio-header-embedded">
        <p>Website preferences</p>
        <div>
          <span className={`studio-save ${saveState}`}>
            <i />
            {saveState === "saving"
              ? "Saving…"
              : saveState === "error"
                ? "Couldn’t save"
                : "Preferences saved"}
          </span>
          <Link href="/onboarding">← Profile</Link>
        </div>
      </header>
      <section className="studio-layout">
        <div className="studio-controls">
          <header>
            <p>Website preferences</p>
            <h1>
              Shape how your
              <br />
              practice <em>feels.</em>
            </h1>
            <span>
              Choose the sections, tone, and visual direction for your website.
            </span>
          </header>

          <fieldset>
            <legend>
              <span>01</span>
              <div>
                <b>Choose your sections</b>
                <small>Show only what patients need to see.</small>
              </div>
            </legend>
            <div className="section-options">
              {sections.map(([id, label]) => {
                const checked = preferences.enabledSections.includes(id);
                return (
                  <label key={id} className={checked ? "selected" : ""}>
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={id === "blog"}
                      onChange={() => toggleSection(id)}
                    />
                    <span aria-hidden="true">{checked ? "✓" : ""}</span>
                    <b>{label}</b>
                    {id === "blog" ? <small>Required in V1</small> : null}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend>
              <span>02</span>
              <div>
                <b>Choose your tone</b>
                <small>How should the website sound?</small>
              </div>
            </legend>
            <div className="tone-options">
              {tones.map((tone) => (
                <label
                  key={tone.id}
                  className={preferences.tone === tone.id ? "selected" : ""}
                >
                  <input
                    type="radio"
                    name="tone"
                    value={tone.id}
                    checked={preferences.tone === tone.id}
                    onChange={() => void update({ tone: tone.id })}
                  />
                  <span>
                    <b>{tone.name}</b>
                    <small>“{tone.sample}”</small>
                  </span>
                  <i aria-hidden="true" />
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>
              <span>03</span>
              <div>
                <b>Choose your colours</b>
                <small>A starting palette for your site.</small>
              </div>
            </legend>
            <div className="palette-options">
              {palettes.map((palette) => (
                <button
                  type="button"
                  key={palette.id}
                  className={
                    preferences.palette === palette.id ? "selected" : ""
                  }
                  onClick={() => void update({ palette: palette.id })}
                >
                  <span>
                    {palette.colors.map((color) => (
                      <i key={color} style={{ background: color }} />
                    ))}
                  </span>
                  <b>{palette.name}</b>
                  {preferences.palette === palette.id ? (
                    <em>Selected</em>
                  ) : null}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>
              <span>04</span>
              <div>
                <b>Choose a visual style</b>
                <small>This controls structure, not your content.</small>
              </div>
            </legend>
            <div className="style-options">
              {styles.map((style) => (
                <label
                  key={style.id}
                  className={
                    preferences.visualStyle === style.id ? "selected" : ""
                  }
                >
                  <input
                    type="radio"
                    name="style"
                    value={style.id}
                    checked={preferences.visualStyle === style.id}
                    onChange={() => void update({ visualStyle: style.id })}
                  />
                  <span
                    className={`style-sketch ${style.id}`}
                    aria-hidden="true"
                  >
                    <i />
                    <i />
                    <i />
                  </span>
                  <span>
                    <b>{style.name}</b>
                    <small>{style.description}</small>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <aside className="live-preview-panel">
          <div className="preview-label">
            <span>Live preview</span>
            <small>Updates as you choose</small>
          </div>
          <WebsitePreview profile={profile} preferences={preferences} />
        </aside>
      </section>
    </main>
  );
}

export function WebsitePreview({
  profile,
  preferences,
  content,
  appearance = {
    headingFont: "editorial",
    headingSize: "medium",
    bodyFont: "clean",
    bodySize: "medium",
    testimonialSize: "medium",
    sectionSpacing: "comfortable",
    navbarLayout: "classic",
    navbarButtonStyle: "solid",
    imageBorder: false,
    imageBorderColor: "ink",
    sectionBackgrounds: [],
    sectionAlignments: [],
    imageShape: "arch",
    imageBackground: "soft",
    imagePadding: "balanced",
  },
  sectionOrder = sections.map(([id]) => id),
  interactive = false,
  bookingUrl,
  blogContent,
  bookingContent,
  enquiryContent,
  testimonialContent,
  onBookingClick,
}: {
  profile: Profile;
  preferences: Preferences;
  content?: PreviewContent;
  appearance?: PreviewAppearance;
  sectionOrder?: readonly string[];
  interactive?: boolean;
  bookingUrl?: string;
  blogContent?: React.ReactNode;
  bookingContent?: React.ReactNode;
  enquiryContent?: React.ReactNode;
  testimonialContent?: React.ReactNode;
  onBookingClick?: () => void;
}) {
  const enabled = new Set(preferences.enabledSections);
  const name = profile?.fullName || "Your name";
  const specialization = profile?.specializations?.[0] || "what matters to you";
  const headline =
    content?.headline ||
    (preferences.tone === "warm"
      ? "A gentle place to feel more like yourself."
      : preferences.tone === "grounded"
        ? "Space to understand what’s weighing on you."
        : "Thoughtful support for lasting emotional wellbeing.");
  const services = profile?.services?.length
    ? profile.services
    : [
        {
          name: "Individual therapy",
          durationMinutes: 50,
          feeInr: 2000,
          format: "online",
        },
      ];
  const sectionBackgrounds = new Map(
    appearance.sectionBackgrounds.map((item) => [
      item.sectionId,
      item.background,
    ]),
  );
  const sectionAlignments = new Map(
    (appearance.sectionAlignments ?? []).map((item) => [
      item.sectionId,
      item.alignment,
    ]),
  );
  const sectionClass = (id: string, base: string) => {
    const fallback = ["about", "approach", "faqs", "blog", "enquiry", "testimonials"].includes(
      id,
    )
      ? "soft"
      : "white";
    return `${base} section-background-${sectionBackgrounds.get(id) ?? fallback} section-align-${sectionAlignments.get(id) ?? "left"}`;
  };

  function renderSection(id: string) {
    if (!enabled.has(id)) return null;
    if (id === "introduction")
      return (
        <section key={id} id={id} className={sectionClass(id, "preview-hero")}>
          <div>
            <small>
              {content?.heroEyebrow ||
                `Counselling psychologist · ${profile?.city || "Your city"}`}
            </small>
            <h2>{headline}</h2>
            <p>
              {content?.heroSupport ||
                `Support for people navigating ${specialization.toLowerCase()} and life’s quieter pressures.`}
            </p>
            {interactive ? (
              <a
                className="preview-action"
                href={bookingUrl || "#booking"}
                target={bookingUrl ? "_blank" : undefined}
                rel={bookingUrl ? "noreferrer" : undefined}
                onClick={onBookingClick}
              >
                Book a discovery call →
              </a>
            ) : (
              <button type="button">Book a discovery call →</button>
            )}
          </div>
          <div className="preview-photo">
            <div
              className={`preview-photo-frame ${profile?.profilePhotoUrl ? "" : "placeholder"}`}
            >
              {profile?.profilePhotoUrl ? (
                <Image
                  src={profile.profilePhotoUrl}
                  alt={`${name} profile preview`}
                  fill
                  sizes="280px"
                  unoptimized
                />
              ) : (
                <span>
                  {name
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")}
                </span>
              )}
            </div>
          </div>
        </section>
      );
    if (id === "about")
      return (
        <section key={id} id={id} className={sectionClass(id, "preview-about")}>
          <h3 className="preview-section-title">About me</h3>
          <p className="preview-body-copy">
            {content?.biography ||
              profile?.biography ||
              "Your biography will introduce your approach and the kind of space you offer."}
          </p>
        </section>
      );
    if (id === "who-i-help")
      return (
        <section key={id} id={id} className={sectionClass(id, "preview-focus")}>
          <h3 className="preview-section-title">Who I help</h3>
          <p>
            {content?.whoYouHelp ||
              profile?.whoYouHelp ||
              "The people and situations you support will appear here."}
          </p>
        </section>
      );
    if (id === "approach")
      return (
        <section key={id} id={id} className={sectionClass(id, "preview-about")}>
          <h3 className="preview-section-title">Therapeutic approach</h3>
          <p className="preview-body-copy">
            {content?.therapeuticApproach ||
              profile?.therapeuticApproach ||
              "Your therapeutic approach will appear here."}
          </p>
        </section>
      );
    if (id === "qualifications")
      return (
        <section key={id} id={id} className={sectionClass(id, "preview-focus")}>
          <h3 className="preview-section-title">Qualifications</h3>
          <p>
            {profile?.qualifications?.join(" · ") ||
              "Your qualifications will appear here."}
          </p>
        </section>
      );
    if (id === "services")
      return (
        <section
          key={id}
          id={id}
          className={sectionClass(id, "preview-services")}
        >
          <h3 className="preview-section-title">Ways to work together</h3>
          <div>
            {services.slice(0, 2).map((service) => (
              <article key={service.name}>
                <h4>{service.name}</h4>
                <p>
                  {service.durationMinutes} minutes · {service.format} · ₹
                  {service.feeInr.toLocaleString("en-IN")}
                </p>
              </article>
            ))}
          </div>
        </section>
      );
    if (id === "testimonials") {
      if (interactive)
        return testimonialContent ? (
          <section key={id} id={id} className={sectionClass(id, "public-testimonials-section")}>
            {testimonialContent}
          </section>
        ) : null;
      return (
        <section
          key={id}
          id={id}
          className={sectionClass(id, "preview-testimonials")}
        >
          <small>Kind words</small>
          <blockquote>
            “A testimonial shared with permission will appear here.”
          </blockquote>
          <p>— Client name or context</p>
        </section>
      );
    }
    if (id === "faqs")
      return (
        <section key={id} id={id} className={sectionClass(id, "preview-about")}>
          <h3 className="preview-section-title">Frequently asked questions</h3>
          <p className="preview-body-copy">
            Your practical information will help visitors know what to expect.
          </p>
        </section>
      );
    if (id === "blog")
      if (interactive && blogContent)
        return (
          <section
            key={id}
            id={id}
            className={sectionClass(id, "public-journal-section")}
          >
            {blogContent}
          </section>
        );
    if (id === "blog")
      return (
        <section key={id} id={id} className={sectionClass(id, "preview-blog")}>
          <h3 className="preview-section-title">From the journal</h3>
          <div>
            <i />
            <i />
            <i />
          </div>
        </section>
      );
    if (id === "booking")
      if (interactive && bookingContent)
        return (
          <section
            key={id}
            id={id}
            className={sectionClass(id, "public-booking-section")}
          >
            {bookingContent}
          </section>
        );
    if (id === "booking")
      return (
        <section key={id} id={id} className={sectionClass(id, "preview-focus")}>
          <h3 className="preview-section-title">Book a discovery call</h3>
          <p>Choose a time that works for you.</p>
          {interactive ? (
            <a
              className="preview-action"
              href={bookingUrl || "#booking"}
              target={bookingUrl ? "_blank" : undefined}
              rel={bookingUrl ? "noreferrer" : undefined}
              onClick={onBookingClick}
            >
              View availability →
            </a>
          ) : (
            <button type="button">View availability →</button>
          )}
        </section>
      );
    if (id === "enquiry")
      if (interactive && enquiryContent)
        return (
          <section
            key={id}
            id="enquiry-form"
            className={sectionClass(id, "public-enquiry-shell")}
          >
            {enquiryContent}
          </section>
        );
    if (id === "enquiry")
      return (
        <section key={id} id={id} className={sectionClass(id, "preview-about")}>
          <h3 className="preview-section-title">Send an enquiry</h3>
          <p className="preview-body-copy">
            Share a few details and I’ll get back to you.
          </p>
          {interactive ? (
            <a className="preview-action" href="#enquiry-form">
              Start enquiry →
            </a>
          ) : (
            <button type="button">Start enquiry →</button>
          )}
        </section>
      );
    if (id === "contact")
      return (
        <section key={id} id={id} className={sectionClass(id, "preview-focus")}>
          <h3 className="preview-section-title">Contact</h3>
          <p>
            {profile?.contactEmail || "Your contact details will appear here."}
          </p>
        </section>
      );
    return null;
  }

  return (
    <div
      className={`website-preview palette-${preferences.palette} style-${preferences.visualStyle} heading-font-${appearance.headingFont} heading-${appearance.headingSize} body-font-${appearance.bodyFont} body-${appearance.bodySize} testimonial-${appearance.testimonialSize} spacing-${appearance.sectionSpacing} navbar-${appearance.navbarLayout} navbar-button-${appearance.navbarButtonStyle} image-shape-${appearance.imageShape} image-background-${appearance.imageBackground} image-padding-${appearance.imagePadding} image-border-color-${appearance.imageBorderColor} ${appearance.imageBorder ? "image-border" : ""}`}
    >
      <header>
        <b>{name}</b>
        <nav>
          {interactive ? (
            <>
              <a href="#about">About</a>
              <a href="#services">Services</a>
              <a href="#blog">Journal</a>
              {appearance.navbarLayout === "centered" ? (
                <a href={bookingUrl || "#booking"} onClick={onBookingClick}>
                  Book a call
                </a>
              ) : null}
            </>
          ) : (
            <>
              <span>About</span>
              <span>Services</span>
              <span>Journal</span>
              {appearance.navbarLayout === "centered" ? (
                <span>Book a call</span>
              ) : null}
            </>
          )}
        </nav>
        {appearance.navbarLayout === "minimal" ? (
          <details className="preview-menu">
            <summary>Menu</summary>
            <div>
              <a href="#about">About</a>
              <a href="#services">Services</a>
              <a href="#blog">Journal</a>
            </div>
          </details>
        ) : null}
        {appearance.navbarLayout !== "centered" &&
        appearance.navbarButtonStyle !== "none" &&
        interactive ? (
          <a
            className="preview-action"
            href={bookingUrl || "#booking"}
            target={bookingUrl ? "_blank" : undefined}
            rel={bookingUrl ? "noreferrer" : undefined}
            onClick={onBookingClick}
          >
            Book a call
          </a>
        ) : appearance.navbarLayout !== "centered" &&
          appearance.navbarButtonStyle !== "none" ? (
          <button type="button">Book a call</button>
        ) : null}
      </header>
      {sectionOrder.map(renderSection)}
      <footer>
        {enabled.has("booking") ? (
          <b>Ready for a first conversation?</b>
        ) : (
          <b>{name}</b>
        )}
        <span>{enabled.has("contact") ? "Contact" : ""}</span>
      </footer>
    </div>
  );
}
