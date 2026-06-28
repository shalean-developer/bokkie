import type { Metadata } from "next";
import FeaturedCleaners from "@/components/FeaturedCleaners";
import Footer from "@/components/Footer";
import {
  capeTownGeoMeta,
  generateCanonicalUrl,
  generateMetaDescription,
  getOgImageMetadata,
  getOgImageUrl,
  indexableRobots,
  siteConfig,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: { default: "Our Team | Bokkie Cleaning Services Cape Town" },
  description: generateMetaDescription(
    "Meet the professional cleaning team at Bokkie Cleaning Services. Vetted, experienced cleaners serving homes and businesses across Cape Town."
  ),
  openGraph: {
    title: "Our Team | Bokkie Cleaning Services Cape Town",
    description: "Meet the professional cleaning team at Bokkie Cleaning Services.",
    url: generateCanonicalUrl("/team"),
    siteName: siteConfig.name,
    images: [getOgImageMetadata("Our Team - Bokkie Cleaning Services Cape Town")],
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Team | Bokkie Cleaning Services Cape Town",
    description: "Meet the professional cleaning team at Bokkie Cleaning Services.",
    images: [getOgImageUrl()],
  },
  alternates: {
    canonical: generateCanonicalUrl("/team"),
  },
  robots: indexableRobots,
  other: capeTownGeoMeta,
};

export default function TeamPage() {
  return (
    <>
      <main className="min-h-screen bg-white">
        <FeaturedCleaners />
      </main>
      <Footer />
    </>
  );
}
