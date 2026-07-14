import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

type AdminClaims = {
  sub?: string;
  app_metadata?: {
    role?: string;
  };
};

export async function getAdminRouteContext() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims as AdminClaims | undefined;

  if (!claims?.sub) {
    return { status: "unauthenticated" as const };
  }

  if (claims.app_metadata?.role !== "admin") {
    return { status: "forbidden" as const };
  }

  return {
    status: "ok" as const,
    userId: claims.sub,
    supabase,
    downloadClient: hasSupabaseAdminEnv() ? createAdminClient() : supabase,
  };
}
