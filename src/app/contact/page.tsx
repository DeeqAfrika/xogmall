import type { Metadata } from "next";
import { PublicPageShell } from "@/components/site/PublicPageShell";
import { SupportRequestForm } from "@/components/site/SupportRequestForm";
import { brand } from "@/config/brand";

export const metadata: Metadata = { title: "Contact and Support", description: `Contact information for ${brand.name}.` };

export default function ContactPage() {
  return (
    <PublicPageShell>
      <section className="bg-white py-12 sm:py-16">
        <div className="container-shell">
          <div className="max-w-3xl">
            <p className="eyebrow">Contact</p>
            <h1 className="section-title mt-4">Contact {brand.name}</h1>
            <p className="body-copy mt-6">Contact Hogmall for transfer support, complaints, agent enquiries, or help finding the right next step.</p>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
            <aside className="rounded-2xl border border-line bg-sky-soft p-6 text-sm leading-7">
              <h2 className="text-xl font-semibold text-ink">Hogmall Ltd</h2>
              <p className="mt-4"><span className="font-semibold">Phone</span><br /><a href={`tel:${brand.telephone.replace(/\s/g, "")}`} className="underline underline-offset-4 hover:text-brand">{brand.telephone}</a></p>
              <p className="mt-3"><span className="font-semibold">Email</span><br /><a href={`mailto:${brand.contactEmail}`} className="break-all underline underline-offset-4 hover:text-brand">{brand.contactEmail}</a></p>
              <p className="mt-3"><span className="font-semibold">Registered address</span><br />{brand.registeredAddress}</p>
              <p className="mt-3 text-xs text-muted">Company no. {brand.companyNumber}<br />FCA FRN {brand.fcaReferenceNumber}</p>
            </aside>
            <SupportRequestForm />
          </div>
        </div>
      </section>
    </PublicPageShell>
  );
}
