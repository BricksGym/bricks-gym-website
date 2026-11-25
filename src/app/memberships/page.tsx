import type { Metadata } from "next";
import Link from "next/link";
import { additionalMember, afterTerm, onlineApplication, plans, rules } from "@/config/gym";
import { PlanCard } from "@/components/PlanCard";
import { Eyebrow, H2, PageHero, PrelaunchNote, Section } from "@/components/ui";
import { formatMoney, money, quote, termLabel } from "@/lib/pricing";
import { otherFees } from "@/lib/fee-list";

export const metadata: Metadata = {
  title: "Memberships & Pricing",
  description: "Compare Bricks Gym membership plans: month-to-month, 6, 12 and 24 months. Every fee shown up front.",
  alternates: { canonical: "/memberships" },
};

export default function MembershipsPage() {
  const quotes = plans.map((p) => quote(p.id));
  const familyDues = Object.values(additionalMember.monthlyDues);
  const rows: { label: string; values: string[] }[] = [
    { label: "Monthly dues", values: plans.map((p) => money(p.monthlyDues)) },
    { label: "Term", values: plans.map(termLabel) },
    { label: "Enrollment fee", values: plans.map((p) => money(p.enrollmentFee)) },
    { label: "Last month's dues up front", values: plans.map((p) => (p.lastMonthDueAtSignup ? "Yes" : "No")) },
    { label: "Due at signup", values: quotes.map((q) => formatMoney(q.dueTodayCents)) },
    {
      label: "Monthly payments after signup",
      values: quotes.map((q) => (q.remainingPayments === null ? "Ongoing" : String(q.remainingPayments))),
    },
    { label: "Each additional family member", values: plans.map((p) => `${money(additionalMember.monthlyDues[p.id])}/mo`) },
    { label: "Early cancellation fee", values: quotes.map((q) => q.earlyCancellation) },
  ];

  return (
    <>
      <PageHero eyebrow="Memberships" title="Plans & pricing">
        Every cost shown up front: no surprises at the front desk.
      </PageHero>

      <Section>
        <PrelaunchNote>Prices shown are sample numbers until final pricing is set.</PrelaunchNote>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((p) => (
            <PlanCard key={p.id} plan={p} location="memberships" />
          ))}
        </div>
      </Section>

      <Section tone="paper">
        <Eyebrow>Side by side</Eyebrow>
        <H2>Compare plans</H2>
        <div className="mt-6 overflow-x-auto rounded-md border border-ink/15 bg-white">
          <table className="w-full min-w-[640px] text-left text-[15px]">
            <caption className="sr-only">Membership plan comparison</caption>
            <thead className="bg-ink text-white">
              <tr>
                <th scope="col" className="p-3 font-condensed uppercase tracking-wider">
                  &nbsp;
                </th>
                {plans.map((p) => (
                  <th key={p.id} scope="col" className="p-3 font-condensed uppercase tracking-wider">
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-t border-ink/10">
                  <th scope="row" className="p-3 font-medium text-concrete">
                    {r.label}
                  </th>
                  {r.values.map((v, i) => (
                    <td key={plans[i].id} className="p-3">
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-concrete">{afterTerm.description}</p>
      </Section>

      <Section>
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <Eyebrow>Family</Eyebrow>
            <H2>Add family members</H2>
            <p className="mt-4 text-iron">
              Add family members to your membership for {money(Math.min(...familyDues))}–
              {money(Math.max(...familyDues))} a month each, depending on the plan
              {additionalMember.enrollmentFee > 0 ? `, plus a ${money(additionalMember.enrollmentFee)} enrollment fee each` : ""}.
              The person who signs up is the <strong>Primary member</strong> and is responsible for paying for
              everyone on the membership. Members must be at least {rules.minimumAge}; ages {rules.minimumAge}–
              {rules.accompaniedThroughAge} must be accompanied by a parent or guardian.
            </p>

            <h3 className="mt-10 font-display text-2xl">How joining works</h3>
            <ol className="mt-4 space-y-3">
              <li className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brick font-bold text-white">1</span>
                <span className="pt-1">Pick a plan and fill out the online application (about 5 minutes).</span>
              </li>
              {onlineApplication.nextSteps.map((s, i) => (
                <li key={s} className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brick font-bold text-white">
                    {i + 2}
                  </span>
                  <span className="pt-1">{s}</span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <Eyebrow>The fine print, in plain English</Eyebrow>
            <H2>Other fees</H2>
            <dl className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
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
            <p className="mt-4 text-sm text-concrete">
              Full details are in the{" "}
              <Link href="/legal/membership-terms" className="text-brick underline">
                Membership Terms
              </Link>
              .
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
