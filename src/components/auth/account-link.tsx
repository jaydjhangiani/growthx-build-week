"use client";

import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import Link from "next/link";

export function AccountLink({ className }: { className?: string }) {
  return <><AuthLoading><span className={className}>Checking account…</span></AuthLoading><Authenticated><Link className={className} href="/dashboard">Dashboard</Link></Authenticated><Unauthenticated><Link className={className} href="/sign-in">Sign in</Link></Unauthenticated></>;
}
