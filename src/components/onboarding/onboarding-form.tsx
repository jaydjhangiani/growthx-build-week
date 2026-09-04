"use client";

import { useMutation } from "convex/react";
import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { credentialsSchema, identitySchema, practiceSchema, servicesSchema } from "@/lib/onboarding-schema";

type Service = { name: string; format: "online" | "offline" | "hybrid"; durationMinutes: number; feeInr: number };
type Certification = { name: string; place: string };
type Draft = {
  currentStep: number;
  completedSteps: number[];
  fullName?: string;
  city?: string;
  practiceLocation?: string;
  languages?: string[];
  profilePhotoUrl?: string | null;
  qualifications?: string[];
  certifications?: Array<string | Certification>;
  yearsExperience?: number;
  biography?: string;
  whoYouHelp?: string;
  specializations?: string[];
  therapeuticApproach?: string;
  services?: Service[];
  contactEmail?: string;
};

type FormState = {
  fullName: string;
  city: string;
  practiceLocation: string;
  languages: string;
  qualifications: string;
  certifications: Certification[];
  yearsExperience: string;
  biography: string;
  whoYouHelp: string;
  specializations: string;
  therapeuticApproach: string;
  services: Service[];
  contactEmail: string;
};

const steps = [
  { number: 1, label: "You & your practice", short: "About you" },
  { number: 2, label: "Training & experience", short: "Experience" },
  { number: 3, label: "How you help", short: "Your work" },
  { number: 4, label: "Services & contact", short: "Services" },
  { number: 5, label: "Review your profile", short: "Review" },
] as const;

const initialService: Service = { name: "", format: "online", durationMinutes: 50, feeInr: 2000 };
const splitList = (value: string) => value.split(/,|\n/).map((item) => item.trim()).filter(Boolean);

function initialState(draft: Draft | null): FormState {
  return {
    fullName: draft?.fullName ?? "",
    city: draft?.city ?? "",
    practiceLocation: draft?.practiceLocation ?? "",
    languages: draft?.languages?.join(", ") ?? "",
    qualifications: draft?.qualifications?.join("\n") ?? "",
    certifications:
      draft?.certifications?.map((certification) =>
        typeof certification === "string"
          ? { name: certification, place: "" }
          : certification,
      ) ?? [],
    yearsExperience: draft?.yearsExperience?.toString() ?? "",
    biography: draft?.biography ?? "",
    whoYouHelp: draft?.whoYouHelp ?? "",
    specializations: draft?.specializations?.join(", ") ?? "",
    therapeuticApproach: draft?.therapeuticApproach ?? "",
    services: draft?.services?.length ? [...draft.services] : [{ ...initialService }],
    contactEmail: draft?.contactEmail ?? "",
  };
}

function errorsFromIssues(issues: ReadonlyArray<{ path: PropertyKey[]; message: string }>) {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.join(".");
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return <label className="profile-field"><span className="profile-label">{label}</span>{hint ? <small>{hint}</small> : null}{children}{error ? <span className="profile-error">{error}</span> : null}</label>;
}

