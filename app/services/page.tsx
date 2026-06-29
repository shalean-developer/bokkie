import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Gift,
  Home,
  Layers,
  Leaf,
  Shield,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import {
  truncateTitle,
  generateMetaDescription,
  generateCanonicalUrl,
  capeTownGeoMeta,
  getOgImageMetadata,
  getOgImageUrl,
  indexableRobots,
  siteConfig,
} from "@/lib/seo";
import { generateFaqPageSchema } from "@/lib/seo/faq-schema";
import { generateBreadcrumbSchema } from "@/lib/seo/schema-generator";
import { generateServicesPageStructuredData } from "@/lib/structured-data";
import Footer from "@/components/Footer";
import PageHero from "@/components/marketing/PageHero";
import MarketingCta from "@/components/marketing/MarketingCta";
import FaqAccordion from "@/components/marketing/FaqAccordion";
import JsonLd from "@/components/marketing/JsonLd";
import { marketingHeroImages } from "@/lib/marketing-hero-images";
import { getServiceCategoryPricing } from "@/lib/supabase/booking-data";
import { formatPrice } from "@/lib/pricing";

export const metadata: Metadata = {
  title: { default: truncateTitle("Professional Cleaning Services in Cape Town") },
  description: generateMetaDescription(
    "Professional cleaning services in Cape Town: residential, commercial, deep cleaning, move-in/out, Airbnb, and specialized services. Vetted cleaners, transparent pricing, same-day booking."
  ),
  keywords: [
    "cleaning services Cape Town",
    "professional cleaners Cape Town",
    "residential cleaning Cape Town",
    "commercial cleaning Cape Town",
    "deep cleaning Cape Town",
    "Airbnb cleaning Cape Town",
    "affordable cleaners Cape Town",
  ],
  alternates: {
    canonical: generateCanonicalUrl("/services"),
  },
  openGraph: {
    title: "Professional Cleaning Services in Cape Town | Bokkie Cleaning Services",
    description:
      "Residential, commercial, deep cleaning, move-in/out, and specialized cleaning services in Cape Town.",
    url: generateCanonicalUrl("/services"),
    siteName: siteConfig.name,
    images: [getOgImageMetadata("Professional Cleaning Services in Cape Town")],
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Professional Cleaning Services in Cape Town",
    description: "Comprehensive cleaning services in Cape Town with vetted, insured cleaners.",
    images: [getOgImageUrl()],
  },
  robots: indexableRobots,
  other: capeTownGeoMeta,
};

const baseServices = [
  {
    id: "residential-cleaning",
    name: "Residential Cleaning",
    category: "Residential",
    icon: Home,
    description:
      "Regular maintenance cleaning for homes and apartments. Keep your living space fresh, organized, and hygienic.",
    features: [
      "Kitchen and bathroom sanitization",
      "Dusting, vacuuming, and mopping",
      "Eco-friendly products available",
      "Flexible one-off or recurring schedules",
    ],
    popularAreas: ["Claremont", "Sea Point", "Camps Bay", "Constantia"],
    accent: "bg-blue-50 text-blue-700",
  },
  {
    id: "commercial-cleaning",
    name: "Commercial Cleaning",
    category: "Commercial",
    icon: Building2,
    description:
      "Professional cleaning for offices, retail spaces, and businesses. Maintain a clean workspace for your team and clients.",
    features: [
      "Office and workspace cleaning",
      "Restroom sanitization",
      "Floor care and waste management",
      "Flexible after-hours scheduling",
    ],
    popularAreas: ["Cape Town CBD", "V&A Waterfront", "Green Point", "Century City"],
    accent: "bg-emerald-50 text-emerald-700",
  },
  {
    id: "specialized-cleaning",
    name: "Specialized Cleaning",
    category: "Specialized",
    icon: Sparkles,
    description:
      "Deep cleaning, move-in/out, post-construction, carpet, and window cleaning for residential and commercial properties.",
    features: [
      "Move-in and move-out cleaning",
      "Post-construction cleanup",
      "Carpet and upholstery cleaning",
      "All supplies included on deep cleans",
    ],
    popularAreas: ["All Cape Town areas", "Newlands", "Rondebosch", "Observatory"],
    accent: "bg-purple-50 text-purple-700",
  },
];

