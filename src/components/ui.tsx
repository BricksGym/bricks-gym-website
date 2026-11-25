import Link from "next/link";
import type { ReactNode } from "react";
import { PRELAUNCH } from "@/config/gym";
import { isExternal } from "@/lib/links";

export type ButtonVariant = "primary" | "dark" | "outline" | "outline-light";

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: "md" | "lg";
  className?: string;
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brick text-white hover:bg-brick-bright",
  dark: "bg-ink text-white hover:bg-iron",
  outline: "border-2 border-ink text-ink hover:bg-ink hover:text-white",
  "outline-light": "border-2 border-white text-white hover:bg-white hover:text-ink",
};

export function buttonClass(variant: ButtonVariant = "primary", size: "md" | "lg" = "md") {
  return `inline-flex items-center justify-center rounded font-condensed font-semibold uppercase tracking-wider transition-colors ${
    size === "lg" ? "px-7 py-4 text-lg" : "px-5 py-3 text-base"
  } ${variants[variant]}`;
}

export function ButtonLink({ href, children, variant, size, className = "" }: ButtonProps) {
  const cls = `${buttonClass(variant, size)} ${className}`;
  if (isExternal(href)) {
    return (
      <a href={href} className={cls} rel="noopener">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 ${className}`}>{children}</div>;
}

export function Section({ children, className = "", tone = "white" }: { children: ReactNode; className?: string; tone?: "white" | "paper" | "ink" }) {
  const bg = tone === "paper" ? "bg-paper" : tone === "ink" ? "bg-ink text-white" : "bg-white";
  return (
    <section className={`${bg} py-14 sm:py-20 ${className}`}>
      <Container>{children}</Container>
    </section>
  );
}

export function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <p className={`stamp text-sm ${light ? "text-white/70" : "text-brick"}`}>{children}</p>;
}

export function H2({ children, light = false, id }: { children: ReactNode; light?: boolean; id?: string }) {
  return (
    <h2 id={id} className={`mt-1 font-display text-3xl leading-tight sm:text-4xl ${light ? "text-white" : "text-ink"}`}>
      {children}
    </h2>
  );
}

/** Title band at the top of inner pages. */
export function PageHero({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <section className="border-b-4 border-brick bg-ink text-white">
      <Container className="py-12 sm:py-16">
        {eyebrow && <Eyebrow light>{eyebrow}</Eyebrow>}
        <h1 className="mt-1 font-display text-4xl leading-tight sm:text-5xl">{title}</h1>
        {children && <div className="mt-3 max-w-2xl text-lg text-white/80">{children}</div>}
      </Container>
    </section>
  );
}

/** Notice shown only before launch, so filler is never mistaken for real info. */
export function PrelaunchNote({ children }: { children: ReactNode }) {
  if (!PRELAUNCH) return null;
  return (
    <p className="rounded border border-dashed border-brick bg-brick/5 px-3 py-2 text-sm text-brick-dark">
      <span className="stamp mr-2 text-xs">Preview</span>
      {children}
    </p>
  );
}

/** Text wrapper for long pages (FAQ, legal pages). */
export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-3xl space-y-4 text-[17px] leading-relaxed text-iron [&_a]:font-semibold [&_a]:text-brick [&_a]:underline [&_h2]:pt-6 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-ink [&_h3]:pt-2 [&_h3]:font-condensed [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:uppercase [&_h3]:tracking-wide [&_h3]:text-ink [&_ol]:space-y-2 [&_ol]:pl-6 [&_ol>li]:list-decimal [&_strong]:text-ink [&_ul]:space-y-2 [&_ul]:pl-6 [&_ul>li]:list-disc">
      {children}
    </div>
  );
}
