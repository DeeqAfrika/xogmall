import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAdminEnv } from "./env";

let adminClient: ReturnType<typeof createClient> | null = null;

export function createAdminClient() {
  if (!adminClient) {
    const { url, serviceRoleKey } = requireSupabaseAdminEnv();

    adminClient = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return adminClient;
}
