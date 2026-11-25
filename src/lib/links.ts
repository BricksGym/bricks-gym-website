import { aboutStory, classes, clubSystems, personalTraining, remodel, type PlanId } from "@/config/gym";

/** Which optional pages have real content. Empty pages stay hidden automatically. */
export const show = {
  about: aboutStory.length > 0,
  classes: classes.length > 0 || Boolean(clubSystems.schedulingWidgetUrl) || Boolean(personalTraining.description),
  remodel: remodel.show,
};

/** Where a plan's Join button goes: Club Systems if set, otherwise our application. */
export function joinHref(plan: PlanId | "day-pass"): string {
  const external = clubSystems.joinNowUrls[plan];
  if (external) return external;
  if (plan === "day-pass") return "/memberships#day-pass";
  return `/join?plan=${plan}`;
}

/** Club Systems member portal, or null until you add the link (then "Member Login" appears). */
export function memberLoginHref(): string | null {
  return clubSystems.memberPortalUrl || null;
}

export const isExternal = (href: string) => /^https?:\/\//.test(href);

export const nav = [
  { href: "/memberships", label: "Memberships" },
  ...(show.remodel ? [{ href: "/remodel", label: "Remodel" }] : []),
  ...(show.classes ? [{ href: "/classes", label: "Classes" }] : []),
  ...(show.about ? [{ href: "/about", label: "About" }] : []),
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];
