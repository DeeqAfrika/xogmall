"use client";

import Link from "next/link";
import {
  ArrowRight,
  Crosshair,
  EnvelopeSimple,
  MagnifyingGlass,
  MapPin,
  NavigationArrow,
  Phone,
  Storefront,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import {
  formatAgentAddress,
  googleMapsEmbedUrl,
  mapsDirectionsUrl,
  mapsSearchUrl,
} from "@/lib/agent-format";
import type { AgentDirectoryEntry, AgentLocation } from "@/lib/types";

type AgentLocatorExperienceProps = {
  agents: AgentLocation[];
  directoryAgents?: AgentDirectoryEntry[];
  title: string;
  body: string;
  variant: "section" | "page";
};

type Coordinates = {
  latitude: number;
  longitude: number;
};

type PostcodeLookupResult = {
  status: number;
  result?: {
    latitude: number | null;
    longitude: number | null;
    postcode?: string;
  } | null;
};

type SortableAgent = AgentLocation & {
  address: string;
  distanceMiles: number | null;
};

export function AgentLocatorExperience({ agents, directoryAgents = [], title, body, variant }: AgentLocatorExperienceProps) {
  const [selectedId, setSelectedId] = useState(agents[0]?.id ?? "");
  const [selectedDirectoryId, setSelectedDirectoryId] = useState("");
  const [query, setQuery] = useState("");
  const [textFilter, setTextFilter] = useState("");
  const [origin, setOrigin] = useState<Coordinates | null>(null);
  const [originLabel, setOriginLabel] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);

  const isFullPage = variant === "page";
  const preparedAgents = useMemo(
    () =>
      agents.map((agent) => ({
        ...agent,
        address: formatAgentAddress(agent),
        distanceMiles: origin && hasCoordinates(agent) ? distanceInMiles(origin, agent) : null,
      })),
    [agents, origin],
  );

  const confirmedAgents = useMemo(
    () => preparedAgents.filter(hasConfirmedMapAddress),
    [preparedAgents],
  );

  const filteredAgents = useMemo(() => {
    const normalizedFilter = textFilter.trim().toLowerCase();

    if (!normalizedFilter) {
      return confirmedAgents;
    }

    return confirmedAgents.filter((agent) =>
      [
        agent.name,
        agent.address,
        agent.phone,
        agent.email,
        agent.services,
      ].filter(Boolean).join(" ").toLowerCase().includes(normalizedFilter),
    );
  }, [confirmedAgents, textFilter]);

  const pendingDirectoryAgents = useMemo(
    () =>
      directoryAgents
        .filter((agent) => agent.status === "address_pending")
        .sort((a, b) => a.display_order - b.display_order || a.name.localeCompare(b.name)),
    [directoryAgents],
  );

  const filteredDirectoryAgents = useMemo(() => {
    const normalizedFilter = textFilter.trim().toLowerCase();

    if (!normalizedFilter) {
      return pendingDirectoryAgents;
    }

    return pendingDirectoryAgents.filter((agent) =>
      [
        agent.name,
        agent.fca_frn,
        agent.city,
        agent.postcode,
        agent.source_note,
      ].filter(Boolean).join(" ").toLowerCase().includes(normalizedFilter),
    );
  }, [pendingDirectoryAgents, textFilter]);

  const selectedDirectoryAgent = pendingDirectoryAgents.find((agent) => agent.id === selectedDirectoryId) ?? null;
  const directoryResults = useMemo(() => {
    if (!selectedDirectoryAgent) {
      return filteredDirectoryAgents;
    }

    return [
      selectedDirectoryAgent,
      ...filteredDirectoryAgents.filter((agent) => agent.id !== selectedDirectoryAgent.id),
    ];
  }, [filteredDirectoryAgents, selectedDirectoryAgent]);

  const sortedAgents = useMemo(() => {
    const list = [...filteredAgents];

    if (origin) {
      list.sort((a, b) => {
        if (a.distanceMiles === null && b.distanceMiles === null) {
          return a.display_order - b.display_order || a.name.localeCompare(b.name);
        }

        if (a.distanceMiles === null) return 1;
        if (b.distanceMiles === null) return -1;
        return a.distanceMiles - b.distanceMiles;
      });

      return list;
    }

    return list.sort((a, b) => a.display_order - b.display_order || a.name.localeCompare(b.name));
  }, [filteredAgents, origin]);

  const selectedAgent =
    sortedAgents.find((agent) => agent.id === selectedId) ??
    sortedAgents[0] ??
    null;
  const selectedAddress = selectedAgent?.address ?? "Address pending confirmation";
  const mapTitle = selectedAgent ? `${selectedAgent.name} on Google Maps` : "Hogmall location on Google Maps";

  async function handleNearestSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setTextFilter("");
      setStatusMessage("Enter a UK postcode or town to search the locator.");
      return;
    }

    setLoadingLocation(true);
    setStatusMessage("");

    const coordinates = await lookupPostcode(trimmedQuery);

    if (coordinates) {
      setOrigin(coordinates);
      setOriginLabel(trimmedQuery.toUpperCase());
      setTextFilter("");
      setSelectedDirectoryId("");
      setSelectedId(findNearestAgentId(confirmedAgents, coordinates) ?? selectedId);
      setStatusMessage(`Sorted by distance from ${trimmedQuery.toUpperCase()}.`);
    } else {
      setTextFilter(trimmedQuery);
      setStatusMessage("We could not calculate distance from that postcode, so the list is filtered by your search text.");
    }

    setLoadingLocation(false);
  }

  function handleUseLocation() {
    if (!navigator.geolocation) {
      setStatusMessage("Your browser does not support location sharing. Try entering your postcode instead.");
      return;
    }

    setLoadingLocation(true);
    setStatusMessage("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setOrigin({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setOriginLabel("your current location");
        setTextFilter("");
        setQuery("");
        setSelectedDirectoryId("");
        setSelectedId(findNearestAgentId(confirmedAgents, {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }) ?? selectedId);
        setStatusMessage("Sorted by distance from your current location.");
        setLoadingLocation(false);
      },
      () => {
        setStatusMessage("Location access was not allowed. You can still enter a UK postcode.");
        setLoadingLocation(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 1000 * 60 * 10 },
    );
  }

  function clearSearch() {
    setQuery("");
    setTextFilter("");
    setSelectedDirectoryId("");
    setOrigin(null);
    setOriginLabel("");
    setStatusMessage("");
  }

  function selectDirectoryAgent(agentId: string) {
    setSelectedDirectoryId(agentId);

    if (!agentId) {
      setStatusMessage("");
      return;
    }

    const agent = pendingDirectoryAgents.find((entry) => entry.id === agentId);

    if (!agent) {
      return;
    }

    setQuery(agent.name);
    setTextFilter(agent.name);
    setOrigin(null);
    setOriginLabel("");
    setStatusMessage(`${agent.name} is directory. Please confirm the current address with Hogmall before visiting.`);
  }

  function selectMappedAgent(agentId: string) {
    setSelectedId(agentId);
    setSelectedDirectoryId("");
  }

  return (
    <div className={isFullPage ? "bg-sky-soft py-10 sm:py-14" : "bg-sky-soft py-14 sm:py-16"}>
      <div className="container-shell">
        <div className={isFullPage ? "grid gap-8 xl:grid-cols-[0.85fr_1.15fr]" : "grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch"}>
          <div className="rounded-3xl bg-white p-6 shadow-[0_18px_55px_rgba(76,5,8,0.08)] sm:p-8">
            <p className="eyebrow">Agent locator</p>
            <h2 className={isFullPage ? "mt-3 text-4xl font-bold tracking-tight text-ink sm:text-5xl" : "mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl"}>
              {title}
            </h2>
            <p className="mt-5 text-sm leading-7 text-muted sm:text-base">{body}</p>

            {isFullPage ? (
              <div className="mt-8 rounded-2xl border border-line bg-sky-soft p-4">
                <form onSubmit={handleNearestSearch} className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <label className="sr-only" htmlFor="agent-search">Search by postcode, town, or agent name</label>
                  <div className="relative">
                    <MagnifyingGlass aria-hidden="true" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      id="agent-search"
                      value={query}
                      onChange={(event) => {
                        setQuery(event.target.value);
                        setTextFilter(event.target.value);
                        setSelectedDirectoryId("");
                      }}
                      placeholder="Enter postcode, town, or agent name"
                      className="h-12 w-full rounded-xl border border-line bg-white pl-11 pr-4 text-sm text-ink outline-none focus:border-brand focus:ring-3 focus:ring-red-100"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loadingLocation}
                    className="focus-ring inline-flex h-12 items-center justify-center rounded-xl bg-brand px-5 text-sm font-bold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loadingLocation ? "Checking..." : "Find nearest"}
                  </button>
                </form>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleUseLocation}
                    disabled={loadingLocation}
                    className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl border border-brand/20 bg-white px-4 text-xs font-bold text-brand hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Crosshair aria-hidden="true" size={16} weight="bold" />
                    Use my location
                  </button>
                  {(query || origin || textFilter) && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="focus-ring rounded-lg text-xs font-bold text-muted hover:text-brand"
                    >
                      Clear search
                    </button>
                  )}
                </div>
                {statusMessage && <p className="mt-3 text-xs leading-5 text-muted">{statusMessage}</p>}
              </div>
            ) : (
              <Link
                href="/agents"
                className="focus-ring mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-bold text-white hover:bg-brand-dark"
              >
                Open full locator <ArrowRight aria-hidden="true" size={16} weight="bold" />
              </Link>
            )}

            {sortedAgents.length > 0 && (
              <AgentSelectionPanel
                agents={sortedAgents}
                selectedId={selectedAgent?.id ?? ""}
                isFullPage={isFullPage}
                origin={origin}
                originLabel={originLabel}
                loadingLocation={loadingLocation}
                onSelect={selectMappedAgent}
                onUseLocation={handleUseLocation}
              />
            )}

            <div className={isFullPage ? "mt-8 grid gap-4" : "mt-8 grid gap-3"}>
              {selectedAgent ? (
                <AgentCard
                  agent={selectedAgent}
                  isSelected
                  origin={origin}
                  originLabel={originLabel}
                  onSelect={() => setSelectedId(selectedAgent.id)}
                />
              ) : (
                <EmptyLocatorState hasDirectoryMatches={isFullPage && directoryResults.length > 0} />
              )}
            </div>

            {isFullPage && pendingDirectoryAgents.length > 0 && (
              <AgentDirectoryPanel
                allAgents={pendingDirectoryAgents}
                agents={directoryResults}
                selectedId={selectedDirectoryId}
                searchTerm={textFilter}
                onSelect={selectDirectoryAgent}
              />
            )}
          </div>

          <div className="overflow-hidden rounded-3xl bg-navy text-white shadow-[0_24px_70px_rgba(76,5,8,0.22)]">
            <div className="grid min-h-full grid-rows-[auto_1fr]">
              <div className="p-6 sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-200">Google map</p>
                <h3 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                  {selectedAgent ? selectedAgent.name : "Hogmall agent locations"}
                </h3>
                <p className="mt-3 text-sm leading-6 text-red-100">
                  {selectedAgent ? selectedAddress : "Published Hogmall agent locations will appear here."}
                </p>
              </div>

              <div className={isFullPage ? "min-h-[520px] bg-white" : "min-h-[420px] bg-white"}>
                {selectedAgent ? <iframe
                  key={selectedAddress}
                  src={googleMapsEmbedUrl(selectedAddress)}
                  title={mapTitle}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-full min-h-[inherit] w-full border-0"
                /> : <div className="flex min-h-[inherit] items-center justify-center px-8 text-center text-sm text-muted">A map will appear when a published agent with a confirmed address is available.</div>}
              </div>
            </div>
          </div>
        </div>

        {isFullPage && (
          <p className="mt-5 text-center text-xs leading-5 text-muted">
            Distances are approximate straight-line distances from {originLabel || "your chosen postcode/location"}. Use Google Maps directions for live routing and travel time.
          </p>
        )}
      </div>
    </div>
  );
}

