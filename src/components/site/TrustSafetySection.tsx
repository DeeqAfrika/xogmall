import { Headset, IdentificationBadge, LockKey, Network } from "@phosphor-icons/react/dist/ssr";

const points = [
  { icon: LockKey, title: "Secure access", text: "Protected access for authorised staff and agent partners." },
  { icon: Headset, title: "Support details", text: "Approved contact details are required before launch." },
  { icon: IdentificationBadge, title: "Private documents", text: "Onboarding uploads use a private, access-controlled bucket." },
  { icon: Network, title: "Published records", text: "Only published agent locations and the active rate are public." },
];

export function TrustSafetySection() {
  return (
    <section className="bg-white py-14 sm:py-16">
      <div className="container-shell">
        <h2 className="text-center text-2xl font-bold tracking-tight text-ink sm:text-3xl">Trust, clarity, and support.</h2>
        <div className="mt-9 grid gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {points.map(({ icon: Icon, title, text }) => (
            <article key={title} className="flex gap-4 px-4 lg:border-r lg:border-line lg:last:border-r-0">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-red-200 text-brand"><Icon aria-hidden="true" size={23} weight="duotone" /></span>
              <div>
                <h3 className="text-sm font-bold text-ink">{title}</h3>
                <p className="mt-1.5 text-xs leading-5 text-muted">{text}</p>
              </div>
            </article>
          ))}
        </div>
        <p className="mx-auto mt-9 max-w-3xl border-t border-line pt-5 text-center text-[11px] leading-5 text-muted">
          Regulatory, service, destination, and legal information must be approved before production launch.
        </p>
      </div>
    </section>
  );
}
