import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Footer from "@/components/Footer";
import PageHero from "@/components/marketing/PageHero";
import MarketingCta from "@/components/marketing/MarketingCta";
import FaqAccordion from "@/components/marketing/FaqAccordion";
import JsonLd from "@/components/marketing/JsonLd";
import { marketingHeroImages } from "@/lib/marketing-hero-images";
import { bookingFaqs } from "@/lib/data/booking-faqs";
import { generateFaqPageSchema } from "@/lib/seo/faq-schema";
import { generateBreadcrumbSchema } from "@/lib/seo/schema-generator";
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
  title: { default: "FAQ: Cleaning Services in Cape Town" },
  description: generateMetaDescription(
    "Answers to frequently asked questions about booking professional cleaning services in Cape Town with Bokkie. Pricing, scheduling, satisfaction guarantee, supplies, and service areas."
  ),
  keywords: [
    "cleaning service FAQ Cape Town",
    "cleaning booking questions",
    "how much does cleaning cost Cape Town",
    "same-day cleaning Cape Town",
    "Bokkie cleaning FAQ",
  ],
  openGraph: {
    title: "FAQ | Bokkie Cleaning Services Cape Town",
    description: "Answers to common questions about booking cleaning services in Cape Town.",
    url: generateCanonicalUrl("/faq"),
    siteName: siteConfig.name,
    images: [getOgImageMetadata("FAQ - Bokkie Cleaning Services Cape Town")],
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ | Bokkie Cleaning Services Cape Town",
    description: "Answers to common questions about booking cleaning services in Cape Town.",
    images: [getOgImageUrl()],
  },
  alternates: {
    canonical: generateCanonicalUrl("/faq"),
  },
  robots: indexableRobots,
  other: capeTownGeoMeta,
};

const faqCategories = [
  {
    id: "booking",
    title: "Booking and scheduling",
    items: bookingFaqs.filter((_, i) => [0, 1, 7, 10].includes(i)),
  },
  {
    id: "pricing",
    title: "Pricing and payment",
    items: bookingFaqs.filter((_, i) => [5, 9].includes(i)),
  },
  {
    id: "service",
    title: "Service details",
    items: bookingFaqs.filter((_, i) => [2, 4, 11].includes(i)),
  },
  {
    id: "trust",
    title: "Trust and coverage",
    items: bookingFaqs.filter((_, i) => [3, 6, 8].includes(i)),
  },
];

export default function FaqPage() {
  const pageUrl = generateCanonicalUrl("/faq");
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      generateFaqPageSchema(bookingFaqs),
      generateBreadcrumbSchema([
        { name: "Home", url: siteConfig.url },
        { name: "FAQ", url: pageUrl },
      ]),
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: "FAQ: Cleaning Services in Cape Town",
        description:
          "Frequently asked questions about booking professional cleaning services in Cape Town with Bokkie.",
        inLanguage: "en-ZA",
        isPartOf: { "@id": `${siteConfig.url}#website` },
      },
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />

      <main className="min-h-screen bg-white">
        <PageHero
          eyebrow="Help centre"
          title="Frequently asked questions"
          description="Find answers about booking, pricing, scheduling, and what to expect from professional cleaning services in Cape Town."
          imageSrc={marketingHeroImages.faq.src}
          imageAlt={marketingHeroImages.faq.alt}
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "FAQ" },
          ]}
        >
          <p className="text-sm text-gray-500">
            Cannot find your answer?{" "}
            <Link href="/contact" className="text-brand-primary font-semibold hover:underline">
              Contact our team
            </Link>
            .
          </p>
        </PageHero>

        <div className="py-10 sm:py-14">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto space-y-10 sm:space-y-12">
              {faqCategories.map((category) => (
                <section key={category.id} aria-labelledby={`${category.id}-heading`}>
                  <h2
                    id={`${category.id}-heading`}
                    className="text-lg sm:text-xl font-bold text-gray-900 mb-4"
                  >
                    {category.title}
                  </h2>
                  <FaqAccordion items={category.items} />
                </section>
              ))}
            </div>

            <div className="max-w-2xl mx-auto mt-12 sm:mt-14 p-6 sm:p-8 bg-brand-surface border border-gray-200 rounded-xl text-center">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                Still have questions?
              </h2>
              <p className="text-gray-600 text-sm sm:text-base mb-5">
                Our team is available 24/7 to help with bookings, quotes, and service enquiries.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold rounded-button transition-colors"
                >
                  Contact us
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/how-it-works"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-900 font-semibold rounded-button hover:bg-white transition-colors"
                >
                  How it works
                </Link>
              </div>
            </div>
          </div>
        </div>

        <MarketingCta
          title="Ready to book a clean?"
          description="Get an instant quote and book a vetted cleaner in Cape Town today."
          phone={false}
        />
      </main>
      <Footer />
    </>
  );
}
