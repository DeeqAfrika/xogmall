import { ContentPage } from "@/components/site/ContentPage";
import { PublicPageShell } from "@/components/site/PublicPageShell";
import { launchPlaceholder } from "@/config/brand";

export default function ComplaintsPage() {
  return <PublicPageShell><ContentPage eyebrow="Legal placeholder" title="Complaints" intro={launchPlaceholder}><p>The approved complaint channel, response process, timeframes, and any eligible escalation route must be added before launch.</p></ContentPage></PublicPageShell>;
}
