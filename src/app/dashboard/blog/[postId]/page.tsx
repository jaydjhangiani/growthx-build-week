"use client";

import { AuthGate } from "@/components/auth/auth-gate";
import { BlogEditor } from "@/components/blog/blog-editor";

export default function BlogEditorPage() { return <AuthGate><BlogEditor /></AuthGate>; }
