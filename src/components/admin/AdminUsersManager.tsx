"use client";

import { ShieldCheck } from "@phosphor-icons/react";
import { useActionState, useEffect, useRef } from "react";
import { createAdminUser, type CreateAdminUserState } from "@/app/admin/users/actions";
import type { AdminUserSummary } from "@/lib/types";

const initialState: CreateAdminUserState = {
  status: "idle",
  message: "",
};

export function AdminUsersManager({ users }: { users: AdminUserSummary[] }) {
  const [state, action, pending] = useActionState(createAdminUser, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
      <form ref={formRef} action={action} className="rounded-2xl border border-line bg-white p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Create admin</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Full admin access</h2>
          </div>
          <ShieldCheck size={26} weight="duotone" className="text-brand" />
        </div>

        <p className="mt-4 text-sm leading-6 text-muted">
          Creates a Supabase Auth user, confirms their email, and stores full admin permissions in app metadata.
        </p>

        <label className="mt-7 block">
          <span className="text-sm font-semibold text-ink">Email address</span>
          <input name="email" type="email" required autoComplete="email" className="mt-2 h-12 w-full rounded-xl border border-line px-4 text-ink outline-none focus:border-brand focus:ring-3 focus:ring-blue-100" />
        </label>

        <label className="mt-5 block">
          <span className="text-sm font-semibold text-ink">Temporary password</span>
          <input name="password" type="password" required minLength={8} autoComplete="new-password" className="mt-2 h-12 w-full rounded-xl border border-line px-4 text-ink outline-none focus:border-brand focus:ring-3 focus:ring-blue-100" />
        </label>

        <label className="mt-5 block">
          <span className="text-sm font-semibold text-ink">Name <span className="font-normal text-muted">(optional)</span></span>
          <input name="full_name" type="text" autoComplete="name" className="mt-2 h-12 w-full rounded-xl border border-line px-4 text-ink outline-none focus:border-brand focus:ring-3 focus:ring-blue-100" />
        </label>

        {state.status === "error" && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{state.message}</p>}
        {state.status === "success" && <p role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{state.message}</p>}

        <button type="submit" disabled={pending} className="focus-ring mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark disabled:cursor-wait disabled:opacity-60">
          {pending ? "Creating..." : "Create Full Admin"}
        </button>
      </form>

      <div className="rounded-2xl border border-line bg-white">
        <div className="border-b border-line p-6">
          <p className="eyebrow">Admin users</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Current access</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Users with role <code className="font-mono">admin</code> can manage rates, content, agents, and create other admins.</p>
        </div>

        {users.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-muted">No full admin users were returned by Supabase Auth.</p>
        ) : (
          <div className="divide-y divide-line">
            {users.map((user) => (
              <article key={user.id} className="p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-ink">{user.email}</h3>
                    {user.full_name && <p className="mt-1 text-sm text-muted">{user.full_name}</p>}
                    <p className="mt-2 text-xs leading-5 text-muted">
                      Created {new Date(user.created_at).toLocaleString("en-GB")}
                      {user.last_sign_in_at ? ` · Last sign in ${new Date(user.last_sign_in_at).toLocaleString("en-GB")}` : ""}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${user.role === "admin" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                    {user.role}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
