import { AgentLocatorExperience } from "@/components/site/AgentLocatorExperience";
import { enrichAgentsWithPostcodeCoordinates } from "@/lib/agent-geo";
import { getAgentDirectoryEntries, getPublishedAgents } from "@/lib/agents";
import { getSiteContentValues } from "@/lib/site-content";

export async function AgentLocatorSection() {
  const [publishedAgents, content] = await Promise.all([
    getPublishedAgents(),
    getSiteContentValues(["agentLocator.title", "agentLocator.body"]),
  ]);
  const agents = await enrichAgentsWithPostcodeCoordinates(publishedAgents);
  const directoryAgents = await getAgentDirectoryEntries(publishedAgents);

  return (
    <section id="agent-locator">
      <AgentLocatorExperience
        agents={agents}
        directoryAgents={directoryAgents}
        title={content["agentLocator.title"]}
        body={content["agentLocator.body"]}
        variant="section"
      />
    </section>
  );
}
