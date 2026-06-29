import type { Metadata } from "next";
import FeaturedCleaners from "@/components/FeaturedCleaners";
import Footer from "@/components/Footer";
import PageHero from "@/components/marketing/PageHero";
import { marketingHeroImages } from "@/lib/marketing-hero-images";
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
        <PageHero
          eyebrow="Our people"
          title="Meet the Bokkie cleaning team"
          description="Behind every reliable service is a team that truly cares. Our trained specialists follow clear standards, respect your space, and take pride in doing things right."
          imageSrc={marketingHeroImages.team.src}
          imageAlt={marketingHeroImages.team.alt}
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Team" },
          ]}
        />
        <FeaturedCleaners />
      </main>
      <Footer />
    </>
  );
}
