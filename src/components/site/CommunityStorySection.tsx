import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle, MapPin, Storefront } from "@phosphor-icons/react/dist/ssr";

const supportPoints = [
  { icon: MapPin, title: "Published locations", text: "Only addresses approved by an authorised admin appear in the locator." },
  { icon: Storefront, title: "Local support", text: "Use the directory to find the contact and opening details an agent has published." },
  { icon: CheckCircle, title: "Clear status", text: "Draft and suspended locations remain private until they are ready to display." },
];

export function CommunityStorySection() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="container-shell">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="eyebrow">Local agents, local support</p>
            <h2 className="mt-4 max-w-xl [font-family:Georgia,'Times_New_Roman',serif] text-[clamp(2.5rem,4.5vw,4.75rem)] font-normal leading-[0.98] tracking-[-0.045em] text-ink">Your neighbourhood, ready to help.</h2>
          </div>
          <div className="border-t border-line pt-6 lg:ml-auto lg:max-w-lg">
            <p className="text-base leading-7 text-muted">Find published Hogmall agent information in one place. Search the live locator when you need an approved address or contact route.</p>
            <Link href="/agents#locator" className="focus-ring mt-5 inline-flex items-center gap-2 rounded-lg text-sm font-bold text-brand hover:text-brand-dark">Find an agent near you <ArrowRight aria-hidden="true" size={17} weight="bold" /></Link>
          </div>
        </div>

        <div className="mt-12 grid overflow-hidden rounded-[2rem] bg-[#f7eee9] lg:grid-cols-[0.88fr_1.12fr]">
          <div className="relative min-h-[360px] lg:min-h-[560px]">
            <Image src="/images/hogmall-agent-support.png" alt="An agent assisting a customer at a counter" fill sizes="(max-width: 1024px) 100vw, 44vw" className="object-cover object-[62%_center]" />
          </div>
          <div className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-14">
            {supportPoints.map(({ icon: Icon, title, text }, index) => (
              <article key={title} className="grid grid-cols-[auto_1fr] gap-4 border-b border-brand/15 py-6 first:pt-0 last:border-b-0 last:pb-0">
                <span className="mt-0.5 flex size-11 items-center justify-center rounded-full bg-white text-brand"><Icon aria-hidden="true" size={22} weight="duotone" /></span>
                <div>
                  <p className="font-mono text-xs font-bold text-brand">0{index + 1}</p>
                  <h3 className="mt-1 text-xl font-bold tracking-tight text-ink">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
