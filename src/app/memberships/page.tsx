import type { Metadata } from "next";
import Link from "next/link";
import { additionalMember, clubSystems, fees, onlineApplication, plans, rules } from "@/config/gym";
import { PlanCard } from "@/components/PlanCard";
import { ButtonLink, Eyebrow, H2, PageHero, PrelaunchNote, Section } from "@/components/ui";
import { money } from "@/lib/pricing";
import { otherFees } from "@/lib/fee-list";

export const metadata: Metadata = {
  title: "Memberships & Pricing",
  description: "Bricks Gym membership plans: month-to-month, 6, 12 and 24 months, plus family add-ons and day passes.",
  alternates: { canonical: "/memberships" },
};

export default function MembershipsPage() {
  const familyDues = Object.values(additionalMember.monthlyDues);
  const dayPassOnline = clubSystems.joinNowUrls["day-pass"];
  return (
    <>
      <PageHero eyebrow="Memberships" title="Plans & pricing">
        Simple plans. Every fee shown up front.
      </PageHero>

      <Section>
        <PrelaunchNote>Prices shown are sample numbers until final pricing is set.</PrelaunchNote>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((p) => (
            <PlanCard key={p.id} plan={p} location="memberships" />
          ))}
        </div>
        <p className="mt-8 text-sm text-iron">
          Every plan&apos;s full costs, including the yearly Club Improvement fee and early cancellation fees, are in our{" "}
          <Link href="/legal/membership-terms#sec-plans" className="font-semibold text-brick underline">
            Membership Terms
          </Link>
          .
        </p>
      </Section>

      <Section tone="paper">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <Eyebrow>Family</Eyebrow>
            <H2>Add family members</H2>
            <p className="mt-4 text-iron">
              {money(Math.min(...familyDues))}–{money(Math.max(...familyDues))} a month per person, depending on the plan
              {additionalMember.enrollmentFee > 0 ? `, plus a ${money(additionalMember.enrollmentFee)} enrollment fee each` : ""}.
              The person who signs up is the <strong>Primary member</strong> and pays for everyone. Members must be at least{" "}
              {rules.minimumAge}; ages {rules.minimumAge}–{rules.accompaniedThroughAge} must be with a parent or guardian.
            </p>

            <h3 className="mt-10 font-display text-2xl">How joining works</h3>
            <ol className="mt-4 space-y-3">
              {["Pick a plan and fill out the online application (about 5 minutes).", ...onlineApplication.nextSteps].map(
                (s, i) => (
                  <li key={s} className="flex gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brick font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="pt-1">{s}</span>
                  </li>
                ),
              )}
            </ol>
          </div>

          <div id="day-pass" className="scroll-mt-28">
            <Eyebrow>Just visiting?</Eyebrow>
            <H2>Day pass: {money(fees.dayPass)}</H2>
            <p className="mt-4 text-iron">
              {dayPassOnline
                ? "Buy your day pass online, then check in at the front desk."
                : "Walk in during open hours and grab a day pass at the front desk."}{" "}
              Bring a photo ID; you&apos;ll sign a liability waiver before you train. Minimum age {rules.minimumAge}.
            </p>
            {dayPassOnline && (
              <div className="mt-4">
                <ButtonLink href={dayPassOnline}>Buy a day pass</ButtonLink>
              </div>
            )}
          </div>
        </div>
      </Section>

      <Section>
        <details className="group max-w-3xl">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 border-b-2 border-ink/10 pb-3">
            <span>
              <span className="stamp block text-sm text-brick">The fine print</span>
              <span className="font-display text-2xl">Other fees</span>
            </span>
            <span aria-hidden="true" className="text-3xl text-brick transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <dl className="divide-y divide-ink/10">
            {otherFees().map((f) => (
              <div key={f.name} className="py-3">
                <dt className="font-semibold">{f.name}</dt>
                <dd className="text-iron">
                  {f.amount}
                  {f.note && <span className="block text-sm text-concrete">{f.note}</span>}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 text-sm text-concrete">
            Full details are in the{" "}
            <Link href="/legal/membership-terms" className="text-brick underline">
              Membership Terms
            </Link>
            .
          </p>
        </details>
      </Section>
    </>
  );
}
