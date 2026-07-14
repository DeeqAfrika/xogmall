import type { ExchangeRate } from "@/lib/types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00Z`));
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
  }).format(new Date(value));
}

export function RateHistoryTable({ rates }: { rates: ExchangeRate[] }) {
  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-line bg-white">
      <div className="border-b border-line px-6 py-5 sm:px-8">
        <p className="eyebrow">Audit trail</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Rate history</h2>
      </div>
      {rates.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-muted">No rates have been published yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="bg-sky-soft text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-6 py-4 font-semibold">Rate</th>
                <th className="px-6 py-4 font-semibold">Effective date</th>
                <th className="px-6 py-4 font-semibold">Note</th>
                <th className="px-6 py-4 font-semibold">Created</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rates.map((rate) => (
                <tr key={rate.id} className="text-ink">
                  <td className="px-6 py-4 font-mono font-semibold">£1 = ${Number(rate.rate).toFixed(6)}</td>
                  <td className="px-6 py-4">{formatDate(rate.effective_date)}</td>
                  <td className="max-w-xs px-6 py-4 text-muted">{rate.note || "—"}</td>
                  <td className="px-6 py-4 text-muted">{formatTimestamp(rate.created_at)}</td>
                  <td className="px-6 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${rate.is_active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{rate.is_active ? "Active" : "Inactive"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
