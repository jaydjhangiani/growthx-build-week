"use client";

import { AuthGate } from "@/components/auth/auth-gate";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { EnquiryInbox } from "@/components/enquiries/enquiry-inbox";

export default function EnquiriesPage() {
  return <AuthGate><DashboardShell><EnquiryInbox /></DashboardShell></AuthGate>;
}
