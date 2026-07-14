import Link from "next/link";
import { GlobeHemisphereEast } from "@phosphor-icons/react/dist/ssr";

export function EastAfricaSection() {
  return (
    <section className="section-pad bg-sky-soft">
      <div className="container-shell text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-white text-brand">
          <GlobeHemisphereEast aria-hidden="true" size={25} weight="duotone" />
        </span>
        <p className="eyebrow mt-5">Destination information</p>
        <h2 className="section-title mx-auto mt-4 max-w-2xl">Supported countries will be added after approval.</h2>
        <p className="body-copy mx-auto mt-5 max-w-2xl">No destination, payout method, delivery time, partner, or service availability is represented by this preview.</p>
        <Link href="/regulatory-information" className="focus-ring mt-7 inline-flex rounded-lg text-sm font-semibold text-brand hover:text-brand-dark">Read the launch notice</Link>
      </div>
    </section>
  );
}
