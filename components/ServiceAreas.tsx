import Link from "next/link";
import { ArrowRight, MapPin, MapPinned, Waves, Building2, Home, Mountain } from "lucide-react";
import { capeTownAreas, getLocationSlug } from "@/lib/constants/areas";

const areaRegions = [
  {
    name: "Atlantic Seaboard",
    icon: Waves,
    areas: [
      "Sea Point",
      "Camps Bay",
      "Green Point",
      "Mouille Point",
      "Three Anchor Bay",
      "Bantry Bay",
      "Fresnaye",
      "Bakoven",
      "Llandudno",
      "Hout Bay",
    ],
    accent: "text-brand-primary",
    chipHover: "hover:border-brand-primary hover:text-brand-primary hover:bg-brand-primary/5",
  },
  {
    name: "City Bowl",
    icon: Building2,
    areas: [
      "City Bowl",
      "Gardens",
      "Tamboerskloof",
      "Oranjezicht",
      "Vredehoek",
      "Devil's Peak",
      "Woodstock",
      "Observatory",
      "V&A Waterfront",
    ],
    accent: "text-brand-primary-light",
    chipHover: "hover:border-brand-primary-light hover:text-brand-primary-light hover:bg-brand-primary/5",
  },
  {
    name: "Southern Suburbs",
    icon: Home,
    areas: [
      "Claremont",
      "Constantia",
      "Newlands",
      "Rondebosch",
      "Wynberg",
      "Kenilworth",
      "Plumstead",
      "Diep River",
      "Bergvliet",
      "Tokai",
      "Steenberg",
    ],
    accent: "text-brand-accent",
    chipHover: "hover:border-brand-accent hover:text-brand-primary hover:bg-brand-primary/5",
  },
  {
    name: "South Peninsula",
    icon: Mountain,
    areas: ["Muizenberg", "Kalk Bay", "Fish Hoek", "Simon's Town"],
    accent: "text-brand-primary-dark",
    chipHover: "hover:border-brand-primary-dark hover:text-brand-primary-dark hover:bg-brand-primary/5",
  },
] as const;

export default function ServiceAreas() {
  return (
    <section id="service-areas" className="py-16 sm:py-20 lg:py-24 bg-brand-surface">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-10 lg:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-200 bg-gray-50/80 text-sm text-gray-600 mb-6">
            <MapPinned className="w-3.5 h-3.5 text-brand-primary" />
            Service Areas
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-5">
            Areas We Serve in{" "}
            <span className="font-serif italic font-normal">Cape Town</span>
          </h2>

          <p className="text-gray-500 text-base sm:text-lg leading-relaxed">
            Professional cleaning services available throughout Cape Town and surrounding
            suburbs. From the Atlantic Seaboard to the South Peninsula, our vetted cleaners
            are ready when you are.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-10 lg:mb-12">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gray-50 border border-gray-100">
            <span className="text-2xl font-bold text-brand-primary">{capeTownAreas.length}</span>
            <span className="text-sm text-gray-600">Neighborhoods</span>
          </div>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gray-50 border border-gray-100">
            <MapPin className="w-4 h-4 text-brand-primary shrink-0" />
            <span className="text-sm font-medium text-gray-700">Cape Town, Western Cape</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 mb-12 lg:mb-14">
          {areaRegions.map((region) => {
            const Icon = region.icon;
            return (
              <div
                key={region.name}
                className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 border border-gray-100">
                    <Icon className={`w-5 h-5 ${region.accent}`} strokeWidth={1.75} />
                  </span>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg">{region.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {region.areas.length} {region.areas.length === 1 ? "area" : "areas"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {region.areas.map((area) => (
                    <Link
                      key={area}
                      href={`/areas/${getLocationSlug(area)}`}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm text-gray-600 bg-gray-50 border border-gray-100 transition-colors ${region.chipHover}`}
                    >
                      <MapPin className="w-3 h-3 shrink-0 opacity-60" />
                      {area}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <p className="text-gray-500 text-sm sm:text-base mb-6">
            Don&apos;t see your area? We may still be able to help!
          </p>
          <Link
            href="/service-areas"
            className="inline-flex items-center gap-3 bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold rounded-2xl pl-6 pr-1.5 py-1.5 transition-colors shadow-md text-sm sm:text-base"
          >
            View all service areas
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-white shrink-0">
              <ArrowRight className="w-4 h-4 text-brand-primary" strokeWidth={2.5} />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
