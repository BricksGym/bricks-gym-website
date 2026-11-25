import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero, Section } from "@/components/ui";
import { JoinForm } from "./JoinForm";

export const metadata: Metadata = {
  title: "Join Online",
  description: "Apply for a Bricks Gym membership online in about 5 minutes. Nothing is charged online.",
  alternates: { canonical: "/join" },
};

export default function JoinPage() {
  return (
    <>
      <PageHero eyebrow="Join" title="Membership application">
        About 5 minutes. Nothing is charged online. We&apos;ll contact you to finish up.
      </PageHero>
      <Section>
        <Suspense fallback={<p className="text-concrete">Loading the application…</p>}>
          <JoinForm />
        </Suspense>
      </Section>
    </>
  );
}
