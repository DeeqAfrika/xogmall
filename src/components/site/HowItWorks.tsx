import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

const stories = [
  { image: "/images/hogmall-family-call.png", alt: "A grandmother and children connecting by phone", title: "Check the published rate", text: "Start with the current GBP to USD rate and an informational estimate." },
  { image: "/images/hogmall-community-connection.png", alt: "Families using phones across two homes", title: "Choose local support", text: "Open the agent locator to see addresses that are approved for public display." },
  { image: "/images/hogmall-transfer-family.png", alt: "People receiving updates on their phones", title: "Stay connected", text: "Use the approved contact routes when you need help or clarification." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[#fffaf6] py-16 sm:py-20">
      <div className="container-shell">
        <div className="grid gap-8 lg:grid-cols-[0.55fr_1.45fr] lg:items-end">
          <div>
            <p className="eyebrow">Built on connection</p>
            <h2 className="mt-4 [font-family:Georgia,'Times_New_Roman',serif] text-[clamp(2.5rem,4vw,4rem)] font-normal leading-[0.98] tracking-[-0.04em] text-ink">More than a transfer.</h2>
            <p className="mt-5 max-w-sm text-base leading-7 text-muted">A simpler path from checking the rate to finding the right support.</p>
            <Link href="/about" className="focus-ring mt-6 inline-flex items-center gap-2 rounded-lg text-sm font-bold text-brand">How Hogmall works <ArrowRight aria-hidden="true" size={17} weight="bold" /></Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {stories.map(({ image, alt, title, text }, index) => (
              <article key={title}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem]">
                  <Image src={image} alt={alt} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover object-center" />
                </div>
                <div className="mt-5 flex gap-4">
                  <span className="font-mono text-sm font-bold text-brand">0{index + 1}</span>
                  <div><h3 className="font-bold text-ink">{title}</h3><p className="mt-2 text-sm leading-6 text-muted">{text}</p></div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
