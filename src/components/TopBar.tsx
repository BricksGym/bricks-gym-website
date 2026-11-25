import Link from "next/link";
import { business, remodel } from "@/config/gym";

/** Thin bar above the header: "Formerly Body Zone" and the remodel link. */
export function TopBar() {
  if (!business.formerName && !remodel.show) return null;
  return (
    <div className="bg-ink text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 py-2 text-center font-condensed text-sm uppercase tracking-[0.15em] sm:px-6">
        {business.formerName && (
          <p>
            Formerly <span className="font-semibold">{business.formerName}</span>
          </p>
        )}
        {business.formerName && remodel.show && (
          <span aria-hidden="true" className="text-brick-bright">
            ■
          </span>
        )}
        {remodel.show && (
          <Link href="/remodel" className="font-semibold text-white underline decoration-brick-bright decoration-2 underline-offset-4 hover:text-bone">
            Huge remodel underway →
          </Link>
        )}
      </div>
    </div>
  );
}
