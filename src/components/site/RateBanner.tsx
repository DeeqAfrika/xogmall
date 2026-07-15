import { Clock } from "@phosphor-icons/react/dist/ssr";
import { formatUkTimestamp } from "@/lib/rates";
import type { ExchangeRate } from "@/lib/types";

export function RateBanner({ rate }: { rate: ExchangeRate | null }) {
  const updated = rate ? formatUkTimestamp(rate.created_at) : null;

  return (
    <aside
      aria-label="Today's exchange rate"
      className="relative z-50 bg-brand-dark text-white shadow-[0_1px_0_rgba(255,255,255,0.2)]"
    >
      <div className="container-shell py-1.5">
        <div className="flex min-h-8 flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
          <span className="text-xs font-semibold text-red-100 sm:text-sm">
            Today&apos;s rate
          </span>
          {rate ? (
            <strong className="rounded border border-white/20 bg-white/10 px-2.5 py-1 font-mono text-base tracking-tight sm:text-lg">
              £1 = ${Number(rate.rate).toFixed(2)}
            </strong>
          ) : (
            <strong className="text-base">Rate temporarily unavailable</strong>
          )}
          {updated && (
            <span className="hidden items-center gap-1.5 text-[10px] text-red-100 md:ml-auto md:flex">
              <Clock aria-hidden="true" size={15} weight="bold" />
              Updated {updated.date} at {updated.time} UK time
            </span>
          )}
        </div>
        <p className="sr-only">
          The active rate is published manually by an authorised Hogmall admin. The calculator is informational only.
        </p>
      </div>
    </aside>
  );
}
