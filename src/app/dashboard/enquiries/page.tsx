"use client";

import { AuthGate } from "@/components/auth/auth-gate";
import { ActivitySummary } from "@/components/dashboard/activity-summary";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { EnquiryInbox } from "@/components/enquiries/enquiry-inbox";

export default function EnquiriesPage() {
  return (
    <AuthGate>
      <DashboardShell>
        <main className="activity-page">
          <header>
            <p>Activity</p>
            <h1>
              See what is happening,
              <br />
              <em>then respond.</em>
            </h1>
          </header>
          <ActivitySummary />
          <EnquiryInbox embedded />
        </main>
      </DashboardShell>
    </AuthGate>
  );
}
