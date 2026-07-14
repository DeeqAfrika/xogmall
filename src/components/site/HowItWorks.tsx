import {
  CheckCircle,
  IdentificationCard,
  SignIn,
  TrendUp,
} from "@phosphor-icons/react/dist/ssr";

const steps = [
  { icon: TrendUp, title: "Check the rate", text: "See the current GBP to USD rate." },
  { icon: SignIn, title: "Find an agent", text: "View published agent locations." },
  { icon: IdentificationCard, title: "Apply as an agent", text: "Use the private onboarding workflow." },
  { icon: CheckCircle, title: "Await review", text: "Application status is managed by authorised admins." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-14 sm:py-16">
      <div className="container-shell">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">How it works</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-ink sm:text-3xl">A clear platform workflow.</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-muted">Public rate information and agent workflows remain available while service wording awaits approval.</p>
        </div>
        <div className="mt-9 grid overflow-hidden rounded-xl border border-line sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, title, text }, index) => (
            <article key={title} className="relative border-b border-line p-6 sm:border-r lg:border-b-0 lg:last:border-r-0">
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-full bg-sky-soft text-brand">
                  <Icon aria-hidden="true" size={21} weight="duotone" />
                </span>
                <span className="font-mono text-xs font-bold text-blue-300">0{index + 1}</span>
              </div>
              <h3 className="mt-5 text-base font-bold text-ink">{title}</h3>
              <p className="mt-2 text-xs leading-5 text-muted">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
