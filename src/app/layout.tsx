import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Alfa_Slab_One, Inter, Oswald } from "next/font/google";
import "./globals.css";
import { business, hoursForGoogle } from "@/config/gym";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { memberLoginHref } from "@/lib/links";

const alfa = Alfa_Slab_One({ weight: "400", subsets: ["latin"], variable: "--font-alfa", display: "swap" });
const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(business.siteUrl),
  title: {
    default: `${business.name} | Gym in Watsonville, CA`,
    template: `%s | ${business.name}`,
  },
  description: business.description,
  openGraph: {
    type: "website",
    siteName: business.name,
    locale: "en_US",
  },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#141111",
};

const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

/** Tells Google this is a local gym (address, phone, hours). */
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "HealthClub",
  name: business.name,
  description: business.description,
  url: business.siteUrl,
  telephone: business.phone,
  address: {
    "@type": "PostalAddress",
    streetAddress: business.address.street,
    addressLocality: business.address.city,
    addressRegion: business.address.state,
    postalCode: business.address.zip,
    addressCountry: "US",
  },
  openingHoursSpecification: hoursForGoogle.map((h) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: h.dayOfWeek,
    opens: h.opens,
    closes: h.closes,
  })),
  sameAs: Object.values(business.social).filter(Boolean),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${alfa.variable} ${oswald.variable} ${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema).replace(/</g, "\\u003c") }}
        />
        <Header logo={<Logo priority className="w-32 sm:w-40" />} memberLoginHref={memberLoginHref()} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        {plausibleDomain && (
          <Script defer data-domain={plausibleDomain} src="https://plausible.io/js/script.tagged-events.js" />
        )}
      </body>
    </html>
  );
}
