"use client";

import { AuthGate } from "@/components/auth/auth-gate";
import { BlogList } from "@/components/blog/blog-list";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function BlogPage() { return <AuthGate><DashboardShell><BlogList /></DashboardShell></AuthGate>; }
