import { ContentPage } from "@/components/site/ContentPage";
import { PublicPageShell } from "@/components/site/PublicPageShell";
import { launchPlaceholder } from "@/config/brand";

export default function AccessibilityPage() {
  return <PublicPageShell><ContentPage eyebrow="Legal placeholder" title="Accessibility" intro={launchPlaceholder}><p>An approved accessibility statement, known limitations, and contact route for requesting assistance must be added before launch.</p></ContentPage></PublicPageShell>;
}
