import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Create your Releaf account" };

export default function SignUpPage() {
  return <div className="auth-card"><p className="auth-kicker">Create your account</p><h1>Let’s shape your<br /><em>online practice.</em></h1><p className="auth-intro">Start with a few details. Your progress will be saved as you go.</p><AuthForm mode="signUp" /></div>;
}
