import type { Metadata } from "next";
import { business, rules } from "@/config/gym";
import { PageHero, PrelaunchNote, Prose, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Liability Waiver",
  description: "The Bricks Gym release of liability and assumption of risk.",
  alternates: { canonical: "/legal/waiver" },
};

export default function WaiverPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Liability waiver" />
      <Section>
        <Prose>
          <PrelaunchNote>
            Draft for attorney review. This matches section 8 of the membership agreement and is also signed by day-pass
            visitors.
          </PrelaunchNote>
          <h2>Release of liability and assumption of risk</h2>
          <p>
            In exchange for being allowed to use the facilities, equipment and services of {business.name} (&quot;the
            Gym&quot;), I agree to the following:
          </p>
          <ol>
            <li>
              <strong>Physician advice.</strong> I have been advised to consult a physician before starting any exercise
              program, and I am responsible for knowing my own health limits.
            </li>
            <li>
              <strong>Risks.</strong> I understand that exercise and the use of gym equipment and facilities involve risks,
              including muscle and joint injuries, heart problems, falls, dropped weights, equipment failure, and illness
              (including contagious illnesses such as COVID-19), and in rare cases serious injury or death.
            </li>
            <li>
              <strong>Assumption of risk.</strong> I voluntarily accept all of these risks.
            </li>
            <li>
              <strong>Release.</strong> I release the Gym, its owners, employees and agents from all claims for injury,
              illness, loss or damage arising from my use of the Gym, including claims based on the Gym&apos;s negligence,
              to the fullest extent permitted by law.
            </li>
            <li>
              <strong>Rules.</strong> I will follow the Gym&apos;s rules and staff instructions and use equipment only as
              intended.
            </li>
            <li>
              <strong>Minors.</strong> If I am signing for a minor (ages {rules.minimumAge}–{rules.adultAge - 1}), I am the
              minor&apos;s parent or legal guardian and agree to these terms on the minor&apos;s behalf. Minors aged{" "}
              {rules.minimumAge}–{rules.accompaniedThroughAge} must be accompanied by a parent or guardian.
            </li>
          </ol>
          <p>I have read this waiver, understand it, and sign it voluntarily.</p>
        </Prose>
      </Section>
    </>
  );
}
