export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-sky-soft px-6">
      <div className="text-center">
        <div className="mx-auto size-10 animate-pulse rounded-full bg-brand" />
        <p className="mt-4 text-sm font-medium text-muted">Loading Hogmall…</p>
      </div>
    </div>
  );
}
