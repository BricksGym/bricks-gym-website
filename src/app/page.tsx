import Image from "next/image";
import Link from "next/link";
import { amenities, business, fees, photos, plans, remodel, testimonials } from "@/config/gym";
import { Logo } from "@/components/Logo";
import { joinHref } from "@/lib/links";
import { HoursTable } from "@/components/HoursTable";
import { MapEmbed } from "@/components/MapEmbed";
import { JoinLink } from "@/components/JoinLink";
import { ButtonLink, ComingSoon, Container, Eyebrow, H2, PrelaunchNote, Section } from "@/components/ui";
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
            <ButtonLink href="/memberships#day-pass" variant="outline" size="lg">
              Day Pass {money(fees.dayPass)}
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* Remodel teaser */}
      {remodel.show && (
        <section className="border-b-4 border-brick bg-ink text-white">
          <Container className="grid gap-8 py-14 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <Eyebrow light>Remodel</Eyebrow>
              <H2 light>{remodel.headline}</H2>
              <p className="mt-3 max-w-2xl text-white/80">{remodel.intro}</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {remodel.upgrades.map((u) => (
                  <li key={u.name} className="rounded border border-white/25 px-3 py-1 font-condensed text-sm uppercase tracking-wider">
                    {u.name}
                  </li>
                ))}
              </ul>
            </div>
            <ButtonLink href="/remodel" size="lg">
              See what&apos;s coming
            </ButtonLink>
          </Container>
        </section>
      )}

      {/* Plans (short version; full details on the Memberships page) */}
      <Section>
        <Eyebrow>Memberships</Eyebrow>
        <H2>Plans from {money(Math.min(...plans.map((p) => p.monthlyDues)))}/month</H2>
        <div className="mt-4">
          <PrelaunchNote>Prices shown are sample numbers until final pricing is set.</PrelaunchNote>
        </div>
        <ul className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {plans.map((p) => (
            <li key={p.id}>
              <Link
                href={joinHref(p.id)}
                className={`block h-full rounded-md border-2 p-4 text-center transition-colors ${
                  p.featured
                    ? "border-brick bg-brick text-white shadow-lg shadow-brick/25 hover:bg-brick-dark"
                    : "border-ink/15 hover:border-brick"
                }`}
              >
                <span className={`block font-condensed text-sm font-semibold uppercase tracking-wider ${p.featured ? "text-white/85" : "text-concrete"}`}>
                  {p.name}
                </span>
                <span className={`mt-1 block font-display text-3xl ${p.featured ? "text-white" : "text-brick"}`}>{money(p.monthlyDues)}</span>
                <span className={`block text-sm ${p.featured ? "text-white/85" : "text-concrete"}`}>per month</span>
                {p.badge && (
                  <span className="mt-2 inline-block rounded bg-white px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-brick">
                    {p.badge}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <ButtonLink href="/memberships">See plans &amp; join</ButtonLink>
          <Link href="/memberships#day-pass" className="font-semibold text-brick underline underline-offset-4">
            Just visiting? Day pass {money(fees.dayPass)}
          </Link>
        </div>
      </Section>

      {/* Amenities */}
      <Section tone="paper">
        <Eyebrow>Inside the gym</Eyebrow>
        <H2>Everything you need. Nothing you don&apos;t.</H2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {amenities.map((a) => (
            <li key={a.name} className="rounded-md border-l-4 border-brick bg-white p-5">
              <h3 className="font-condensed text-xl font-semibold uppercase tracking-wide">
                {a.name}
                {a.comingSoon && <ComingSoon />}
              </h3>
              <p className="mt-1 text-iron">{a.description}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* Photos: shown once photos are added in src/config/gym.ts */}
      {photos.length > 0 && (
        <Section>
          <Eyebrow>Photos</Eyebrow>
          <H2>Take a look around</H2>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
            {photos.map((p) => (
              <Image
                key={p.src}
                src={p.src}
                alt={p.alt}
                width={800}
                height={600}
                sizes="(max-width: 768px) 50vw, 33vw"
                className="aspect-[4/3] w-full rounded-md object-cover"
              />
            ))}
          </div>
        </Section>
      )}

      {/* Reviews: real reviews only, shown once added in src/config/gym.ts */}
      {testimonials.length > 0 && (
        <Section tone="paper">
          <Eyebrow>Members say</Eyebrow>
          <H2>Reviews</H2>
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
