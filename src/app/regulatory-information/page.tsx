import { ContentPage } from "@/components/site/ContentPage";
import { PublicPageShell } from "@/components/site/PublicPageShell";
import { brand } from "@/config/brand";

export default function RegulatoryInformationPage() {
  return <PublicPageShell><ContentPage eyebrow="Launch placeholder" title="Regulatory information" intro={brand.regulatoryNotice}><p>No licensing, registration, authorisation, partnership, or regulatory status is claimed on this page. Approved wording and verified references are required before launch.</p></ContentPage></PublicPageShell>;
}
