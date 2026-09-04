import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Sign in to Releaf" };

export default function SignInPage() {
  return <div className="auth-card"><p className="auth-kicker">Welcome back</p><h1>Continue building<br /><em>your practice.</em></h1><p className="auth-intro">Sign in to return to your website and enquiries.</p><AuthForm mode="signIn" /></div>;
}
