import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Home,
  MapPin,
  Sparkles,
} from "lucide-react";
import {
  capeTownGeoMeta,
  generateCanonicalUrl,
  generateMetaDescription,
  getOgImageMetadata,
  getOgImageUrl,
  indexableRobots,
  siteConfig,
} from "@/lib/seo";
import { formatLocationName } from "@/lib/constants/areas";
import { getNearbyLocations, normalizeSuburb } from "@/lib/data/location-pages";
import { generateLocationStructuredData } from "@/lib/structured-data";
import { getLocationContent, getServiceLocations } from "@/lib/supabase/booking-data";
import Footer from "@/components/Footer";
import PageHero from "@/components/marketing/PageHero";
import MarketingCta from "@/components/marketing/MarketingCta";
import JsonLd from "@/components/marketing/JsonLd";

async function getValidLocations() {
  try {
    const locations = await getServiceLocations();
    return locations.filter((loc) => loc.is_active);
  } catch (error) {
    console.error("Error fetching locations from database:", error);
    return [];
  }
}

async function getLocationBySlug(slug: string) {
  const locations = await getValidLocations();
  return locations.find((loc) => loc.slug === slug) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ location: string }>;
}): Promise<Metadata> {
  const { location } = await params;
  const record = await getLocationBySlug(location);

  if (!record) {
    return {};
  }

  const locationName = record.name;
  const locationContent = await getLocationContent(location);

  const description = locationContent?.intro_paragraph
    ? generateMetaDescription(locationContent.intro_paragraph)
    : generateMetaDescription(
        `Professional cleaning services in ${locationName}, Cape Town. Residential, commercial, and specialized cleaning. Book vetted cleaners online with Bokkie.`
      );

  const keywords =
    locationContent?.seo_keywords && locationContent.seo_keywords.length > 0
      ? locationContent.seo_keywords
      : [
          `cleaning services ${locationName}`,
          `professional cleaners ${locationName}`,
          `house cleaning ${locationName}`,
          `office cleaning ${locationName}`,
          `residential cleaning ${locationName}`,
          `deep cleaning ${locationName}`,
          "cleaning services Cape Town",
        ];

  const title = `Cleaning Services in ${locationName}, Cape Town`;
  const pageUrl = generateCanonicalUrl(`/areas/${location}`);

  return {
    title: { default: title },
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: siteConfig.name,
      images: [getOgImageMetadata(`Cleaning Services in ${locationName}, Cape Town`)],
      locale: "en_ZA",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [getOgImageUrl()],
    },
    alternates: {
      canonical: pageUrl,
    },
    robots: indexableRobots,
    other: {
      ...capeTownGeoMeta,
      "geo.placename": locationName,
    },
  };
}

const serviceLinks = [
  {
    name: "Residential cleaning",
    description: "Regular home and apartment maintenance cleaning",
    href: "/services/residential-cleaning",
    icon: Home,
  },
  {
    name: "Commercial cleaning",
    description: "Office and workspace cleaning for businesses",
    href: "/services/commercial-cleaning",
    icon: Building2,
  },
  {
    name: "Specialized cleaning",
    description: "Deep cleaning, move-in/out, and carpet care",
    href: "/services/specialized-cleaning",
    icon: Sparkles,
  },
];

const includedTasks = [
  "Kitchen and bathroom sanitization",
  "Dusting, vacuuming, and mopping",
  "Eco-friendly products on request",
  "Same-day booking when available",
  "Vetted, insured cleaners",
  "100% satisfaction guarantee",
];

