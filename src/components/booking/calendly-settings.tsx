"use client";

import { FormEvent, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { parseCalendlyUrl } from "@/lib/calendly";

export function CalendlySettings({
  initialUrl,
  initialEnabled,
}: {
  initialUrl: string;
  initialEnabled: boolean;
}) {
  const save = useMutation(api.booking.save);
  const setBookingEnabled = useMutation(api.booking.setEnabled);
  const [value, setValue] = useState(initialUrl);
  const [savedUrl, setSavedUrl] = useState(initialUrl);
  const [enabled, setEnabled] = useState(initialEnabled);
  const [error, setError] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "saved">(
    initialUrl ? "saved" : "idle",
  );
  const [toggleState, setToggleState] = useState<"idle" | "saving">("idle");
  const preview = parseCalendlyUrl(savedUrl);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "saving") return;
    const parsed = parseCalendlyUrl(value);
    if (!parsed.ok) {
      setError(parsed.error);
      setState("idle");
      return;
    }
    setError("");
    setState("saving");
    try {
      const result = await save({ calendlyUrl: parsed.url });
      setValue(result.calendlyUrl);
      setSavedUrl(result.calendlyUrl);
      setEnabled(true);
      setState("saved");
    } catch {
      setError("Your Calendly link could not be saved. Try again.");
      setState("idle");
    }
  }

  async function toggle(nextEnabled: boolean) {
    if (!savedUrl || toggleState === "saving") return;
    const previous = enabled;
    setEnabled(nextEnabled);
    setToggleState("saving");
    setError("");
    try {
      await setBookingEnabled({ enabled: nextEnabled });
    } catch {
      setEnabled(previous);
      setError("Your Calendly setting could not be changed. Try again.");
    } finally {
      setToggleState("idle");
    }
  }

  return (
    <div className="calendly-settings">
      <header>
        <p>Booking settings</p>
        <h1>
          Connect your
          <br />
          <em>discovery call.</em>
        </h1>
        <span>
          Calendly will handle availability, appointments, reminders and
          rescheduling.
        </span>
      </header>
      <div className="calendly-grid">
        <section className="calendly-form-card">
          <div className="calendly-visibility">
            <div>
              <b>Show discovery calls</b>
              <small>
                {savedUrl
                  ? "Turn this off to hide booking everywhere. Your link stays saved."
                  : "Add a Calendly event link to turn this on."}
              </small>
            </div>
            <label className="calendly-switch">
              <input
                type="checkbox"
                checked={enabled}
                disabled={!savedUrl || toggleState === "saving"}
                onChange={(event) => void toggle(event.target.checked)}
              />
              <span aria-hidden="true" />
              <i>{enabled ? "On" : "Off"}</i>
            </label>
          </div>
          <div className="calendly-step">
            <span>01</span>
            <div>
              <b>Add your event link</b>
              <small>
                Open the event in Calendly and copy its public scheduling link.
              </small>
            </div>
          </div>
          <form onSubmit={(event) => void submit(event)} noValidate>
            <label htmlFor="calendly-url">Calendly event link</label>
            <div
              className={error
                ? "calendly-url-field invalid"
                : "calendly-url-field"}
            >
              <span aria-hidden="true">↗</span>
              <input
                id="calendly-url"
                type="url"
                inputMode="url"
                value={value}
                onChange={(event) => {
                  setValue(event.target.value);
                  setError("");
                  setState("idle");
                }}
                placeholder="https://calendly.com/your-name/discovery-call"
                aria-invalid={Boolean(error)}
                aria-describedby="calendly-help calendly-error"
              />
            </div>
            <small id="calendly-help">
              This must link to a specific Calendly event, not just your profile.
            </small>
            {error ? (
              <p id="calendly-error" role="alert">
                {error}
              </p>
            ) : null}
            <button type="submit" disabled={state === "saving"}>
              {state === "saving"
                ? "Checking and saving…"
                : state === "saved" && value === savedUrl && enabled
                  ? "Saved ✓"
                  : "Save and show discovery calls →"}
            </button>
          </form>
          <div className="calendly-note">
            <span aria-hidden="true">i</span>
            <p>
              <b>Calendly stays in control</b>
              Your calendar and client appointments remain inside Calendly.
              Releaf only displays the scheduler.
            </p>
          </div>
        </section>
        <section className="calendly-preview-card">
          <div>
            <span>Website preview</span>
            {enabled && preview.ok ? <small>Visible</small> : <small>Hidden</small>}
          </div>
          {enabled && preview.ok ? (
            <iframe
              title="Calendly discovery call scheduler"
              src={preview.embedUrl}
              loading="lazy"
            />
          ) : (
            <div className="calendly-preview-empty">
              <span>◷</span>
              <h2>Discovery calls are hidden.</h2>
              <p>
                {savedUrl
                  ? "Turn the setting on when you want booking to appear on your website."
                  : "Add a valid Calendly event link when you are ready to offer discovery calls."}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
