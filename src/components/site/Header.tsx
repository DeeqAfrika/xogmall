"use client";

import Image from "next/image";
import Link from "next/link";
import { List, Storefront, X } from "@phosphor-icons/react";
import { useState } from "react";
import { brand } from "@/config/brand";

const links = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Agents", href: "/agents" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-40 border-b border-line bg-white">
      <div className="container-shell flex min-h-16 items-center justify-between gap-4 lg:min-h-[4.5rem]">
        <Link
          href="/"
          aria-label={`${brand.name} home`}
          className="focus-ring shrink-0 rounded-lg"
        >
          <Image
            src={brand.logo.full}
            alt={brand.name}
            width={4000}
            height={1928}
            priority
            className="h-auto w-[105px] sm:w-[116px]"
          />
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-5 lg:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="focus-ring rounded-md text-[13px] font-medium text-ink transition-colors hover:text-brand"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {brand.agentPortalUrl && <div className="hidden items-center gap-2 lg:flex">
          <a
            href={brand.agentPortalUrl}
            target="_blank"
            rel="noreferrer"
            className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-md border border-brand px-3 text-xs font-semibold text-brand transition-colors hover:bg-blue-50"
          >
            <Storefront aria-hidden="true" size={15} weight="bold" /> Open Agent Portal
          </a>
        </div>}

        <button
          type="button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="focus-ring inline-flex size-11 items-center justify-center rounded-lg border border-line text-ink lg:hidden"
        >
          {open ? <X size={22} weight="bold" /> : <List size={23} weight="bold" />}
        </button>
      </div>

      {open && (
        <nav
          aria-label="Mobile navigation"
          className="absolute inset-x-0 top-full border-y border-line bg-white px-4 py-5 shadow-xl lg:hidden"
        >
          <div className="mx-auto flex max-w-xl flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="focus-ring rounded-lg px-3 py-3 text-base font-medium text-ink hover:bg-sky-soft"
              >
                {link.label}
              </Link>
            ))}
            {brand.agentPortalUrl && <div className="mt-3 border-t border-line pt-4">
              <a
                href={brand.agentPortalUrl}
                target="_blank"
                rel="noreferrer"
                className="focus-ring inline-flex min-h-12 w-full items-center justify-center rounded-lg border border-brand px-3 text-center text-sm font-semibold text-brand"
              >
                Open Agent Portal
              </a>
            </div>}
          </div>
        </nav>
      )}
    </header>
  );
}
