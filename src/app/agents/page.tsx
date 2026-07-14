import type { Metadata } from "next";
import Link from "next/link";
import { ArrowSquareOut, ClipboardText, MapPin, Storefront } from "@phosphor-icons/react/dist/ssr";
import { AgentLocatorExperience } from "@/components/site/AgentLocatorExperience";
import { PublicPageShell } from "@/components/site/PublicPageShell";
import { enrichAgentsWithPostcodeCoordinates } from "@/lib/agent-geo";
import { getAgentDirectoryEntries, getPublishedAgents } from "@/lib/agents";
import { AGENT_PORTAL_URL } from "@/lib/constants";
import { getSiteContentValues } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Agents",
  description:
    "Find Xogmall agents, learn about agent support, and start the Xogmall agent onboarding process.",
};

export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  const [publishedAgents, content] = await Promise.all([
    getPublishedAgents(),
    getSiteContentValues(["agentLocator.title", "agentLocator.body"]),
  ]);
  const agents = await enrichAgentsWithPostcodeCoordinates(publishedAgents);
  const directoryAgents = await getAgentDirectoryEntries(publishedAgents);

  return (
    <PublicPageShell>
      <section className="bg-white py-12 sm:py-16">
        <div className="container-shell">
          <div className="max-w-3xl">
            <p className="eyebrow">Agents</p>
            <h1 className="section-title mt-4">Find, contact, or become a Xogmall agent.</h1>
            <p className="body-copy mt-6">
              Search the public agent locator, learn what agents support, and start the onboarding process if you want to partner with Xogmall.
            </p>
          </div>
        </div>
      </section>

      <section id="become-agent" className="bg-sky-soft py-12 sm:py-14">
        <div className="container-shell grid gap-5 lg:grid-cols-[1fr_1fr_1fr]">
          <article className="rounded-2xl border border-line bg-white p-6 shadow-sm">
            <span className="flex size-11 items-center justify-center rounded-full bg-sky-soft text-brand">
              <Storefront aria-hidden="true" size={23} weight="duotone" />
            </span>
            <h2 className="mt-5 text-xl font-semibold text-ink">Become a Xogmall agent</h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              Submit your details and required onboarding documents so Xogmall staff can review your application and prepare the agent forms for signature.
            </p>
            <Link href="/agent-onboarding" className="focus-ring mt-5 inline-flex min-h-11 items-center rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark">
              Start agent onboarding
            </Link>
          </article>

          <article className="rounded-2xl border border-line bg-white p-6 shadow-sm">
            <span className="flex size-11 items-center justify-center rounded-full bg-sky-soft text-brand">
              <ClipboardText aria-hidden="true" size={23} weight="duotone" />
            </span>
            <h2 className="mt-5 text-xl font-semibold text-ink">What agents help with</h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              Agents support customers with transfer guidance, information checks, document readiness, payout questions, and escalation to Xogmall staff when needed.
            </p>
          </article>

          <article className="rounded-2xl border border-line bg-white p-6 shadow-sm">
            <span className="flex size-11 items-center justify-center rounded-full bg-sky-soft text-brand">
              <MapPin aria-hidden="true" size={23} weight="duotone" />
            </span>
            <h2 className="mt-5 text-xl font-semibold text-ink">Authorised agent access</h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              Existing authorised agents can open the Xogmall Agent Portal in a separate tab.
            </p>
            {AGENT_PORTAL_URL ? (
              <a href={AGENT_PORTAL_URL} target="_blank" rel="noreferrer" className="focus-ring mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl border border-brand px-5 text-sm font-semibold text-brand hover:bg-blue-50">
                Open Agent Portal
                <ArrowSquareOut aria-hidden="true" size={16} weight="bold" />
              </a>
            ) : (
              <p className="mt-5 text-sm text-muted">Portal access will appear after an approved URL is configured.</p>
            )}
          </article>
        </div>
      </section>

      <section id="locator" className="bg-white py-12 sm:py-14">
        <div className="container-shell">
          <div className="max-w-3xl">
            <p className="eyebrow">UK agent locator</p>
            <h2 className="section-title mt-4">Find your nearest Xogmall agent.</h2>
            <p className="body-copy mt-6">
              Search by postcode, town, agent name, or register reference. Confirmed addresses appear on Google Maps, and the wider published agent directory helps you find other Xogmall agents while their public addresses are confirmed.
            </p>
          </div>
        </div>
      </section>
      <AgentLocatorExperience
        agents={agents}
        directoryAgents={directoryAgents}
        title={content["agentLocator.title"]}
        body={content["agentLocator.body"]}
        variant="page"
      />
    </PublicPageShell>
  );
}
