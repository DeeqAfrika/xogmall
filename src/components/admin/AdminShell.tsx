import Image from "next/image";
import Link from "next/link";

const adminLinks = [
  { label: "Dashboard", href: "/admin", key: "dashboard" },
  { label: "Rates", href: "/admin/rates", key: "rates" },
  { label: "Agents", href: "/admin/agents", key: "agents" },
  { label: "Page content", href: "/admin/content", key: "content" },
  { label: "Admin users", href: "/admin/users", key: "users" },
] as const;

export function AdminShell({
  children,
  actions,
  active,
}: {
  children: React.ReactNode;
  actions?: React.ReactNode;
  active?: (typeof adminLinks)[number]["key"];
}) {
  return (
    <div className="min-h-screen bg-[#f5f8fc]">
      <header className="border-b border-line bg-white">
        <div className="container-shell flex min-h-20 flex-wrap items-center justify-between gap-4">
          <Link href="/" aria-label="Hogmall homepage" className="focus-ring rounded-lg">
            <Image src="/brand/hogmall-icon.png" alt="Hogmall" width={267} height={255} className="h-11 w-auto object-contain" priority />
          </Link>
          {active && (
            <nav aria-label="Admin navigation" className="order-3 flex w-full gap-2 overflow-x-auto pb-4 text-sm sm:order-none sm:w-auto sm:pb-0">
              {adminLinks.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  className={`focus-ring shrink-0 rounded-full px-4 py-2 font-semibold ${
                    active === link.key
                      ? "bg-brand text-white"
                      : "border border-line bg-white text-muted hover:text-brand"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
          {actions}
        </div>
      </header>
      <main className="container-shell py-10 sm:py-14">{children}</main>
    </div>
  );
}
