import Link from "next/link";

export function ContentPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <div className="section-pad bg-white">
      <div className="container-shell">
        <div className="max-w-3xl">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="section-title mt-4">{title}</h1>
          <p className="body-copy mt-6">{intro}</p>
        </div>
        <div className="mt-12 max-w-3xl space-y-8 text-base leading-8 text-muted">
          {children}
        </div>
        <Link href="/" className="focus-ring mt-12 inline-flex rounded-lg text-sm font-semibold text-brand hover:text-brand-dark">
          Return to homepage
        </Link>
      </div>
    </div>
  );
}
