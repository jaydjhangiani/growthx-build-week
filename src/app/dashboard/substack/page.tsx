"use client";

import { AuthGate } from "@/components/auth/auth-gate";
import { SubstackSettings } from "@/components/blog/substack-settings";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function SubstackPage() {
  return (
    <AuthGate>
      <DashboardShell>
        <SubstackSettings />
      </DashboardShell>
    </AuthGate>
  );
}
