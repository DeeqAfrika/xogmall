import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function AdminOnboardingRedirectPage() {
  redirect("/admin/agents?view=applications");
}
