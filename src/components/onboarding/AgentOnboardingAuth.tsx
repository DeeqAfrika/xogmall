"use client";

import { LockKey, SignIn, UserPlus } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AgentOnboardingAuth() {
  const router = useRouter();
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();
    const normalizedEmail = email.trim().toLowerCase();

    if (mode === "signup") {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        setMessage("Account created. Opening your agent registration form...");
        router.refresh();
        return;
      }

      setError("Account created, but Supabase email confirmation is still switched on. For this private onboarding flow, turn off Confirm Email in Supabase Auth so new agents are logged in immediately after registering.");
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.refresh();
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
      <div className="rounded-3xl bg-navy p-8 text-white shadow-[0_24px_70px_rgba(76,5,8,0.22)]">
        <p className="eyebrow !text-red-300">Private onboarding</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
          Become a Hogmall agent.
        </h1>
        <p className="mt-5 text-sm leading-7 text-red-100">
          Create an account first, then you will be logged in and taken straight to the agent form. You can return to this same private link later to sign in and update your details.
        </p>
        <ul className="mt-8 grid gap-3 text-sm leading-6 text-red-100">
          <li><strong className="text-white">1.</strong> Register with email and password</li>
          <li><strong className="text-white">2.</strong> Complete the agent registration form</li>
          <li><strong className="text-white">3.</strong> Upload verification documents</li>
          <li><strong className="text-white">4.</strong> Sign back in anytime to update missing details</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="rounded-3xl border border-line bg-white p-6 shadow-[0_20px_60px_rgba(16,33,63,0.1)] sm:p-8">
        <span className="flex size-12 items-center justify-center rounded-full bg-sky-soft text-brand">
          <LockKey size={24} weight="duotone" />
        </span>
        <h2 className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-ink">
          {mode === "signup" ? "Create your onboarding account" : "Sign in to continue"}
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          No public portal is required. New agents register here first, then use the same email and password whenever they return to complete or update their application.
        </p>

        {mode === "signup" && (
          <label className="mt-7 block">
            <span className="text-sm font-semibold text-ink">Full name</span>
            <input
              type="text"
              required
              autoComplete="name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="mt-2 h-12 w-full rounded-xl border border-line px-4 text-ink outline-none focus:border-brand focus:ring-3 focus:ring-red-100"
            />
          </label>
        )}

        <label className={mode === "signup" ? "mt-5 block" : "mt-7 block"}>
          <span className="text-sm font-semibold text-ink">Email address</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 h-12 w-full rounded-xl border border-line px-4 text-ink outline-none focus:border-brand focus:ring-3 focus:ring-red-100"
          />
        </label>

        <label className="mt-5 block">
          <span className="text-sm font-semibold text-ink">Password</span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 h-12 w-full rounded-xl border border-line px-4 text-ink outline-none focus:border-brand focus:ring-3 focus:ring-red-100"
          />
        </label>

        {mode === "signup" && (
          <label className="mt-5 block">
            <span className="text-sm font-semibold text-ink">Confirm password</span>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="mt-2 h-12 w-full rounded-xl border border-line px-4 text-ink outline-none focus:border-brand focus:ring-3 focus:ring-red-100"
            />
          </label>
        )}

        {mode === "signup" && (
          <p className="mt-4 rounded-xl bg-sky-soft px-4 py-3 text-xs leading-5 text-muted">
            After registration, the form opens immediately when Supabase Auth email confirmation is disabled for this private onboarding flow.
          </p>
        )}

        {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {message && <p role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="focus-ring mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {mode === "signup" ? <UserPlus size={18} weight="bold" /> : <SignIn size={18} weight="bold" />}
          {loading ? "Please wait..." : mode === "signup" ? "Create account" : "Sign in"}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode((current) => current === "signup" ? "signin" : "signup");
            setError(null);
            setMessage(null);
            setPassword("");
            setConfirmPassword("");
          }}
          className="focus-ring mt-4 w-full rounded-lg text-center text-sm font-semibold text-brand hover:text-brand-dark"
        >
          {mode === "signup" ? "Already have an account? Sign in" : "Need an account? Create one"}
        </button>
      </form>
    </div>
  );
}
