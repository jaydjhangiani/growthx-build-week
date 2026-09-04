"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
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

type Panel = "content" | "faqs" | "design" | "sections" | "publish";
type EditorDraft = NonNullable<
  ReturnType<typeof useQuery<typeof api.websiteEditor.get>>
>;
const panels: Array<{ id: Panel; label: string }> = [
  { id: "content", label: "Content" },
  { id: "faqs", label: "FAQs" },
  { id: "design", label: "Design" },
  { id: "sections", label: "Sections" },
  { id: "publish", label: "Publish" },
];
const sections = [
  ["introduction", "Introduction"],
  ["about", "About me"],
  ["who-i-help", "Who I help"],
  ["approach", "Therapeutic approach"],
  ["qualifications", "Training & practice"],
  ["services", "Services"],
  ["testimonials", "Testimonials"],
  ["faqs", "FAQs"],
  ["blog", "Blog"],
  ["booking", "Discovery call"],
  ["enquiry", "Enquiry form"],
] as const;
const palettes = [
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
] as const;
const visualStyles = [
  { id: "organic", label: "Soft & organic" },
  { id: "editorial", label: "Airy editorial" },
  { id: "structured", label: "Quietly structured" },
] as const;
const fonts = [
  { id: "editorial", label: "Editorial serif" },
  { id: "clean", label: "Clean sans" },
  { id: "humanist", label: "Soft humanist" },
] as const;
const sizes = [
  { id: "small", label: "Small" },
  { id: "medium", label: "Medium" },
  { id: "large", label: "Large" },
] as const;
const spacings = [
  { id: "compact", label: "Compact" },
  { id: "comfortable", label: "Comfortable" },
  { id: "spacious", label: "Spacious" },
] as const;
const navbarLayouts = [
  { id: "classic", label: "Classic" },
  { id: "centered", label: "Centered" },
  { id: "minimal", label: "Minimal" },
] as const;
const navbarButtonStyles = [
  { id: "solid", label: "Solid" },
  { id: "outline", label: "Outline" },
  { id: "text", label: "Text only" },
  { id: "none", label: "None" },
] as const;
const imageShapes = [
  { id: "arch", label: "Arch" },
  { id: "circle", label: "Circle" },
  { id: "rounded", label: "Rounded" },
  { id: "square", label: "Square" },
] as const;
const imageBackgrounds = [
  { id: "none", label: "None" },
  { id: "soft", label: "Soft" },
  { id: "accent", label: "Accent" },
  { id: "ink", label: "Dark" },
] as const;
const imagePaddings = [
  { id: "compact", label: "Compact" },
  { id: "balanced", label: "Balanced" },
  { id: "spacious", label: "Spacious" },
] as const;

function editorSaveArgs(draft: EditorDraft) {
  return {
    headline: draft.headline,
    heroEyebrow: draft.heroEyebrow,
    heroSupport: draft.heroSupport,
    exploreHeading: draft.exploreHeading,
    biography: draft.biography,
    whoYouHelp: draft.whoYouHelp,
    therapeuticApproach: draft.therapeuticApproach,
    faqs: draft.faqs,
    enabledSections: draft.enabledSections,
    sectionOrder: draft.sectionOrder,
    palette: draft.palette,
    tone: draft.tone,
    visualStyle: draft.visualStyle,
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
  };
}

export function WebsiteEditor({
  defaultPanel = "content",
}: {
  defaultPanel?: Panel;
}) {
  const initial = useQuery(api.websiteEditor.get);
  const searchParams = useSearchParams();
  const requestedPanel = searchParams.get("panel");
  const initialPanel = panels.some((item) => item.id === requestedPanel)
    ? (requestedPanel as Panel)
    : defaultPanel;
  if (initial === undefined)
    return (
      <div className="website-editor-loading">Opening your website draft…</div>
    );
  return (
    <WebsiteEditorWorkspace
      key={initial.profile?.profilePhotoUrl ?? "draft"}
      initial={initial}
      initialPanel={initialPanel}
    />
  );
}

