import type { Metadata } from "next";
import { business } from "@/config/gym";
import { MapEmbed } from "@/components/MapEmbed";
import { Eyebrow, H2, PageHero, Section } from "@/components/ui";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact Bricks Gym at ${business.address.street}, Watsonville, CA. Call ${business.phone}.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const { address } = business;
  return (
    <>
      <PageHero eyebrow="Contact" title="Get in touch" />
      <Section>
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <Eyebrow>Send a message</Eyebrow>
            <H2>We&apos;ll get back to you</H2>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <Eyebrow>Visit or call</Eyebrow>
              <address className="mt-2 text-lg not-italic">
                {address.street}
                <br />
                {address.city}, {address.state} {address.zip}
                <br />
                <a href={`tel:${business.phone.replace(/[^0-9+]/g, "")}`} className="font-semibold text-brick">
                  {business.phone}
                </a>
                {business.email && (
                  <>
                    <br />
                    <a href={`mailto:${business.email}`} className="text-brick underline">
                      {business.email}
                    </a>
                  </>
                )}
              </address>
            </div>
            <MapEmbed />
          </div>
        </div>
      </Section>
    </>
  );
}
