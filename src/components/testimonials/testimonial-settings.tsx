"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import {
  TESTIMONIAL_ATTRIBUTION_MAX_LENGTH,
  TESTIMONIAL_MAX_LENGTH,
  validateTestimonialImage,
  validateWrittenTestimonial,
} from "@/lib/testimonials";

type Format = "written" | "image";
type RequestState = "idle" | "working" | "success" | "error";

export function TestimonialSettings() {
  const data = useQuery(api.testimonials.get);
  const chooseFormat = useMutation(api.testimonials.chooseFormat);
  const addWritten = useMutation(api.testimonials.addWritten);
  const generateUploadUrl = useMutation(api.testimonials.generateUploadUrl);
  const addImage = useMutation(api.testimonials.addImage);
  const setVisible = useMutation(api.testimonials.setVisible);
  const move = useMutation(api.testimonials.move);
  const remove = useMutation(api.testimonials.remove);
  const fileInput = useRef<HTMLInputElement>(null);
  const [quote, setQuote] = useState("");
  const [attribution, setAttribution] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState("");
  const [state, setState] = useState<RequestState>("idle");
  const [message, setMessage] = useState("");

  if (data === undefined)
    return <div className="testimonial-loading">Opening testimonials…</div>;

  const format = data.format;
  const items = data.items.filter((item) => item.kind === format);

  async function selectFormat(next: Format) {
    if (state === "working" || next === format) return;
    setState("working");
    setMessage("");
    try {
      await chooseFormat({ format: next });
      setState("success");
      setMessage(`${next === "written" ? "Written" : "Image"} testimonials will appear on your website.`);
    } catch (error) {
      showError(error);
    }
  }

  function pickFile(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0] ?? null;
    if (!next) return;
    const error = validateTestimonialImage(next);
    if (error) {
      setFile(null);
      setFilePreview("");
      setState("error");
      setMessage(error);
      return;
    }
    setFile(next);
    setFilePreview(URL.createObjectURL(next));
    setState("idle");
    setMessage("");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (state === "working") return;
    if (format === "written") {
      const error = validateWrittenTestimonial(quote, attribution);
      if (error) {
        setState("error");
        setMessage(error);
        return;
      }
    } else if (!file) {
      setState("error");
      setMessage("Choose a testimonial image.");
      return;
    }
    setState("working");
    setMessage("");
    try {
      if (format === "written") {
        await addWritten({ quote, attribution });
      } else if (file) {
        const uploadUrl = await generateUploadUrl({});
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!response.ok) throw new Error("The image could not be uploaded.");
        const { storageId } = (await response.json()) as { storageId: Id<"_storage"> };
        await addImage({ imageId: storageId, attribution });
      }
      setQuote("");
      setAttribution("");
      setFile(null);
      if (filePreview) URL.revokeObjectURL(filePreview);
      setFilePreview("");
      if (fileInput.current) fileInput.current.value = "";
      setState("success");
      setMessage("Testimonial added and selected for your website.");
    } catch (error) {
      showError(error);
    }
  }

  function showError(error: unknown) {
    const text = error instanceof Error ? error.message.match(/ConvexError:\s*([^\n]+)/)?.[1] || error.message : "That change could not be saved.";
    setState("error");
    setMessage(text);
  }

  async function deleteItem(id: Id<"testimonials">) {
    if (!window.confirm("Delete this testimonial? This cannot be undone.")) return;
    setState("working");
    try {
      await remove({ id });
      setState("success");
      setMessage("Testimonial deleted.");
    } catch (error) {
      showError(error);
    }
  }

  return (
    <main className="testimonial-settings">
      <header>
        <div>
          <p>Trust signals</p>
          <h1>Share kind words,<br /><em>with care.</em></h1>
        </div>
        <span>{items.filter((item) => item.visible).length} showing</span>
      </header>

      <section className="testimonial-format" aria-label="Choose testimonial format">
        <button type="button" className={format === "written" ? "selected" : ""} aria-pressed={format === "written"} disabled={state === "working"} onClick={() => void selectFormat("written")}>
          <span>01</span><b>Written testimonials</b><small>Type a quote and optional name or context.</small><i>{format === "written" ? "Showing on website" : "Use written"}</i>
        </button>
        <button type="button" className={format === "image" ? "selected" : ""} aria-pressed={format === "image"} disabled={state === "working"} onClick={() => void selectFormat("image")}>
          <span>02</span><b>Testimonial images</b><small>Upload screenshots or designed testimonial cards.</small><i>{format === "image" ? "Showing on website" : "Use images"}</i>
        </button>
      </section>

      <div className="testimonial-workspace">
        <section className="testimonial-form-card">
          <header><span>Add {format === "written" ? "a written testimonial" : "an image testimonial"}</span><small>New items show by default</small></header>
          <form onSubmit={(event) => void submit(event)} noValidate>
            {format === "written" ? (
              <label>Testimonial text
                <textarea value={quote} maxLength={TESTIMONIAL_MAX_LENGTH} onChange={(event) => { setQuote(event.target.value); setState("idle"); setMessage(""); }} placeholder="Paste the testimonial exactly as it was shared…" rows={7} />
                <small>{quote.length}/{TESTIMONIAL_MAX_LENGTH}</small>
              </label>
            ) : (
              <div className="testimonial-upload">
                <button type="button" onClick={() => fileInput.current?.click()} disabled={state === "working"}>
                  {filePreview ? <Image src={filePreview} alt="Selected testimonial preview" fill sizes="360px" unoptimized /> : <><b>Choose image</b><small>JPG, PNG or WebP · Up to 5 MB</small></>}
                </button>
                <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={pickFile} hidden />
              </div>
            )}
            <label>Name or context <span>Optional</span>
              <input value={attribution} maxLength={TESTIMONIAL_ATTRIBUTION_MAX_LENGTH} onChange={(event) => setAttribution(event.target.value)} placeholder="For example: Former client, Mumbai" />
            </label>
            <button type="submit" disabled={state === "working"}>{state === "working" ? "Saving…" : "Add testimonial"}</button>
          </form>
          {message ? <p className={state === "error" ? "error" : "success"} role={state === "error" ? "alert" : "status"}>{message}</p> : null}
          <aside><b>Share responsibly</b><p>Only publish words or images you have permission to share. Avoid names and private clinical details unless the person clearly agreed.</p></aside>
        </section>

        <section className="testimonial-library">
          <header><div><span>Saved {format} testimonials</span><h2>{items.length ? "Choose what visitors see" : "Nothing added yet"}</h2></div><small>Use arrows to set slider order</small></header>
          {items.length ? <div>{items.map((item, index) => (
            <article key={item._id} className={item.visible ? "visible" : "hidden"}>
              <div className="testimonial-item-content">
                {item.kind === "image" && item.imageUrl ? <Image src={item.imageUrl} alt="Uploaded testimonial" width={160} height={110} unoptimized /> : <blockquote>“{item.quote}”</blockquote>}
                <p>{item.attribution || "No name or context"}</p>
              </div>
              <div className="testimonial-item-controls">
                <label><input type="checkbox" checked={item.visible} onChange={() => void setVisible({ id: item._id, visible: !item.visible })} /><span>{item.visible ? "Showing" : "Hidden"}</span></label>
                <button type="button" aria-label="Move testimonial up" disabled={index === 0} onClick={() => void move({ id: item._id, direction: "up" })}>↑</button>
                <button type="button" aria-label="Move testimonial down" disabled={index === items.length - 1} onClick={() => void move({ id: item._id, direction: "down" })}>↓</button>
                <button type="button" className="delete" onClick={() => void deleteItem(item._id)}>Delete</button>
              </div>
            </article>
          ))}</div> : <div className="testimonial-empty"><span>“ ”</span><p>Add your first {format} testimonial using the form.</p></div>}
        </section>
      </div>
    </main>
  );
}
