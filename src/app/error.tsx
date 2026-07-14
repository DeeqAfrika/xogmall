"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-sky-soft px-6">
      <div className="max-w-md rounded-2xl border border-line bg-white p-8 text-center shadow-lg">
        <p className="eyebrow">Something went wrong</p>
        <h1 className="mt-3 text-2xl font-semibold text-ink">We could not load this page.</h1>
        <p className="mt-3 text-sm leading-6 text-muted">Please try again. The public rate will remain unavailable if the data service is not configured.</p>
        <button type="button" onClick={reset} className="focus-ring mt-6 min-h-11 rounded-xl bg-brand px-5 text-sm font-semibold text-white">Try again</button>
      </div>
    </div>
  );
}
