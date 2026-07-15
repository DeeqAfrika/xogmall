import Image from "next/image";
import Link from "next/link";
import { RateCalculator } from "./RateCalculator";
import type { ExchangeRate } from "@/lib/types";

export function HeroSection({ rate }: { rate: ExchangeRate | null }) {
  return (
    <section className="relative bg-white pb-8">
      <div className="grid lg:min-h-[520px] lg:grid-cols-[0.43fr_0.57fr]">
        <div className="flex items-center bg-brand-dark px-5 py-14 text-white sm:px-10 lg:px-[max(3rem,calc((100vw-74rem)/2))] lg:pr-12">
          <div className="max-w-lg">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-200">
              Hogmall platform preview
            </p>
            <h1 className="mt-5 text-[clamp(2.55rem,3.7vw,3.75rem)] font-bold leading-[1.02] tracking-[-0.055em] text-white">
              Check the latest published GBP to USD rate.
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-red-100 sm:text-lg">
              Use the two-way calculator, find published agent locations, or start an agent application. Service and destination information is awaiting approval.
            </p>
            <div className="mt-6 h-1 w-12 rounded-full bg-white/80" />
            <div className="mt-8 flex flex-wrap gap-3 lg:hidden">
              <Link href="#rate-calculator" className="focus-ring rounded-md bg-white px-5 py-3 text-sm font-semibold text-brand-dark">
                Check your transfer
              </Link>
              <Link href="/contact#support" className="focus-ring rounded-md border border-white/40 px-5 py-3 text-sm font-semibold text-white">
                Talk to support
              </Link>
            </div>
          </div>
        </div>

        <div className="relative min-h-[360px] lg:min-h-[520px]">
          <Image
            src="/images/hogmall-transfer-family.png"
            alt="A man and an older couple using their phones"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 57vw"
            className="object-cover object-center"
          />
        </div>
      </div>

      <div className="container-shell relative z-10 -mt-3 pb-2 lg:-mt-24">
        <RateCalculator rate={rate ? Number(rate.rate) : null} />
      </div>
    </section>
  );
}
