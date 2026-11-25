import type { Metadata } from "next";
import { fees } from "@/config/gym";
import { HoursTable } from "@/components/HoursTable";
import { ButtonLink, Eyebrow, H2, PageHero, Prose, Section } from "@/components/ui";
import { money } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Child Care",
  description: "On-site child care at Bricks Gym in Watsonville for kids 6 months and up.",
  alternates: { canonical: "/child-care" },
};

export default function ChildCarePage() {
  const c = fees.childCare;
  return (
    <>
      <PageHero eyebrow="Child Care" title="Bring the kids">
        On-site child care, so parents can train too.
      </PageHero>
      <Section>
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <Eyebrow>Pricing</Eyebrow>
            <H2>Simple rates</H2>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-md border-2 border-ink/15 p-5 text-center">
                <p className="font-display text-4xl text-brick">{money(c.perVisit)}</p>
                <p className="mt-1 text-concrete">per child, per visit</p>
              </div>
              <div className="rounded-md border-2 border-brick p-5 text-center">
                <p className="font-display text-4xl text-brick">{money(c.monthly)}</p>
                <p className="mt-1 text-concrete">per child, per month</p>
              </div>
            </div>
            <Prose>
              <ul className="mt-6">
                <li>For children {c.minimumAgeMonths} months and older.</li>
                <li>Available to members while they&apos;re working out in the gym.</li>
                <li>Prices may change. Ask at the front desk about current availability.</li>
              </ul>
            </Prose>
            <div className="mt-6">
              <ButtonLink href="/memberships">See memberships</ButtonLink>
            </div>
          </div>
          <div>
            <Eyebrow>Hours</Eyebrow>
            <H2>Gym hours</H2>
            <p className="mt-2 text-sm text-concrete">Ask at the front desk for child care hours.</p>
            <HoursTable className="mt-4" />
          </div>
        </div>
      </Section>
    </>
  );
}
