import { redirect } from "next/navigation";

export default function PublishPage() {
  redirect("/dashboard/website?panel=publish");
}
