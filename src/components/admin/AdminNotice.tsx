export function AdminSetupNotice() {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-8">
      <p className="eyebrow !text-amber-700">Setup required</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">Connect Supabase to manage the site.</h1>
      <p className="mt-4 text-sm leading-6 text-amber-900">
        Add <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="font-mono">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> or <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in Vercel. Then apply the Supabase migrations and create the first admin user.
      </p>
    </div>
  );
}

export function AdminAccessDeniedNotice() {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-8">
      <p className="eyebrow !text-red-700">Access denied</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">This account is not an admin.</h1>
      <p className="mt-4 text-sm leading-6 text-red-800">
        Ask a Supabase project owner to set <code className="font-mono">app_metadata.role</code> to <code className="font-mono">admin</code> for this user, then sign in again.
      </p>
    </div>
  );
}
