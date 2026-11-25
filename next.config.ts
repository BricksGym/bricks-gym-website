import type { NextConfig } from "next";
import { clubSystems } from "./src/config/gym";

const isProd = process.env.NODE_ENV === "production";
const plausible = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ? " https://plausible.io" : "";
const clubOrigins = clubSystems.allowedOrigins.join(" ");

/**
 * Content Security Policy: the list of outside websites our pages may load
 * things from. Club Systems' domain is added from src/config/gym.ts.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com${plausible}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self' https://challenges.cloudflare.com${plausible}`,
  `frame-src https://www.google.com https://challenges.cloudflare.com ${clubOrigins}`.trim(),
  `form-action 'self' ${clubOrigins}`.trim(),
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  ...(isProd
    ? [
        { key: "Content-Security-Policy", value: csp },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      ]
    : []),
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
