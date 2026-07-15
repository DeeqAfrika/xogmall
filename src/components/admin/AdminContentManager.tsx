"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type EditableBlock = {
  key: string;
  label: string;
  body: string;
  is_published: boolean;
  updated_at: string | null;
};

export function AdminContentManager({ blocks }: { blocks: EditableBlock[] }) {
  const router = useRouter();
  const [drafts, setDrafts] = useState(blocks);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function updateBlock(key: string, patch: Partial<EditableBlock>) {
    setDrafts((current) =>
      current.map((block) => block.key === key ? { ...block, ...patch } : block),
    );
  }

  async function saveBlock(block: EditableBlock) {
    if (!block.body.trim()) {
      setError("Content cannot be empty.");
      return;
    }

    setSavingKey(block.key);
    setMessage(null);
    setError(null);

    const supabase = createClient();
    const { error: saveError } = await supabase
      .from("site_content")
      .upsert({
        key: block.key,
        label: block.label,
        body: block.body.trim(),
        is_published: block.is_published,
      }, { onConflict: "key" });

    if (saveError) {
      setError(saveError.message);
      setSavingKey(null);
      return;
    }

    setMessage(`${block.label} saved.`);
    setSavingKey(null);
    router.refresh();
  }

  return (
    <div className="grid gap-5">
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}

      {drafts.map((block) => (
        <article key={block.key} className="rounded-2xl border border-line bg-white p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-wider text-brand">{block.key}</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">{block.label}</h2>
              {block.updated_at && <p className="mt-2 text-xs text-muted">Last saved {new Date(block.updated_at).toLocaleString("en-GB")}</p>}
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold text-ink">
              <input
                type="checkbox"
                checked={block.is_published}
                onChange={(event) => updateBlock(block.key, { is_published: event.target.checked })}
                className="size-4 accent-brand"
              />
              Published
            </label>
          </div>

          <textarea
            value={block.body}
            onChange={(event) => updateBlock(block.key, { body: event.target.value })}
            rows={5}
            className="mt-6 w-full resize-y rounded-xl border border-line px-4 py-3 text-ink outline-none focus:border-brand focus:ring-3 focus:ring-red-100"
          />

          <button
            type="button"
            disabled={savingKey === block.key}
            onClick={() => saveBlock(block)}
            className="focus-ring mt-4 inline-flex min-h-11 items-center rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark disabled:cursor-wait disabled:opacity-60"
          >
            {savingKey === block.key ? "Saving..." : "Save block"}
          </button>
        </article>
      ))}
    </div>
  );
}
