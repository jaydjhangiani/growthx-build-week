"use client";

import { AuthGate } from "@/components/auth/auth-gate";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { TestimonialSettings } from "@/components/testimonials/testimonial-settings";

export default function TestimonialsPage() {
  return (
    <AuthGate>
      <DashboardShell>
        <TestimonialSettings />
      </DashboardShell>
    </AuthGate>
  );
}
