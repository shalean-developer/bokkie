import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle, Phone, Star } from "lucide-react";
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
  title: { default: "About Us | Bokkie Cleaning Services Cape Town" },
  description: generateMetaDescription(
    "Learn about Bokkie Cleaning Services — Cape Town's trusted professional cleaning company. Vetted cleaners, eco-friendly products, same-day booking, and a 100% satisfaction guarantee."
  ),
  openGraph: {
    title: "About Us | Bokkie Cleaning Services Cape Town",
    description:
      "Learn about Bokkie Cleaning Services — Cape Town's trusted professional cleaning company.",
    url: generateCanonicalUrl("/about"),
    siteName: siteConfig.name,
    images: [getOgImageMetadata("About Bokkie Cleaning Services Cape Town")],
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | Bokkie Cleaning Services Cape Town",
    description: "Learn about Bokkie Cleaning Services — Cape Town's trusted professional cleaning company.",
    images: [getOgImageUrl()],
  },
  alternates: {
    canonical: generateCanonicalUrl("/about"),
  },
  robots: indexableRobots,
  other: capeTownGeoMeta,
};

const values = [
  "Professional, vetted cleaners with verified credentials",
  "Fully insured and bonded for your peace of mind",
  "100% satisfaction guarantee on all services",
  "Same-day booking available throughout Cape Town",
  "Eco-friendly cleaning products and methods",
  "Rated 4.8/5 stars with 150+ customer reviews",
];

export default function AboutPage() {
  return (
    <>
      <main className="min-h-screen bg-white">
        <section className="relative bg-gradient-to-br from-blue-50 to-blue-50 pt-12 pb-20 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                  About Bokkie Cleaning Services
                </h1>
                <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                  We connect Cape Town homes and businesses with trusted, professional cleaners —
                  making it easy to book reliable cleaning services on your schedule.
                </p>
                <div className="flex items-center gap-2 mb-8">
                  <div className="flex">
                    {[...Array(4)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                    <Star className="w-5 h-5 text-yellow-400" />
                  </div>
                  <span className="text-gray-700 font-semibold">4.8 Rating · 150+ Reviews</span>
                </div>
                <Link
                  href="/booking/quote"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#007bff] hover:bg-[#0056b3] text-white font-semibold rounded-2xl transition-colors shadow-lg"
                >
                  Get Free Quote
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/services/residential-cleaning.jpg"
                  alt="Bokkie Cleaning Services team at work"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Bokkie Cleaning Services was built to make professional cleaning accessible,
                transparent, and stress-free. Whether you need a one-time deep clean, regular
                home maintenance, or commercial office cleaning, we match you with skilled
                professionals who take pride in their work.
              </p>
              <p className="text-lg text-gray-600 mb-10 leading-relaxed">
                Based in Cape Town, we serve homes and businesses across the city — from Sea
                Point and Camps Bay to Claremont, Constantia, and beyond. Every cleaner in our
                network is background-checked, insured, and committed to delivering spotless results.
              </p>

              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Why Choose Us
              </h2>
              <ul className="space-y-4 mb-12">
                {values.map((value) => (
                  <li key={value} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">{value}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/how-it-works"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-2xl transition-colors"
                >
                  How It Works
                </Link>
                <Link
                  href="/services"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-2xl transition-colors"
                >
                  Our Services
                </Link>
                <a
                  href="tel:+27724162547"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#007bff] hover:bg-[#0056b3] text-white font-semibold rounded-2xl transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  Call Us
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
