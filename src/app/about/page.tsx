import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, GlobeHemisphereEast, Handshake, ShieldCheck, UsersThree } from "@phosphor-icons/react/dist/ssr";
import { PublicPageShell } from "@/components/site/PublicPageShell";
import { COMPANY_ADDRESS } from "@/lib/constants";
import { getSiteContentValues } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "About Xogmall",
  description: "Learn about Xogmall, its UK-based transfer support, Destination information, compliance approach, and agent network.",
};

const principles = [
  "Clear daily rate visibility",
  "Practical support before and during processing",
  "Customer and recipient detail checks",
  "Agent network support for local communities",
];

const supportAreas = [
  { icon: GlobeHemisphereEast, title: "Destination information", text: "Xogmall supports corridors and communities where customers need clear payout guidance and practical help." },
  { icon: ShieldCheck, title: "Responsible checks", text: "Verification, document requests, and review steps help protect customers and support legal obligations." },
  { icon: UsersThree, title: "Community support", text: "Customers can use online guidance, contact support, or speak with a Xogmall agent where available." },
  { icon: Handshake, title: "Agent partners", text: "Approved agents help customers understand requirements, prepare information, and access support." },
];

export default async function AboutPage() {
  const content = await getSiteContentValues(["about.title", "about.body"]);

  return (
    <PublicPageShell>
      <section className="bg-white py-12 sm:py-16">
        <div className="container-shell">
          <div className="max-w-3xl">
            <p className="eyebrow">About Xogmall</p>
            <h1 className="section-title mt-4">{content["about.title"]}</h1>
            <p className="body-copy mt-6">{content["about.body"]}</p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <section className="rounded-2xl border border-line bg-sky-soft p-6 sm:p-8">
              <h2 className="text-2xl font-semibold tracking-tight text-ink">Company details</h2>
              <dl className="mt-6 grid gap-4 text-sm leading-6">
                <Detail label="Registered company" value={COMPANY_ADDRESS.name} />
                <Detail label="Company number" value="To be confirmed before launch" />
                <Detail label="Registered address" value={`${COMPANY_ADDRESS.line1}, ${COMPANY_ADDRESS.city}, ${COMPANY_ADDRESS.country}, ${COMPANY_ADDRESS.postcode}`} />
              </dl>
            </section>

            <section className="rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-semibold tracking-tight text-ink">What Xogmall helps with</h2>
              <p className="mt-4 text-sm leading-7 text-muted">
                Xogmall provides transfer support, agent access, payout guidance, and customer assistance for people sending money from the UK. The website shows current rate information and connects customers to the right support route before final transfer details are confirmed.
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
              <h2 className="text-2xl font-semibold tracking-tight text-white">Need help from Xogmall?</h2>
              <p className="mt-2 text-sm leading-6 text-blue-100">Use the contact page for transfer support, payout questions, agent support, and partner enquiries.</p>
            </div>
            <Link href="/contact" className="focus-ring inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-brand hover:bg-blue-50">
              Contact support
            </Link>
          </div>
        </div>
      </section>
    </PublicPageShell>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{label}</dt>
      <dd className="mt-1 text-ink">{value}</dd>
    </div>
  );
}
