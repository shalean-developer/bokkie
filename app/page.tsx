import type { Metadata } from "next";
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import Services from "@/components/Services";
import { getServiceTypePricing } from "@/lib/supabase/booking-data";
import { FALLBACK_PRICING_CONFIG } from "@/lib/pricing";
import ServiceAreas from "@/components/ServiceAreas";
import HowItWorks from "@/components/HowItWorks";
import AboutUs from "@/components/AboutUs";
import BeforeAfter from "@/components/BeforeAfter";
import Testimonials from "@/components/Testimonials";
import HomeFaq from "@/components/HomeFaq";
import FeaturedCleaners from "@/components/FeaturedCleaners";
import CleaningGuides from "@/components/CleaningGuides";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import FloatingContactButtons from "@/components/FloatingContactButtons";
import {
  capeTownGeoMeta,
  generateCanonicalUrl,
  getOgImageMetadata,
  getOgImageUrl,
  indexableRobots,
  siteConfig,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: { default: "Professional Cleaning Services Cape Town" },
  description: "Book trusted professional cleaners in Cape Town. Same-day booking available for residential, commercial, deep cleaning, move-in/out, Airbnb, and office cleaning. Rated 5 stars with 150+ reviews. Serving Sea Point, Camps Bay, Claremont & more.",
  keywords: [
    "cleaning services Cape Town",
    "professional cleaners Cape Town",
    "house cleaning Cape Town",
    "office cleaning Cape Town",
    "deep cleaning Cape Town",
    "move in cleaning Cape Town",
    "Airbnb cleaning Cape Town",
    "same day cleaning Cape Town",
    "trusted cleaners Cape Town",
    "best cleaning service Cape Town",
    "affordable cleaners Cape Town",
    "residential cleaning Cape Town",
    "commercial cleaning Cape Town",
    "cleaning services Sea Point",
    "cleaning services Camps Bay",
    "cleaning services Claremont",
    "professional cleaning services South Africa",
  ],
  openGraph: {
    title: "Professional Cleaning Services Cape Town | Bokkie Cleaning Services",
    description: "Book trusted professional cleaners in Cape Town. Same-day booking available for residential, commercial, deep cleaning, move-in/out, Airbnb, and office cleaning. Rated 5 stars with 150+ reviews.",
    url: generateCanonicalUrl("/"),
    siteName: siteConfig.name,
    images: [
      getOgImageMetadata(
        "Bokkie Cleaning Services - Professional Cleaning Services in Cape Town"
      ),
    ],
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Professional Cleaning Services Cape Town | Bokkie Cleaning Services",
    description: "Book trusted professional cleaners in Cape Town. Same-day booking available. Rated 5 stars with 150+ reviews.",
    images: [getOgImageUrl()],
    creator: "@bokkiecleaning",
    site: "@bokkiecleaning",
  },
  alternates: {
    canonical: generateCanonicalUrl("/"),
  },
  robots: indexableRobots,
  other: capeTownGeoMeta,
};

export default async function Home() {
  const serviceTypePricing = await getServiceTypePricing();
  const pricingByServiceId: Record<string, number> = {
    ...FALLBACK_PRICING_CONFIG.basePrices,
    ...Object.fromEntries(
      serviceTypePricing.map((pricing) => [pricing.service_type, Number(pricing.base_price)])
    ),
  };

  const homepageUrl = generateCanonicalUrl("/");

  // WebPage structured data for homepage SEO
  const webpageStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${homepageUrl}#webpage`,
    url: homepageUrl,
    name: "Professional Cleaning Services Cape Town | Bokkie Cleaning Services",
    description: "Book trusted professional cleaners in Cape Town. Same-day booking available for residential, commercial, deep cleaning, move-in/out, Airbnb, and office cleaning.",
    inLanguage: "en-ZA",
    isPartOf: {
      "@id": `${siteConfig.url}#website`,
    },
    about: {
      "@id": `${siteConfig.url}#organization`,
    },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: getOgImageUrl(),
    },
    breadcrumb: {
      "@id": `${siteConfig.url}#breadcrumb`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webpageStructuredData) }}
      />
      <main className="min-h-screen">
        <Hero />
        <TrustBar />
        <Services pricingByServiceId={pricingByServiceId} />
        <BeforeAfter />
        <FeaturedCleaners />
        <HowItWorks />
        <AboutUs />
        <ServiceAreas />
        <CleaningGuides />
        <Testimonials />
        <HomeFaq />
        <Contact />
        <Footer />
        <FloatingContactButtons />
      </main>
    </>
  );
}
