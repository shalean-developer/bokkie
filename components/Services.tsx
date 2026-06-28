"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ArrowRight, Plus, X } from "lucide-react";

const services = [
  {
    id: "standard",
    number: "01",
    title: "Standard cleaning",
    shortDescription:
      "Regular maintenance cleaning for homes and apartments, including kitchens, bathrooms, dusting, and floors.",
    fullDescription:
      "Our standard cleaning service keeps your home fresh and hygienic with thorough kitchen and bathroom sanitization, dusting, vacuuming, and floor care. Ideal for weekly, bi-weekly, or monthly schedules across Cape Town.",
    tags: ["homes", "apartments", "weekly cleans", "kitchen", "bathrooms", "maintenance"],
    image: "/image/service-standard-living-room.png",
    bookingHref: "/book/regular-cleaning",
  },
  {
    id: "deep",
    number: "02",
    title: "Deep cleaning",
    shortDescription:
      "A thorough top-to-bottom clean for homes that need extra attention, covering every corner, surface, and detail.",
    fullDescription:
      "Deep cleaning goes beyond regular maintenance with intensive scrubbing of kitchens, bathrooms, appliances, and hard-to-reach areas. Perfect for seasonal refreshes, post-renovation tidy-ups, or when your home needs a full reset.",
    tags: ["deep clean", "spring clean", "thorough scrub", "appliances", "detailed", "top-to-bottom"],
    image: "/image/blog-spotless-living-room.png",
    bookingHref: "/book/deep-cleaning",
  },
  {
    id: "move-in-out",
    number: "03",
    title: "Move in / out cleaning",
    shortDescription:
      "Comprehensive cleaning for moving day so you can leave your old place spotless or arrive to a fresh new home.",
    fullDescription:
      "Moving is stressful enough. Our move in/out team handles the deep clean so you can focus on the move. We cover every room, cupboard, and appliance to meet landlord or new-owner standards.",
    tags: ["moving", "landlord", "end of lease", "new home", "cupboards", "appliances"],
    image: "/image/service-move-in-out.png",
    bookingHref: "/book/moving-cleaning",
  },
  {
    id: "airbnb",
    number: "04",
    title: "Airbnb cleaning",
    shortDescription:
      "Fast, reliable turnover cleaning between guest stays so your listing stays five-star ready.",
    fullDescription:
      "Keep your short-term rental guest-ready with efficient turnover cleans. We refresh linens, restock essentials, and ensure every surface sparkles, helping you maintain great reviews and higher occupancy.",
    tags: ["Airbnb", "short-term rental", "turnover", "guest-ready", "linens", "five-star"],
    image: "/image/service-airbnb-bedroom.png",
    bookingHref: "/book/airbnb-cleaning",
  },
  {
    id: "office",
    number: "05",
    title: "Office cleaning",
    shortDescription:
      "Professional cleaning for offices and workspaces, including restrooms, break rooms, desks, and common areas.",
    fullDescription:
      "Maintain a clean, professional workspace for your team and clients. We sanitize restrooms, clean break rooms, dust workstations, and care for floors, with flexible scheduling before or after business hours.",
    tags: ["office", "workspace", "restrooms", "break rooms", "commercial", "flexible hours"],
    image: "/image/service-office-workspace.png",
    bookingHref: "/book/office-cleaning",
  },
  {
    id: "carpet-cleaning",
    number: "06",
    title: "Carpet cleaning",
    shortDescription:
      "Professional carpet and rug cleaning to remove stains, odours, and built-up dirt from your floors.",
    fullDescription:
      "Restore your carpets and rugs with professional deep extraction cleaning. We treat stains, eliminate odours, and refresh fitted carpets and loose rugs, leaving your floors looking and smelling like new.",
    tags: ["carpets", "rugs", "stain removal", "odours", "fitted rooms", "upholstery"],
    image: "/image/service-carpet-bedroom.png",
    bookingHref: "/book/carpet-cleaning",
  },
];

function BookNowButton({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-2xl bg-brand-primary hover:bg-brand-primary-dark p-1 pl-5 transition-colors"
    >
      <span className="text-white text-sm font-semibold pr-4">Book Now</span>
      <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-white shrink-0">
        <ArrowRight className="w-4 h-4 text-brand-primary" strokeWidth={2.5} />
      </span>
    </Link>
  );
}

interface ServicesProps {
  pricingByCategoryId?: Record<string, number>;
}

export default function Services(_props: ServicesProps) {
  const [expandedId, setExpandedId] = useState<string | null>(services[0].id);

  return (
    <section id="services" className="py-16 sm:py-20 lg:py-24 bg-brand-primary-dark">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-12 lg:mb-16">
          <div>
            <p className="flex items-center gap-2 text-brand-accent text-sm font-semibold tracking-wide uppercase mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
              Our Services
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Discover our services and how{" "}
              <span className="font-script text-brand-accent italic font-normal">we do it better</span>
            </h2>
          </div>
          <div className="flex items-end">
            <p className="text-white/75 text-base sm:text-lg leading-relaxed max-w-xl lg:ml-auto">
              Whether it&apos;s your home or your office, our reliable cleaning pros deliver fresh,
              spotless spaces with care, consistency, and attention to every detail.
            </p>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {services.map((service) => {
            const isExpanded = expandedId === service.id;

            if (isExpanded) {
              return (
                <div
                  key={service.id}
                  className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10"
                >
                  <div className="flex justify-end mb-4 lg:mb-6">
                    <button
                      type="button"
                      onClick={() => setExpandedId(null)}
                      className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-brand-primary text-white hover:bg-brand-primary-dark transition-colors shrink-0"
                      aria-label={`Close ${service.title}`}
                    >
                      <X className="w-5 h-5 shrink-0" strokeWidth={2.5} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
                    <div>
                      <span className="text-5xl sm:text-6xl font-light text-gray-300 leading-none">
                        {service.number}
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-4 mb-4 capitalize">
                        {service.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed mb-6">
                        {service.fullDescription}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-8">
                        {service.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-4 py-2 text-sm text-gray-800 border border-gray-200 rounded-full bg-white"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <BookNowButton href={service.bookingHref} />
                    </div>

                    <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[320px] rounded-2xl overflow-hidden">
                      <Image
                        src={service.image}
                        alt={service.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <button
                key={service.id}
                type="button"
                onClick={() => setExpandedId(service.id)}
                className="w-full text-left bg-white/[0.06] border border-white/10 rounded-2xl px-5 sm:px-8 py-5 sm:py-6 flex items-center gap-4 sm:gap-8 hover:bg-white/[0.1] transition-colors group"
              >
                <span className="text-3xl sm:text-4xl font-light text-white/25 shrink-0 w-12 sm:w-16">
                  {service.number}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-white capitalize mb-1">
                    {service.title}
                  </h3>
                  <p className="text-white/50 text-sm sm:text-base line-clamp-2">
                    {service.shortDescription}
                  </p>
                </div>
                <span className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brand-primary text-white shrink-0 group-hover:bg-brand-primary-dark transition-colors">
                  <Plus className="w-5 h-5" />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
