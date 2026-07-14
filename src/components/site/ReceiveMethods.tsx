import {
  Bank,
  DeviceMobile,
  Handshake,
  Headset,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";

const methods = [
  { icon: Handshake, title: "Agent directory", text: "Published locations only" },
  { icon: Bank, title: "Service details", text: "Pending approval" },
  { icon: DeviceMobile, title: "Receive methods", text: "Pending approval" },
  { icon: Headset, title: "Support details", text: "Pending approval" },
  { icon: UsersThree, title: "Destinations", text: "Pending approval" },
];

export function ReceiveMethods() {
  return (
    <section id="receive-options" className="bg-sky-soft py-14 sm:py-16">
      <div className="container-shell">
        <h2 className="text-center text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Service information
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-6 text-muted">
          Receive methods, destinations, partners, fees, and delivery information will be shown only after approval.
        </p>
        <div className="mt-10 grid gap-y-8 sm:grid-cols-2 lg:grid-cols-5">
          {methods.map(({ icon: Icon, title, text }) => (
            <article key={title} className="px-4 text-center lg:border-r lg:border-blue-200 lg:last:border-r-0">
              <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-white text-brand shadow-sm">
                <Icon aria-hidden="true" size={28} weight="duotone" />
              </span>
              <h3 className="mt-4 text-sm font-bold text-brand-dark">{title}</h3>
              <p className="mx-auto mt-1.5 max-w-36 text-xs leading-5 text-muted">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
