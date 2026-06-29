import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  CreditCard,
  Leaf,
  MessageCircle,
  Phone,
  Shield,
  Sparkles,
  Star,
  Users,
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
import { generateFaqPageSchema } from "@/lib/seo/faq-schema";
import { generateBreadcrumbSchema } from "@/lib/seo/schema-generator";
import { generateHowItWorksStructuredData } from "@/lib/structured-data";
import { bookingFaqs } from "@/lib/data/booking-faqs";
import Footer from "@/components/Footer";
import PageHero from "@/components/marketing/PageHero";
import MarketingCta from "@/components/marketing/MarketingCta";
import FaqAccordion from "@/components/marketing/FaqAccordion";
import JsonLd from "@/components/marketing/JsonLd";
import { marketingHeroImages } from "@/lib/marketing-hero-images";

export const metadata: Metadata = {
  title: { default: "How It Works: Book Professional Cleaning in Cape Town" },
  description: generateMetaDescription(
    "Book professional cleaning in Cape Town with Bokkie in 5 simple steps. Choose your service, pick a vetted cleaner, schedule online, pay securely, and enjoy a spotless space. Same-day booking available."
  ),
  keywords: [
    "how it works cleaning service Cape Town",
    "how to book cleaning service Cape Town",
    "cleaning service booking process Cape Town",
    "book cleaning service online Cape Town",
    "same-day cleaning booking Cape Town",
  ],
  openGraph: {
    title: "How It Works: Book Professional Cleaning in Cape Town",
    description:
      "Book professional cleaning in Cape Town with Bokkie. Simple 5-step process with same-day booking available.",
    url: generateCanonicalUrl("/how-it-works"),
    siteName: siteConfig.name,
    images: [getOgImageMetadata("How It Works - Bokkie Cleaning Services Cape Town")],
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "How It Works: Book Professional Cleaning in Cape Town",
    description: "Simple 5-step booking process for professional cleaning in Cape Town.",
    images: [getOgImageUrl()],
  },
  alternates: {
    canonical: generateCanonicalUrl("/how-it-works"),
  },
  robots: indexableRobots,
  other: capeTownGeoMeta,
};

const bookingSteps = [
  {
    number: 1,
    title: "Choose your service",
    description:
      "Select residential, commercial, deep cleaning, move-in/out, Airbnb, or specialized services tailored to your needs in Cape Town.",
    icon: Sparkles,
    details: [
      "Residential cleaning for homes and apartments",
      "Commercial cleaning for offices and businesses",
      "Deep cleaning and move-in/out services",
      "Airbnb turnover and window cleaning",
    ],
    link: "/services",
    linkText: "View all services",
  },
  {
    number: 2,
    title: "Select your cleaner",
    description:
      "Browse vetted professionals, read verified reviews, compare skills and pricing, and choose the cleaner that fits your needs.",
    icon: Users,
    details: [
      "Verified customer reviews and ratings",
      "Cleaner profiles with skills and experience",
      "Background-checked and insured professionals",
    ],
    link: "/team",
    linkText: "Browse cleaners",
  },
  {
    number: 3,
    title: "Schedule your clean",
    description:
      "Pick a date and time that works for you. Same-day booking is available across Cape Town, with flexible recurring options too.",
    icon: Calendar,
    details: [
      "Same-day booking available",
      "Flexible scheduling 7 days a week",
      "Easy rescheduling through your dashboard",
    ],
    link: "/booking/quote",
    linkText: "Get started",
  },
  {
    number: 4,
    title: "Pay securely",
    description:
      "Complete payment through our encrypted checkout. You receive instant confirmation by email and SMS with transparent pricing.",
    icon: CreditCard,
    details: [
      "Secure, encrypted payment processing",
      "Instant booking confirmation",
      "No hidden fees",
    ],
    link: "/booking/quote",
    linkText: "Book now",
  },
  {
    number: 5,
    title: "Enjoy your clean space",
    description:
      "Your cleaner arrives on time, completes the job to your specifications, and you can review and rebook easily afterward.",
    icon: CheckCircle,
    details: [
      "On-time arrival with professional equipment",
      "Direct communication through our platform",
      "100% satisfaction guarantee",
    ],
    link: "/booking/service/standard/details",
    linkText: "Book your clean",
  },
];

const benefits = [
  {
    icon: Shield,
    title: "100% satisfaction guarantee",
    description: "If you are not happy, we will make it right at no extra cost.",
  },
  {
    icon: Star,
    title: "5-star rated cleaners",
    description: "Every cleaner is reviewed by real customers across Cape Town.",
  },
  {
    icon: Calendar,
    title: "Same-day booking",
    description: "Need a clean today? We accommodate urgent requests when possible.",
  },
  {
    icon: Leaf,
    title: "Eco-friendly products",
    description: "Effective cleaning products that are safe for your home and family.",
  },
  {
    icon: Users,
    title: "Vetted professionals",
    description: "Background-checked, insured cleaners who meet our quality standards.",
  },
  {
    icon: MessageCircle,
    title: "Direct communication",
    description: "Chat with your cleaner and share instructions through our platform.",
  },
];

const experiencePhases = [
  {
    title: "Before your clean",
    items: [
      "Confirmation with cleaner details sent to you",
      "Direct messaging opens with your cleaner",
      "Share specific instructions or preferences",
    ],
  },
  {
    title: "During your clean",
    items: [
      "Cleaner arrives on time and ready to work",
      "Professional cleaning according to your service type",
      "Track progress through our platform",
    ],
  },
  {
    title: "After your clean",
    items: [
      "Quality check and satisfaction confirmation",
      "Easy rebooking for future services",
      "Review and rate your experience",
    ],
  },
  {
    title: "Quality assurance",
    items: [
      "100% satisfaction guarantee on every booking",
      "Post-cleaning follow-up and support",
      "Continuous improvement from customer feedback",
    ],
  },
];

