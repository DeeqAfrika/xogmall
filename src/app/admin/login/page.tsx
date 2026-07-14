import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = { title: "Admin Login", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <AdminShell>
      <div className="mx-auto max-w-md py-6 sm:py-14">
        <AdminLoginForm />
        <p className="mt-5 text-center text-xs leading-5 text-muted">This area is for authorised Xogmall staff only.</p>
      </div>
    </AdminShell>
  );
}
