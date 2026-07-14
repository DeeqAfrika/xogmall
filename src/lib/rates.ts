import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { ExchangeRate } from "@/lib/types";

export async function getActiveRate(): Promise<ExchangeRate | null> {
  if (!hasSupabaseEnv()) {
    return null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("exchange_rates")
      .select(
        "id, from_currency, to_currency, rate, effective_date, is_active, note, created_by, created_at",
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return { ...data, rate: Number(data.rate) } as ExchangeRate;
  } catch {
    return null;
  }
}

export function formatUkTimestamp(value: string) {
  const date = new Date(value);

  return {
    date: new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Europe/London",
    }).format(date),
    time: new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Europe/London",
    }).format(date),
  };
}