export function OnboardingForm({ draft }: { draft: Draft | null }) {
  const saveStep = useMutation(api.onboarding.saveStep);
  const generatePhotoUploadUrl = useMutation(api.onboarding.generatePhotoUploadUrl);
  const saveProfilePhoto = useMutation(api.onboarding.saveProfilePhoto);
  const [step, setStep] = useState(Math.min(Math.max(draft?.currentStep ?? 1, 1), 5));
  const [completed, setCompleted] = useState(draft?.completedSteps ?? []);
  const [form, setForm] = useState(() => initialState(draft));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">(draft ? "saved" : "idle");
  const [photoUrl, setPhotoUrl] = useState(draft?.profilePhotoUrl ?? null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const photoInput = useRef<HTMLInputElement>(null);

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
    setSaveState("idle");
  }

  async function uploadPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((current) => ({ ...current, profilePhoto: "Choose an image file." }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((current) => ({ ...current, profilePhoto: "Choose an image smaller than 5 MB." }));
      return;
    }

    setPhotoUploading(true);
    setErrors((current) => ({ ...current, profilePhoto: "" }));
    try {
      const uploadUrl = await generatePhotoUploadUrl({});
      const response = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": file.type }, body: file });
      if (!response.ok) throw new Error("Upload failed");
      const { storageId } = (await response.json()) as { storageId: Id<"_storage"> };
      await saveProfilePhoto({ storageId });
      setPhotoUrl(URL.createObjectURL(file));
      setSaveState("saved");
    } catch {
      setErrors((current) => ({ ...current, profilePhoto: "The photo could not be uploaded. Try again." }));
    } finally {
      setPhotoUploading(false);
    }
  }

  function validateCurrentStep() {
    if (step === 1) return identitySchema.safeParse({ fullName: form.fullName, city: form.city, practiceLocation: form.practiceLocation, languages: splitList(form.languages) });
    if (step === 2) return credentialsSchema.safeParse({ qualifications: splitList(form.qualifications), certifications: form.certifications.filter((item) => item.name.trim() || item.place.trim()), yearsExperience: Number(form.yearsExperience) });
    if (step === 3) return practiceSchema.safeParse({ biography: form.biography, whoYouHelp: form.whoYouHelp, specializations: splitList(form.specializations), therapeuticApproach: form.therapeuticApproach });
    return servicesSchema.safeParse({ services: form.services, contactEmail: form.contactEmail });
  }

  async function handleContinue(event: FormEvent) {
    event.preventDefault();
    if (step === 5 || saveState === "saving") return;
    const result = validateCurrentStep();
    if (!result.success) {
      setErrors(errorsFromIssues(result.error.issues));
      return;
    }

    setErrors({});
    setSaveState("saving");
    try {
      const response = await saveStep({ step, data: result.data });
      setCompleted(response.completedSteps);
      setSaveState("saved");
      setStep(response.currentStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message.replace(/^.*Uncaught ConvexError: /, "") : "Your answers could not be saved. Try again." });
      setSaveState("error");
    }
  }

  function goToStep(nextStep: number) {
    if (nextStep > Math.max(step, ...completed.map((item) => item + 1))) return;
    setErrors({});
    setStep(nextStep);
  }

  function updateService(index: number, patch: Partial<Service>) {
    setForm((current) => ({ ...current, services: current.services.map((service, serviceIndex) => serviceIndex === index ? { ...service, ...patch } : service) }));
    setErrors({});
    setSaveState("idle");
  }

  function addService() {
    setForm((current) => ({ ...current, services: [...current.services, { ...initialService }] }));
  }

  function removeService(index: number) {
    setForm((current) => ({ ...current, services: current.services.filter((_, serviceIndex) => serviceIndex !== index) }));
  }

  function updateCertification(index: number, patch: Partial<Certification>) {
    setForm((current) => ({
      ...current,
      certifications: current.certifications.map((certification, certificationIndex) =>
        certificationIndex === index ? { ...certification, ...patch } : certification,
      ),
    }));
    setErrors({});
    setSaveState("idle");
  }

  function addCertification() {
    setForm((current) => ({
      ...current,
      certifications: [...current.certifications, { name: "", place: "" }],
    }));
  }

  function removeCertification(index: number) {
    setForm((current) => ({
      ...current,
      certifications: current.certifications.filter(
        (_, certificationIndex) => certificationIndex !== index,
      ),
    }));
  }

  const currentStep = steps[step - 1];
  const progress = ((step - 1) / (steps.length - 1)) * 100;

  return (
    <div className="profile-builder">
      <aside className="profile-rail">
        <div>
          <p className="profile-rail-kicker">Build your foundation</p>
          <h2>Your practice,<br /><em>in your words.</em></h2>
          <p>These details become the source for your website. You can edit them later.</p>
        </div>
        <ol>
          {steps.map((item) => {
            const accessible = item.number <= Math.max(step, ...completed.map((saved) => saved + 1));
            return <li key={item.number} className={item.number === step ? "current" : completed.includes(item.number) ? "complete" : ""}><button type="button" onClick={() => goToStep(item.number)} disabled={!accessible} aria-current={item.number === step ? "step" : undefined}><span>{completed.includes(item.number) ? "✓" : `0${item.number}`}</span><b>{item.label}</b></button></li>;
          })}
        </ol>
        <p className={`save-indicator ${saveState}`} aria-live="polite"><span />{saveState === "saving" ? "Saving your answers…" : saveState === "saved" ? "All changes saved" : saveState === "error" ? "Not saved" : "Changes save when you continue"}</p>
      </aside>

      <section className="profile-workspace">
        <div className="mobile-progress"><span>Step {step} of 5 · {currentStep.short}</span><div><i style={{ width: `${progress}%` }} /></div></div>
        <form onSubmit={handleContinue} noValidate>
          <header className="profile-step-header"><p>Step 0{step}</p><h1>{step === 1 ? "Start with the person behind the practice." : step === 2 ? "Share the training that shapes your work." : step === 3 ? "Help people recognise themselves here." : step === 4 ? "Make the practical details easy to find." : "This is the profile we’ll build from."}</h1><span>{step === 1 ? "The basics patients look for when deciding whether to reach out." : step === 2 ? "Clear credentials build trust without making the page feel like a résumé." : step === 3 ? "Use language you would feel comfortable saying in a first conversation." : step === 4 ? "Add each way someone can work with you and what it costs." : "Read through your answers. Open any step to make a change."}</span></header>

          {step === 1 ? <div className="profile-fields">
            <div className="photo-field"><button type="button" className="photo-control" onClick={() => photoInput.current?.click()} disabled={photoUploading}>{photoUrl ? <Image src={photoUrl} alt="Your uploaded profile" fill sizes="112px" unoptimized /> : <span aria-hidden="true">DM</span>}<i>{photoUploading ? "Uploading…" : photoUrl ? "Replace photo" : "Add photo"}</i></button><input ref={photoInput} type="file" accept="image/*" onChange={uploadPhoto} hidden /><div><b>Profile photograph</b><p>Optional · JPG, PNG or WebP · Up to 5 MB</p>{errors.profilePhoto ? <span className="profile-error">{errors.profilePhoto}</span> : null}</div></div>
            <Field label="Your full name" error={errors.fullName}><input value={form.fullName} onChange={(e) => setField("fullName", e.target.value)} placeholder="Diva Mehta" autoComplete="name" aria-invalid={Boolean(errors.fullName)} /></Field>
            <div className="field-row"><Field label="City" error={errors.city}><input value={form.city} onChange={(e) => setField("city", e.target.value)} placeholder="Mumbai" aria-invalid={Boolean(errors.city)} /></Field><Field label="Practice location" hint="Neighbourhood or area" error={errors.practiceLocation}><input value={form.practiceLocation} onChange={(e) => setField("practiceLocation", e.target.value)} placeholder="Bandra West" aria-invalid={Boolean(errors.practiceLocation)} /></Field></div>
            <Field label="Languages" hint="Separate multiple languages with commas" error={errors.languages}><input value={form.languages} onChange={(e) => setField("languages", e.target.value)} placeholder="English, Hindi" aria-invalid={Boolean(errors.languages)} /></Field>
          </div> : null}

          {step === 2 ? <div className="profile-fields">
            <Field label="Qualifications" hint="One qualification per line" error={errors.qualifications}><textarea value={form.qualifications} onChange={(e) => setField("qualifications", e.target.value)} rows={4} placeholder={"M.A. Counselling Psychology\nB.A. Psychology"} aria-invalid={Boolean(errors.qualifications)} /></Field>
            <div className="service-editor-heading"><div><b>Certifications</b><p>Optional · Add the course and where you completed it.</p></div><button type="button" onClick={addCertification}>+ Add certification</button></div>
            {form.certifications.map((certification, index) => <div className="service-editor certification-editor" key={index}><div className="service-editor-title"><span>Certification 0{index + 1}</span><button type="button" onClick={() => removeCertification(index)}>Remove</button></div><div className="field-row"><Field label="Certification name" error={errors[`certifications.${index}.name`]}><textarea rows={2} value={certification.name} onChange={(event) => updateCertification(index, { name: event.target.value })} placeholder="Advanced practicum in rational emotive behavioural therapy by Albert Ellis Institute" aria-invalid={Boolean(errors[`certifications.${index}.name`])} /></Field><Field label="Place" hint="City"><input value={certification.place} onChange={(event) => updateCertification(index, { place: event.target.value })} placeholder="New York" /></Field></div></div>)}
            <Field label="Years of experience" error={errors.yearsExperience}><div className="number-field"><input type="number" min="0" max="60" value={form.yearsExperience} onChange={(e) => setField("yearsExperience", e.target.value)} placeholder="5" aria-invalid={Boolean(errors.yearsExperience)} /><span>years</span></div></Field>
          </div> : null}

          {step === 3 ? <div className="profile-fields">
            <Field label="Biography" hint={`${form.biography.length} characters · Minimum 40`} error={errors.biography}><textarea value={form.biography} onChange={(e) => setField("biography", e.target.value)} rows={5} placeholder="I work with adults who look capable on the outside but feel overwhelmed underneath…" aria-invalid={Boolean(errors.biography)} /></Field>
            <Field label="Who do you help?" hint="Describe the people and situations you commonly support" error={errors.whoYouHelp}><textarea value={form.whoYouHelp} onChange={(e) => setField("whoYouHelp", e.target.value)} rows={4} placeholder="Young adults navigating anxiety, relationships, identity, and life transitions." aria-invalid={Boolean(errors.whoYouHelp)} /></Field>
            <Field label="Specializations" hint="Separate multiple areas with commas" error={errors.specializations}><input value={form.specializations} onChange={(e) => setField("specializations", e.target.value)} placeholder="Anxiety, relationships, self-worth" aria-invalid={Boolean(errors.specializations)} /></Field>
            <Field label="Therapeutic approach" hint={`${form.therapeuticApproach.length} characters · Minimum 30`} error={errors.therapeuticApproach}><textarea value={form.therapeuticApproach} onChange={(e) => setField("therapeuticApproach", e.target.value)} rows={5} placeholder="My approach is collaborative, trauma-informed, and grounded in each person’s pace…" aria-invalid={Boolean(errors.therapeuticApproach)} /></Field>
          </div> : null}

          {step === 4 ? <div className="profile-fields">
            <div className="service-editor-heading"><div><b>Your services</b><p>Add at least one service. You can change the order later.</p></div><button type="button" onClick={addService}>+ Add another service</button></div>
            {form.services.map((service, index) => <div className="service-editor" key={index}><div className="service-editor-title"><span>Service 0{index + 1}</span>{form.services.length > 1 ? <button type="button" onClick={() => removeService(index)}>Remove</button> : null}</div><Field label="Service name" error={errors[`services.${index}.name`]}><input value={service.name} onChange={(e) => updateService(index, { name: e.target.value })} placeholder="Individual therapy" /></Field><div className="field-row three"><Field label="Format"><select value={service.format} onChange={(e) => updateService(index, { format: e.target.value as Service["format"] })}><option value="online">Online</option><option value="offline">In person</option><option value="hybrid">Online & in person</option></select></Field><Field label="Duration" error={errors[`services.${index}.durationMinutes`]}><div className="number-field"><input type="number" min="10" max="240" value={service.durationMinutes} onChange={(e) => updateService(index, { durationMinutes: Number(e.target.value) })} /><span>min</span></div></Field><Field label="Fee" error={errors[`services.${index}.feeInr`]}><div className="number-field"><span>₹</span><input type="number" min="0" value={service.feeInr} onChange={(e) => updateService(index, { feeInr: Number(e.target.value) })} /></div></Field></div></div>)}
            {errors.services ? <span className="profile-error">{errors.services}</span> : null}
            <Field label="Public contact email" hint="Enquiries will be sent here in a later milestone" error={errors.contactEmail}><input type="email" value={form.contactEmail} onChange={(e) => setField("contactEmail", e.target.value)} placeholder="hello@yourpractice.com" aria-invalid={Boolean(errors.contactEmail)} /></Field>
          </div> : null}

          {step === 5 ? <div className="profile-review">
            <ReviewSection number="01" title="You & your practice" onEdit={() => goToStep(1)}><h3>{form.fullName}</h3><p>{form.practiceLocation}, {form.city}</p><div className="review-tags">{splitList(form.languages).map((item) => <span key={item}>{item}</span>)}</div></ReviewSection>
            <ReviewSection number="02" title="Training & experience" onEdit={() => goToStep(2)}><h3>{form.yearsExperience} years of experience</h3><p>{splitList(form.qualifications).join(" · ")}</p>{form.certifications.map((certification) => <p key={`${certification.name}-${certification.place}`}><b>{certification.name}</b>{certification.place ? ` · ${certification.place}` : ""}</p>)}</ReviewSection>
            <ReviewSection number="03" title="How you help" onEdit={() => goToStep(3)}><h3>{splitList(form.specializations).join(" · ")}</h3><p>{form.biography}</p></ReviewSection>
            <ReviewSection number="04" title="Services & contact" onEdit={() => goToStep(4)}>{form.services.map((service) => <p key={service.name}><b>{service.name}</b> · {service.format} · {service.durationMinutes} min · ₹{service.feeInr.toLocaleString("en-IN")}</p>)}</ReviewSection>
            <div className="profile-ready"><span>✓</span><div><b>Your practice profile is saved</b><p>Next, you’ll choose the sections, tone, and visual direction for your website.</p></div></div>
          </div> : null}

          {errors.form ? <p className="profile-form-error" role="alert">{errors.form}</p> : null}
          <footer className="profile-actions">{step > 1 ? <button className="profile-back" type="button" onClick={() => goToStep(step - 1)}>← Back</button> : <span />}{step < 5 ? <button className="profile-continue" type="submit" disabled={saveState === "saving"}>{saveState === "saving" ? "Saving…" : step === 4 ? "Save and review" : "Save and continue"}<span aria-hidden="true">→</span></button> : <Link className="profile-continue" href="/onboarding/preferences">Choose website preferences <span aria-hidden="true">→</span></Link>}</footer>
        </form>
      </section>
    </div>
  );
}

function ReviewSection({ number, title, onEdit, children }: { number: string; title: string; onEdit(): void; children: React.ReactNode }) {
  return <section className="review-section"><header><span>{number}</span><b>{title}</b><button type="button" onClick={onEdit}>Edit</button></header><div>{children}</div></section>;
}
