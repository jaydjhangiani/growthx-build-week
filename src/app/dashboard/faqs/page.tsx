"use client";

import { Suspense } from "react";
import { AuthGate } from "@/components/auth/auth-gate";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { WebsiteEditor } from "@/components/website/website-editor";

export default function FaqEditorPage() {
  return (
    <AuthGate>
      <DashboardShell>
        <Suspense
          fallback={
            <div className="website-editor-loading">Opening your FAQs…</div>
          }
        >
          <WebsiteEditor defaultPanel="faqs" />
        </Suspense>
      </DashboardShell>
    </AuthGate>
  );
}
