import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { AGENT_PORTAL_URL } from "@/lib/constants";

export function FinalCTA() {
  return (
    <section className="bg-white py-10 sm:py-16">
      <div className="container-shell rounded-[1.75rem] bg-brand px-6 py-14 text-center text-white sm:px-12 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-100">Get started</p>
        <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
          Ready to send money with Hogmall?
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-red-100">
          Check today&apos;s rate, speak to Hogmall support, or use the Agent Portal if you are an authorised partner.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/contact" className="focus-ring inline-flex min-h-12 items-center justify-center rounded-xl border border-white/45 px-6 text-sm font-semibold text-white hover:bg-white/10">
            Contact Hogmall
          </Link>
          {AGENT_PORTAL_URL ? (
            <a href={AGENT_PORTAL_URL} target="_blank" rel="noreferrer" className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-brand">
              Open Agent Portal <ArrowRight aria-hidden="true" size={17} weight="bold" />
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
