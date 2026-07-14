import { COMPANY_ADDRESS } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminEnv, hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { AgentDirectoryEntry, AgentLocation } from "@/lib/types";

const agentSelect =
  "id, name, address_line_1, address_line_2, city, postcode, country, phone, email, opening_hours, services, latitude, longitude, status, display_order, updated_by, created_at, updated_at";
const fcaDirectorySelect =
  "id, name, address_line_1, address_line_2, city, postcode, services, display_order, status";
const fcaPendingAddressMarker = "Address pending approved directory lookup";

type PendingFcaAgentRecord = {
  id: string;
  name: string;
  address_line_2: string | null;
  city: string | null;
  postcode: string | null;
  services: string | null;
  display_order: number | null;
};

export async function getPublishedAgents(): Promise<AgentLocation[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("agents")
      .select(agentSelect)
      .eq("status", "published")
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      return [];
    }

    return (data || []).map(normalizeAgent);
  } catch {
    return [];
  }
}

export async function getAgentDirectoryEntries(publishedAgents?: AgentLocation[]): Promise<AgentDirectoryEntry[]> {
  const mappedAgents = publishedAgents ?? await getPublishedAgents();
  const pendingFcaAgents = await getPendingFcaDirectoryEntries();
  const entries = [
    ...mappedAgents.map(agentToDirectoryEntry),
    ...pendingFcaAgents,
  ];
  const uniqueEntries = new Map(entries.map((entry) => [entry.id, entry]));

  return [...uniqueEntries.values()].sort(
    (a, b) => a.display_order - b.display_order || a.name.localeCompare(b.name),
  );
}

export function companyAddressText() {
  return [
    COMPANY_ADDRESS.line1,
    COMPANY_ADDRESS.city,
    COMPANY_ADDRESS.postcode,
    COMPANY_ADDRESS.country,
  ].join(", ");
}

function normalizeAgent(agent: Record<string, unknown>) {
  return {
    ...agent,
    latitude: agent.latitude === null || agent.latitude === undefined ? null : Number(agent.latitude),
    longitude: agent.longitude === null || agent.longitude === undefined ? null : Number(agent.longitude),
    display_order: Number(agent.display_order || 0),
  } as AgentLocation;
}

async function getPendingFcaDirectoryEntries(): Promise<AgentDirectoryEntry[]> {
  if (!hasSupabaseAdminEnv()) {
    return [];
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("agents")
      .select(fcaDirectorySelect)
      .eq("status", "draft")
      .eq("address_line_1", fcaPendingAddressMarker)
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      return [];
    }

    const agents = (data || []) as PendingFcaAgentRecord[];

    return agents.map((agent) => ({
      id: String(agent.id),
      name: String(agent.name),
      fca_frn: extractFcaFrn([agent.address_line_2, agent.services]),
      city: isPendingLocation(agent.city) ? null : String(agent.city || ""),
      postcode: agent.postcode ? String(agent.postcode) : null,
      status: "address_pending",
      display_order: Number(agent.display_order || 0),
      source_note: "directory Xogmall agent. Public address is being confirmed before map directions are shown.",
    }));
  } catch {
    return [];
  }
}

function agentToDirectoryEntry(agent: AgentLocation): AgentDirectoryEntry {
  const hasPendingAddress = hasPendingPublicAddress(agent);

  return {
    id: agent.id,
    name: agent.name,
    fca_frn: extractFcaFrn([agent.address_line_2, agent.services]),
    city: hasPendingAddress || isPendingLocation(agent.city) ? null : agent.city || null,
    postcode: hasPendingAddress ? null : agent.postcode || null,
    status: hasPendingAddress ? "address_pending" : "mapped",
    display_order: agent.display_order,
    source_note: hasPendingAddress
      ? "directory Xogmall agent. Public address is being confirmed before map directions are shown."
      : null,
  };
}

function extractFcaFrn(values: unknown[]) {
  const text = values.filter(Boolean).join(" ");
  const match = text.match(/\bregister reference[:\s]+(\d+)/i);

  return match?.[1] ?? null;
}

function isPendingLocation(value: unknown) {
  return !value || String(value).trim().toLowerCase() === "to be confirmed";
}

function hasPendingPublicAddress(agent: Pick<AgentLocation, "address_line_1" | "city">) {
  return (
    String(agent.address_line_1).trim().toLowerCase() === fcaPendingAddressMarker.toLowerCase() ||
    isPendingLocation(agent.city)
  );
}

export { formatAgentAddress } from "@/lib/agent-format";
