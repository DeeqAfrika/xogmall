import type { Metadata } from "next";
import Link from "next/link";
import { AdminAccessDeniedNotice, AdminSetupNotice } from "@/components/admin/AdminNotice";
import { AdminShell } from "@/components/admin/AdminShell";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { getAdminContext } from "@/lib/admin";
import type { ExchangeRate } from "@/lib/types";

export const metadata: Metadata = { title: "Admin Dashboard", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const admin = await getAdminContext();

  if (admin.status === "setup") {
    return <AdminShell><AdminSetupNotice /></AdminShell>;
  }

  if (admin.status === "denied") {
    return <AdminShell actions={<LogoutButton />}><AdminAccessDeniedNotice /></AdminShell>;
  }

  const [rateResult, agentCountResult, onboardingCountResult, contentCountResult] = await Promise.all([
    admin.supabase
      .from("exchange_rates")
      .select("id, from_currency, to_currency, rate, effective_date, is_active, note, created_by, created_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin.supabase.from("agents").select("id", { count: "exact", head: true }),
    admin.supabase.from("agent_applications").select("id", { count: "exact", head: true }),
    admin.supabase.from("site_content").select("key", { count: "exact", head: true }),
  ]);

  const activeRate = rateResult.data
    ? ({ ...rateResult.data, rate: Number(rateResult.data.rate) } as ExchangeRate)
    : null;

  const cards = [
    {
      title: "Daily exchange rate",
      description: "Publish the GBP to USD rate shown on the public website.",
      href: "/admin/rates",
      cta: "Manage rates",
      metric: activeRate ? `£1 = $${activeRate.rate.toFixed(6)}` : "Not published",
    },
    {
      title: "Agents",
      description: "Manage public locator agents, private signup applications, review status, and filed document packs.",
      href: "/admin/agents",
      cta: "Manage agents",
      metric: `${agentCountResult.count ?? 0} saved / ${onboardingCountResult.count ?? 0} applications`,
    },
    {
      title: "Page content",
      description: "Update approved homepage, FAQ, and locator text without a code change.",
      href: "/admin/content",
      cta: "Manage content",
      metric: `${contentCountResult.count ?? 0} edited`,
    },
    {
      title: "Admin users",
      description: "Create full admins who can manage rates, agents, content, and other admins.",
      href: "/admin/users",
      cta: "Manage users",
      metric: "Full access",
    },
  ];

  return (
    <AdminShell active="dashboard" actions={<LogoutButton />}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Xogmall admin</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-ink sm:text-5xl">Website control panel</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
            Manage the daily rate, public agent locator, and approved text blocks used across the Xogmall website.
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.title} className="rounded-2xl border border-line bg-white p-6 shadow-sm">
            <p className="font-mono text-sm font-semibold text-brand">{card.metric}</p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink">{card.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{card.description}</p>
            <Link href={card.href} className="focus-ring mt-6 inline-flex min-h-11 items-center rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark">
              {card.cta}
            </Link>
          </article>
        ))}
      </div>

      <div className="mt-10 rounded-2xl bg-navy p-7 text-white sm:p-8">
        <p className="eyebrow !text-blue-300">Operational note</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">Use draft mode for anything that is not ready for the public site.</h2>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-blue-100">
          Agent addresses and content snippets are protected by admin-only update rules. Published agent locations and published content can be read by the public website.
        </p>
      </div>
    </AdminShell>
  );
}
