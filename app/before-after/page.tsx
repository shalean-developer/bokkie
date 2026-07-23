import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import Footer from "@/components/Footer";
import PageHero from "@/components/marketing/PageHero";
import BeforeAfterGalleryGrid from "@/components/BeforeAfterGalleryGrid";
import { beforeAfterGallery } from "@/lib/data/before-after-gallery";
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
  title: { default: "Before & After Cleaning Gallery | Bokkie Cleaning Services" },
  description: generateMetaDescription(
    "Browse real before and after cleaning transformations from Bokkie Cleaning Services in Cape Town. Stovetops, ovens, cabinets, and more — drag to compare."
  ),
  openGraph: {
    title: "Before & After Cleaning Gallery | Bokkie Cleaning Services",
    description:
      "See real cleaning transformations. Drag the slider to compare before and after results across Cape Town homes.",
    url: generateCanonicalUrl("/before-after"),
    siteName: siteConfig.name,
    images: [getOgImageMetadata("Before and After Cleaning Results - Bokkie Cleaning Services")],
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Before & After Cleaning Gallery | Bokkie Cleaning Services",
    description: "See real cleaning transformations from Bokkie Cleaning Services.",
    images: [getOgImageUrl()],
  },
  alternates: {
    canonical: generateCanonicalUrl("/before-after"),
  },
  robots: indexableRobots,
  other: capeTownGeoMeta,
};

export default function BeforeAfterGalleryPage() {
  return (
    <>
      <main className="min-h-screen bg-white">
        <PageHero
          eyebrow="Real results"
          title="Before & After Gallery"
          description="Every transformation below uses the same interactive slider. Drag the handle to compare before and after — and see what a professional clean can do."
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Before & After" },
          ]}
        />

        <section className="bg-[#FCFAF7] py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 lg:mb-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white text-xs text-gray-600 mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  {beforeAfterGallery.length} transformation
                  {beforeAfterGallery.length === 1 ? "" : "s"}
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  All cleaning transformations
                </h2>
                <p className="text-gray-500 text-sm sm:text-base mt-2 max-w-xl">
                  Drag the white handle left or right to compare. On mobile, scroll the page
                  normally — only the handle starts a compare drag.
                </p>
              </div>
            </div>

            <BeforeAfterGalleryGrid items={beforeAfterGallery} />

            <div className="mt-12 text-center">
              <Link
                href="/booking/service/deep/details"
                className="inline-flex items-center gap-3 bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold rounded-2xl pl-6 pr-1.5 py-1.5 transition-colors shadow-md"
              >
                Book a deep clean
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/15 shrink-0">
                  <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                </span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
