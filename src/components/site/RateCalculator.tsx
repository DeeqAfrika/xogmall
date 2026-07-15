"use client";

import {
  ArrowsLeftRight,
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
    <div id="rate-calculator" className="w-full overflow-hidden rounded-[1.75rem] bg-brand text-white shadow-[0_28px_70px_rgba(76,5,8,0.28)] lg:max-w-[330px]">
      <div className="p-6 sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">Today&apos;s rate</p>
        <p className="mt-3 font-mono text-3xl font-bold tracking-tight">{activeRate ? `£1 = $${activeRate.toFixed(2)}` : "Temporarily unavailable"}</p>
        <p className="mt-2 text-xs leading-5 text-white/75">Published by an authorised Hogmall admin.</p>
      </div>
      <div className="bg-navy p-6 sm:p-7">
        <h2 className="text-xl font-bold tracking-tight text-white">Calculate an estimate</h2>
        <div className="mt-5 grid gap-4">
        <label className="block">
          <span className="text-[11px] font-semibold text-white/70">You send</span>
          <span className="mt-1.5 flex h-14 items-center rounded-xl border border-white/30 bg-white/10 px-4 focus-within:border-white focus-within:ring-3 focus-within:ring-white/20">
            <span className="font-mono font-semibold text-white">£</span>
            <input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={gbpAmount}
              onChange={(event) =>
                setEntry({ currency: "GBP", value: event.target.value })
              }
              className="h-full min-w-0 flex-1 bg-transparent px-2 font-mono text-lg text-white outline-none"
              aria-label="Amount to send in pounds"
            />
            <span className="text-xs font-bold text-white">GBP</span>
          </span>
        </label>

        <span className="mx-auto flex size-9 items-center justify-center rounded-full border border-white/25 text-white">
          <ArrowsLeftRight aria-hidden="true" size={18} weight="bold" />
        </span>
        <label className="block">
          <span className="text-[11px] font-semibold text-white/70">They receive (estimated)</span>
          <span className="mt-1.5 flex h-14 items-center rounded-xl border border-white/30 bg-white/10 px-4 focus-within:border-white focus-within:ring-3 focus-within:ring-white/20">
            <span className="font-mono font-semibold text-white">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={usdAmount}
              onChange={(event) =>
                setEntry({ currency: "USD", value: event.target.value })
              }
              className="h-full min-w-0 flex-1 bg-transparent px-2 font-mono text-lg font-bold text-white outline-none"
              aria-label="Estimated amount received in dollars"
            />
            <span className="text-xs font-bold text-white">USD</span>
          </span>
        </label>
        </div>
        <p className="mt-5 flex gap-2 border-t border-white/15 pt-4 text-[11px] leading-5 text-white/65"><Info aria-hidden="true" size={15} className="mt-0.5 shrink-0" />Commission is not included. Fees and final payout are confirmed before transfer.</p>
      </div>
    </div>
  );
}
