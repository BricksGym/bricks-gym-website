import type { Metadata } from "next";
import Link from "next/link";
import { business } from "@/config/gym";
import { PageHero, PrelaunchNote, Prose, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What information Bricks Gym collects, why, and how it is protected.",
  alternates: { canonical: "/legal/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy policy" />
      <Section>
        <Prose>
          <PrelaunchNote>Draft for attorney review.</PrelaunchNote>
          <p>
            This policy explains what information {business.legalName}, doing business as {business.name} (&quot;we&quot;),
            collects through this website and at the gym, how we use it, and the choices you have.
          </p>

          <h2>What we collect</h2>
          <ul>
            <li>
              <strong>Membership applications:</strong> name, birthdate, mailing address, phone numbers, email, driver&apos;s
              license number, the plan you choose and the family members you add (with their names and birthdates).
            </li>
            <li>
              <strong>Contact and cancellation forms:</strong> name, email, phone and your message.
            </li>
            <li>
              <strong>At the gym:</strong> your signed membership agreement, payment details and check-in visits. These are
              handled in our member management system, Club Systems.
            </li>
            <li>
              <strong>Website visits:</strong> anonymous, cookie-free statistics (for example, how many people clicked
              &quot;Join&quot;). We do not use advertising cookies or sell your information.
            </li>
          </ul>
          <p>
            <strong>This website never collects card numbers, security codes or bank account numbers.</strong> Payments are
            set up only through Club Systems&apos; secure systems.
          </p>

          <h2>How we use it</h2>
          <ul>
            <li>To set up and manage your membership, billing and check-in.</li>
            <li>To verify your identity and age.</li>
            <li>To answer your questions and process cancellation requests.</li>
            <li>To send required notices about your membership (renewal reminders, price changes, cancellation confirmations).</li>
          </ul>

          <h2>Who we share it with</h2>
          <p>We share information only with service providers that help us run the gym, and only for that purpose:</p>
          <ul>
            <li>
              <strong>Club Systems</strong> (Health Club Systems Corp.): member records, agreements, billing and check-in.
            </li>
            <li>
              <strong>Website hosting and email providers</strong>, which deliver this website and send form submissions and
              confirmations to us and to you.
            </li>
            <li>
              <strong>Cloudflare Turnstile</strong>, which checks that forms are filled in by people, not bots.
            </li>
            <li>A collection agency, only if an account goes unpaid as described in the membership agreement.</li>
          </ul>
          <p>We may also disclose information when required by law.</p>

          <h2>How long we keep it</h2>
          <p>
            Online applications are entered into Club Systems and the emailed copy is then deleted. Membership records are
            kept for as long as you are a member and afterward as required for tax, accounting and legal purposes.
          </p>

          <h2>Children</h2>
          <p>
            Members must be at least 14. Applications for members under 18 must be made by a parent or guardian. We do not
            knowingly collect information from children under 13 through this website.
          </p>

          <h2>Your choices</h2>
          <p>
            You can ask to see, correct or delete the personal information we hold about you, subject to legal requirements
            to keep certain records. Contact us at{" "}
            <a href={`mailto:${business.email}`}>{business.email}</a> or {business.phone}, or visit the front desk.
          </p>

          <h2>Contact</h2>
          <p>
            {business.noticeAddress}
            <br />
            <Link href="/contact">Contact form</Link>
          </p>
        </Prose>
      </Section>
    </>
  );
}
