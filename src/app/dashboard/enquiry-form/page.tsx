"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { AuthGate, ProductLoading } from "@/components/auth/auth-gate";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { EnquiryBuilder } from "@/components/enquiries/enquiry-builder";

export default function EnquiryFormPage() {
  const config = useQuery(api.enquiries.getConfig);
  return <AuthGate><DashboardShell>{config === undefined ? <ProductLoading message="Opening your enquiry form…" /> : <EnquiryBuilder initialFields={config.fields} />}</DashboardShell></AuthGate>;
}
