import type { Metadata } from "next";
import { ContentPage } from "@/components/site/ContentPage";
import { PublicPageShell } from "@/components/site/PublicPageShell";
import { launchPlaceholder } from "@/config/brand";

export const metadata: Metadata = { title: "Cookie Policy — draft placeholder" };

export default function CookiesPage() {
  return (
    <PublicPageShell>
      <ContentPage eyebrow="Legal placeholder" title="Cookie Policy" intro={launchPlaceholder}>
        <p>This page must be replaced with an approved policy that reflects the cookies and similar technologies actually used in the production deployment.</p>
        <p>Necessary authentication and security storage must be documented. Optional analytics or marketing technology must not be enabled until the required consent controls and wording are approved.</p>
      </ContentPage>
    </PublicPageShell>
  );
}
