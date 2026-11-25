import type { Metadata } from "next";
import { business } from "@/config/gym";
import { MapEmbed } from "@/components/MapEmbed";
import { ButtonLink, PageHero, PrelaunchNote, Prose, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "About",
  description: "Bricks Gym is an independent, family-friendly gym on Main Street in Watsonville, CA.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="About" title="Built brick by brick">
        An independent gym on Main Street in Watsonville.
      </PageHero>
      <Section>
        <div className="grid gap-12 md:grid-cols-2">
          <Prose>
            <PrelaunchNote>Placeholder copy. Replace with your own story.</PrelaunchNote>
            <p>
              Bricks Gym is a locally owned, no-nonsense gym at {business.address.street} in Watsonville. We&apos;re
              here for people who want to show up, put in the work and get stronger, whether it&apos;s your first
              day under a bar or your thousandth.
            </p>
            <p>
              We keep it simple: solid equipment, fair prices with every fee shown up front, long hours and on-site
              child care so parents can train too.
            </p>
            <div className="pt-2">
              <ButtonLink href="/memberships">See memberships</ButtonLink>
            </div>
          </Prose>
          <MapEmbed />
        </div>
      </Section>
    </>
  );
}
