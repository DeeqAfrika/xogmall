import type { Metadata } from "next";
import { AdminAccessDeniedNotice, AdminSetupNotice } from "@/components/admin/AdminNotice";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminUsersManager } from "@/components/admin/AdminUsersManager";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { getAdminContext } from "@/lib/admin";
import type { AdminUserSummary } from "@/lib/types";

export const metadata: Metadata = { title: "Manage Admin Users", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type AdminUserRpcRow = {
  id: string;
  email: string | null;
  role: string | null;
  full_name: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
};

export default async function AdminUsersPage() {
  const admin = await getAdminContext();

  if (admin.status === "setup") {
    return <AdminShell><AdminSetupNotice /></AdminShell>;
  }

  if (admin.status === "denied") {
    return <AdminShell actions={<LogoutButton />}><AdminAccessDeniedNotice /></AdminShell>;
  }

  const { data, error } = await admin.supabase.rpc("list_admin_auth_users");
  const rows = (data ?? []) as AdminUserRpcRow[];
  const users: AdminUserSummary[] = error
    ? []
    : rows.filter((user) => user.role === "admin").map((user) => ({
      id: user.id,
      email: user.email || "No email",
      role: "admin",
      full_name: user.full_name,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      email_confirmed_at: user.email_confirmed_at,
    }));

  return (
    <AdminShell active="users" actions={<LogoutButton />}>
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Admin users</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-ink sm:text-5xl">Manage full admins</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
            Create full admin users who can manage rates, agent locations, page content, and other admins.
          </p>
        </div>
      </div>

      {error && <p role="alert" className="mb-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Could not load users: {error.message}</p>}
      <AdminUsersManager users={users} />
    </AdminShell>
  );
}
