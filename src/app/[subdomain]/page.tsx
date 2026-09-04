"use client";

import { useParams } from "next/navigation";
import { PublishedWebsite } from "@/components/website/published-website";

export default function PublicSitePage() {
  const params = useParams<{ subdomain: string }>();
  return <PublishedWebsite subdomain={params.subdomain} />;
}
