"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOutButton() {
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    if (pending) return;
    setPending(true);
    await signOut();
    router.replace("/sign-in");
  }

  return <button className="quiet-button" type="button" onClick={handleSignOut} disabled={pending}>{pending ? "Signing out…" : "Sign out"}</button>;
}
