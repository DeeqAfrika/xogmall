import type { Metadata } from "next";
import { AdminAccessDeniedNotice, AdminSetupNotice } from "@/components/admin/AdminNotice";
import { AdminRateForm } from "@/components/admin/AdminRateForm";
import { AdminShell } from "@/components/admin/AdminShell";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { RateHistoryTable } from "@/components/admin/RateHistoryTable";
import { getAdminContext } from "@/lib/admin";
import type { ExchangeRate } from "@/lib/types";

export const metadata: Metadata = { title: "Manage Exchange Rates", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

function getLondonDate() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Europe/London",
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

export default async function AdminRatesPage() {
  const admin = await getAdminContext();

  if (admin.status === "setup") {
    return <AdminShell><AdminSetupNotice /></AdminShell>;
  }

  if (admin.status === "denied") {
    return <AdminShell actions={<LogoutButton />}><AdminAccessDeniedNotice /></AdminShell>;
  }

  const { data, error } = await admin.supabase
    .from("exchange_rates")
    .select("id, from_currency, to_currency, rate, effective_date, is_active, note, created_by, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const rates = error
    ? []
    : (data || []).map((rate) => ({ ...rate, rate: Number(rate.rate) })) as ExchangeRate[];
  const activeRate = rates.find((rate) => rate.is_active) || null;

  return (
    <AdminShell active="rates" actions={<LogoutButton />}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Rate management</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-ink sm:text-5xl">Daily exchange rate</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-muted">Publish the GBP to USD rate shown across the public Hogmall website.</p>
        </div>
        <div className="rounded-xl border border-red-100 bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Current active rate</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-brand">{activeRate ? `£1 = $${Number(activeRate.rate).toFixed(6)}` : "Not published"}</p>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
        <AdminRateForm defaultDate={getLondonDate()} />
        <div className="rounded-2xl bg-navy p-7 text-white sm:p-8">
          <p className="eyebrow !text-red-300">Publishing checklist</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">Confirm before publishing</h2>
          <ol className="mt-7 space-y-5 text-sm leading-6 text-red-100">
            <li><span className="mr-3 font-mono text-coral">01</span>Check the rate is the approved GBP to USD daily rate.</li>
            <li><span className="mr-3 font-mono text-coral">02</span>Confirm the effective date in UK time.</li>
            <li><span className="mr-3 font-mono text-coral">03</span>Add a short internal note when useful.</li>
            <li><span className="mr-3 font-mono text-coral">04</span>Publishing immediately replaces the public active rate.</li>
          </ol>
        </div>
      </div>

      {error && <p role="alert" className="mt-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Could not load rate history: {error.message}</p>}
      <RateHistoryTable rates={rates} />
    </AdminShell>
  );
}
