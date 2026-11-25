import type { MetadataRoute } from "next";
import { business } from "@/config/gym";

const paths = [
  "",
  "/memberships",
  "/join",
  "/classes",
  "/day-pass",
  "/about",
  "/faq",
  "/contact",
  "/member-login",
  "/cancel",
  "/legal/membership-terms",
  "/legal/privacy",
  "/legal/waiver",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.map((p) => ({
    url: `${business.siteUrl}${p}`,
    changeFrequency: "monthly",
    priority: p === "" ? 1 : p === "/memberships" || p === "/join" ? 0.9 : 0.6,
  }));
}
