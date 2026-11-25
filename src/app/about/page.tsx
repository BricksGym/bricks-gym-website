import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { aboutStory } from "@/config/gym";
import { ButtonLink, PageHero, Prose, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "About",
  description: "The story of Bricks Gym, an independent gym on Main Street in Watsonville, CA.",
  alternates: { canonical: "/about" },
};

/** Shown only once you write your story in src/config/gym.ts (aboutStory). */
export default function AboutPage() {
  if (aboutStory.length === 0) notFound();
  return (
    <>
      <PageHero eyebrow="About" title="Built brick by brick" />
      <Section>
        <Prose>
          {aboutStory.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <div className="pt-2">
            <ButtonLink href="/memberships">See memberships</ButtonLink>
          </div>
        </Prose>
      </Section>
    </>
  );
}
