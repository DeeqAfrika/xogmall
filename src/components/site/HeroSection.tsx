import Image from "next/image";
import { RateCalculator } from "./RateCalculator";
import type { ExchangeRate } from "@/lib/types";

export function HeroSection({ rate }: { rate: ExchangeRate | null }) {
  return (
    <section className="overflow-hidden bg-[#fffaf6] pb-12 lg:pb-20">
      <div className="container-shell grid items-stretch gap-6 lg:grid-cols-[0.78fr_1.15fr_0.72fr] lg:gap-0">
        <div className="flex flex-col justify-center py-12 lg:pr-10">
          <p className="eyebrow">Neighbourhood exchange</p>
          <h1 className="mt-5 [font-family:Georgia,'Times_New_Roman',serif] text-[clamp(3rem,5vw,5.25rem)] font-normal leading-[0.94] tracking-[-0.055em] text-ink">
            Real people.<br />Real rates.<br /><span className="text-brand">Right around the corner.</span>
          </h1>
          <p className="mt-7 max-w-md text-base leading-7 text-muted">Check the published rate, calculate an estimate, and find local support through Hogmall’s agent network.</p>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold">
            <a href="#rate-calculator" className="focus-ring rounded-full bg-brand px-6 py-3 text-white hover:bg-brand-dark">See today&apos;s rate</a>
            <a href="/agents#locator" className="focus-ring rounded-full border border-ink/25 px-6 py-3 text-ink hover:border-brand hover:text-brand">Find a local agent</a>
          </div>
        </div>
        <div className="relative min-h-[430px] overflow-hidden rounded-[2rem] lg:min-h-[680px] lg:rounded-none">
          <Image
            src="/images/hogmall-transfer-family.png"
            alt="A man checking his phone and family members receiving an update"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 46vw"
            className="object-cover object-left"
          />
        </div>
        <div className="relative z-10 flex items-center lg:-ml-6">
          <RateCalculator rate={rate ? Number(rate.rate) : null} />
        </div>
      </div>
    </section>
  );
}
