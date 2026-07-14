import type { Metadata } from "next";
import { AdminContentManager } from "@/components/admin/AdminContentManager";
import { AdminAccessDeniedNotice, AdminSetupNotice } from "@/components/admin/AdminNotice";
import { AdminShell } from "@/components/admin/AdminShell";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { getAdminContext } from "@/lib/admin";
import { mergeContentRows } from "@/lib/site-content";
import type { SiteContent } from "@/lib/types";

export const metadata: Metadata = { title: "Manage Page Content", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const admin = await getAdminContext();

  if (admin.status === "setup") {
    return <AdminShell><AdminSetupNotice /></AdminShell>;
  }

  if (admin.status === "denied") {
    return <AdminShell actions={<LogoutButton />}><AdminAccessDeniedNotice /></AdminShell>;
  }

  const { data, error } = await admin.supabase
    .from("site_content")
    .select("key, label, body, is_published, updated_by, created_at, updated_at")
    .order("key", { ascending: true });

  const rows = error ? [] : (data || []) as SiteContent[];
  const blocks = mergeContentRows(rows);

  return (
    <AdminShell active="content" actions={<LogoutButton />}>
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Page content</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-ink sm:text-5xl">Manage public copy</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
            Edit approved snippets used by the About section, Agent Locator, and FAQ intros. Legal policy pages are kept in code so compliance text is reviewed before publishing.
          </p>
        </div>
      </div>

      {error && <p role="alert" className="mb-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Could not load content rows: {error.message}</p>}
      <AdminContentManager blocks={blocks} />
    </AdminShell>
  );
}
