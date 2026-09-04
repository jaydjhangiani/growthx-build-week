"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { AuthGate, ProductLoading } from "@/components/auth/auth-gate";
import { CalendlySettings } from "@/components/booking/calendly-settings";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function CalendlyPage() {
  const settings = useQuery(api.booking.get);
  return <AuthGate><DashboardShell>{settings === undefined ? <ProductLoading message="Opening your booking settings…" /> : <CalendlySettings initialUrl={settings.calendlyUrl} />}</DashboardShell></AuthGate>;
}
