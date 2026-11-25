import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { remodel } from "@/config/gym";
import { JoinLink } from "@/components/JoinLink";
import { Container, Eyebrow, H2, PageHero, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Remodel",
  description:
    "Bricks Gym in Watsonville is getting a huge remodel: new machines, a bigger workout space, new flooring, fresh paint, a new sound system and a sauna.",
  alternates: { canonical: "/remodel" },
};

export default function RemodelPage() {
  if (!remodel.show) notFound();
  return (
    <>
      <PageHero eyebrow="Remodel" title={remodel.headline}>
        {remodel.intro}
        {remodel.openStatus && (
          <p className="mt-4 inline-block rounded bg-brick px-3 py-1.5 font-condensed text-base font-semibold uppercase tracking-wider text-white">
            {remodel.openStatus}
          </p>
        )}
      </PageHero>

      <Section>
        <Eyebrow>What&apos;s coming</Eyebrow>
        <H2>Bigger. Better. Brand new.</H2>
        {remodel.timeline && (
          <p className="mt-3 inline-block rounded bg-brick px-3 py-1 font-condensed uppercase tracking-wider text-white">
            {remodel.timeline}
          </p>
        )}
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {remodel.upgrades.map((u, i) => (
            <li key={u.name} className="rounded-md border-l-4 border-brick bg-paper p-5">
              <p className="font-display text-3xl text-brick/30" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-1 font-condensed text-xl font-semibold uppercase tracking-wide">{u.name}</h3>
              <p className="mt-1 text-iron">{u.description}</p>
            </li>
          ))}
        </ul>
      </Section>

      <section className="bg-ink text-white">
        <Container className="flex flex-col items-center gap-5 py-14 text-center">
          <h2 className="font-display text-3xl sm:text-4xl">{remodel.closing}</h2>
          <p className="max-w-xl text-white/80">Join now and be part of the new Bricks Gym from day one.</p>
          <JoinLink href="/memberships" plan="any" location="remodel" size="lg">
            See memberships
          </JoinLink>
        </Container>
      </section>
    </>
  );
}
