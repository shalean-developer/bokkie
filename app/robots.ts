import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";

const PRIVATE_PATHS = [
  "/admin/",
  "/api/",
  "/_next/",
  "/private/",
  "/dashboard/",
  "/cleaner/",
  "/auth/",
  "/booking/service/",
  "/booking/pay/",
  "/booking/quote/confirmation",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
