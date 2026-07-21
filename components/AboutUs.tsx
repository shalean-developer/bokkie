import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Users, Sparkles, Handshake } from "lucide-react";

const features = [
  { icon: MapPin, label: "Serving Cape Town" },
  { icon: Users, label: "Experienced Team" },
  { icon: Sparkles, label: "Attention to Detail" },
  { icon: Handshake, label: "Customer First" },
];

export default function AboutUs() {
  return (
    <section id="about" className="bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-16 sm:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="relative aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5] rounded-3xl overflow-hidden bg-gray-100 order-2 lg:order-1">
            <Image
              src="/image/about-bokkie-cleaner-sink.png"
              alt="Bokkie cleaner in branded uniform washing at a kitchen sink with soapy gloves"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div className="order-1 lg:order-2">
            <p className="flex items-center gap-2 text-brand-accent text-sm font-semibold tracking-wide uppercase mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
              About Bokkie Cleaning Services
            </p>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-5">
              More Than Cleaning — We Help You{" "}
              <span className="font-serif italic font-normal">Feel at Home</span>
            </h2>

            <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-4">
              At Bokkie Cleaning Services, we believe a clean environment brings comfort,
              peace of mind, and more time to enjoy what matters most. Our mission is to
              deliver reliable, high-quality cleaning services with professionalism,
              integrity, and genuine care.
            </p>

            <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-8">
              Proudly serving homeowners and businesses across Cape Town and surrounding
              suburbs.
            </p>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
              {features.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-brand-surface px-4 py-3.5"
                >
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-primary text-white shrink-0">
                    <Icon className="w-5 h-5" strokeWidth={1.75} />
                  </span>
                  <span className="text-sm font-semibold text-gray-900 leading-snug">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <Link
              href="/about"
              className="inline-flex items-center gap-3 bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold rounded-2xl pl-6 pr-1.5 py-1.5 transition-colors shadow-md"
            >
              Learn More
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/15 shrink-0">
                <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
              </span>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-brand-primary">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="py-2.5 text-center text-sm text-white/90 leading-snug">
            Explore the areas where our experienced cleaning team proudly serves clients.
          </p>
        </div>
      </div>
    </section>
  );
}
