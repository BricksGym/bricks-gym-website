import type { Metadata } from "next";
import Link from "next/link";
import { business, clubSystems } from "@/config/gym";
import { ButtonLink, PageHero, Prose, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Member Login",
  description: "Manage your Bricks Gym membership: billing, payment card, freezes and cancellation.",
  alternates: { canonical: "/member-login" },
};

export default function MemberLoginPage() {
  const { memberPortalUrl, appStoreUrl, googlePlayUrl } = clubSystems;
  return (
    <>
      <PageHero eyebrow="Members" title="Member login" />
      <Section>
        <Prose>
          {memberPortalUrl ? (
            <>
              <p>
                Your account is managed in our secure member portal (powered by Club Systems). Log in to see your
                billing history, update your card, check visits and manage your membership.
              </p>
              <ButtonLink href={memberPortalUrl}>Go to the member portal</ButtonLink>
            </>
          ) : (
            <>
              <p>
                Online member accounts are coming soon. In the meantime, stop by the front desk or call{" "}
                <a href={`tel:${business.phone.replace(/[^0-9+]/g, "")}`}>{business.phone}</a> to update your card,
                freeze your membership or ask about your billing.
              </p>
              <p>
                Want to cancel? You can do that online any time on our{" "}
                <Link href="/cancel">cancellation page</Link>.
              </p>
            </>
          )}
          {(appStoreUrl || googlePlayUrl) && (
            <>
              <h2>Get the member app</h2>
              <p>Use the app for your digital check-in card at the front desk.</p>
              <div className="flex flex-wrap gap-3">
                {appStoreUrl && <ButtonLink href={appStoreUrl} variant="dark">Download on the App Store</ButtonLink>}
                {googlePlayUrl && <ButtonLink href={googlePlayUrl} variant="dark">Get it on Google Play</ButtonLink>}
              </div>
            </>
          )}
        </Prose>
      </Section>
    </>
  );
}