function AgentSelectionPanel({
  agents,
  selectedId,
  isFullPage,
  origin,
  originLabel,
  loadingLocation,
  onSelect,
  onUseLocation,
}: {
  agents: SortableAgent[];
  selectedId: string;
  isFullPage: boolean;
  origin: Coordinates | null;
  originLabel: string;
  loadingLocation: boolean;
  onSelect: (agentId: string) => void;
  onUseLocation: () => void;
}) {
  const agentCountLabel = agents.length === 1 ? "1 mapped agent" : `${agents.length} mapped agents`;

  return (
    <div className="mt-6 rounded-2xl border border-line bg-white p-4 shadow-[0_10px_28px_rgba(76,5,8,0.05)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Mapped agents</p>
          <h3 className="mt-1 text-lg font-bold tracking-tight text-ink">Choose which agent appears on the map</h3>
        </div>
        <span className="inline-flex w-fit rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-brand">
          {agentCountLabel}
        </span>
      </div>

      <label className="mt-4 block">
        <span className="text-xs font-bold text-ink">Agent map pin</span>
        <select
          value={selectedId}
          onChange={(event) => onSelect(event.target.value)}
          className="mt-2 h-12 w-full rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink outline-none focus:border-brand focus:ring-3 focus:ring-red-100"
        >
          {agents.map((agent, index) => (
            <option key={agent.id} value={agent.id}>
              {index === 0 && origin ? "Closest: " : ""}{agent.name}{agent.distanceMiles !== null ? ` - ${formatDistance(agent.distanceMiles)}` : ""}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {!isFullPage && (
          <button
            type="button"
            onClick={onUseLocation}
            disabled={loadingLocation}
            className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl border border-brand/20 bg-red-50 px-4 text-xs font-bold text-brand hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Crosshair aria-hidden="true" size={16} weight="bold" />
            {loadingLocation ? "Checking..." : "Use my location"}
          </button>
        )}
        <p className="text-xs leading-5 text-muted">
          {origin
            ? `Closest confirmed agents are sorted first from ${originLabel || "your location"}.`
            : "Select an agent from the dropdown to update the Google Maps pin."}
        </p>
      </div>
    </div>
  );
}

function AgentDirectoryPanel({
  allAgents,
  agents,
  selectedId,
  searchTerm,
  onSelect,
}: {
  allAgents: AgentDirectoryEntry[];
  agents: AgentDirectoryEntry[];
  selectedId: string;
  searchTerm: string;
  onSelect: (agentId: string) => void;
}) {
  const normalizedSearch = searchTerm.trim();
  const selectedAgent = allAgents.find((agent) => agent.id === selectedId) ?? null;
  const optionAgents = agents.length > 0 ? agents : allAgents;

  return (
    <div className="mt-6 rounded-2xl border border-red-100 bg-red-50/70 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Wider agent network</p>
          <h3 className="mt-2 text-lg font-bold tracking-tight text-ink">Search all directory Hogmall agents</h3>
          <p className="mt-2 text-xs leading-5 text-muted">
            Mapped agents have confirmed public addresses and directions. directory agents below are discoverable by name or register reference while their public address is being confirmed.
          </p>
        </div>
        <span className="inline-flex w-fit shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-brand shadow-sm">
          {allAgents.length === 1 ? "1 address-pending agent" : `${allAgents.length} address-pending agents`}
        </span>
      </div>

      <label className="mt-4 block">
        <span className="text-xs font-bold text-ink">Jump to an agent</span>
        <select
          value={selectedId}
          onChange={(event) => onSelect(event.target.value)}
          className="mt-2 h-12 w-full rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink outline-none focus:border-brand focus:ring-3 focus:ring-red-100"
        >
          <option value="">Select another directory agent</option>
          {optionAgents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name}{agent.fca_frn ? ` - register reference ${agent.fca_frn}` : ""}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-4 grid gap-3">
        {selectedAgent ? (
          <AgentDirectoryCard agent={selectedAgent} isSelected />
        ) : agents.length > 0 ? (
          <p className="rounded-xl border border-red-100 bg-white p-4 text-sm leading-6 text-muted">
            {normalizedSearch
              ? `${agents.length} address-pending directory ${agents.length === 1 ? "agent matches" : "agents match"} "${normalizedSearch}". Choose one from the dropdown above to view its details.`
              : "Choose an address-pending directory agent from the dropdown above to view its details."}
          </p>
        ) : (
          <p className="rounded-xl border border-dashed border-red-200 bg-white p-4 text-sm leading-6 text-muted">
            No published agent directory agents match {normalizedSearch ? `"${normalizedSearch}"` : "that search"}. Try a different agent name or register reference.
          </p>
        )}
      </div>
    </div>
  );
}

function AgentDirectoryCard({ agent, isSelected }: { agent: AgentDirectoryEntry; isSelected: boolean }) {
  return (
    <article className={`rounded-xl border bg-white p-4 ${isSelected ? "border-brand shadow-[0_12px_24px_rgba(220,20,30,0.12)]" : "border-line"}`}>
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-brand">
          <Storefront aria-hidden="true" size={20} weight="duotone" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-semibold text-ink">{agent.name}</h4>
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-amber-800">
              Address to confirm
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">
            {agent.fca_frn ? `register reference ${agent.fca_frn}` : "directory agent"}
            {agent.city ? ` · ${agent.city}` : ""}
            {agent.postcode ? ` · ${agent.postcode}` : ""}
          </p>
          {agent.source_note && <p className="mt-2 text-xs leading-5 text-muted">{agent.source_note}</p>}
          <Link href="/contact" className="focus-ring mt-3 inline-flex rounded-lg text-sm font-bold text-brand hover:text-brand-dark">
            Confirm address with Hogmall
          </Link>
        </div>
      </div>
    </article>
  );
}

function AgentCard({
  agent,
  isSelected,
  origin,
  originLabel,
  onSelect,
}: {
  agent: SortableAgent;
  isSelected: boolean;
  origin: Coordinates | null;
  originLabel: string;
  onSelect: () => void;
}) {
  const directionsUrl = mapsDirectionsUrl(agent.address, origin);

  return (
    <article className={`rounded-2xl border bg-white p-4 transition ${isSelected ? "border-brand shadow-[0_14px_30px_rgba(220,20,30,0.12)]" : "border-line hover:border-red-200"}`}>
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-brand">
          <Storefront aria-hidden="true" size={22} weight="duotone" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="font-semibold text-ink">{agent.name}</h3>
            {agent.distanceMiles !== null && (
              <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-brand">
                {formatDistance(agent.distanceMiles)}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm leading-6 text-muted">{agent.address}</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-muted">
            {agent.phone && <a href={`tel:${agent.phone}`} className="inline-flex items-center gap-1.5 hover:text-brand"><Phone aria-hidden="true" size={15} />{agent.phone}</a>}
            {agent.email && <a href={`mailto:${agent.email}`} className="inline-flex items-center gap-1.5 hover:text-brand"><EnvelopeSimple aria-hidden="true" size={15} />Email</a>}
          </div>
          {agent.services && <p className="mt-3 text-xs leading-5 text-muted">{agent.services}</p>}
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onSelect}
              className="focus-ring inline-flex items-center gap-2 rounded-lg text-sm font-bold text-brand hover:text-brand-dark"
            >
              <MapPin aria-hidden="true" size={16} weight="fill" />
              Show on map
            </button>
            <a href={directionsUrl} target="_blank" rel="noreferrer" className="focus-ring inline-flex items-center gap-2 rounded-lg text-sm font-bold text-brand hover:text-brand-dark">
              Directions <NavigationArrow aria-hidden="true" size={15} weight="bold" />
            </a>
            <a href={mapsSearchUrl(agent.address)} target="_blank" rel="noreferrer" className="focus-ring inline-flex items-center gap-2 rounded-lg text-sm font-bold text-muted hover:text-brand">
              Open Google Maps
            </a>
          </div>
          {origin && agent.distanceMiles === null && (
            <p className="mt-3 text-xs leading-5 text-muted">Distance from {originLabel || "your location"} is unavailable until this agent has a valid postcode or coordinates.</p>
          )}
        </div>
      </div>
    </article>
  );
}

function EmptyLocatorState({ hasDirectoryMatches = false }: { hasDirectoryMatches?: boolean }) {
  return (
    <div className="rounded-2xl border border-dashed border-red-200 bg-red-50 p-5">
      <h3 className="font-semibold text-ink">No matching agents found.</h3>
      <p className="mt-2 text-sm leading-6 text-muted">
        {hasDirectoryMatches
          ? "No confirmed map locations match this search yet. Check the wider published agent directory above, or try a different postcode, town, agent name, or register reference."
          : "Try a different postcode, town, or agent name. Published Hogmall agents can also be confirmed by contacting support."}
      </p>
    </div>
  );
}

function hasConfirmedMapAddress(agent: SortableAgent) {
  return (
    agent.address_line_1.trim().toLowerCase() !== "address pending fca api lookup" &&
    agent.city.trim().toLowerCase() !== "to be confirmed"
  );
}

function hasCoordinates(agent: Pick<AgentLocation, "latitude" | "longitude">): agent is AgentLocation & Coordinates {
  return typeof agent.latitude === "number" && typeof agent.longitude === "number";
}

function distanceInMiles(origin: Coordinates, agent: Coordinates) {
  const earthRadiusMiles = 3958.7613;
  const latitudeDelta = toRadians(agent.latitude - origin.latitude);
  const longitudeDelta = toRadians(agent.longitude - origin.longitude);
  const originLatitude = toRadians(origin.latitude);
  const agentLatitude = toRadians(agent.latitude);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(originLatitude) * Math.cos(agentLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return earthRadiusMiles * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function formatDistance(distanceMiles: number) {
  if (distanceMiles < 0.1) {
    return "Under 0.1 mi";
  }

  return `${distanceMiles.toFixed(distanceMiles < 10 ? 1 : 0)} mi`;
}

function findNearestAgentId(agents: AgentLocation[], origin: Coordinates) {
  return agents
    .filter(hasCoordinates)
    .map((agent) => ({
      id: agent.id,
      distanceMiles: distanceInMiles(origin, agent),
    }))
    .sort((a, b) => a.distanceMiles - b.distanceMiles)[0]?.id;
}

async function lookupPostcode(postcode: string): Promise<Coordinates | null> {
  try {
    const response = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`);

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
