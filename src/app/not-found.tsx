import { ButtonLink, Section } from "@/components/ui";

export default function NotFound() {
  return (
    <Section>
      <div className="py-10 text-center">
        <p className="stamp text-brick">404</p>
        <h1 className="mt-2 font-display text-4xl">Page not found</h1>
        <p className="mt-3 text-iron">That page doesn&apos;t exist. Let&apos;s get you back to the gym.</p>
        <div className="mt-6">
          <ButtonLink href="/">Go home</ButtonLink>
        </div>
      </div>
    </Section>
  );
}
