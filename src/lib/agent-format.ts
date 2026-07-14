import type { AgentLocation } from "@/lib/types";

export type AgentAddressFields = Pick<
  AgentLocation,
  "address_line_1" | "address_line_2" | "city" | "postcode" | "country"
>;

export function formatAgentAddress(agent: AgentAddressFields) {
  return [
    agent.address_line_1,
    agent.address_line_2,
    agent.city,
    agent.postcode,
    agent.country,
  ].filter(Boolean).join(", ");
}

export function mapsSearchUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export function mapsDirectionsUrl(address: string, origin?: { latitude: number; longitude: number } | null) {
  const params = new URLSearchParams({
    api: "1",
    destination: address,
  });

  if (origin) {
    params.set("origin", `${origin.latitude},${origin.longitude}`);
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function googleMapsEmbedUrl(address: string) {
  return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
}
