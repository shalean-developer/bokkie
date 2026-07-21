import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";

const comparisons = [
  {
    id: "stove",
    title: "Stovetop deep clean",
    description:
      "Burnt-on grease and carbon lifted from gas burners and stainless trays — watch the surface go from grimy to gleaming.",
    beforeSrc: "/image/before-after-stove-before.png",
    afterSrc: "/image/before-after-stove-after.png",
    beforeAlt: "Dirty gas stovetop burner covered in burnt grease before cleaning",
    afterAlt: "Polished stainless gas stovetop burner after professional cleaning",
  },
  {
    id: "oven",
    title: "Oven deep clean",
    description:
      "Trays, racks, glass, and cavity scrubbed free of baked-on food and grime for a fresh, ready-to-cook oven.",
    beforeSrc: "/image/before-after-oven-before.png",
    afterSrc: "/image/before-after-oven-after.png",
    beforeAlt: "Dirty oven interior with greasy tray and crumbs before cleaning",
    afterAlt: "Spotless oven interior with clean racks and tray after professional deep cleaning",
  },
  {
    id: "cabinets",
    title: "Cabinet refresh",
    description:
      "Kitchen drawers and fronts wiped and degreased so every handle and panel looks renewed and spotless.",
    beforeSrc: "/image/before-after-cabinets-after.png",
    afterSrc: "/image/before-after-cabinets-before.png",
    beforeAlt: "Kitchen cabinets before professional cleaning",
    afterAlt: "Freshly cleaned white kitchen drawers after professional cleaning",
  },
];

export default function BeforeAfter() {
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {comparisons.map((item) => (
            <BeforeAfterSlider
              key={item.id}
              title={item.title}
              description={item.description}
              beforeSrc={item.beforeSrc}
              afterSrc={item.afterSrc}
              beforeAlt={item.beforeAlt}
              afterAlt={item.afterAlt}
            />
          ))}
        </div>

        <div className="mt-10 lg:mt-12 text-center">
          <p className="text-xs text-gray-400 mb-5">
            Drag any slider yourself to pause the auto-play and compare in detail
          </p>
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
