import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

type AdminClaims = {
  sub?: string;
  app_metadata?: {
    role?: string;
  };
};

export async function getAdminContext() {
  if (!hasSupabaseEnv()) {
    return { status: "setup" as const };
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims as AdminClaims | undefined;

  if (!claims?.sub) {
    redirect("/admin/login");
  }

  if (claims.app_metadata?.role !== "admin") {
    return { status: "denied" as const, supabase, userId: claims.sub };
  }

  return { status: "ok" as const, supabase, userId: claims.sub };
}
