import Image from "next/image";
import Link from "next/link";
import { Sparkles, Clock, Star, Smile } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Attention to Every Detail",
    description:
      "We don't just clean the obvious areas. We focus on the small details that leave your space looking fresh, spotless, and well cared for.",
    align: "right" as const,
  },
  {
    icon: Smile,
    title: "Customer-Focused Cleaning Service",
    description:
      "Your satisfaction is at the heart of everything we do. We listen to your needs and strive to exceed your expectations with every visit.",
    align: "right" as const,
  },
  {
    icon: Clock,
    title: "Reliable & Punctual Service",
    description:
      "We value your time by arriving on schedule, communicating clearly, and completing every cleaning efficiently and professionally.",
    align: "left" as const,
  },
  {
    icon: Star,
    title: "Experienced House Cleaning Professionals",
    description:
      "Our trained and experienced cleaners deliver consistent, high-quality results with care, professionalism, and attention to detail.",
    align: "left" as const,
  },
];
function FeatureBlock({
  icon: Icon,
  title,
  description,
  align,
}: {
  icon: (typeof features)[number]["icon"];
  title: string;
  description: string;
  align: "left" | "right";
}) {
  return (
    <div
      className={`flex flex-col gap-3 max-w-[280px] mx-auto ${
        align === "right" ? "lg:ml-auto lg:mr-0 lg:items-end lg:text-right" : "lg:mr-auto lg:ml-0 lg:items-start lg:text-left"
      } items-center text-center`}
    >
      <span className="inline-flex items-center justify-center w-12 h-12 shrink-0">
        <Icon className="w-10 h-10 text-brand-primary" strokeWidth={1.25} />
      </span>
      <h3 className="text-sm sm:text-base font-bold text-gray-900 uppercase tracking-wide">
        {title}
      </h3>
      <p className="text-gray-500 text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export default function HowItWorks() {
  const leftFeatures = features.filter((f) => f.align === "right");
  const rightFeatures = features.filter((f) => f.align === "left");

  return (
    <section id="how-it-works" className="bg-brand-surface">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-16 sm:py-20 lg:py-24">
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
          </p>
        </div>

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
                alt="Professional cleaner deep cleaning a washing machine with gloves and cleaning supplies"
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
              alt="Professional cleaner deep cleaning a washing machine with gloves and cleaning supplies"
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

      <div className="bg-brand-primary">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="py-2.5 text-center text-sm text-white/90 leading-snug">
            Our commitment to quality is built on more than great cleaning, it&apos;s built on
            the values that shape our business every day.
          </p>
        </div>
      </div>
    </section>
  );
}
