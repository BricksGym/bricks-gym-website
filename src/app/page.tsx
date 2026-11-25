import Image from "next/image";
import Link from "next/link";
import { amenities, business, fees, photos, plans, PRELAUNCH, testimonials } from "@/config/gym";
import { Logo } from "@/components/Logo";
import { PlanCard } from "@/components/PlanCard";
import { HoursTable } from "@/components/HoursTable";
import { MapEmbed } from "@/components/MapEmbed";
import { JoinLink } from "@/components/JoinLink";
import { ButtonLink, Container, Eyebrow, H2, PrelaunchNote, Section } from "@/components/ui";
import { money } from "@/lib/pricing";

export default function Home() {
  const { address } = business;
  return (
    <>
      {/* Hero */}
      <section className="border-b border-ink/10 bg-paper">
        <Container className="flex flex-col items-center py-14 text-center sm:py-20">
          <h1 className="sr-only">Bricks Gym — gym in Watsonville, CA</h1>
          <Logo priority className="w-full max-w-xl" />
          <p className="mt-6 font-condensed text-xl uppercase tracking-[0.2em] text-iron sm:text-2xl">
            {business.tagline}
          </p>
          <p className="mt-2 text-concrete">
            {address.street}, {address.city}, {address.state}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <JoinLink href="/memberships" plan="any" location="home-hero" size="lg">
              Join Now
            </JoinLink>
            <ButtonLink href="/day-pass" variant="outline" size="lg">
              Day Pass {money(fees.dayPass)}
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* Plans */}
      <Section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Memberships</Eyebrow>
            <H2>Pick your plan</H2>
          </div>
          <Link href="/memberships" className="font-semibold text-brick underline underline-offset-4">
            Compare all plans and fees →
          </Link>
        </div>
        <div className="mt-4">
          <PrelaunchNote>Prices shown are sample numbers until final pricing is set.</PrelaunchNote>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((p) => (
            <PlanCard key={p.id} plan={p} location="home" />
          ))}
        </div>
      </Section>

      {/* Amenities */}
      <Section tone="paper">
        <Eyebrow>Inside the gym</Eyebrow>
        <H2>Everything you need. Nothing you don&apos;t.</H2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {amenities.map((a) => (
            <li key={a.name} className="rounded-md border-l-4 border-brick bg-white p-5">
              <h3 className="font-condensed text-xl font-semibold uppercase tracking-wide">{a.name}</h3>
              <p className="mt-1 text-iron">{a.description}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* Photos */}
      {(photos.length > 0 || PRELAUNCH) && (
        <Section>
          <Eyebrow>Photos</Eyebrow>
          <H2>Take a look around</H2>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
            {photos.length > 0
              ? photos.map((p) => (
                  <Image
                    key={p.src}
                    src={p.src}
                    alt={p.alt}
                    width={800}
                    height={600}
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="aspect-[4/3] w-full rounded-md object-cover"
                  />
                ))
              : Array.from({ length: 6 }, (_, i) => (
                  <div
                    key={i}
                    className="flex aspect-[4/3] items-center justify-center rounded-md border-2 border-dashed border-ink/20 bg-paper text-sm text-concrete"
                  >
                    Photo coming soon
                  </div>
                ))}
          </div>
        </Section>
      )}

      {/* Testimonials — real reviews only, added in src/config/gym.ts */}
      {(testimonials.length > 0 || PRELAUNCH) && (
        <Section tone="paper">
          <Eyebrow>Members say</Eyebrow>
          <H2>Reviews</H2>
          {testimonials.length > 0 ? (
            <ul className="mt-8 grid gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <li key={t.quote} className="rounded-md bg-white p-6">
                  <blockquote className="text-lg text-iron">&ldquo;{t.quote}&rdquo;</blockquote>
                  <p className="mt-3 font-semibold">
                    {t.name}
                    {t.source && <span className="font-normal text-concrete"> · {t.source}</span>}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6">
              <PrelaunchNote>Real member reviews go here. Add them in the settings file.</PrelaunchNote>
            </div>
          )}
        </Section>
      )}

      {/* Hours & location */}
      <Section>
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <Eyebrow>Visit us</Eyebrow>
            <H2>Hours &amp; location</H2>
            <address className="mt-4 not-italic text-lg">
              {address.street}
              <br />
              {address.city}, {address.state} {address.zip}
            </address>
            <p className="mt-1">
              <a href={`tel:${business.phone.replace(/[^0-9+]/g, "")}`} className="font-semibold text-brick">
                {business.phone}
              </a>
            </p>
            <HoursTable className="mt-6 max-w-sm" />
            <p className="mt-4 text-sm text-concrete">
              On-site child care for kids {fees.childCare.minimumAgeMonths} months and up.{" "}
              <Link href="/child-care" className="text-brick underline">
                Learn more
              </Link>
            </p>
          </div>
          <MapEmbed />
        </div>
      </Section>

      {/* Final call to action */}
      <section className="bg-brick text-white">
        <Container className="flex flex-col items-center gap-5 py-14 text-center">
          <h2 className="font-display text-3xl sm:text-4xl">Ready to lift?</h2>
          <p className="max-w-xl text-white/85">
            Apply online in about five minutes. Nothing is charged online. We&apos;ll contact you to
            finish signing up.
          </p>
          <JoinLink href="/memberships" plan="any" location="home-bottom" variant="dark" size="lg">
            Join Bricks Gym
          </JoinLink>
        </Container>
      </section>
    </>
  );
}
