import type { Metadata } from "next";
import Link from "next/link";
import { Warning } from "@phosphor-icons/react/dist/ssr";
import { PublicPageShell } from "@/components/site/PublicPageShell";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  title: "Regulatory Information",
  description: `Company and regulatory information for ${brand.legalName}.`,
};

export default function RegulatoryInformationPage() {
  return (
    <PublicPageShell>
      <main className="bg-white py-12 sm:py-16">
        <div className="container-shell max-w-4xl">
          <p className="eyebrow">Legal and regulatory</p>
          <h1 className="section-title mt-4">Regulatory information</h1>
          <p className="body-copy mt-6">{brand.regulatoryNotice}</p>

          <section className="mt-10 rounded-2xl border border-line bg-sky-soft p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-ink">Firm details</h2>
            <dl className="mt-6 grid gap-x-8 gap-y-5 text-sm sm:grid-cols-2">
              <Detail label="Legal name" value={brand.legalName} />
              <Detail label="Company number" value={brand.companyNumber} href={brand.companiesHouseUrl} />
              <Detail label="FCA firm reference number" value={brand.fcaReferenceNumber} href={brand.fcaRegisterUrl} />
              <Detail label="Payment services status" value={brand.paymentServicesStatus} />
              <Detail label="Register type" value={brand.regulatoryType} />
              <Detail label="Status shown since" value={brand.paymentServicesStatusSince} />
              <Detail label="Registered address" value={brand.registeredAddress} />
              <Detail label="Contact" value={`${brand.telephone} · ${brand.contactEmail}`} />
            </dl>
          </section>

          <section className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-6 sm:p-8">
            <div className="flex gap-4">
              <Warning aria-hidden="true" size={28} weight="fill" className="mt-0.5 shrink-0 text-amber-700" />
              <div>
                <h2 className="text-xl font-semibold text-amber-950">Some activities may not be protected</h2>
                <p className="mt-3 text-sm leading-7 text-amber-950">Money held with a Small Payment Institution is not protected by the Financial Services Compensation Scheme (FSCS). Small Payment Institutions are not generally required to safeguard customer funds, although an institution may elect to do so.</p>
                <p className="mt-3 text-sm leading-7 text-amber-950">You may be able to complain to the Financial Ombudsman Service after first giving Hogmall the opportunity to resolve your complaint. Eligibility depends on the activity and circumstances. The Financial Ombudsman Service and FSCS make the final decisions about the complaints and claims they can consider.</p>
              </div>
            </div>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-semibold text-ink">Check current information</h2>
            <p className="mt-3 text-sm leading-7 text-muted">Regulatory status and permissions can change. Check the official sources before relying on this information.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <ExternalLink href={brand.fcaRegisterUrl}>Financial Services Register</ExternalLink>
              <ExternalLink href={brand.companiesHouseUrl}>Companies House</ExternalLink>
              <ExternalLink href="https://www.fca.org.uk/consumers/using-payment-service-providers">FCA payment provider guidance</ExternalLink>
              <ExternalLink href="https://www.financial-ombudsman.org.uk/consumers/how-to-complain">Financial Ombudsman Service</ExternalLink>
              <ExternalLink href="https://www.fscs.org.uk/check/check-your-money-is-protected/">FSCS protection checker</ExternalLink>
            </div>
          </section>

          <p className="mt-10 text-xs leading-6 text-muted">Last reviewed against the details supplied from the Financial Services Register on 15 July 2026. If this page differs from the official register, the official register takes precedence.</p>
          <Link href="/contact" className="focus-ring mt-5 inline-flex text-sm font-bold text-brand underline underline-offset-4">Contact Hogmall</Link>
        </div>
      </main>
    </PublicPageShell>
  );
}

function Detail({ label, value, href }: { label: string; value: string; href?: string }) {
  return <div><dt className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{label}</dt><dd className="mt-1.5 leading-6 text-ink">{href ? <a href={href} target="_blank" rel="noreferrer" className="font-semibold underline underline-offset-4 hover:text-brand">{value}</a> : value}</dd></div>;
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} target="_blank" rel="noreferrer" className="focus-ring inline-flex min-h-11 items-center rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink hover:border-brand hover:text-brand">{children}</a>;
}
