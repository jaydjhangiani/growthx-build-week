"use client";

import { FormEvent, type ReactNode, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { normalizeSubstackUrl } from "@/lib/substack";

type RequestState = "idle" | "working" | "success" | "error";

export function SubstackSettings({ nativeContent }: { nativeContent?: ReactNode }) {
  const settings = useQuery(api.substack.get);
  const refreshFeed = useAction(api.substack.refresh);
  const chooseSource = useMutation(api.substack.chooseSource);
  const [url, setUrl] = useState("");
  const [requestState, setRequestState] = useState<RequestState>("idle");
  const [sourceState, setSourceState] = useState<RequestState>("idle");
  const [viewSource, setViewSource] = useState<"native" | "substack" | null>(
    null,
  );
  const [message, setMessage] = useState("");

  if (settings === undefined)
    return <div className="substack-loading">Opening blog sources…</div>;

  const currentSettings = settings;
  const inputValue = url || settings.publicationUrl || "";
  const connected = Boolean(settings.lastSuccessfulRefresh);
  const visibleSource = viewSource ?? settings.source;

  async function connect(event: FormEvent) {
    event.preventDefault();
    if (requestState === "working") return;
    const checked = normalizeSubstackUrl(inputValue);
    if (!checked.ok) {
      setRequestState("error");
      setMessage(checked.error);
      return;
    }
    setRequestState("working");
    setMessage("");
    try {
      const result = await refreshFeed({
        publicationUrl: checked.publicationUrl,
        activate: true,
      });
      setUrl(checked.publicationUrl);
      setRequestState("success");
      setMessage(`${result.postCount} public posts imported.`);
    } catch (error) {
      setRequestState("error");
      setMessage(readableError(error));
    }
  }

  async function refresh() {
    if (!currentSettings.publicationUrl || requestState === "working") return;
    setRequestState("working");
    setMessage("");
    try {
      const result = await refreshFeed({
        publicationUrl: currentSettings.publicationUrl,
      });
      setRequestState("success");
      setMessage(`${result.postCount} public posts refreshed.`);
    } catch (error) {
      setRequestState("error");
      setMessage(readableError(error));
    }
  }

  async function selectSource(source: "native" | "substack") {
    if (sourceState === "working") return;
    setViewSource(source);
    if (source === "substack" && !connected) {
      setMessage("");
      return;
    }
    if (source === currentSettings.source) return;
    setSourceState("working");
    setMessage("");
    try {
      await chooseSource({ source });
      setSourceState("success");
      setMessage(
        source === "native"
          ? "Your native articles will appear on the website."
          : "Your imported Substack posts will appear on the website.",
      );
    } catch (error) {
      setViewSource(null);
      setSourceState("error");
      setMessage(readableError(error));
    }
  }

  return (
    <div className="substack-settings">
      <header>
        <div>
          <p>Blog source</p>
          <h1>
            Bring your writing
            <br />
            <em>into one place.</em>
          </h1>
        </div>
        <span>
          {settings.source === "substack" ? "Substack active" : "Native active"}
        </span>
      </header>

      <section className="blog-source-choices" aria-label="Choose blog source">
        <button
          type="button"
          className={visibleSource === "native" ? "selected" : ""}
          aria-pressed={visibleSource === "native"}
          disabled={sourceState === "working"}
          onClick={() => void selectSource("native")}
        >
          <span>01</span>
          <b>Write in Releaf</b>
          <small>Use the Markdown editor and publish articles here.</small>
          <i>
            {settings.source === "native" ? "Active source" : "Use Native blog"}
          </i>
        </button>
        <button
          type="button"
          className={visibleSource === "substack" ? "selected" : ""}
          aria-pressed={visibleSource === "substack"}
          disabled={sourceState === "working"}
          onClick={() => void selectSource("substack")}
        >
          <span>02</span>
          <b>Import from Substack</b>
          <small>
            Show your latest public posts and open them on Substack.
          </small>
          <i>
            {settings.source === "substack"
              ? "Active source"
              : connected
                ? "Use Substack"
                : "Connect below first"}
          </i>
        </button>
      </section>

      {visibleSource === "native" ? nativeContent : (
      <div className="substack-workspace">
        <section className="substack-connect-card">
          <header>
            <span>Connection</span>
            {connected ? (
              <small>Connected</small>
            ) : (
              <small>Not connected</small>
            )}
          </header>
          <form onSubmit={(event) => void connect(event)} noValidate>
            <label htmlFor="substack-url">Substack publication URL</label>
            <input
              id="substack-url"
              type="url"
              inputMode="url"
              value={inputValue}
              onChange={(event) => {
                setUrl(event.target.value);
                setRequestState("idle");
                setMessage("");
              }}
              placeholder="https://your-publication.substack.com"
              aria-invalid={requestState === "error"}
            />
            <small>
              Paste the publication homepage. Releaf reads its public `/feed`.
            </small>
            <div>
              <button type="submit" disabled={requestState === "working"}>
                {requestState === "working"
                  ? "Checking feed…"
                  : connected
                    ? "Update connection"
                    : "Connect and use Substack"}
              </button>
              {connected ? (
                <button
                  className="substack-refresh"
                  type="button"
                  disabled={requestState === "working"}
                  onClick={() => void refresh()}
                >
                  Refresh posts
                </button>
              ) : null}
            </div>
          </form>
          {message || settings.lastError ? (
            <p
              className={
                requestState === "error" || settings.lastError
                  ? "error"
                  : "success"
              }
              role={requestState === "error" ? "alert" : "status"}
            >
              {message || settings.lastError}
              {settings.lastError && settings.posts.length
                ? " Your previously imported posts are still safe."
                : ""}
            </p>
          ) : null}
          {connected ? (
            <dl>
              <div>
                <dt>Last refreshed</dt>
                <dd>{formatDate(settings.lastSuccessfulRefresh)}</dd>
              </div>
              <div>
                <dt>Posts saved</dt>
                <dd>{settings.posts.length}</dd>
              </div>
            </dl>
          ) : null}
        </section>

        <section className="substack-post-preview">
          <header>
            <div>
              <span>Imported posts</span>
              <h2>
                {settings.posts.length
                  ? "Latest from your feed"
                  : "Your posts will appear here"}
              </h2>
            </div>
            {settings.publicationUrl ? (
              <a
                href={settings.publicationUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open Substack ↗
              </a>
            ) : null}
          </header>
          {settings.posts.length ? (
            <div>
              {settings.posts.slice(0, 6).map((post) => (
                <article key={post.externalId}>
                  {post.imageUrl ? (
                    // The browser loads RSS images directly; Releaf does not fetch them server-side.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.imageUrl}
                      alt=""
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span aria-hidden="true">Aa</span>
                  )}
                  <div>
                    <time>
                      {post.publishedAt
                        ? formatDate(post.publishedAt)
                        : "Published"}
                    </time>
                    <h3>{post.title}</h3>
                    <p>
                      {post.summary || "Open the original post to read more."}
                    </p>
                    <a href={post.url} target="_blank" rel="noreferrer">
                      Read on Substack ↗
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="substack-empty">
              <span>↗</span>
              <p>
                Connect a public Substack publication to preview its latest
                posts.
              </p>
            </div>
          )}
        </section>
      </div>
      )}
    </div>
  );
}

function formatDate(value: number | undefined) {
  if (!value) return "Not yet";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function readableError(error: unknown) {
  if (!(error instanceof Error))
    return "The Substack feed could not be refreshed.";
  const convexMessage = error.message.match(/ConvexError:\s*([^\n]+)/)?.[1];
  return (
    convexMessage ||
    error.message ||
    "The Substack feed could not be refreshed."
  );
}
