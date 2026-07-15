import {
  Headset,
  LockKey,
  MapPin,
  SlidersHorizontal,
  TrendUp,
  UserCircleGear,
} from "@phosphor-icons/react/dist/ssr";
import { SectionIntro } from "./SectionIntro";

const reasons = [
  {
    icon: TrendUp,
    title: "Clear daily rate",
    text: "See the manually updated GBP to USD rate before starting your transfer.",
  },
  {
    icon: MapPin,
    title: "Destination information",
    text: "Supported countries will be shown only after Hogmall approval.",
  },
  {
    icon: UserCircleGear,
    title: "Agent-friendly platform",
    text: "Secure portal access and operational support for agents and sub-agents.",
  },
  {
    icon: Headset,
    title: "Support route",
    text: "Approved support details will be published before launch.",
  },
  {
    icon: LockKey,
    title: "Secure access",
    text: "Admin and agent partner access is protected behind secure authentication.",
  },
  {
    icon: SlidersHorizontal,
    title: "Simple experience",
    text: "Check the rate, find support, and understand the next step without confusing public pages.",
  },
];

export function WhyHogmall() {
  return (
    <section id="why-hogmall" className="section-pad bg-white">
      <div className="container-shell">
        <SectionIntro
          eyebrow="Why Hogmall"
          title="A clear foundation for customers and agents."
          description="The platform keeps rate information, agent discovery, and onboarding easy to find while launch wording is reviewed."
        />
        <div className="mt-14 grid border-y border-line sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map(({ icon: Icon, title, text }, index) => (
            <article
              key={title}
              className={`p-7 sm:p-8 ${index < 3 ? "lg:border-b lg:border-line" : ""} ${index % 3 !== 2 ? "lg:border-r lg:border-line" : ""}`}
            >
              <Icon aria-hidden="true" size={27} className="text-brand" weight="duotone" />
              <h3 className="mt-5 text-lg font-semibold tracking-tight text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
