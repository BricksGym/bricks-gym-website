"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { track } from "@/lib/analytics";
import { buttonClass } from "@/components/ui";

/** A Join button that also records the click in analytics. */
export function JoinLink({
  href,
  plan,
  location,
  children,
  variant = "primary",
  size = "md",
  className = "",
}: {
  href: string;
  plan: string;
  location: string;
  children: ReactNode;
  variant?: "primary" | "dark" | "outline" | "outline-light";
  size?: "md" | "lg";
  className?: string;
}) {
  const cls = `${buttonClass(variant, size)} ${className}`;
  const onClick = () => track("Join Click", { plan, location });
  if (/^https?:\/\//.test(href)) {
    return (
      <a href={href} className={cls} onClick={onClick} data-plan={plan} rel="noopener">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} onClick={onClick} data-plan={plan}>
      {children}
    </Link>
  );
}
