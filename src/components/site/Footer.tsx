import Image from "next/image";
import Link from "next/link";
import { brand } from "@/config/brand";

const pageLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Agents", href: "/agents" },
  { label: "Contact", href: "/contact" },
];

const legalLinks = [
  { label: "Terms and conditions", href: "/terms" },
  { label: "Privacy policy", href: "/privacy" },
  { label: "Cookie policy", href: "/cookies" },
  { label: "Complaints", href: "/complaints" },
  { label: "Accessibility", href: "/accessibility" },
  { label: "Regulatory information", href: "/regulatory-information" },
];

export function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="container-shell grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.35fr_0.7fr_0.7fr_0.8fr]">
        <div>
          <Image src={brand.logo.white} alt={brand.name} width={458} height={445} className="h-auto w-[116px] rounded-xl" />
          <p className="mt-5 max-w-sm text-xs leading-6 text-red-100">Public rate information, agent discovery, and agent onboarding.</p>
          <p className="mt-4 max-w-sm text-[11px] leading-5 text-red-200">Registered address and contact details: to be confirmed before launch.</p>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider">Pages</h3>
          <div className="mt-4 flex flex-col gap-2.5 text-xs text-red-100">
            {pageLinks.map((link) => <Link key={link.label} href={link.href} className="hover:text-white">{link.label}</Link>)}
          </div>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider">Legal</h3>
          <div className="mt-4 flex flex-col gap-2.5 text-xs text-red-100">
            {legalLinks.map((link) => <Link key={link.label} href={link.href} className="hover:text-white">{link.label}</Link>)}
          </div>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider">Agent network</h3>
          <div className="mt-4 flex flex-col gap-2.5 text-xs text-red-100">
            {brand.agentPortalUrl && <a href={brand.agentPortalUrl} target="_blank" rel="noreferrer" className="hover:text-white">Open Agent Portal</a>}
            <Link href="/agents#locator" className="hover:text-white">Agent locator</Link>
            <Link href="/agents#become-agent" className="hover:text-white">Become an agent</Link>
            <Link href="/contact#support" className="hover:text-white">Support</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-shell flex flex-col gap-3 py-5 text-[10px] leading-5 text-red-200 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {brand.name}. Legal company information is pending approval.</p>
          <p className="max-w-2xl sm:text-right">Service, legal, and regulatory information must be approved before production launch.</p>
        </div>
      </div>
    </footer>
  );
}
