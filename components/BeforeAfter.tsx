import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { connection } from "next/server";
import BeforeAfterGalleryGrid from "@/components/BeforeAfterGalleryGrid";
import {
  beforeAfterGallery,
  HOMEPAGE_TRANSFORMATION_COUNT,
  pickRandomTransformations,
} from "@/lib/data/before-after-gallery";

/**
 * Homepage Before & After section.
 * Picks 3 unique transformations per request so each page load can
 * show a different set as the gallery grows.
 */
export default async function BeforeAfter() {
  // Opt out of static caching so Math.random runs on every request
  await connection();

  const featured = pickRandomTransformations(
    beforeAfterGallery,
    HOMEPAGE_TRANSFORMATION_COUNT
  );

  return (
    <section id="results" className="bg-[#FCFAF7]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-16 sm:py-20 lg:py-24">
        <div className="text-center max-w-3xl mx-auto mb-10 lg:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-200 bg-white text-sm text-gray-600 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Real results
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-5">
            See the difference a{" "}
            <span className="font-serif italic font-normal text-brand-primary">
              proper clean
            </span>{" "}
            makes
          </h2>

          <p className="text-gray-500 text-base sm:text-lg leading-relaxed">
            Each photo starts on the before shot, then slides across to reveal the after —
            so you can see the transformation for yourself.
          </p>
        </div>

        <BeforeAfterGalleryGrid items={featured} />

        <div className="mt-10 lg:mt-12 text-center">
          <p className="text-xs text-gray-400 mb-5">
            Drag the white handle left or right to compare — scroll the page normally on mobile
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/before-after"
              className="inline-flex items-center gap-3 bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold rounded-2xl pl-6 pr-1.5 py-1.5 transition-colors shadow-md"
            >
              View More Transformations
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/15 shrink-0">
                <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
              </span>
            </Link>
            <Link
              href="/booking/service/deep/details"
              className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-brand-primary hover:text-brand-primary-dark transition-colors"
            >
              Book a deep clean
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-brand-primary">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="py-2.5 text-center text-sm text-white/90 leading-snug">
            Behind every spotless home is a team of professionals who take pride in every
            detail.
          </p>
        </div>
      </div>
    </section>
  );
}
