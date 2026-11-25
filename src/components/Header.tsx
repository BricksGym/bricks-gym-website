"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { nav, isExternal } from "@/lib/links";
import { buttonClass } from "@/components/ui";
import { track } from "@/lib/analytics";

export function Header({ logo, memberLoginHref }: { logo: ReactNode; memberLoginHref: string | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const close = () => setOpen(false);
  const loginProps = memberLoginHref && isExternal(memberLoginHref) ? { rel: "noopener" } : {};

  return (
    <header className="sticky top-0 z-40 border-b-4 border-brick bg-white">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:bg-ink focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2 sm:px-6">
        <Link href="/" onClick={close} className="shrink-0" aria-label="Bricks Gym home">
          {logo}
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-6 font-condensed text-[15px] uppercase tracking-wider">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className="py-2 text-iron hover:text-brick aria-[current=page]:text-brick"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          {memberLoginHref && (
            <a
              href={memberLoginHref}
              {...loginProps}
              onClick={() => track("Member Login Click")}
              className="hidden font-condensed text-sm font-semibold uppercase tracking-wider text-ink underline decoration-brick decoration-2 underline-offset-4 hover:text-brick sm:inline"
            >
              Member Login
            </a>
          )}
          <Link
            href="/memberships"
            onClick={() => {
              close();
              track("Join Click", { location: "header" });
            }}
            className={`${buttonClass("primary")} !px-4 !py-2 text-sm`}
          >
            Join Now
          </Link>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded border-2 border-ink/20 text-ink lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2.5" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label="Mobile" className="border-t border-ink/10 lg:hidden">
          <ul className="mx-auto max-w-6xl px-4 py-2 font-condensed text-lg uppercase tracking-wider">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} onClick={close} className="block border-b border-ink/10 py-3 text-ink">
                  {item.label}
                </Link>
              </li>
            ))}
            {memberLoginHref && (
              <li>
                <a href={memberLoginHref} {...loginProps} onClick={close} className="block py-3 text-brick">
                  Member Login →
                </a>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
