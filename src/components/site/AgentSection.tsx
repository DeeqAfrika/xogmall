import Image from "next/image";
import { ArrowRight, Storefront } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { brand } from "@/config/brand";

export function AgentSection() {
  return (
    <section className="bg-white py-10">
      <div className="container-shell overflow-hidden rounded-xl bg-brand-dark shadow-[0_16px_45px_rgba(7,28,62,0.16)]">
        <div className="grid lg:grid-cols-[1fr_1.08fr]">
          <div className="flex items-center gap-5 px-6 py-9 text-white sm:px-10 lg:py-10">
            <span className="hidden size-16 shrink-0 items-center justify-center rounded-full bg-white/10 text-white sm:flex">
              <Storefront aria-hidden="true" size={30} weight="duotone" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-200">Agent network</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">Partner with Xogmall</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-blue-100">Submit an individual or limited-company application for Xogmall review.</p>
              {brand.agentPortalUrl ? <a href={brand.agentPortalUrl} target="_blank" rel="noreferrer" className="focus-ring mt-5 inline-flex min-h-11 items-center gap-2 rounded-md bg-[#ffbf23] px-5 text-sm font-bold text-navy hover:bg-[#ffd15d]">Open Agent Portal <ArrowRight aria-hidden="true" size={16} weight="bold" /></a> : <Link href="/agents#become-agent" className="focus-ring mt-5 inline-flex min-h-11 items-center gap-2 rounded-md bg-[#ffbf23] px-5 text-sm font-bold text-navy hover:bg-[#ffd15d]">Start an application <ArrowRight aria-hidden="true" size={16} weight="bold" /></Link>}
            </div>
          </div>
          <div className="relative min-h-64 lg:min-h-[290px]">
            <Image
              src="/images/xogmall-agent-banner-v2.png"
              alt="A Xogmall agent helping a customer"
              fill
              loading="eager"
              sizes="(max-width: 1024px) 100vw, 54vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
