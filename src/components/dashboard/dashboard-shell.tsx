"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ReleafLogo } from "@/components/brand/releaf-logo";

const navigation = [
  { href: "/dashboard", label: "Overview", mark: "⌂" },
  { href: "/dashboard/enquiries", label: "Activity", mark: "✉" },
  { href: "/onboarding", label: "Practice profile", mark: "○" },
  { href: "/dashboard/blog", label: "Blog", mark: "✎" },
  { href: "/dashboard/testimonials", label: "Testimonials", mark: "“" },
  { href: "/dashboard/faqs", label: "FAQs", mark: "?" },
  { href: "/dashboard/calendly", label: "Calendly", mark: "◷" },
  { href: "/dashboard/enquiry-form", label: "Enquiry form", mark: "◇" },
  { href: "/dashboard/website", label: "Website builder", mark: "▣" },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <main className="dashboard-shell">
      <aside className="dashboard-nav">
        <Link
          className="releaf-wordmark"
          href="/dashboard"
          aria-label="Open dashboard"
        >
          <ReleafLogo priority />
        </Link>
        <nav>
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                pathname === item.href ||
                (item.href.startsWith("/dashboard/") &&
                  pathname.startsWith(item.href))
                  ? "active"
                  : ""
              }
            >
              <span>{item.mark}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div>
          <SignOutButton />
        </div>
      </aside>
      <section className="dashboard-content">{children}</section>
    </main>
  );
}
