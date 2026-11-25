import type { Metadata } from "next";
import { afterTerm, business, rules } from "@/config/gym";
import { PageHero, Prose, Section } from "@/components/ui";
import { CancelForm } from "./CancelForm";

export const metadata: Metadata = {
  title: "Cancel Membership",
  description: "Cancel your Bricks Gym membership online. No phone call or visit required.",
  alternates: { canonical: "/cancel" },
};

export default function CancelPage() {
  return (
    <>
      <PageHero eyebrow="Members" title="Cancel your membership">
        Cancel online in a minute. No phone call or visit needed.
      </PageHero>
      <Section>
        <div className="grid gap-12 md:grid-cols-[1fr_360px]">
          <CancelForm />
          <Prose>
            <h2 className="!pt-0">Good to know</h2>
            <ul>
              <li>You&apos;ll get an email right away with a request number and timestamp. That&apos;s your proof.</li>
              <li>Memberships end {afterTerm.noticeDays} days after we receive your written notice.</li>
              <li>If you&apos;re still in your initial term, your plan&apos;s early cancellation fee applies.</li>
              <li>
                Signed up within the last {rules.rightToCancelBusinessDays} business days (not counting Sundays and holidays)?
                You&apos;ll get a full refund.
              </li>
              <li>
                You can also cancel in person, by email from the address on your account to{" "}
                <a href={`mailto:${business.email}`}>{business.email}</a>, or by mail to {business.noticeAddress}.
              </li>
            </ul>
          </Prose>
        </div>
      </Section>
    </>
  );
}
