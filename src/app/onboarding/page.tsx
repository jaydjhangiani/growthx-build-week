"use client";

import { AuthGate } from "@/components/auth/auth-gate";
import { ProductLoading } from "@/components/auth/auth-gate";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function OnboardingPage() {
  return <AuthGate><DashboardShell><OnboardingDraft /></DashboardShell></AuthGate>;
}

function OnboardingDraft() {
  const draft = useQuery(api.onboarding.getDraft);
  if (draft === undefined) return <ProductLoading message="Opening your saved profile…" />;
  return <OnboardingForm draft={draft} />;
}
