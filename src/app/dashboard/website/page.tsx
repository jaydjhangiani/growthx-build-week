"use client";

import { AuthGate } from "@/components/auth/auth-gate";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { WebsiteEditor } from "@/components/website/website-editor";
import { Suspense } from "react";

export default function WebsiteEditorPage() {
  return (
    <AuthGate>
      <DashboardShell>
        <Suspense
          fallback={
            <div className="website-editor-loading">
              Opening your website editor…
            </div>
          }
        >
          <WebsiteEditor />
        </Suspense>
      </DashboardShell>
    </AuthGate>
  );
}
