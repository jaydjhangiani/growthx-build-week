import Link from "next/link";
import { AccountLink } from "@/components/auth/account-link";
import { ReleafLogo } from "@/components/brand/releaf-logo";
import { samplePractice } from "@/content/sample-practice";

export default function ReleafHomePage() {
  return (
    <main className="releaf-home">
      <header className="releaf-nav">
        <Link className="releaf-wordmark" href="/" aria-label="Releaf home">
          <ReleafLogo priority />
        </Link>
        <nav aria-label="Releaf navigation">
          <a href="#how-it-works">How it works</a>
          <Link href="/demo">See an example</Link>
        </nav>
        <AccountLink className="releaf-nav-action" />
      </header>
      <section className="releaf-hero">
        <div className="releaf-hero-copy">
          <p className="eyebrow">
            A website builder for independent psychologists
          </p>
          <h1>
            Your practice deserves
            <br />
            more than an <em>Instagram bio.</em>
          </h1>
          <p>
            Turn what you already know about your practice into a thoughtful
            website—with your services, articles, availability, and ways to get
            in touch.
          </p>
          <div className="releaf-hero-actions">
            <Link className="button button-primary" href="/sign-up">
              Create my website <span aria-hidden="true">→</span>
            </Link>
            <Link className="text-link" href="/demo">
              Explore an example website <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <p className="releaf-calm-note">
            <span>✦</span> No blank canvas. No design experience needed.
          </p>
        </div>
        <div className="releaf-demo-window">
          <div className="demo-browser">
            <span />
            <span />
            <span />
            <small>your-name.releaf</small>
          </div>
          <div className="demo-page-preview">
            <div>
              <small>Counselling psychologist · Mumbai</small>
              <h2>{samplePractice.headline}</h2>
              <p>{samplePractice.heroSupport}</p>
              <span>See available times →</span>
            </div>
          </div>
          <Link href="/demo">
            Open the full sample website <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
      <section className="releaf-how" id="how-it-works">
        <p className="eyebrow">From practice notes to published website</p>
        <div className="releaf-how-heading">
          <h2>
            Three considered steps.
            <br />
            <em>Nothing technical.</em>
          </h2>
          <p>
            Releaf begins with questions about your real practice—not a page of
            empty boxes and design controls.
          </p>
        </div>
        <ol>
          <li>
            <span>01</span>
            <h3>Tell us about your practice</h3>
            <p>
              Add your background, approach, services, fees, and the people you
              help.
            </p>
          </li>
          <li>
            <span>02</span>
            <h3>Choose your direction</h3>
            <p>
              Review three website options shaped around your tone and
              preferences.
            </p>
          </li>
          <li>
            <span>03</span>
            <h3>Make it yours and publish</h3>
            <p>
              Edit the words, change the look, connect booking, and share one
              link.
            </p>
          </li>
        </ol>
      </section>
      <section className="releaf-final-cta">
        <p className="eyebrow light">Begin with what you know</p>
        <h2>
          Your practice already has a story.
          <br />
          <em>Give it a place to live.</em>
        </h2>
        <Link className="button" href="/sign-up">
          Create my website <span aria-hidden="true">→</span>
        </Link>
      </section>
      <footer className="releaf-footer">
        <div className="releaf-wordmark inverse">
          <ReleafLogo />
        </div>
        <p>Thoughtful websites for independent psychologists.</p>
        <AccountLink />
      </footer>
    </main>
  );
}
