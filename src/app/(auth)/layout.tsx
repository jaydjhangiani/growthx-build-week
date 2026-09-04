import Link from "next/link";
import { ReleafLogo } from "@/components/brand/releaf-logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="auth-shell">
      <section className="auth-story">
        <Link className="releaf-wordmark" href="/" aria-label="Releaf home">
          <ReleafLogo priority />
        </Link>
        <div className="auth-story-copy">
          <p className="eyebrow light">
            Your practice, in one thoughtful place
          </p>
          <h2>
            From what you know
            <br />
            to a website that
            <br />
            <em>feels like you.</em>
          </h2>
          <p>
            We’ll guide you through the words, services, and details patients
            need before they reach out.
          </p>
        </div>
        <ol className="website-path" aria-label="Website creation steps">
          <li className="active">
            <span>1</span>About your practice
          </li>
          <li>
            <span>2</span>Choose a direction
          </li>
          <li>
            <span>3</span>Edit and publish
          </li>
        </ol>
      </section>
      <section className="auth-panel">
        {children}
        <p className="auth-footnote">
          Your information stays private until you publish.
        </p>
      </section>
    </main>
  );
}
