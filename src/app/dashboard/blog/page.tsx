"use client";

import { AuthGate } from "@/components/auth/auth-gate";
import { BlogList } from "@/components/blog/blog-list";
import { SubstackSettings } from "@/components/blog/substack-settings";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function BlogPage() {
  return (
    <AuthGate>
      <DashboardShell>
        <SubstackSettings nativeContent={<BlogList />} />
      </DashboardShell>
    </AuthGate>
  );
}
