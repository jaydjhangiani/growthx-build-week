"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { presetEnquiryFields } from "@/lib/enquiry";

export function EnquiryInbox({ embedded = false }: { embedded?: boolean }) {
  const enquiries = useQuery(api.enquiries.list);
  const markRead = useMutation(api.enquiries.markRead);
  const [selectedId, setSelectedId] = useState<Id<"enquiries"> | null>(null);
  const selected = enquiries?.find((enquiry) => enquiry._id === selectedId) ?? enquiries?.[0] ?? null;

  function open(enquiryId: Id<"enquiries">) {
    setSelectedId(enquiryId);
    void markRead({ enquiryId });
  }

  if (enquiries === undefined) return <div className="inbox-loading">Opening enquiries…</div>;
  if (enquiries.length === 0) return <div className={`enquiries-page ${embedded ? "embedded" : ""}`}><header><p>Enquiries</p><h1>Your conversations<br /><em>start here.</em></h1></header><section className="inbox-empty"><span>✉</span><h2>No enquiries yet.</h2><p>Responses from your website enquiry form will appear here.</p></section></div>;

  return <div className={`enquiries-page ${embedded ? "embedded" : ""}`}><header><div><p>Enquiries</p><h1>Your conversations<br /><em>start here.</em></h1></div><span>{enquiries.filter((item) => item.status === "new").length} new · {enquiries.length} total</span></header><div className="inbox-layout"><section className="inbox-list" aria-label="Enquiry list">{enquiries.map((enquiry) => { const name = enquiry.responses.find((item) => item.fieldId === "name")?.value || "Anonymous enquiry"; const message = enquiry.responses.find((item) => item.fieldId === "message")?.value || "No message provided"; return <button type="button" key={enquiry._id} className={`${selected?._id === enquiry._id ? "selected" : ""} ${enquiry.status}`} onClick={() => open(enquiry._id)}><span className="inbox-person">{name.slice(0, 1).toUpperCase()}</span><span><b>{name}{enquiry.isTest ? <em>Test</em> : null}</b><small>{message}</small><time>{new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(enquiry.submittedAt)}</time></span>{enquiry.status === "new" ? <i aria-label="New enquiry" /> : null}</button>; })}</section>{selected ? <article className="enquiry-detail"><header><div><p>{selected.isTest ? "Test enquiry" : "Website enquiry"}</p><h2>{selected.responses.find((item) => item.fieldId === "name")?.value || "Anonymous enquiry"}</h2><time>{new Intl.DateTimeFormat("en-IN", { dateStyle: "long", timeStyle: "short" }).format(selected.submittedAt)}</time></div><span className={`delivery-${selected.emailDelivery ?? "pending"}`}>{selected.emailDelivery === "sent" ? "Email sent ✓" : selected.emailDelivery === "failed" ? "Email not sent" : "Email pending"}</span></header>{selected.emailDelivery === "failed" ? <aside><b>The dashboard copy is safe.</b><p>Email delivery failed{selected.emailError ? `: ${selected.emailError}` : "."} You can still read the full enquiry here.</p></aside> : null}<div className="enquiry-answers">{selected.responses.map((response) => <section key={response.fieldId}><small>{presetEnquiryFields.find((field) => field.id === response.fieldId)?.label ?? response.fieldId}</small><p>{response.value || "Not answered"}</p></section>)}</div><footer>This enquiry is not a clinical record. Handle sensitive details according to your practice’s privacy process.</footer></article> : null}</div></div>;
}