const additionalServices = [
  {
    name: "Airbnb Cleaning",
    description: "Fast turnover cleaning between guest stays",
    link: "/booking/service/airbnb/details",
    icon: Calendar,
  },
  {
    name: "Holiday Cleaning",
    description: "Pre and post-holiday cleaning for your home",
    link: "/booking/service/holiday/details",
    icon: Gift,
  },
  {
    name: "Carpet Cleaning",
    description: "Professional carpet and rug deep cleaning",
    link: "/booking/service/carpet-cleaning/details",
    icon: Layers,
  },
];

const faqs = [
  {
    question: "What cleaning services do you offer in Cape Town?",
    answer:
      "We offer residential cleaning, commercial cleaning, and specialized services including deep cleaning, move-in/out, post-construction, carpet cleaning, and window cleaning. We also provide Airbnb and holiday cleaning.",
  },
  {
    question: "How much do cleaning services cost in Cape Town?",
    answer:
      "Pricing varies by service type, property size, and frequency. Residential cleaning typically starts around R500, commercial around R800, and specialized around R900. Get an instant quote on our booking page with no hidden fees.",
  },
  {
    question: "Do you provide cleaning supplies and equipment?",
    answer:
      "For deep cleaning, move-in/out, and carpet cleaning, all supplies and equipment are included. For standard, Airbnb, office, and holiday cleaning, supplies can be requested during booking at an additional cost.",
  },
  {
    question: "What areas in Cape Town do you serve?",
    answer:
      "We serve Cape Town and surrounding areas including Sea Point, Camps Bay, Claremont, Green Point, Constantia, Newlands, V&A Waterfront, Century City, and 30+ more neighborhoods.",
  },
  {
    question: "Can I book same-day cleaning services?",
    answer:
      "Yes. Same-day booking is available throughout Cape Town depending on cleaner availability. Book online or call +27 72 416 2547 for urgent requests.",
  },
  {
    question: "Are your cleaners insured and vetted?",
    answer:
      "All cleaners are fully insured, bonded, and background-checked. We offer a 100% satisfaction guarantee on every service.",
  },
  {
    question: "How do I book a cleaning service?",
    answer:
      "Visit our booking page, choose your service, select a cleaner, pick a date and time, and pay securely. You receive instant confirmation by email and SMS.",
  },
  {
    question: "What if I am not satisfied with the cleaning?",
    answer:
      "Contact us within 24 hours and we will send a cleaner back to address any issues at no additional cost under our satisfaction guarantee.",
  },
];

const whyChooseUs = [
  {
    title: "Professional cleaners",
    description: "Vetted, insured, and experienced professionals",
    icon: Users,
  },
  {
    title: "Satisfaction guarantee",
    description: "Not happy? We will make it right",
    icon: Shield,
  },
  {
    title: "Flexible scheduling",
    description: "Same-day or advance booking, 7 days a week",
    icon: Clock,
  },
  {
    title: "Eco-friendly products",
    description: "Safe, effective cleaning for your home or office",
    icon: Leaf,
  },
];

