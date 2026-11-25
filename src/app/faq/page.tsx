import type { Metadata } from "next";
import Link from "next/link";
import { afterTerm, business, clubSystems, extraFaqs, fees, rules } from "@/config/gym";
import { PageHero, Section } from "@/components/ui";
import { money } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "FAQ",
  description: "How to join Bricks Gym, check in, freeze, cancel and update your payment card.",
  alternates: { canonical: "/faq" },
};

type Faq = { q: string; a: string; link?: { href: string; label: string } };

function faqs(): Faq[] {
  const portal = clubSystems.memberPortalUrl;
  const desk = `the front desk or call ${business.phone}`;
  return [
    {
      q: "How do I join online?",
      a: "Pick a plan and fill out the online application. It takes about 5 minutes and nothing is charged online. We'll contact you to finish up at the front desk, where you sign your membership agreement and set up payment securely.",
      link: { href: "/memberships", label: "Choose a plan" },
    },
    {
      q: "What do I pay when I sign up?",
      a: "The enrollment fee and your first month's dues, plus last month's dues on plans that require it. Each plan card shows the exact total due at signup.",
      link: { href: "/memberships", label: "Compare plans" },
    },
    {
      q: "What do I need to bring?",
      a: "A photo ID (driver's license or similar). Members under 18 need a parent or guardian to sign with them.",
    },
    {
      q: "How old do I have to be?",
      a: `At least ${rules.minimumAge}. Members under ${rules.adultAge} need a parent or guardian's signature, and members aged ${rules.minimumAge}–${rules.accompaniedThroughAge} must be accompanied by a parent or guardian while in the gym.`,
    },
    {
      q: "How do I check in?",
      a:
        clubSystems.appStoreUrl || clubSystems.googlePlayUrl
          ? "Check in at the front desk every visit. Show the digital check-in card in the member app, or give your name or member number."
          : "Check in at the front desk every visit with your name or member number.",
    },
    {
      q: "Can I add family members?",
      a: "Yes. The person who signs up becomes the Primary member and pays for everyone on the membership. You can add family members on the online application.",
    },
    {
      q: "How do I freeze my membership?",
      a: `You can freeze for ${fees.freeze.minMonths}–${fees.freeze.maxMonthsPerYear} months a year at ${money(fees.freeze.perMonth)} a month, paid in advance. A medical hold is free for up to ${fees.freeze.medicalHoldMaxMonths} months with a doctor's note. Frozen months don't count toward your contract. To request a freeze, ${portal ? "use the member portal or visit " + desk : "visit " + desk}.`,
    },
    {
      q: "How do I cancel?",
      a: `You can cancel online, any time, from our cancellation page. No phone call or visit needed. You can also cancel in person, by email from the address on your account, or by mail to ${business.noticeAddress}. Memberships end with ${afterTerm.noticeDays} days' written notice. If you're still within your initial term, the early cancellation fee for your plan applies. New members can cancel for a full refund within ${rules.rightToCancelBusinessDays} business days of signing (not counting Sundays and holidays).`,
      link: { href: "/cancel", label: "Cancel online" },
    },
    {
      q: "What happens when my term ends?",
      a: afterTerm.description,
    },
    {
      q: "How do I update my payment card?",
      a: portal
        ? "Log in to the member portal and update your card there, or visit the front desk."
        : `Visit ${desk}. For your security we never take card numbers through this website.`,
      ...(portal ? { link: { href: portal, label: "Member portal" } } : {}),
    },
    {
      q: "What is the Club Improvement fee?",
      a: `A yearly fee of ${money(fees.annualClubImprovement.amount)}${fees.annualClubImprovement.perMember ? " per member" : ""}, billed each ${fees.annualClubImprovement.month}. The Primary member pays it for everyone on the membership.`,
    },
    {
      q: "Can I just come in for a day?",
      a: `Yes. Day passes are ${money(fees.dayPass)}.`,
      link: { href: "/memberships#day-pass", label: "Day pass" },
    },
    {
      q: "Is my information safe?",
      a: "This website never asks for or stores card or bank numbers. Payments are handled only through our secure member system (Club Systems). See our privacy policy for what we collect and why.",
      link: { href: "/legal/privacy", label: "Privacy policy" },
    },
    ...extraFaqs,
  ];
}

export default function FaqPage() {
  const list = faqs();
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: list.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />
      <PageHero eyebrow="FAQ" title="Questions & answers" />
      <Section>
        <div className="max-w-3xl divide-y divide-ink/10 border-y border-ink/10">
          {list.map((f) => (
            <details key={f.q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                {f.q}
                <span aria-hidden="true" className="text-2xl text-brick transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-iron">{f.a}</p>
              {f.link && (
                <p className="mt-2">
                  <Link href={f.link.href} className="font-semibold text-brick underline">
                    {f.link.label} →
                  </Link>
                </p>
              )}
            </details>
          ))}
        </div>
      </Section>
    </>
  );
}
