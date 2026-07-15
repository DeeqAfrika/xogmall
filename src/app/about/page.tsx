import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, GlobeHemisphereEast, Handshake, ShieldCheck, UsersThree } from "@phosphor-icons/react/dist/ssr";
import { PublicPageShell } from "@/components/site/PublicPageShell";
import { brand } from "@/config/brand";
import { getSiteContentValues } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "About Hogmall",
  description: "Learn about Hogmall, its UK-based transfer support, Destination information, compliance approach, and agent network.",
};

const principles = [
  "Clear daily rate visibility",
  "Practical support before and during processing",
  "Customer and recipient detail checks",
  "Agent network support for local communities",
];

const supportAreas = [
  { icon: GlobeHemisphereEast, title: "Destination information", text: "Hogmall supports corridors and communities where customers need clear payout guidance and practical help." },
  { icon: ShieldCheck, title: "Responsible checks", text: "Verification, document requests, and review steps help protect customers and support legal obligations." },
  { icon: UsersThree, title: "Community support", text: "Customers can use online guidance, contact support, or speak with a Hogmall agent where available." },
  { icon: Handshake, title: "Agent partners", text: "Approved agents help customers understand requirements, prepare information, and access support." },
];

export default async function AboutPage() {
  const content = await getSiteContentValues(["about.title", "about.body"]);

  return (
    <PublicPageShell>
      <section className="bg-white py-12 sm:py-16">
        <div className="container-shell">
          <div className="max-w-3xl">
            <p className="eyebrow">About Hogmall</p>
            <h1 className="section-title mt-4">{content["about.title"]}</h1>
            <p className="body-copy mt-6">{content["about.body"]}</p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <section className="rounded-2xl border border-line bg-sky-soft p-6 sm:p-8">
              <h2 className="text-2xl font-semibold tracking-tight text-ink">Company details</h2>
              <dl className="mt-6 grid gap-4 text-sm leading-6">
                <Detail label="Registered company" value={brand.legalName} />
                <Detail label="Company number" value={brand.companyNumber} href={brand.companiesHouseUrl} />
                <Detail label="Registered address" value={brand.registeredAddress} />
                <Detail label="Telephone" value={brand.telephone} href={`tel:${brand.telephone.replace(/\s/g, "")}`} />
                <Detail label="Email" value={brand.contactEmail} href={`mailto:${brand.contactEmail}`} />
              </dl>
            </section>

            <section className="rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-semibold tracking-tight text-ink">What Hogmall helps with</h2>
              <p className="mt-4 text-sm leading-7 text-muted">
                Hogmall provides transfer support, agent access, payout guidance, and customer assistance for people sending money from the UK. The website shows current rate information and connects customers to the right support route before final transfer details are confirmed.
              </p>
              <ul className="mt-6 grid gap-3">
                {principles.map((item) => (
                  <li key={item} className="flex gap-3 text-sm font-semibold text-ink">
                    <CheckCircle aria-hidden="true" size={19} weight="fill" className="mt-0.5 shrink-0 text-brand" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section className="mt-8 rounded-2xl border border-amber-300 bg-amber-50 p-6 sm:p-8">
            <p className="eyebrow text-amber-800">Regulatory information</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink">Registered as a Small Payment Institution</h2>
            <dl className="mt-6 grid gap-4 text-sm leading-6 sm:grid-cols-3">
              <Detail label="FCA firm reference number" value={brand.fcaReferenceNumber} href={brand.fcaRegisterUrl} />
              <Detail label="Register type" value={brand.regulatoryType} />
              <Detail label="Status since" value={brand.paymentServicesStatusSince} />
            </dl>
            <p className="mt-6 text-sm font-semibold leading-6 text-amber-950">Important: some activities may not be protected. Money held with a Small Payment Institution is not protected by the Financial Services Compensation Scheme (FSCS).</p>
            <p className="mt-3 text-sm leading-6 text-amber-950">Check the Financial Services Register for Hogmall Ltd’s current status, permissions, restrictions and contact details. Whether the Financial Ombudsman Service can consider a complaint depends on the circumstances and activity.</p>
            <Link href="/regulatory-information" className="focus-ring mt-5 inline-flex text-sm font-bold text-brand underline underline-offset-4 hover:text-brand-dark">Read the full regulatory information</Link>
          </section>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {supportAreas.map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-2xl border border-line bg-white p-5 shadow-sm">
                <span className="flex size-11 items-center justify-center rounded-full bg-sky-soft text-brand">
                  <Icon aria-hidden="true" size={23} weight="duotone" />
                </span>
                <h3 className="mt-5 text-base font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-3 rounded-2xl bg-navy p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">Need help from Hogmall?</h2>
              <p className="mt-2 text-sm leading-6 text-red-100">Use the contact page for transfer support, payout questions, agent support, and partner enquiries.</p>
            </div>
            <Link href="/contact" className="focus-ring inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-brand hover:bg-red-50">
              Contact support
            </Link>
          </div>
        </div>
      </section>
    </PublicPageShell>
  );
}

function Detail({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{label}</dt>
      <dd className="mt-1 text-ink">{href ? <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined} className="font-semibold underline underline-offset-4 hover:text-brand">{value}</a> : value}</dd>
    </div>
  );
}