function WebsiteEditorWorkspace({
  initial,
  initialPanel,
}: {
  initial: EditorDraft;
  initialPanel: Panel;
}) {
  const save = useMutation(api.websiteEditor.save);
  const generateUploadUrl = useMutation(api.onboarding.generatePhotoUploadUrl);
  const savePhoto = useMutation(api.onboarding.saveProfilePhoto);
  const photoInput = useRef<HTMLInputElement>(null);
  const editVersion = useRef(0);
  const [draft, setDraft] = useState(initial);
  const [panel, setPanel] = useState<Panel>(initialPanel);
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [state, setState] = useState<"saved" | "unsaved" | "saving" | "error">(
    "saved",
  );

  function selectPanel(next: Panel) {
    setPanel(next);
    window.history.replaceState(
      null,
      "",
      next === "faqs" ? "/dashboard/faqs" : `/dashboard/website?panel=${next}`,
    );
  }
  function update(patch: Partial<EditorDraft>) {
    editVersion.current += 1;
    setDraft((current) => ({ ...current, ...patch }));
    setState("unsaved");
  }
  function addFaq() {
    update({ faqs: [...draft.faqs, { question: "", answer: "" }] });
  }
  function updateFaq(
    index: number,
    patch: Partial<EditorDraft["faqs"][number]>,
  ) {
    update({
      faqs: draft.faqs.map((faq, faqIndex) =>
        faqIndex === index ? { ...faq, ...patch } : faq,
      ),
    });
  }
  function removeFaq(index: number) {
    update({ faqs: draft.faqs.filter((_, faqIndex) => faqIndex !== index) });
  }

  useEffect(() => {
    if (state !== "unsaved") return;
    const version = editVersion.current;
    const timeout = window.setTimeout(async () => {
      setState("saving");
      try {
        await save(editorSaveArgs(draft));
        if (editVersion.current === version) setState("saved");
      } catch {
        if (editVersion.current === version) setState("error");
      }
    }, 600);
    return () => window.clearTimeout(timeout);
  }, [draft, save, state]);
  function move(id: string, amount: -1 | 1) {
    const order = [...draft.sectionOrder];
    const from = order.indexOf(id);
    const to = from + amount;
    if (from < 0 || to < 0 || to >= order.length) return;
    [order[from], order[to]] = [order[to], order[from]];
    update({ sectionOrder: order });
  }

  async function persist() {
    if (state === "saving") return false;
    setState("saving");
    try {
      await save(editorSaveArgs(draft));
      setState("saved");
      return true;
    } catch {
      setState("error");
      return false;
    }
  }

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024)
      return;
    setState("saving");
    try {
      const url = await generateUploadUrl({});
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = (await response.json()) as {
        storageId: Id<"_storage">;
      };
      await savePhoto({ storageId });
      setDraft((current) => ({
        ...current,
        profile: current.profile
          ? { ...current.profile, profilePhotoUrl: URL.createObjectURL(file) }
          : current.profile,
      }));
      setState("saved");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="website-editor unified-editor">
      <header>
        <div>
          <p>Website editor</p>
          <h1>
            Build it once.
            <br />
            <em>Make it yours.</em>
          </h1>
        </div>
        <div>
          <span>
            {state === "saving"
              ? "Saving…"
              : state === "saved"
                ? "All changes saved"
                : state === "error"
                  ? "Couldn’t save"
                  : "Unsaved changes"}
          </span>
          <button
            className="editor-save-button"
            type="button"
            onClick={() => void persist()}
            disabled={state === "saving"}
          >
            Save website
          </button>
          <button
            className="editor-publish-button"
            type="button"
            onClick={() => selectPanel("publish")}
          >
            Publish website →
          </button>
        </div>
      </header>
      <nav className="editor-panel-tabs" aria-label="Website editing areas">
        {panels.map((item) => (
          <button
            type="button"
            key={item.id}
            className={panel === item.id ? "active" : ""}
            aria-current={panel === item.id ? "page" : undefined}
            onClick={() => selectPanel(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div className="website-editor-grid">
        <aside className="website-controls unified-controls">
          {panel === "content" ? (
            <div className="editor-panel">
              <PanelHeader
                number="01"
                title="Content"
                description="Edit the words and portrait visitors see."
              />
              <label>
                Headline
                <textarea
                  rows={3}
                  value={draft.headline}
                  onChange={(event) => update({ headline: event.target.value })}
                />
              </label>
              <label>
                Professional and location line
                <input
                  value={draft.heroEyebrow ?? ""}
                  onChange={(event) =>
                    update({ heroEyebrow: event.target.value })
                  }
                  placeholder="Counselling psychologist · Mumbai"
                />
              </label>
              <label>
                Supporting introduction
                <textarea
                  rows={3}
                  value={draft.heroSupport ?? ""}
                  onChange={(event) =>
                    update({ heroSupport: event.target.value })
                  }
                  placeholder="Support for people navigating what matters to you and life’s quieter pressures."
                />
              </label>
              <label>
                Biography
                <textarea
                  rows={6}
                  value={draft.biography}
                  onChange={(event) =>
                    update({ biography: event.target.value })
                  }
                />
              </label>
              <label>
                What we can explore — heading
                <input
                  value={draft.exploreHeading ?? ""}
                  onChange={(event) =>
                    update({ exploreHeading: event.target.value })
                  }
                  placeholder="You don’t have to carry it alone."
                />
              </label>
              <label>
                What we can explore — copy
                <textarea
                  rows={4}
                  value={draft.whoYouHelp}
                  onChange={(event) =>
                    update({ whoYouHelp: event.target.value })
                  }
                />
              </label>
              <label>
                Therapeutic approach
                <textarea
                  rows={5}
                  value={draft.therapeuticApproach}
                  onChange={(event) =>
                    update({ therapeuticApproach: event.target.value })
                  }
                />
              </label>
              <div className="editor-photo-row">
                <div>
                  <b>Profile photo</b>
                  <small>JPG or PNG, up to 5 MB</small>
                </div>
                <button
                  className="editor-photo"
                  type="button"
                  onClick={() => photoInput.current?.click()}
                >
                  {draft.profile?.profilePhotoUrl ? (
                    <Image
                      src={draft.profile.profilePhotoUrl}
                      alt="Profile"
                      fill
                      sizes="80px"
                      unoptimized
                    />
                  ) : (
                    <span>Add photo</span>
                  )}
                </button>
                <input
                  ref={photoInput}
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(event) => void upload(event)}
                />
              </div>
              <Link className="editor-profile-link" href="/onboarding">
                Edit professional details →
              </Link>
            </div>
          ) : null}
          {panel === "faqs" ? (
            <div className="editor-panel">
              <PanelHeader
                number="02"
                title="FAQs"
                description="Answer the questions visitors often ask before reaching out."
              />
              <div className="editor-faq-list">
                {draft.faqs.map((faq, index) => (
                  <section className="editor-faq-card" key={index}>
                    <div>
                      <b>Question {String(index + 1).padStart(2, "0")}</b>
                      <button type="button" onClick={() => removeFaq(index)}>
                        Remove
                      </button>
                    </div>
                    <label>
                      Question
                      <input
                        value={faq.question}
                        onChange={(event) =>
                          updateFaq(index, { question: event.target.value })
                        }
                        placeholder="How often will we meet?"
                      />
                    </label>
                    <label>
                      Answer
                      <textarea
                        rows={4}
                        value={faq.answer}
                        onChange={(event) =>
                          updateFaq(index, { answer: event.target.value })
                        }
                        placeholder="Share a short, clear answer."
                      />
                    </label>
                  </section>
                ))}
                {draft.faqs.length === 0 ? (
                  <p className="editor-faq-empty">
                    No questions yet. Add one, or hide the FAQ section under Sections.
                  </p>
                ) : null}
                <button className="editor-add-faq" type="button" onClick={addFaq}>
                  + Add FAQ
                </button>
              </div>
            </div>
          ) : null}
          {panel === "design" ? (
            <div className="editor-panel">
              <PanelHeader
                number="03"
                title="Design"
                description="Choose one consistent visual direction."
              />
              <ControlGroup label="Navbar layout">
                <div className="editor-segmented">
                  {navbarLayouts.map((item) => (
                    <button
                      type="button"
                      className={
                        draft.navbarLayout === item.id ? "selected" : ""
                      }
                      key={item.id}
                      onClick={() => update({ navbarLayout: item.id })}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </ControlGroup>
              <ControlGroup label="Navbar button">
                <div className="editor-segmented editor-segmented-four">
                  {navbarButtonStyles.map((item) => (
                    <button
                      type="button"
                      className={
                        draft.navbarButtonStyle === item.id ? "selected" : ""
                      }
                      key={item.id}
                      onClick={() => update({ navbarButtonStyle: item.id })}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </ControlGroup>
              <ControlGroup label="Profile image shape">
                <div className="editor-segmented editor-segmented-four">
                  {imageShapes.map((item) => (
                    <button
                      type="button"
                      className={draft.imageShape === item.id ? "selected" : ""}
                      key={item.id}
                      onClick={() => update({ imageShape: item.id })}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </ControlGroup>
              <ControlGroup label="Image-section background">
                <div className="editor-segmented editor-segmented-four">
                  {imageBackgrounds.map((item) => (
                    <button
                      type="button"
                      className={
                        draft.imageBackground === item.id ? "selected" : ""
                      }
                      key={item.id}
                      onClick={() => update({ imageBackground: item.id })}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </ControlGroup>
              <ControlGroup label="Space around image">
                <div className="editor-segmented">
                  {imagePaddings.map((item) => (
                    <button
                      type="button"
                      className={
                        draft.imagePadding === item.id ? "selected" : ""
                      }
                      key={item.id}
                      onClick={() => update({ imagePadding: item.id })}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </ControlGroup>
              <ControlGroup label="Image border">
                <div className="editor-segmented editor-segmented-four">
                  <button
                    type="button"
                    className={!draft.imageBorder ? "selected" : ""}
                    onClick={() => update({ imageBorder: false })}
                  >
                    None
                  </button>
                  <button
                    type="button"
                    className={
                      draft.imageBorder && draft.imageBorderColor === "ink"
                        ? "selected"
                        : ""
                    }
                    onClick={() =>
                      update({ imageBorder: true, imageBorderColor: "ink" })
                    }
                  >
                    Dark
                  </button>
                  <button
                    type="button"
                    className={
                      draft.imageBorder && draft.imageBorderColor === "accent"
                        ? "selected"
                        : ""
                    }
                    onClick={() =>
                      update({ imageBorder: true, imageBorderColor: "accent" })
                    }
                  >
                    Accent
                  </button>
                  <button
                    type="button"
                    className={
                      draft.imageBorder && draft.imageBorderColor === "white"
                        ? "selected"
                        : ""
                    }
                    onClick={() =>
                      update({ imageBorder: true, imageBorderColor: "white" })
                    }
                  >
                    White
                  </button>
                </div>
              </ControlGroup>
              <ControlGroup label="Visual style">
                <div className="editor-choice-grid">
                  {visualStyles.map((item) => (
                    <button
                      type="button"
                      className={
                        draft.visualStyle === item.id ? "selected" : ""
                      }
                      key={item.id}
                      onClick={() => update({ visualStyle: item.id })}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </ControlGroup>
              <ControlGroup label="Colours">
                <div className="editor-palettes">
                  {palettes.map((item) => (
                    <button
                      type="button"
                      className={draft.palette === item.id ? "selected" : ""}
                      key={item.id}
                      onClick={() => update({ palette: item.id })}
                    >
                      <span>
                        {item.colors.map((color) => (
                          <i key={color} style={{ background: color }} />
                        ))}
                      </span>
                      {item.name}
                    </button>
                  ))}
                </div>
              </ControlGroup>
              <TypeControls
                title="Heading"
                font={draft.headingFont}
                size={draft.headingSize}
                onFont={(headingFont) => update({ headingFont })}
                onSize={(headingSize) => update({ headingSize })}
              />
              <TypeControls
                title="Body"
                font={draft.bodyFont}
                size={draft.bodySize}
                onFont={(bodyFont) => update({ bodyFont })}
                onSize={(bodySize) => update({ bodySize })}
              />
              <ControlGroup label="Section spacing">
                <div className="editor-segmented">
                  {spacings.map((item) => (
                    <button
                      type="button"
                      className={
                        draft.sectionSpacing === item.id ? "selected" : ""
                      }
                      key={item.id}
                      onClick={() => update({ sectionSpacing: item.id })}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </ControlGroup>
            </div>
          ) : null}
          {panel === "sections" ? (
            <div className="editor-panel">
              <PanelHeader
                number="04"
                title="Sections"
                description="Choose what appears and arrange the story."
              />
              <div className="editor-sections">
                {draft.sectionOrder.map((id, index) => {
                  const label =
                    sections.find((item) => item[0] === id)?.[1] ?? id;
                  const enabled = draft.enabledSections.includes(id);
                  const bookingUnavailable =
                    id === "booking" && !draft.calendlyUrl;
                  const background =
                    draft.sectionBackgrounds.find(
                      (item) => item.sectionId === id,
                    )?.background ?? "white";
                  const alignment =
                    draft.sectionAlignments?.find(
                      (item) => item.sectionId === id,
                    )?.alignment ?? "left";
                  return (
                    <div key={id}>
                      <div className="editor-section-heading">
                        <label>
                          <input
                            type="checkbox"
                            checked={enabled}
                            disabled={id === "blog" || bookingUnavailable}
                            onChange={() =>
                              update({
                                enabledSections: enabled
                                  ? draft.enabledSections.filter(
                                      (item) => item !== id,
                                    )
                                  : [...draft.enabledSections, id],
                              })
                            }
                          />
                          {label}
                          {id === "blog" ? <small>Required</small> : null}
                          {bookingUnavailable ? (
                            <small>
                              <Link href="/dashboard/calendly">Connect Calendly first</Link>
                            </small>
                          ) : null}
                        </label>
                        <span>
                          <button
                            type="button"
                            aria-label={`Move ${label} up`}
                            disabled={index === 0}
                            onClick={() => move(id, -1)}
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            aria-label={`Move ${label} down`}
                            disabled={index === draft.sectionOrder.length - 1}
                            onClick={() => move(id, 1)}
                          >
                            ↓
                          </button>
                        </span>
                      </div>
                      <div className="editor-section-options">
                        <label>
                          <small>Background</small>
                          <select
                            aria-label={`${label} background`}
                            value={background}
                            onChange={(event) =>
                              update({
                                sectionBackgrounds: [
                                  ...draft.sectionBackgrounds.filter(
                                    (item) => item.sectionId !== id,
                                  ),
                                  {
                                    sectionId: id,
                                    background: event.target.value as
                                      "white" | "soft" | "accent" | "dark",
                                  },
                                ],
                              })
                            }
                          >
                            <option value="white">White</option>
                            <option value="soft">Soft</option>
                            <option value="accent">Accent</option>
                            <option value="dark">Dark</option>
                          </select>
                        </label>
                        <label>
                          <small>Text alignment</small>
                          <select
                            aria-label={`${label} text alignment`}
                            value={alignment}
                            onChange={(event) =>
                              update({
                                sectionAlignments: [
                                  ...(draft.sectionAlignments ?? []).filter(
                                    (item) => item.sectionId !== id,
                                  ),
                                  {
                                    sectionId: id,
                                    alignment: event.target.value as
                                      "left" | "center" | "right",
                                  },
                                ],
                              })
                            }
                          >
                            <option value="left">Left</option>
                            <option value="center">Centre</option>
                            <option value="right">Right</option>
                          </select>
                        </label>
                        {id === "testimonials" ? (
                          <label>
                            <small>Testimonial text size</small>
                            <select
                              aria-label="Testimonial text size"
                              value={draft.testimonialSize}
                              onChange={(event) =>
                                update({
                                  testimonialSize: event.target.value as
                                    | "small"
                                    | "medium"
                                    | "large",
                                })
                              }
                            >
                              <option value="small">Small</option>
                              <option value="medium">Medium</option>
                              <option value="large">Large</option>
                            </select>
                          </label>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
          {panel === "publish" ? (
            <PublishPanel saveBeforePublish={persist} />
          ) : null}
        </aside>
        <section className="website-preview-stage">
          <header>
            <span>Live preview</span>
            <div>
              <button
                type="button"
                className={viewport === "desktop" ? "active" : ""}
                onClick={() => setViewport("desktop")}
              >
                Desktop
              </button>
              <button
                type="button"
                className={viewport === "mobile" ? "active" : ""}
                onClick={() => setViewport("mobile")}
              >
                Mobile
              </button>
            </div>
          </header>
          <div className={`website-editor-preview ${viewport}`}>
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
                heroEyebrow: draft.heroEyebrow,
                heroSupport: draft.heroSupport,
                exploreHeading: draft.exploreHeading,
                biography: draft.biography,
                whoYouHelp: draft.whoYouHelp,
                therapeuticApproach: draft.therapeuticApproach,
                faqs: draft.faqs,
              }}
              sectionOrder={draft.sectionOrder}
              bookingUrl={draft.calendlyUrl}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function PanelHeader({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <header>
      <span>{number}</span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </header>
  );
}
function ControlGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="editor-control-group">
      <h3>{label}</h3>
      {children}
    </section>
  );
}
function TypeControls({
  title,
  font,
  size,
  onFont,
  onSize,
}: {
  title: string;
  font: "editorial" | "clean" | "humanist";
  size: "small" | "medium" | "large";
  onFont: (font: "editorial" | "clean" | "humanist") => void;
  onSize: (size: "small" | "medium" | "large") => void;
}) {
  return (
    <section className="editor-type-panel">
      <b>{title}</b>
      <div className="editor-choice-group">
        <span>Font</span>
        <div className="editor-choice-grid">
          {fonts.map((item) => (
            <button
              type="button"
              className={`${item.id} ${font === item.id ? "selected" : ""}`}
              key={item.id}
              onClick={() => onFont(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className="editor-choice-group">
        <span>Size</span>
        <div className="editor-segmented">
          {sizes.map((item) => (
            <button
              type="button"
              className={size === item.id ? "selected" : ""}
              key={item.id}
              onClick={() => onSize(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function PublishPanel({
  saveBeforePublish,
}: {
  saveBeforePublish: () => Promise<boolean>;
}) {
  const status = useQuery(api.publishing.getStatus);
  if (status === undefined)
    return <div className="editor-panel">Preparing publishing…</div>;
  return (
    <PublishPanelReady
      key={`${status.subdomain}-${status.status}`}
      status={status}
      saveBeforePublish={saveBeforePublish}
    />
  );
}

function PublishPanelReady({
  status,
  saveBeforePublish,
}: {
  status: {
    status: "draft" | "published";
    subdomain: string;
    publishedAt?: number;
  };
  saveBeforePublish: () => Promise<boolean>;
}) {
  const publish = useMutation(api.publishing.publish);
  const [subdomain, setSubdomain] = useState(status.subdomain);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState("");
  const error = validateSubdomain(subdomain);
  const availability = useQuery(
    api.publishing.checkAvailability,
    error ? "skip" : { subdomain },
  );
  async function handlePublish() {
    if (publishing || error || !availability?.available) return;
    setPublishing(true);
    setMessage("");
    const saved = await saveBeforePublish();
    if (!saved) {
      setMessage("Save failed. Your current website was not published.");
      setPublishing(false);
      return;
    }
    try {
      await publish({ subdomain });
      setMessage("Published successfully.");
    } catch {
      setMessage("Publishing failed. Try again.");
    } finally {
      setPublishing(false);
    }
  }
  return (
    <div className="editor-panel editor-publish-panel">
      <PanelHeader
        number="05"
        title="Publish"
        description="Save the current preview and make it public."
      />
      <span
        className={`publication-status ${status.status === "published" ? "live" : "draft"}`}
      >
        <i />
        {status.status === "published" ? "Published" : "Draft"}
      </span>
      <label className="subdomain-field">
        <span>Website address</span>
        <div>
          <b>localhost:3000/</b>
          <input
            value={subdomain}
            onChange={(event) => {
              setSubdomain(normalizeSubdomain(event.target.value));
              setMessage("");
            }}
            aria-invalid={Boolean(error || availability?.error)}
          />
        </div>
      </label>
      <p
        className={`subdomain-feedback ${error || availability?.error ? "error" : availability?.available ? "available" : "checking"}`}
      >
        {error ||
          availability?.error ||
          (availability?.available
            ? "This address is available ✓"
            : "Checking availability…")}
      </p>
      {availability?.alternatives.length ? (
        <div className="subdomain-alternatives">
          <span>Available alternatives</span>
          {availability.alternatives.map((item) => (
            <button type="button" key={item} onClick={() => setSubdomain(item)}>
              {item}
            </button>
          ))}
        </div>
      ) : null}
      <button
        className="publish-action"
        type="button"
        disabled={publishing || Boolean(error) || !availability?.available}
        onClick={() => void handlePublish()}
      >
        {publishing
          ? "Saving and publishing…"
          : status.status === "published"
            ? "Publish updates →"
            : "Publish website →"}
      </button>
      {message ? <p className="publish-message">{message}</p> : null}
      {status.status === "published" ? (
        <Link
          className="view-published-site"
          href={publicSitePath(status.subdomain)}
          target="_blank"
        >
          Open published website ↗
        </Link>
      ) : null}
      <small className="local-address-note">
        Publishing always saves the current editor first.
      </small>
    </div>
  );
}
