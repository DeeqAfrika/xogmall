"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, List, X } from "@phosphor-icons/react";
import { useState } from "react";
import { brand } from "@/config/brand";

const links = [
  { label: "Today’s rate", href: "/#rate-calculator" },
  { label: "Find an agent", href: "/agents#locator" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Help", href: "/contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-40 bg-[#fffaf6]">
      <div className="container-shell flex min-h-[4.75rem] items-center justify-between gap-4 lg:min-h-[5.5rem]">
        <Link
          href="/"
          aria-label={`${brand.name} home`}
          className="focus-ring shrink-0 rounded-lg"
        >
          <span className="flex items-center gap-3">
            <Image src={brand.logo.icon} alt="" width={267} height={255} priority className="h-11 w-auto object-contain sm:h-12" />
            <span className="text-lg font-extrabold tracking-[-0.03em] text-ink">{brand.name}</span>
          </span>
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

        <Link href="/agents#become-agent" className="focus-ring hidden min-h-11 items-center gap-2 rounded-full bg-brand px-5 text-sm font-bold text-white hover:bg-brand-dark lg:inline-flex">
          Join the network <ArrowRight aria-hidden="true" size={16} weight="bold" />
        </Link>

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
            <div className="mt-3 border-t border-line pt-4">
              <Link href="/agents#become-agent" onClick={() => setOpen(false)} className="focus-ring inline-flex min-h-12 w-full items-center justify-center rounded-full bg-brand px-4 text-center text-sm font-bold text-white">Join the network</Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
