import type { Metadata } from "next";
import { ContentPage } from "@/components/site/ContentPage";
import { PublicPageShell } from "@/components/site/PublicPageShell";
import { launchPlaceholder } from "@/config/brand";

export const metadata: Metadata = { title: "Terms and Conditions — draft placeholder" };

export default function TermsPage() {
  return (
    <PublicPageShell>
      <ContentPage eyebrow="Legal placeholder" title="Terms and Conditions" intro={launchPlaceholder}>
        <p>This page is a non-operative placeholder and does not describe or promise a live service.</p>
        <p>Approved terms must be supplied by Xogmall and reviewed for the actual legal entity, services, eligibility, rates, verification, cancellation, complaints, liability, partner arrangements, and governing law before launch.</p>
      </ContentPage>
    </PublicPageShell>
  );
}
