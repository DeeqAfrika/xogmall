import type { Metadata } from "next";
import { ContentPage } from "@/components/site/ContentPage";
import { PublicPageShell } from "@/components/site/PublicPageShell";
import { launchPlaceholder } from "@/config/brand";

export const metadata: Metadata = { title: "Privacy Policy — draft placeholder" };

export default function PrivacyPage() {
  return (
    <PublicPageShell>
      <ContentPage eyebrow="Legal placeholder" title="Privacy Policy" intro={launchPlaceholder}>
        <p>This page is a non-operative placeholder. It must be replaced with an approved Xogmall privacy notice before any personal information is collected in production.</p>
        <p>The approved notice must identify the legal entity and contact details, explain processing purposes and lawful bases, retention, sharing, international transfers, security, individual rights, cookies, and complaint routes.</p>
      </ContentPage>
    </PublicPageShell>
  );
}