export default async function LocationPage({
  params,
}: {
  params: Promise<{ location: string }>;
}) {
  const { location } = await params;
  const record = await getLocationBySlug(location);

  if (!record) {
    notFound();
  }

  const locationName = record.name;
  const suburb = normalizeSuburb(record.suburb);
  const allLocations = await getValidLocations();
  const nearbyLocations = getNearbyLocations(allLocations, location);
  const locationContent = await getLocationContent(location);

  const defaultIntro = `Bokkie provides professional residential, commercial, and specialized cleaning in ${locationName}, Cape Town. Book vetted cleaners online for regular home cleaning, deep cleans, office cleaning, Airbnb turnovers, and more.`;
  const defaultMain = `Our service is booked online with secure payment. Cleaners arrive on time, fully equipped, and ready to deliver results that meet our quality standards.`;

  const introParagraph = locationContent?.intro_paragraph || defaultIntro;
  const mainContent = locationContent?.main_content || defaultMain;
  const closingParagraph = locationContent?.closing_paragraph;

  const structuredData = generateLocationStructuredData(locationName, location);

  return (
    <>
      <JsonLd data={structuredData} />

      <main className="min-h-screen bg-white">
        <PageHero
          eyebrow={suburb !== "Other" ? `${suburb}, Cape Town` : "Cape Town"}
          title={`Cleaning services in ${locationName}`}
          description={introParagraph}
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Service areas", href: "/service-areas" },
            { label: locationName },
          ]}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/booking/quote"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold rounded-button transition-colors"
            >
              Book a clean in {locationName}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href="/service-areas"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-gray-300 text-gray-900 font-semibold rounded-button hover:bg-gray-50 transition-colors"
            >
              All service areas
            </Link>
          </div>
        </PageHero>

        <section className="py-10 sm:py-14" aria-labelledby="about-location-heading">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <h2 id="about-location-heading" className="sr-only">
                About cleaning in {locationName}
              </h2>
              <div className="prose prose-gray max-w-none text-gray-600 text-sm sm:text-base leading-relaxed space-y-4">
                <p>{mainContent}</p>
                {closingParagraph && <p>{closingParagraph}</p>}
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-14 bg-brand-surface" aria-labelledby="services-heading">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto mb-8 text-center">
              <h2 id="services-heading" className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                Cleaning services in {locationName}
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Choose a service category to see options and book online.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {serviceLinks.map((service) => {
                const Icon = service.icon;
                return (
                  <Link
                    key={service.href}
                    href={service.href}
                    className="group flex flex-col p-5 bg-white border border-gray-200 rounded-xl hover:border-brand-primary/30 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-brand-surface w-fit mb-3">
                      <Icon className="w-5 h-5 text-brand-primary" aria-hidden="true" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1 group-hover:text-brand-primary transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 flex-1">{service.description}</p>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-primary">
                      View services
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-14" aria-labelledby="included-heading">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto mb-8 text-center">
              <h2 id="included-heading" className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                What you can expect
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Every booking in {locationName} is handled by professional, vetted cleaners.
              </p>
            </div>
            <ul className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
              {includedTasks.map((task) => (
                <li
                  key={task}
                  className="flex items-start gap-2.5 bg-brand-surface border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700"
                >
                  <CheckCircle2
                    className="w-4 h-4 text-brand-accent shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  {task}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {nearbyLocations.length > 0 && (
          <section className="py-10 sm:py-14 bg-brand-surface" aria-labelledby="nearby-heading">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl mx-auto mb-6 text-center">
                <h2 id="nearby-heading" className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                  Nearby areas in {suburb}
                </h2>
                <p className="text-gray-600 text-sm sm:text-base">
                  We also serve these locations close to {locationName}.
                </p>
              </div>
              <div className="max-w-2xl mx-auto flex flex-wrap justify-center gap-2">
                {nearbyLocations.map((nearby) => (
                  <Link
                    key={nearby.id}
                    href={`/areas/${nearby.slug}`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-brand-primary/30 hover:text-brand-primary transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
                    {nearby.name}
                  </Link>
                ))}
              </div>
              <p className="text-center mt-6">
                <Link
                  href="/service-areas"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary hover:text-brand-primary-dark transition-colors"
                >
                  Browse all {allLocations.length} service areas
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </p>
            </div>
          </section>
        )}

        <MarketingCta
          title={`Book a cleaner in ${locationName}`}
          description="Get an instant quote and schedule a vetted professional cleaner in Cape Town today."
          secondaryHref="/contact"
          secondaryLabel="Contact us"
        />
      </main>
      <Footer />
    </>
  );
}
