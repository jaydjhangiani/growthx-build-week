"use client";

import { parseCalendlyUrl } from "@/lib/calendly";

export function PublicCalendly({ url, name }: { url?: string; name: string }) {
  const parsed = parseCalendlyUrl(url ?? "");
  if (!parsed.ok) return <div className="public-booking-missing"><small>Discovery call</small><h2>Booking is not available yet.</h2><p>{name} has not connected a valid Calendly event.</p></div>;
  return <><header><small>Discovery call</small><h2>Find a time that<br />feels comfortable.</h2><p>Choose an available time below. Calendly handles the appointment and reminders.</p></header><iframe title={`Book a discovery call with ${name}`} src={parsed.embedUrl} loading="lazy" /></>;
}
