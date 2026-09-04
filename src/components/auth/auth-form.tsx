"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { signInSchema, signUpSchema } from "@/lib/auth-validation";

type Mode = "signUp" | "signIn";
type FieldErrors = Partial<Record<"name" | "email" | "password", string>>;

function authErrorMessage(error: unknown, mode: Mode) {
  const message = error instanceof Error ? error.message : "";
  if (/already exists|account.*exists/i.test(message)) return "An account with this email already exists. Sign in instead.";
  if (/invalid.*secret|invalid.*password|could not verify|no account/i.test(message)) return "That email or password does not match.";
  return mode === "signUp" ? "We couldn’t create your account. Please try again." : "We couldn’t sign you in. Please try again.";
}

export function AuthForm({ mode }: { mode: Mode }) {
  const { signIn } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const isSignUp = mode === "signUp";

  useEffect(() => {
    if (!isAuthenticated) return;
    router.replace(isSignUp ? "/onboarding" : "/dashboard");
    router.refresh();
  }, [isAuthenticated, isSignUp, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const values = {
      ...(isSignUp ? { name: String(data.get("name") ?? "") } : {}),
      email: String(data.get("email") ?? "").trim().toLowerCase(),
      password: String(data.get("password") ?? ""),
    };
    const result = (isSignUp ? signUpSchema : signInSchema).safeParse(values);

    if (!result.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FieldErrors;
        if (!nextErrors[field]) nextErrors[field] = issue.message;
      }
      setFieldErrors(nextErrors);
      return;
    }

    setPending(true);
    setFieldErrors({});
    setFormError("");
    try {
      const payload = new FormData();
      payload.set("flow", mode);
      payload.set("email", values.email);
      payload.set("password", values.password);
      if (isSignUp) payload.set("name", values.name ?? "");
      await signIn("password", payload);
    } catch (error) {
      setFormError(authErrorMessage(error, mode));
      setPending(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {isSignUp ? (
        <label>Full name<input name="name" autoComplete="name" placeholder="Diva Mehta" aria-invalid={Boolean(fieldErrors.name)} />{fieldErrors.name ? <span className="field-error">{fieldErrors.name}</span> : null}</label>
      ) : null}
      <label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@example.com" aria-invalid={Boolean(fieldErrors.email)} />{fieldErrors.email ? <span className="field-error">{fieldErrors.email}</span> : null}</label>
      <label>Password<input name="password" type="password" autoComplete={isSignUp ? "new-password" : "current-password"} placeholder={isSignUp ? "8+ characters, number and symbol" : "Your password"} aria-invalid={Boolean(fieldErrors.password)} />{fieldErrors.password ? <span className="field-error">{fieldErrors.password}</span> : null}</label>
      {formError ? <p className="form-error" role="alert">{formError}</p> : null}
      <button className="auth-submit" disabled={pending} type="submit">
        <span>{pending ? (isSignUp ? "Creating your space…" : "Signing you in…") : (isSignUp ? "Create my website" : "Sign in")}</span><span aria-hidden="true">→</span>
      </button>
      <p className="auth-switch">{isSignUp ? "Already have an account?" : "New to Releaf?"} <Link href={isSignUp ? "/sign-in" : "/sign-up"}>{isSignUp ? "Sign in" : "Create your account"}</Link></p>
    </form>
  );
}
