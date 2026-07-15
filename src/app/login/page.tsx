import type { Metadata } from "next";
import { ContentPage } from "@/components/site/ContentPage";
import { PublicPageShell } from "@/components/site/PublicPageShell";
import { AGENT_PORTAL_URL } from "@/lib/constants";

export const metadata: Metadata = { title: "Portal Access" };

export default function LoginPage() {
  return (
    <PublicPageShell>
      <ContentPage eyebrow="Portal" title="Portal access" intro="Public customer login is not currently advertised on this website. Agent access is available through the Hogmall Agent Portal.">
        <p>Authorised Hogmall staff can manage website updates by visiting <code className="rounded bg-sky-soft px-2 py-1 font-mono text-sm text-ink">/admin</code>.</p>
        {AGENT_PORTAL_URL ? (
          <a href={AGENT_PORTAL_URL} target="_blank" rel="noreferrer" className="focus-ring inline-flex min-h-12 items-center rounded-xl bg-brand px-6 text-sm font-semibold text-white hover:bg-brand-dark">Open Agent Portal</a>
        ) : (
          <p className="rounded-xl border border-line bg-sky-soft p-4 text-sm text-muted">Agent Portal access will appear after an approved portal URL is configured.</p>
        )}
      </ContentPage>
    </PublicPageShell>
  );
}
