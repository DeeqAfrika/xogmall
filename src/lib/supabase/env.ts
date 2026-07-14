export function getSupabasePublicKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && getSupabasePublicKey(),
  );
}

export function hasSupabaseAdminEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      getSupabasePublicKey() &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function requireSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = getSupabasePublicKey();

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and a publishable or anon key.",
    );
  }

  return { url, key };
}

export function requireSupabaseAdminEnv() {
  const { url } = requireSupabaseEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error("Supabase admin access is not configured. Add SUPABASE_SERVICE_ROLE_KEY.");
  }

  return { url, serviceRoleKey };
}
