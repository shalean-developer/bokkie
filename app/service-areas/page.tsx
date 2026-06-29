import type { Metadata } from "next";
import { getServiceLocations } from "@/lib/supabase/booking-data";
import ServiceAreasClient from "@/components/ServiceAreasClient";
import PageHero from "@/components/marketing/PageHero";
import MarketingCta from "@/components/marketing/MarketingCta";
import JsonLd from "@/components/marketing/JsonLd";
import Footer from "@/components/Footer";
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
import { generateBreadcrumbSchema } from "@/lib/seo/schema-generator";
import { groupLocationsBySuburb, sortSuburbs } from "@/lib/data/location-pages";

export const metadata: Metadata = {
  title: { default: "Service Areas in Cape Town" },
  description: generateMetaDescription(
    "Find professional cleaning services in your Cape Town suburb. Bokkie serves Atlantic Seaboard, City Bowl, Southern Suburbs, Northern Suburbs, and 130+ locations."
  ),
  keywords: [
    "cleaning services Cape Town",
    "service areas Cape Town",
    "cleaning services by suburb",
    "Cape Town cleaning coverage",
    "professional cleaners near me",
    "cleaning services Atlantic Seaboard",
    "cleaning services City Bowl",
    "cleaning services Southern Suburbs",
  ],
  openGraph: {
    title: "Service Areas in Cape Town | Bokkie Cleaning Services",
    description:
      "Find professional cleaning services in your area. We serve all major suburbs across Cape Town.",
    url: generateCanonicalUrl("/service-areas"),
    siteName: siteConfig.name,
    images: [getOgImageMetadata("Bokkie Cleaning Services - Service Areas in Cape Town")],
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Service Areas in Cape Town | Bokkie Cleaning Services",
    description: "Find professional cleaning services in your area across Cape Town.",
    images: [getOgImageUrl()],
  },
  alternates: {
    canonical: generateCanonicalUrl("/service-areas"),
  },
  robots: indexableRobots,
  other: capeTownGeoMeta,
};

export default async function ServiceAreasPage() {
  const locations = await getServiceLocations();
  const activeLocations = locations.filter((loc) => loc.is_active);
  const locationsBySuburb = groupLocationsBySuburb(activeLocations);
  const allSuburbs = sortSuburbs(Object.keys(locationsBySuburb));
  const totalLocations = activeLocations.length;
  const totalSuburbs = allSuburbs.length;
  const pageUrl = generateCanonicalUrl("/service-areas");

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      generateBreadcrumbSchema([
        { name: "Home", url: siteConfig.url },
        { name: "Service Areas", url: pageUrl },
      ]),
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: "Service Areas in Cape Town",
        description:
          "Find professional cleaning services in your Cape Town suburb. Browse all locations served by Bokkie Cleaning Services.",
        inLanguage: "en-ZA",
        isPartOf: { "@id": `${siteConfig.url}#website` },
        publisher: { "@id": `${siteConfig.url}#organization` },
      },
      {
        "@type": "ItemList",
        name: "Cape Town service areas",
        numberOfItems: totalLocations,
        itemListElement: activeLocations.map((location, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: location.name,
          url: `${siteConfig.url}/areas/${location.slug}`,
        })),
      },
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />

      <main className="min-h-screen bg-white">
        <PageHero
          eyebrow="Cape Town coverage"
          title="Service areas we cover"
          description={`Professional residential, commercial, and specialized cleaning across ${totalSuburbs} regions and ${totalLocations} locations in Cape Town. Find your suburb below.`}
          imageSrc={marketingHeroImages.serviceAreas.src}
          imageAlt={marketingHeroImages.serviceAreas.alt}
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Service areas" },
          ]}
        />

        <ServiceAreasClient
          locationsBySuburb={locationsBySuburb}
          allSuburbs={allSuburbs}
          totalLocations={totalLocations}
          totalSuburbs={totalSuburbs}
        />

        <MarketingCta
          title="Don't see your area?"
          description="We may still be able to help. Contact us or request a quote and we will confirm availability."
          primaryLabel="Request a quote"
          primaryHref="/booking/quote"
          secondaryHref="/contact"
          secondaryLabel="Contact us"
          phone={false}
        />
      </main>
      <Footer />
    </>
  );
}
