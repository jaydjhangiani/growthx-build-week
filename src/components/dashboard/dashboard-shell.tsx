"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ReleafLogo } from "@/components/brand/releaf-logo";

const navigation = [
  { href: "/dashboard", label: "Overview", mark: "⌂" },
  { href: "/onboarding", label: "Practice profile", mark: "○" },
  { href: "/dashboard/website", label: "Website editor", mark: "▣" },
  { href: "/dashboard/blog", label: "Blog posts", mark: "✎" },
  { href: "/dashboard/substack", label: "Blog source", mark: "↗" },
  { href: "/dashboard/testimonials", label: "Testimonials", mark: "“" },
  { href: "/dashboard/calendly", label: "Calendly", mark: "◷" },
  { href: "/dashboard/enquiry-form", label: "Enquiry form", mark: "◇" },
  { href: "/dashboard/enquiries", label: "Enquiries", mark: "✉" },
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
