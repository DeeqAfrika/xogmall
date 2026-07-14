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
            <p className="body-copy mt-6">Official contact, support, telephone, address, and portal details are awaiting approval and must be configured before launch.</p>
          </div>
          <div className="mt-10 max-w-3xl"><SupportRequestForm /></div>
        </div>
      </section>
    </PublicPageShell>
  );
}
