"use client";

import { FormEvent, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { PatientField } from "@/components/enquiries/enquiry-builder";
import {
  validateEnquiryResponses,
  type EnquiryFieldConfig,
  type EnquiryFieldId,
  type EnquiryResponses,
} from "@/lib/enquiry";

export function PublicEnquiryForm({ subdomain }: { subdomain: string }) {
  const config = useQuery(api.enquiries.getPublicConfig, { subdomain });
  const submitPublic = useMutation(api.enquiries.submitPublic);
  const record = useMutation(api.analytics.record);
  const [responses, setResponses] = useState<EnquiryResponses>({});
  const [errors, setErrors] = useState<Partial<Record<EnquiryFieldId, string>>>(
    {},
  );
  const [consented, setConsented] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [state, setState] = useState<"idle" | "submitting" | "sent">("idle");
  const [formError, setFormError] = useState("");
  const submissionKey = useRef(crypto.randomUUID());
  const startRecorded = useRef(false);

  function recordStart() {
    if (startRecorded.current) return;
    startRecorded.current = true;
    void record({ subdomain, eventType: "enquiry_start" });
  }

  if (config === undefined) return <div>Loading enquiry form…</div>;
  if (config === null) return null;
  const fields = config.fields as EnquiryFieldConfig[];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state !== "idle") return;
    const nextErrors = validateEnquiryResponses(fields, responses);
    setErrors(nextErrors);
    setConsentError(!consented);
    if (Object.keys(nextErrors).length || !consented) return;
    setState("submitting");
    setFormError("");
    try {
      await submitPublic({
        subdomain,
        submissionKey: submissionKey.current,
        consented,
        responses: Object.entries(responses).map(([fieldId, value]) => ({
          fieldId,
          value: value ?? "",
        })),
      });
      setState("sent");
    } catch {
      setFormError("Your enquiry could not be sent. Please try again.");
      setState("idle");
    }
  }

  return (
    <>
      <div className="public-enquiry-intro">
        <small>Private enquiry</small>
        <h2>Start a conversation.</h2>
        <p>
          Share only what feels comfortable. This form is not monitored for
          urgent support.
        </p>
      </div>
      <div className="patient-form-preview">
        {state === "sent" ? (
          <div className="enquiry-confirmation">
            <span>✓</span>
            <h2>Thank you for reaching out.</h2>
            <p>
              Your enquiry has been received. {config.practitionerName} will
              contact you using your preferred method.
            </p>
          </div>
        ) : (
          <form
            onSubmit={(event) => void submit(event)}
            onFocus={recordStart}
            noValidate
          >
            {fields.map((field) => (
              <PatientField
                key={field.id}
                id={field.id}
                required={field.required}
                value={responses[field.id] ?? ""}
                error={errors[field.id]}
                onChange={(value) => {
                  setResponses((current) => ({
                    ...current,
                    [field.id]: value,
                  }));
                  setErrors((current) => ({
                    ...current,
                    [field.id]: undefined,
                  }));
                }}
              />
            ))}
            <label className="privacy-consent">
              <input
                type="checkbox"
                checked={consented}
                onChange={(event) => {
                  setConsented(event.target.checked);
                  setConsentError(false);
                }}
                aria-invalid={consentError}
              />
              <span>
                I understand that this information will be stored so{" "}
                {config.practitionerName} can respond. This is not a
                clinical-record system or emergency service.
              </span>
            </label>
            {consentError ? (
              <p className="enquiry-form-error" role="alert">
                Please confirm the privacy notice before sending.
              </p>
            ) : null}
            {formError ? (
              <p className="enquiry-form-error" role="alert">
                {formError}
              </p>
            ) : null}
            <button
              className="patient-submit"
              type="submit"
              disabled={state === "submitting"}
            >
              {state === "submitting" ? "Sending safely…" : "Send enquiry →"}
            </button>
          </form>
        )}
      </div>
    </>
  );
}
