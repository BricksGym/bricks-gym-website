import { clubSystems, type PlanId } from "@/config/gym";

/** Where a plan's Join button goes: Club Systems if set, otherwise our application. */
export function joinHref(plan: PlanId | "day-pass"): string {
  const external = clubSystems.joinNowUrls[plan];
  if (external) return external;
  if (plan === "day-pass") return "/day-pass";
  return `/join?plan=${plan}`;
}

/** Where "Member Login" goes: the Club Systems portal if set, else our info page. */
export function memberLoginHref(): string {
  return clubSystems.memberPortalUrl || "/member-login";
}

export const isExternal = (href: string) => /^https?:\/\//.test(href);

export const nav = [
  { href: "/memberships", label: "Memberships" },
  { href: "/classes", label: "Classes & Amenities" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];
