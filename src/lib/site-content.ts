import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { SiteContent } from "@/lib/types";

export const editableContentBlocks = [
  {
    key: "about.title",
    label: "About section headline",
    body: "A clear foundation for public rate information and agent workflows.",
  },
  {
    key: "about.body",
    label: "About section body",
    body:
      "Hogmall brings public rate information, a calculator, and an agent directory together in one place. Supported services, destinations, and operating details must be approved before launch.",
  },
  {
    key: "agentLocator.title",
    label: "Agent locator headline",
    body: "Find a Hogmall agent near you.",
  },
  {
    key: "agentLocator.body",
    label: "Agent locator body",
    body:
      "The locator displays only agent addresses that an authorised admin has marked as published.",
  },
  {
    key: "faq.customerIntro",
    label: "Customer FAQ intro",
    body: "Answers about the published rate, calculator, launch placeholders, and contact configuration.",
  },
  {
    key: "faq.businessIntro",
    label: "Business and agent FAQ intro",
    body: "Answers for agents, sub-agents, and community partners who want to work with Hogmall.",
  },
] as const;

export type EditableContentKey = (typeof editableContentBlocks)[number]["key"];

const defaultContent = Object.fromEntries(
  editableContentBlocks.map((block) => [block.key, block.body]),
) as Record<EditableContentKey, string>;

export function getDefaultSiteContent(key: EditableContentKey) {
  return defaultContent[key];
}

export async function getSiteContentValues(keys: EditableContentKey[]) {
  const values: Record<string, string> = {};

  for (const key of keys) {
    values[key] = getDefaultSiteContent(key);
  }

  if (!hasSupabaseEnv()) {
    return values as Record<EditableContentKey, string>;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_content")
      .select("key, body")
      .in("key", keys)
      .eq("is_published", true);

    if (error) {
      return values as Record<EditableContentKey, string>;
    }

    for (const item of data || []) {
      if (typeof item.body === "string" && item.body.trim()) {
        values[item.key as EditableContentKey] = item.body;
      }
    }
  } catch {
    return values as Record<EditableContentKey, string>;
  }

  return values as Record<EditableContentKey, string>;
}

export function mergeContentRows(rows: SiteContent[]) {
  return editableContentBlocks.map((block) => {
    const saved = rows.find((row) => row.key === block.key);
    return {
      ...block,
      body: saved?.body || block.body,
      is_published: saved?.is_published ?? true,
      updated_at: saved?.updated_at || null,
    };
  });
}
