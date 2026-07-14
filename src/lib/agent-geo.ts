import { formatAgentAddress } from "@/lib/agent-format";
import type { AgentLocation } from "@/lib/types";

type PostcodeLookupResult = {
  status: number;
  result?: {
    latitude: number | null;
    longitude: number | null;
  } | null;
};

const postcodePattern = /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/i;

export function extractUkPostcode(value: string | null | undefined) {
  const match = value?.match(postcodePattern);
  return match ? match[0].toUpperCase().replace(/\s+/g, "") : null;
}

export async function enrichAgentsWithPostcodeCoordinates(agents: AgentLocation[]) {
  const postcodeCache = new Map<string, Promise<{ latitude: number; longitude: number } | null>>();

  return Promise.all(
    agents.map(async (agent) => {
      if (agent.latitude !== null && agent.longitude !== null) {
        return agent;
      }

      const postcode = extractUkPostcode(agent.postcode) ?? extractUkPostcode(formatAgentAddress(agent));

      if (!postcode) {
        return agent;
      }

      if (!postcodeCache.has(postcode)) {
        postcodeCache.set(postcode, lookupPostcode(postcode));
      }

      const coordinates = await postcodeCache.get(postcode);

      if (!coordinates) {
        return agent;
      }

      return {
        ...agent,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      };
    }),
  );
}

async function lookupPostcode(postcode: string) {
  try {
    const response = await fetch(
      `https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`,
      { next: { revalidate: 60 * 60 * 24 * 30 } },
    );

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as PostcodeLookupResult;

    if (
      payload.status !== 200 ||
      typeof payload.result?.latitude !== "number" ||
      typeof payload.result?.longitude !== "number"
    ) {
      return null;
    }

    return {
      latitude: payload.result.latitude,
      longitude: payload.result.longitude,
    };
  } catch {
    return null;
  }
}
