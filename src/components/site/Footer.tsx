import Image from "next/image";
import Link from "next/link";
import { brand } from "@/config/brand";

const legalLinks = [
  { label: "About", href: "/about" },
  { label: "Agents", href: "/agents" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Regulatory", href: "/regulatory-information" },
  { label: "Help", href: "/contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-[#fffaf6] text-ink">
      <div className="container-shell flex flex-col gap-8 py-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-sm">
          <div className="flex items-center gap-3"><Image src={brand.logo.icon} alt="" width={267} height={255} className="h-11 w-auto" /><span className="text-lg font-extrabold">{brand.name}</span></div>
          <p className="mt-5 max-w-sm text-xs leading-6 text-muted">Public rate information, agent discovery, and private agent onboarding.</p>
          <p className="mt-2 text-[11px] leading-5 text-muted">{brand.legalName} · Company no. {brand.companyNumber}<br />FCA FRN {brand.fcaReferenceNumber} · {brand.paymentServicesStatus}</p>
        </div>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-muted">
          {legalLinks.map((link) => <Link key={link.label} href={link.href} className="hover:text-brand">{link.label}</Link>)}
          {brand.agentPortalUrl ? <a href={brand.agentPortalUrl} target="_blank" rel="noreferrer" className="hover:text-brand">Agent portal</a> : null}
        </nav>
        <div className="text-xs leading-5 text-muted lg:text-right">
          <p>© {new Date().getFullYear()} {brand.legalName}</p>
          <p>Some activities may not be protected. <Link href="/regulatory-information" className="underline underline-offset-2 hover:text-brand">Learn more</Link></p>
        </div>
      </div>
    </footer>
  );
}
