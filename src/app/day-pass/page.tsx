import type { Metadata } from "next";
import { business, clubSystems, fees, rules } from "@/config/gym";
import { HoursTable } from "@/components/HoursTable";
import { ButtonLink, Eyebrow, H2, PageHero, Prose, Section } from "@/components/ui";
import { money } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Day Pass",
  description: `Train at Bricks Gym for the day for ${money(fees.dayPass)}.`,
  alternates: { canonical: "/day-pass" },
};

export default function DayPassPage() {
  const online = clubSystems.joinNowUrls["day-pass"];
  return (
    <>
      <PageHero eyebrow="Day Pass" title={`Train today: ${money(fees.dayPass)}`}>
        In town for the day, or want to try us out first? Grab a day pass.
      </PageHero>
      <Section>
        <div className="grid gap-12 md:grid-cols-2">
          <Prose>
            {online ? (
              <>
                <p>Buy your day pass online, then check in at the front desk.</p>
                <ButtonLink href={online}>Buy a day pass</ButtonLink>
              </>
            ) : (
              <p>
                <strong>Day passes are sold at the front desk.</strong> Just walk in during open hours. Bring a photo
                ID; you&apos;ll sign a liability waiver before you train.
              </p>
            )}
            <ul>
              <li>{money(fees.dayPass)} per person, per day.</li>
              <li>
                Minimum age {rules.minimumAge}. Ages {rules.minimumAge}–{rules.accompaniedThroughAge} must be with a
                parent or guardian.
              </li>
              <li>Athletic clothes and shoes required.</li>
            </ul>
            <p>
              Questions? Call <a href={`tel:${business.phone.replace(/[^0-9+]/g, "")}`}>{business.phone}</a>.
            </p>
          </Prose>
          <div>
            <Eyebrow>Hours</Eyebrow>
            <H2>When we&apos;re open</H2>
            <HoursTable className="mt-4" />
          </div>
        </div>
      </Section>
    </>
  );
}
