import Image from "next/image";
import Link from "next/link";
import { Sparkles, ShieldCheck, Home, Leaf, CalendarCheck } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Room-by-room excellence",
    description:
      "From kitchens and bathrooms to bedrooms and living areas, we follow a thorough checklist so every corner of your home is cleaned properly.",
    align: "right" as const,
  },
  {
    icon: ShieldCheck,
    title: "Vetted, insured cleaners",
    description:
      "Every cleaner is background-checked, insured, and trained before entering your home. You get peace of mind, not just a clean house.",
    align: "right" as const,
  },
  {
    icon: Home,
    title: "Safe for your household",
    description:
      "We use effective, family-friendly products that tackle grime and germs while being gentle on surfaces, children, and pets.",
    align: "left" as const,
    secondaryIcon: Leaf,
  },
  {
    icon: CalendarCheck,
    title: "Fits your schedule",
    description:
      "Need a once-off deep clean or regular weekly visits? Book one-time, weekly, bi-weekly, or monthly house cleans across Cape Town.",
    align: "left" as const,
  },
];
function FeatureBlock({
  icon: Icon,
  secondaryIcon: SecondaryIcon,
  title,
  description,
  align,
}: {
  icon: (typeof features)[number]["icon"];
  secondaryIcon?: (typeof features)[number]["secondaryIcon"];
  title: string;
  description: string;
  align: "left" | "right";
}) {
  return (
    <div className={align === "right" ? "lg:text-right" : "lg:text-left"}>
      <div
        className={`mb-3 ${
          align === "right" ? "lg:flex lg:justify-end" : "lg:flex lg:justify-start"
        }`}
      >
        <span className="relative inline-flex items-center justify-center w-12 h-12">
          <Icon className="w-10 h-10 text-brand-primary" strokeWidth={1.25} />
          {SecondaryIcon && (
            <SecondaryIcon
              className="absolute bottom-0 right-0 w-4 h-4 text-brand-primary"
              strokeWidth={1.5}
            />
          )}
        </span>
      </div>
      <h3 className="text-sm sm:text-base font-bold text-gray-900 uppercase tracking-wide mb-2">
        {title}
      </h3>
      <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto lg:mx-0 lg:max-w-[240px]">
        {description}
      </p>
    </div>
  );
}

export default function HowItWorks() {
  const leftFeatures = features.filter((f) => f.align === "right");
  const rightFeatures = features.filter((f) => f.align === "left");

  return (
    <section id="how-it-works" className="py-16 sm:py-20 lg:py-24 bg-brand-surface">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 uppercase tracking-wide mb-3">
            Why Choose Us
          </h2>
          <div className="w-12 h-0.5 bg-brand-primary mx-auto mb-5" />
          <p className="text-gray-500 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Bokkie is Cape Town&apos;s trusted house cleaning service, helping homeowners and
            renters enjoy spotless homes without the stress.
            <br className="hidden sm:block" />
            Here&apos;s why families choose us for their regular and deep cleans.
          </p>        </div>

        <div className="hidden lg:grid lg:grid-cols-[1fr_auto_1fr] lg:grid-rows-2 gap-x-10 xl:gap-x-16 gap-y-14 items-center mb-12">
          <div className="row-start-1 col-start-1 self-end">
            <FeatureBlock {...leftFeatures[0]} />
          </div>
          <div className="row-start-2 col-start-1 self-start">
            <FeatureBlock {...leftFeatures[1]} />
          </div>

          <div className="row-span-2 col-start-2 flex justify-center">
            <div className="relative w-56 h-56 xl:w-64 xl:h-64 rounded-full overflow-hidden border-4 border-white shadow-xl ring-1 ring-gray-100">
              <Image
                src="/image/why-choose-us-kitchen.png"
                alt="Bright, modern kitchen after professional cleaning"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1280px) 224px, 256px"
              />
            </div>
          </div>

          <div className="row-start-1 col-start-3 self-end">
            <FeatureBlock {...rightFeatures[0]} />
          </div>
          <div className="row-start-2 col-start-3 self-start">
            <FeatureBlock {...rightFeatures[1]} />
          </div>
        </div>

        <div className="lg:hidden space-y-10 mb-10">
          <div className="relative w-56 h-56 sm:w-64 sm:h-64 mx-auto rounded-full overflow-hidden border-4 border-white shadow-xl ring-1 ring-gray-100">
            <Image
              src="/image/why-choose-us-kitchen.png"
              alt="Bright, modern kitchen after professional cleaning"
              fill
              className="object-cover object-center"
              sizes="(max-width: 640px) 224px, 256px"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-8">
            {features.map((feature) => (
              <FeatureBlock key={feature.title} {...feature} align="left" />
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/how-it-works"
            className="inline-block px-8 py-3 bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold rounded-2xl transition-colors shadow-md"
          >
            Learn more about booking
          </Link>
        </div>
      </div>
    </section>
  );
}
