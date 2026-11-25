import type { MetadataRoute } from "next";
import { business, PRELAUNCH } from "@/config/gym";

export default function robots(): MetadataRoute.Robots {
  // Before launch, ask search engines not to index the preview site.
  if (PRELAUNCH) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${business.siteUrl}/sitemap.xml`,
  };
}
