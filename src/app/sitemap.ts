import type { MetadataRoute } from "next";
import { business } from "@/config/gym";
import { show } from "@/lib/links";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/memberships",
    "/join",
    ...(show.remodel ? ["/remodel"] : []),
    ...(show.classes ? ["/classes"] : []),
    ...(show.about ? ["/about"] : []),
    "/faq",
    "/contact",
    "/cancel",
    "/legal/membership-terms",
    "/legal/privacy",
    "/legal/waiver",
  ];
  return paths.map((p) => ({
    url: `${business.siteUrl}${p}`,
    changeFrequency: "monthly",
    priority: p === "" ? 1 : p === "/memberships" || p === "/join" ? 0.9 : 0.6,
  }));
}