export default async function ServicesPage() {
  const pageUrl = generateCanonicalUrl("/services");
  const categoryPricing = await getServiceCategoryPricing();
  const pricingMap = new Map(
    categoryPricing.map((pricing) => [pricing.category_id, pricing.display_price])
  );

  const services = baseServices.map((service) => ({
    ...service,
    avgPrice: formatPrice(pricingMap.get(service.id) || 500),
  }));

  const residentialPrice = pricingMap.get("residential-cleaning") || 500;
  const commercialPrice = pricingMap.get("commercial-cleaning") || 800;
  const specializedPrice = pricingMap.get("specialized-cleaning") || 900;

  const faqsWithDynamicPrices = faqs.map((faq) => {
    if (faq.question === "How much do cleaning services cost in Cape Town?") {
      return {
        ...faq,
        answer: `Pricing varies by service type, property size, and frequency. Residential cleaning starts around ${formatPrice(residentialPrice)}, commercial around ${formatPrice(commercialPrice)}, and specialized around ${formatPrice(specializedPrice)}. Get an instant quote on our booking page with no hidden fees.`,
      };
    }
    return faq;
  });

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      generateServicesPageStructuredData(),
      generateBreadcrumbSchema([
        { name: "Home", url: siteConfig.url },
        { name: "Services", url: pageUrl },
      ]),
      generateFaqPageSchema(faqsWithDynamicPrices),
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />

      <main className="min-h-screen bg-white">
        <PageHero
          eyebrow="Cape Town cleaning services"
          title="Professional cleaning services in Cape Town"
          description="From regular home maintenance to deep cleans and commercial office cleaning, Bokkie connects you with trusted, vetted professionals across Cape Town."
          imageSrc={marketingHeroImages.services.src}
          imageAlt={marketingHeroImages.services.alt}
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Services" },
          ]}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/booking/quote"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold rounded-button transition-colors"
            >
              Get instant quote
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-gray-300 text-gray-900 font-semibold rounded-button hover:bg-gray-50 transition-colors"
            >
              How it works
            </Link>
          </div>
        </PageHero>

        <section className="py-10 sm:py-14 lg:py-16" aria-labelledby="categories-heading">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto mb-8 sm:mb-10 text-center">
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-accent mb-3">
                <Star className="w-3.5 h-3.5" aria-hidden="true" />
                Main categories
              </p>
              <h2 id="categories-heading" className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                Cleaning service categories
              </h2>
              <p className="text-gray-600">
                Three core service types covering residential, commercial, and specialized cleaning needs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 max-w-6xl mx-auto">
              {services.map((service) => {
                const Icon = service.icon;
                return (
                  <article
                    key={service.id}
                    className="flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-white"
                  >
                    <div className="p-5 sm:p-6 flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2.5 rounded-lg ${service.accent}`}>
                          <Icon className="w-5 h-5" aria-hidden="true" />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          {service.category}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                        {service.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                        {service.description}
                      </p>
                      <ul className="space-y-2 mb-4">
                        {service.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                            <CheckCircle2
                              className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5"
                              aria-hidden="true"
                            />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-1.5">Popular in</p>
                        <div className="flex flex-wrap gap-1.5">
                          {service.popularAreas.map((area) => (
                            <span
                              key={area}
                              className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md"
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="px-5 sm:px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3 bg-brand-surface/50">
                      <div>
                        <p className="text-xs text-gray-500">From</p>
                        <p className="text-xl font-bold text-brand-primary">{service.avgPrice}</p>
                      </div>
                      <Link
                        href={`/services/${service.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-primary hover:bg-brand-primary-dark text-white text-sm font-semibold rounded-button transition-colors"
                      >
                        Learn more
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-14 bg-brand-surface" aria-labelledby="additional-heading">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto mb-8 text-center">
              <h2 id="additional-heading" className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                Additional services
              </h2>
              <p className="text-gray-600">
                Specialized options for short-term rentals, holidays, and carpet care.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {additionalServices.map((service) => {
                const Icon = service.icon;
                return (
                  <Link
                    key={service.name}
                    href={service.link}
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
                      Book now
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-14 lg:py-16" aria-labelledby="why-heading">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto mb-8 text-center">
              <h2 id="why-heading" className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                Why choose Bokkie
              </h2>
              <p className="text-gray-600">
                Reliable, professional cleaning backed by real customer reviews.
              </p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 max-w-4xl mx-auto">
              {whyChooseUs.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="text-center p-4 sm:p-5">
                    <div className="w-11 h-11 rounded-xl bg-brand-surface flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-5 h-5 text-brand-primary" aria-hidden="true" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">{item.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-14 bg-brand-surface" aria-labelledby="services-faq-heading">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto mb-8 text-center">
              <h2 id="services-faq-heading" className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                Frequently asked questions
              </h2>
              <p className="text-gray-600">
                Everything you need to know about our Cape Town cleaning services.
              </p>
            </div>
            <div className="max-w-2xl mx-auto">
              <FaqAccordion items={faqsWithDynamicPrices} />
            </div>
          </div>
        </section>

        <MarketingCta
          title="Ready to book your cleaning service?"
          description="Get an instant quote and book your preferred cleaner today. Same-day booking available across Cape Town."
          secondaryHref="/service-areas"
          secondaryLabel="View service areas"
        />
      </main>
      <Footer />
    </>
  );
}