export default function HowItWorksPage() {
  const pageUrl = generateCanonicalUrl("/how-it-works");
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      generateHowItWorksStructuredData(),
      generateBreadcrumbSchema([
        { name: "Home", url: siteConfig.url },
        { name: "How It Works", url: pageUrl },
      ]),
      generateFaqPageSchema(bookingFaqs),
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />

      <main className="min-h-screen bg-white">
        <PageHero
          eyebrow="Simple booking process"
          title="How to book professional cleaning in Cape Town"
          description="From choosing your service to enjoying a spotless home or office, Bokkie makes booking trusted cleaners fast and straightforward."
          imageSrc={marketingHeroImages.howItWorks.src}
          imageAlt={marketingHeroImages.howItWorks.alt}
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "How It Works" },
          ]}
        >
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-600 mb-6">
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
              <strong className="text-gray-800">4.8</strong> rating
            </span>
            <span>
              <strong className="text-gray-800">150+</strong> verified reviews
            </span>
            <span>
              <strong className="text-gray-800">Same-day</strong> booking
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/booking/quote"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold rounded-button transition-colors"
            >
              Book your clean
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <a
              href="tel:+27724162547"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-gray-300 text-gray-900 font-semibold rounded-button hover:bg-gray-50 transition-colors"
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
              +27 72 416 2547
            </a>
          </div>
        </PageHero>

        <section className="py-10 sm:py-14 lg:py-16" aria-labelledby="steps-heading">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto mb-10 sm:mb-12 text-center">
              <h2 id="steps-heading" className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                5 steps to a cleaner space
              </h2>
              <p className="text-gray-600 text-base sm:text-lg">
                Our booking process is designed to be quick on mobile and transparent at every stage.
              </p>
            </div>

            <ol className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
              {bookingSteps.map((step) => {
                const Icon = step.icon;
                return (
                  <li
                    key={step.number}
                    className="relative pl-14 sm:pl-16 pb-6 sm:pb-8 border-l-2 border-brand-accent/30 last:border-l-transparent last:pb-0"
                  >
                    <div className="absolute left-0 -translate-x-1/2 top-0 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-sm sm:text-base">
                      {step.number}
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-brand-surface">
                          <Icon className="w-5 h-5 text-brand-primary" aria-hidden="true" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">{step.title}</h3>
                      </div>
                      <p className="text-gray-600 text-sm sm:text-base mb-4 leading-relaxed">
                        {step.description}
                      </p>
                      <ul className="space-y-2 mb-4">
                        {step.details.map((detail) => (
                          <li key={detail} className="flex items-start gap-2 text-sm text-gray-600">
                            <CheckCircle
                              className="w-4 h-4 text-brand-accent shrink-0 mt-0.5"
                              aria-hidden="true"
                            />
                            {detail}
                          </li>
                        ))}
                      </ul>
                      <Link
                        href={step.link}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary hover:text-brand-primary-dark transition-colors"
                      >
                        {step.linkText}
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        <section className="py-10 sm:py-14 bg-brand-surface" aria-labelledby="experience-heading">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto mb-8 sm:mb-10 text-center">
              <h2 id="experience-heading" className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                What to expect during your service
              </h2>
              <p className="text-gray-600">
                Know what happens before, during, and after every cleaning appointment.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 max-w-4xl mx-auto">
              {experiencePhases.map((phase) => (
                <article
                  key={phase.title}
                  className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6"
                >
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">
                    {phase.title}
                  </h3>
                  <ul className="space-y-2">
                    {phase.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle
                          className="w-4 h-4 text-brand-accent shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-14 lg:py-16" aria-labelledby="benefits-heading">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto mb-8 sm:mb-10 text-center">
              <h2 id="benefits-heading" className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                Why book with Bokkie
              </h2>
              <p className="text-gray-600">
                Trusted cleaning services across Cape Town, built around reliability and quality.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 max-w-5xl mx-auto">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <article
                    key={benefit.title}
                    className="border border-gray-200 rounded-xl p-5 sm:p-6 bg-white"
                  >
                    <div className="w-10 h-10 rounded-lg bg-brand-surface flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-brand-primary" aria-hidden="true" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{benefit.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{benefit.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-14 bg-brand-surface" aria-labelledby="faq-heading">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto mb-8 text-center">
              <h2 id="faq-heading" className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                Booking FAQs
              </h2>
              <p className="text-gray-600">
                Common questions about booking cleaning services in Cape Town.
              </p>
            </div>
            <div className="max-w-2xl mx-auto">
              <FaqAccordion items={bookingFaqs} />
            </div>
            <p className="text-center mt-6 text-sm text-gray-600">
              More questions?{" "}
              <Link href="/faq" className="text-brand-primary font-semibold hover:underline">
                View all FAQs
              </Link>{" "}
              or{" "}
              <Link href="/contact" className="text-brand-primary font-semibold hover:underline">
                contact us
              </Link>
              .
            </p>
          </div>
        </section>

        <MarketingCta
          title="Ready to book your clean?"
          description="Join hundreds of satisfied customers across Cape Town. Get an instant quote and book online in minutes."
          primaryLabel="Get started now"
        />
      </main>
      <Footer />
    </>
  );
}
