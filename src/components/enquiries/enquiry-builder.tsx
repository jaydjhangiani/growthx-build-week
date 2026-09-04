"use client";

import { FormEvent, useRef, useState } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { presetEnquiryFields, validateEnquiryResponses, type EnquiryFieldConfig, type EnquiryFieldId, type EnquiryResponses } from "@/lib/enquiry";

export function PatientField({ id, required, value, error, onChange }: { id: EnquiryFieldId; required: boolean; value: string; error?: string; onChange: (value: string) => void }) {
  const field = presetEnquiryFields.find((item) => item.id === id);
  if (!field) return null;
  const common = { id: `patient-${id}`, value, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => onChange(event.target.value), "aria-invalid": Boolean(error), "aria-describedby": error ? `patient-${id}-error` : undefined };
  return <label className="patient-field" htmlFor={`patient-${id}`}><span>{field.label}{required ? <b>Required</b> : <small>Optional</small>}</span>{field.type === "select" ? <select {...common}><option value="">Choose one</option>{field.options.map((option) => <option key={option}>{option}</option>)}</select> : field.type === "textarea" ? <textarea {...common} rows={4} placeholder={field.placeholder} /> : <input {...common} type={field.type} placeholder={field.placeholder} />}{error ? <em id={`patient-${id}-error`}>{error}</em> : null}</label>;
}

export function EnquiryBuilder({ initialFields }: { initialFields: EnquiryFieldConfig[] }) {
  const saveConfig = useMutation(api.enquiries.saveConfig);
  const submitTest = useMutation(api.enquiries.submitTest);
  const deliverEmail = useAction(api.enquiries.deliverEmail);
  const [fields, setFields] = useState(initialFields);
  const [responses, setResponses] = useState<EnquiryResponses>({});
  const [errors, setErrors] = useState<Partial<Record<EnquiryFieldId, string>>>({});
  const [consented, setConsented] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [configState, setConfigState] = useState<"saved" | "unsaved" | "saving">("saved");
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "sent">("idle");
  const [formError, setFormError] = useState("");
  const submissionKey = useRef(crypto.randomUUID());

  function changeField(id: EnquiryFieldId, patch: Partial<EnquiryFieldConfig>) {
    setFields((current) => current.map((field) => field.id === id ? { ...field, ...patch } : field));
    setConfigState("unsaved");
  }

  async function persistFields() {
    if (configState === "saving") return;
    setConfigState("saving");
    setFormError("");
    try {
      const result = await saveConfig({ fields });
      setFields(result.fields as EnquiryFieldConfig[]);
      setConfigState("saved");
    } catch {
      setFormError("Keep at least one field enabled before saving.");
      setConfigState("unsaved");
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitState !== "idle") return;
    const nextErrors = validateEnquiryResponses(fields, responses);
    setErrors(nextErrors);
    setConsentError(!consented);
    if (Object.keys(nextErrors).length || !consented) return;
    setSubmitState("submitting");
    setFormError("");
    try {
      await saveConfig({ fields });
      const result = await submitTest({ submissionKey: submissionKey.current, responses: Object.entries(responses).map(([fieldId, value]) => ({ fieldId, value: value ?? "" })) });
      await deliverEmail({ enquiryId: result.enquiryId });
      setConfigState("saved");
      setSubmitState("sent");
    } catch {
      setFormError("The enquiry could not be submitted. Try again.");
      setSubmitState("idle");
    }
  }

  const enabledFields = fields.filter((field) => field.enabled);
  return <div className="enquiry-builder"><header><p>Enquiry form</p><h1>Ask only what<br /><em>helps you respond.</em></h1><span>Choose the details patients can share before a first conversation.</span></header><div className="enquiry-builder-grid"><section className="field-config"><div className="builder-section-title"><span>01</span><div><b>Choose your fields</b><small>Turn fields on and decide which answers are required.</small></div><button type="button" onClick={() => void persistFields()} disabled={configState === "saving"}>{configState === "saving" ? "Saving…" : configState === "saved" ? "Saved ✓" : "Save changes"}</button></div><div className="field-config-list">{fields.map((field) => { const definition = presetEnquiryFields.find((item) => item.id === field.id); return <article key={field.id} className={field.enabled ? "enabled" : ""}><label className="field-enable"><input type="checkbox" checked={field.enabled} onChange={(event) => changeField(field.id, { enabled: event.target.checked, required: event.target.checked ? field.required : false })} /><span aria-hidden="true">{field.enabled ? "✓" : ""}</span><b>{definition?.label}</b></label><label className="required-toggle"><input type="checkbox" checked={field.required} disabled={!field.enabled} onChange={(event) => changeField(field.id, { required: event.target.checked })} /><span>Required</span></label></article>; })}</div><aside><b>V1 privacy note</b><p>Custom questions may collect sensitive mental-health information. This milestone includes preset fields only; custom fields come in the scoped builder work later.</p></aside></section><section className="patient-form-preview"><div className="preview-window-title"><span>Patient preview</span><small>{enabledFields.length} fields</small></div>{submitState === "sent" ? <div className="enquiry-confirmation"><span>✓</span><h2>Thank you for reaching out.</h2><p>Your enquiry has been received. Diva will contact you using your preferred method.</p><button type="button" onClick={() => { submissionKey.current = crypto.randomUUID(); setResponses({}); setConsented(false); setConsentError(false); setSubmitState("idle"); }}>Preview another response</button></div> : <form onSubmit={(event) => void submit(event)} noValidate><header><small>Start a conversation</small><h2>Tell me a little about what brings you here.</h2><p>This form is for enquiries only and is not monitored for urgent support.</p></header>{enabledFields.map((field) => <PatientField key={field.id} id={field.id} required={field.required} value={responses[field.id] ?? ""} error={errors[field.id]} onChange={(value) => { setResponses((current) => ({ ...current, [field.id]: value })); setErrors((current) => ({ ...current, [field.id]: undefined })); }} />)}<label className="privacy-consent"><input type="checkbox" checked={consented} onChange={(event) => { setConsented(event.target.checked); setConsentError(false); }} aria-invalid={consentError} /><span>I understand that this information will be stored so Diva can respond to my enquiry. This form is not a clinical-record system or emergency service.</span></label>{consentError ? <p className="enquiry-form-error" role="alert">Please confirm the privacy notice before sending.</p> : null}{formError ? <p className="enquiry-form-error" role="alert">{formError}</p> : null}<button className="patient-submit" type="submit" disabled={submitState === "submitting"}>{submitState === "submitting" ? "Sending safely…" : "Send enquiry →"}</button></form>}</section></div></div>;
}
