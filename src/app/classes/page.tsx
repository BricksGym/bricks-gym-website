import type { Metadata } from "next";
import { amenities, classes, clubSystems, personalTraining } from "@/config/gym";
import { ComingSoon, Eyebrow, H2, PageHero, PrelaunchNote, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Classes & Amenities",
  description: "Free weights, cardio and group fitness at Bricks Gym in Watsonville.",
  alternates: { canonical: "/classes" },
};

export default function ClassesPage() {
  return (
    <>
      <PageHero eyebrow="Classes & Amenities" title="What's inside" />

      <Section>
        <Eyebrow>Amenities</Eyebrow>
        <H2>The gym floor</H2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {amenities.map((a) => (
            <li key={a.name} className="rounded-md border-l-4 border-brick bg-paper p-5">
              <h3 className="font-condensed text-xl font-semibold uppercase tracking-wide">
                {a.name}
                {a.comingSoon && <ComingSoon />}
              </h3>
              <p className="mt-1 text-iron">{a.description}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="paper">
        <Eyebrow>Classes</Eyebrow>
        <H2>Class schedule</H2>
        {clubSystems.schedulingWidgetUrl ? (
          <iframe
            title="Class schedule"
            src={clubSystems.schedulingWidgetUrl}
            className="mt-6 h-[700px] w-full rounded-md border border-ink/15 bg-white"
            loading="lazy"
          />
        ) : classes.length > 0 ? (
          <ul className="mt-6 divide-y divide-ink/10 rounded-md border border-ink/15 bg-white">
            {classes.map((c) => (
              <li key={c.name + c.when} className="p-4">
                <p className="font-semibold">
                  {c.name} <span className="font-normal text-concrete">· {c.when}</span>
                </p>
                <p className="text-iron">{c.description}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6 space-y-3">
            <p className="text-iron">Our class schedule is coming soon. Ask at the front desk for current classes.</p>
            <PrelaunchNote>Add classes in the settings file, or the Club Systems scheduling widget link.</PrelaunchNote>
          </div>
        )}
      </Section>

      {personalTraining.description && (
        <Section>
          <Eyebrow>Coaching</Eyebrow>
          <H2>Personal training</H2>
          <p className="mt-4 max-w-2xl text-iron">{personalTraining.description}</p>
        </Section>
      )}
    </>
  );
}
