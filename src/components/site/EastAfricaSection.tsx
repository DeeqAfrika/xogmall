import Image from "next/image";
import Link from "next/link";
import { GlobeHemisphereEast } from "@phosphor-icons/react/dist/ssr";

export function EastAfricaSection() {
  return (
    <section className="section-pad bg-sky-soft">
      <div className="container-shell grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <div>
          <span className="flex size-12 items-center justify-center rounded-full bg-white text-brand">
            <GlobeHemisphereEast aria-hidden="true" size={25} weight="duotone" />
          </span>
          <p className="eyebrow mt-5">Destination information</p>
          <h2 className="section-title mt-4 max-w-2xl">Supported countries will be added after approval.</h2>
          <p className="body-copy mt-5 max-w-2xl">No destination, payout method, delivery time, partner, or service availability is represented by this preview.</p>
          <Link href="/regulatory-information" className="focus-ring mt-7 inline-flex rounded-lg text-sm font-semibold text-brand hover:text-brand-dark">Read the launch notice</Link>
        </div>
        <div className="relative min-h-[420px] overflow-hidden rounded-3xl shadow-[0_24px_60px_rgba(76,5,8,0.14)] sm:min-h-[500px]">
          <Image
            src="/images/hogmall-family-call.png"
            alt="A grandmother and two children smiling during a phone call"
            fill
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover object-center"
          />
        </div>
      </div>
    </section>
  );
}
