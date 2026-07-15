import Image from "next/image";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { brand } from "@/config/brand";

export function AgentSection() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="container-shell overflow-hidden rounded-[2rem] bg-navy">
        <div className="grid lg:min-h-[520px] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex items-center px-7 py-12 text-white sm:px-12 lg:px-16">
            <div className="max-w-lg">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-300">Join our network</p>
              <h2 className="mt-5 [font-family:Georgia,'Times_New_Roman',serif] text-[clamp(2.75rem,4vw,4.5rem)] font-normal leading-[0.98] tracking-[-0.04em] text-white">Help your community.<br />Build your business.</h2>
              <p className="mt-6 max-w-md text-base leading-7 text-red-100">Apply as an individual or limited company, upload the required documents privately, and follow your application status.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/agents#become-agent" className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-navy hover:bg-red-50">Join the network <ArrowRight aria-hidden="true" size={16} weight="bold" /></Link>
                {brand.agentPortalUrl ? <a href={brand.agentPortalUrl} target="_blank" rel="noreferrer" className="focus-ring inline-flex min-h-12 items-center rounded-full border border-white/30 px-6 text-sm font-bold text-white hover:bg-white/10">Agent portal</a> : null}
              </div>
            </div>
          </div>
          <div className="relative min-h-[380px] lg:min-h-[520px]">
            <Image
              src="/images/hogmall-family-call.png"
              alt="A grandmother and two children connecting by phone"
              fill
              loading="eager"
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
