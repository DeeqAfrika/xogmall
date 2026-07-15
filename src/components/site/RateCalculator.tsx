"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowsLeftRight,
  Clock,
  CreditCard,
  Info,
} from "@phosphor-icons/react";
import { useState } from "react";

export function RateCalculator({ rate }: { rate: number | null }) {
  const [entry, setEntry] = useState<{
    currency: "GBP" | "USD";
    value: string;
  }>({ currency: "GBP", value: "100" });

  const activeRate = rate && Number.isFinite(rate) && rate > 0 ? rate : null;
  const parseAmount = (value: string) => {
    const amount = Number(value);

    return value.trim() !== "" && Number.isFinite(amount) && amount >= 0
      ? amount
      : null;
  };
  const formatAmount = (value: number) => value.toFixed(2);
  const entryAmount = parseAmount(entry.value);
  const gbpAmount =
    entry.currency === "GBP"
      ? entry.value
      : activeRate && entryAmount !== null
        ? formatAmount(entryAmount / activeRate)
        : "";
  const usdAmount =
    entry.currency === "USD"
      ? entry.value
      : activeRate && entryAmount !== null
        ? formatAmount(entryAmount * activeRate)
        : "";

  return (
    <div id="rate-calculator" className="rounded-xl border border-line bg-white p-5 shadow-[0_18px_55px_rgba(76,5,8,0.2)] sm:p-6">
      <h2 className="text-lg font-bold tracking-tight text-ink">Check your transfer</h2>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto_1fr_0.95fr] lg:items-end">
        <label className="block">
          <span className="text-[11px] font-semibold text-muted">You send</span>
          <span className="mt-1.5 flex h-14 items-center rounded-lg border border-line bg-white px-4 focus-within:border-brand focus-within:ring-3 focus-within:ring-red-100">
            <span className="font-mono font-semibold text-ink">£</span>
            <input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={gbpAmount}
              onChange={(event) =>
                setEntry({ currency: "GBP", value: event.target.value })
              }
              className="h-full min-w-0 flex-1 bg-transparent px-2 font-mono text-lg text-ink outline-none"
              aria-label="Amount to send in pounds"
            />
            <span className="text-xs font-bold text-ink">GBP</span>
          </span>
        </label>

        <span className="mx-auto hidden size-10 items-center justify-center rounded-full border border-line bg-sky-soft text-brand lg:flex">
          <ArrowsLeftRight aria-hidden="true" size={18} weight="bold" />
        </span>

        <label className="block">
          <span className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-muted">
            They receive (estimated)
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-amber-800">Commission Not Included</span>
          </span>
          <span className="mt-1.5 flex h-14 items-center rounded-lg border border-line bg-[#f8fbff] px-4 focus-within:border-brand focus-within:ring-3 focus-within:ring-red-100">
            <span className="font-mono font-semibold text-ink">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={usdAmount}
              onChange={(event) =>
                setEntry({ currency: "USD", value: event.target.value })
              }
              className="h-full min-w-0 flex-1 bg-transparent px-2 font-mono text-lg font-bold text-ink outline-none"
              aria-label="Estimated amount received in dollars"
            />
            <span className="text-xs font-bold text-ink">USD</span>
          </span>
        </label>

        <div className="border-line lg:border-l lg:pl-5">
          <div className="grid grid-cols-2 gap-3 text-[11px] leading-4 text-muted">
            <span className="flex gap-2"><Clock aria-hidden="true" size={18} className="shrink-0 text-brand" />Support through processing</span>
            <span className="flex gap-2"><CreditCard aria-hidden="true" size={18} className="shrink-0 text-brand" />Payout options vary</span>
          </div>
          <Link
            href="/contact#support"
            className="focus-ring mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Contact support <ArrowRight aria-hidden="true" size={16} weight="bold" />
          </Link>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 border-t border-line pt-3 text-[11px] leading-4 text-muted sm:flex-row sm:items-center sm:justify-between">
        <p className="font-semibold text-ink">Rate: {activeRate ? `£1 = $${activeRate.toFixed(2)}` : "temporarily unavailable"}</p>
        <p className="flex gap-1.5"><Info aria-hidden="true" size={14} className="mt-px shrink-0" />Fees and final payout are confirmed before transfer.</p>
      </div>
    </div>
  );
}
