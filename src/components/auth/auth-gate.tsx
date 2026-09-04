"use client";

import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ReleafLogo } from "@/components/brand/releaf-logo";

function SignedOutRedirect() {
  const router = useRouter();
  useEffect(() => router.replace("/sign-in"), [router]);
  return <ProductLoading message="Taking you to sign in…" />;
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthLoading>
        <ProductLoading message="Checking your account…" />
      </AuthLoading>
      <Unauthenticated>
        <SignedOutRedirect />
      </Unauthenticated>
      <Authenticated>{children}</Authenticated>
    </>
  );
}

export function ProductLoading({ message }: { message: string }) {
  return (
    <main className="product-loading">
      <ReleafLogo className="releaf-loading-logo" priority />
      <p>{message}</p>
    </main>
  );
}
