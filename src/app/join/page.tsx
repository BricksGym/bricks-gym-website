import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero, Section } from "@/components/ui";
import { JoinForm } from "./JoinForm";

export const metadata: Metadata = {
  title: "Join Online",
  description: "Join Bricks Gym online: pick a plan, fill in your details and sign your membership agreement. Nothing is charged online.",
  alternates: { canonical: "/join" },
};

export default function JoinPage() {
  return (
    <>
      <PageHero eyebrow="Join" title="Membership application">
        About 10 minutes. Sign up and sign your agreement online. Nothing is charged online: we&apos;ll call you to set up payment.
      </PageHero>
      <Section>
        <Suspense fallback={<p className="text-concrete">Loading the application…</p>}>
          <JoinForm />
        </Suspense>
      </Section>
    </>
  );
}
