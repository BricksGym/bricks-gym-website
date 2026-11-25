import Link from "next/link";
import { business, clubSystems } from "@/config/gym";
import { Logo } from "@/components/Logo";
import { HoursTable } from "@/components/HoursTable";
import { memberLoginHref, nav } from "@/lib/links";

export function Footer() {
  const { address, social } = business;
  const loginHref = memberLoginHref();
  const socials = [
    { href: social.instagram, label: "Instagram" },
    { href: social.facebook, label: "Facebook" },
    { href: social.tiktok, label: "TikTok" },
    { href: social.googleBusinessProfile, label: "Google" },
  ].filter((s) => s.href);

  return (
    <footer className="border-t-4 border-brick bg-ink text-bone/80">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <Logo variant="white" className="w-44" />
          <address className="mt-4 not-italic leading-relaxed">
            {address.street}
            <br />
            {address.city}, {address.state} {address.zip}
            <br />
            <a href={`tel:${business.phone.replace(/[^0-9+]/g, "")}`} className="hover:text-bone">
              {business.phone}
            </a>
            {business.email && (
              <>
                <br />
                <a href={`mailto:${business.email}`} className="hover:text-bone">
                  {business.email}
                </a>
              </>
            )}
          </address>
        </div>

        <div>
          <h2 className="stamp text-sm text-bone">Hours</h2>
          <HoursTable className="mt-3 text-sm" dark />
        </div>

        <div>
          <h2 className="stamp text-sm text-bone">Gym</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="hover:text-bone">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/memberships#day-pass" className="hover:text-bone">
                Day Pass
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="stamp text-sm text-bone">Members</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {loginHref && (
              <li>
                <a href={loginHref} rel="noopener" className="hover:text-bone">
                  Member Login
                </a>
              </li>
            )}
            <li>
              <Link href="/cancel" className="hover:text-bone">
                Cancel My Membership
              </Link>
            </li>
            <li>
              <Link href="/legal/membership-terms" className="hover:text-bone">
                Membership Terms
              </Link>
            </li>
            <li>
              <Link href="/legal/privacy" className="hover:text-bone">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/legal/waiver" className="hover:text-bone">
                Liability Waiver
              </Link>
            </li>
          </ul>
          {socials.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-4 text-sm">
              {socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} rel="noopener" className="underline hover:text-bone">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="border-t border-bone/10">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-bone/60 sm:px-6">
          © {business.name}. Membership records, billing and check-in are handled securely through
          Club Systems{clubSystems.memberPortalUrl ? "" : " at the front desk"}.
        </p>
      </div>
    </footer>
  );
}
