"use client";

import { CheckCircle, UploadSimple } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AdminRateForm({ defaultDate }: { defaultDate: string }) {
  const router = useRouter();
  const [rate, setRate] = useState("");
  const [effectiveDate, setEffectiveDate] = useState(defaultDate);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function publish(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    const numericRate = Number(rate);
    if (!Number.isFinite(numericRate) || numericRate <= 0) {
      setError("Enter a rate greater than zero.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: publishError } = await supabase.rpc("publish_exchange_rate", {
      p_rate: numericRate,
      p_effective_date: effectiveDate,
      p_note: note || null,
    });

    if (publishError) {
      setError(publishError.message);
      setLoading(false);
      return;
    }

    setRate("");
    setNote("");
    setSuccess(true);
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={publish} className="rounded-2xl border border-line bg-white p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Publish rate</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">New daily rate</h2>
        </div>
        <UploadSimple size={24} weight="duotone" className="text-brand" />
      </div>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <label>
          <span className="text-sm font-semibold text-ink">From currency</span>
          <input value="GBP" disabled className="mt-2 h-12 w-full rounded-xl border border-line bg-sky-soft px-4 font-mono text-ink disabled:opacity-100" />
        </label>
        <label>
          <span className="text-sm font-semibold text-ink">To currency</span>
          <input value="USD" disabled className="mt-2 h-12 w-full rounded-xl border border-line bg-sky-soft px-4 font-mono text-ink disabled:opacity-100" />
        </label>
        <label>
          <span className="text-sm font-semibold text-ink">Rate</span>
          <input type="number" required min="0.000001" step="0.000001" inputMode="decimal" placeholder="1.270000" value={rate} onChange={(event) => setRate(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-line px-4 font-mono text-ink outline-none focus:border-brand focus:ring-3 focus:ring-red-100" />
        </label>
        <label>
          <span className="text-sm font-semibold text-ink">Effective date</span>
          <input type="date" required value={effectiveDate} onChange={(event) => setEffectiveDate(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-line px-4 text-ink outline-none focus:border-brand focus:ring-3 focus:ring-red-100" />
        </label>
      </div>
      <label className="mt-5 block">
        <span className="text-sm font-semibold text-ink">Note <span className="font-normal text-muted">(optional)</span></span>
        <textarea rows={3} maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Internal context for this rate" className="mt-2 w-full resize-y rounded-xl border border-line px-4 py-3 text-ink outline-none focus:border-brand focus:ring-3 focus:ring-red-100" />
      </label>

      {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {success && <p role="status" className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"><CheckCircle size={18} weight="fill" /> New rate published.</p>}

      <button type="submit" disabled={loading} className="focus-ring mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark disabled:cursor-wait disabled:opacity-60">
        {loading ? "Publishing…" : "Publish New Rate"}
      </button>
      <p className="mt-3 text-xs leading-5 text-muted">Publishing makes this rate active and keeps previous rates in history.</p>
    </form>
  );
}
