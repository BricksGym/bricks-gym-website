import type { Metadata } from "next";
import { AgreementText } from "@/components/AgreementText";
import { PageHero, PrelaunchNote, Prose, Section } from "@/components/ui";
import { AGREEMENT_VERSION } from "@/content/agreement";

export const metadata: Metadata = {
  title: "Membership Terms",
  description: "The Bricks Gym membership agreement and conditions of membership.",
  alternates: { canonical: "/legal/membership-terms" },
};

export default function MembershipTermsPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Membership terms">
        The same agreement you sign at the front desk.
      </PageHero>
      <Section>
        <Prose>
          <PrelaunchNote>
            Draft for attorney review ({AGREEMENT_VERSION}). Must match the agreement loaded in Club Systems word for
            word.
          </PrelaunchNote>
          <AgreementText />
        </Prose>
      </Section>
    </>
  );
}
