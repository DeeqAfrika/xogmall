"use client";

import { LockKey, SignIn } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const configured = hasSupabaseEnv();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!configured) {
      setError("Supabase environment variables are not configured.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-line bg-white p-6 shadow-[0_20px_60px_rgba(16,33,63,0.1)] sm:p-8">
      <span className="flex size-12 items-center justify-center rounded-full bg-sky-soft text-brand">
        <LockKey size={24} weight="duotone" />
      </span>
      <h1 className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-ink">Admin sign in</h1>
      <p className="mt-3 text-sm leading-6 text-muted">Use your Hogmall staff email and password to manage rates, agent locations, and editable website content.</p>

      <label className="mt-7 block">
        <span className="text-sm font-semibold text-ink">Email address</span>
        <input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-line px-4 text-ink outline-none focus:border-brand focus:ring-3 focus:ring-red-100" />
      </label>
      <label className="mt-5 block">
        <span className="text-sm font-semibold text-ink">Password</span>
        <input type="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-line px-4 text-ink outline-none focus:border-brand focus:ring-3 focus:ring-red-100" />
      </label>

      {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <button type="submit" disabled={loading || !configured} className="focus-ring mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50">
        <SignIn size={18} weight="bold" />
        {loading ? "Signing in…" : "Sign in"}
      </button>
      {!configured && <p className="mt-4 text-center text-xs leading-5 text-amber-700">Add the Supabase variables from <code className="font-mono">.env.example</code> to enable login.</p>}
    </form>
  );
}
