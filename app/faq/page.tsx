import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import { bookingFaqs } from "@/lib/data/booking-faqs";
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
  title: { default: "FAQ | Bokkie Cleaning Services Cape Town" },
  description: generateMetaDescription(
    "Find answers to frequently asked questions about booking professional cleaning services in Cape Town with Bokkie. Pricing, scheduling, satisfaction guarantee, and more."
  ),
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

export default function FaqPage() {
  return (
    <>
      <main className="min-h-screen bg-white">
        <section className="py-16 sm:py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                  Frequently Asked Questions
                </h1>
                <p className="text-xl text-gray-600">
                  Everything you need to know about booking cleaning services in Cape Town
                </p>
              </div>

              <div className="space-y-6">
                {bookingFaqs.map((faq) => (
                  <div key={faq.question} className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">{faq.question}</h2>
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>

              <div className="mt-12 text-center">
                <p className="text-gray-600 mb-4">Still have questions?</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center px-8 py-4 bg-[#007bff] hover:bg-[#0056b3] text-white font-semibold rounded-2xl transition-colors"
                  >
                    Contact Us
                  </Link>
                  <Link
                    href="/how-it-works"
                    className="inline-flex items-center justify-center px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-2xl transition-colors"
                  >
                    How It Works
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
