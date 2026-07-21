"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star } from "lucide-react";

const reviewAvatars = [
  { initial: "S", alt: "Sumaya" },
  { initial: "S", alt: "Sarah M." },
  { initial: "J", alt: "John D." },
  { initial: "B", alt: "Beaulla" },
];

export default function Hero() {
  return (
    <section className="relative -mt-[6.5rem] sm:-mt-28 md:-mt-[7.5rem] min-h-[580px] sm:min-h-[640px] lg:min-h-[720px] flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/image/hero-professional-cleaning.png"
          alt="Professional cleaning service in action"
          fill
          className="object-cover object-[65%_center] sm:object-[60%_center] lg:object-center"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 w-full pt-36 pb-28 sm:pt-40 sm:pb-28 lg:pt-44 lg:pb-32">
        <div className="max-w-2xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.05] mb-6">
            Professional Cleaning services in Cape Town
          </h1>

          <p className="text-base sm:text-lg text-white/90 max-w-lg mb-8 leading-relaxed">
            Our expert cleaning team delivers high-quality service tailored to your needs, on time, every time.
          </p>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <Link
              href="/book"
              className="inline-flex items-center gap-3 bg-white hover:bg-white/95 text-brand-primary font-semibold rounded-2xl pl-6 pr-1.5 py-1.5 transition-colors shadow-lg text-base sm:text-lg"
            >
              Book a service
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-primary shrink-0">
                <ArrowRight className="w-5 h-5 text-white" strokeWidth={2.5} />
              </span>
            </Link>
            <Link
              href="/booking/quote"
              className="inline-flex items-center gap-2 px-6 py-3.5 border-2 border-white text-white hover:bg-white hover:text-brand-primary font-semibold rounded-2xl transition-colors text-base sm:text-lg"
            >
              Get Free Quote
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-5 left-4 right-4 sm:left-6 sm:right-auto sm:bottom-6 lg:left-8 lg:bottom-8 z-20">
        <div className="inline-flex flex-wrap items-center gap-3 rounded-2xl bg-black/45 backdrop-blur-md border border-white/15 px-4 py-2.5 shadow-lg">
          <div className="flex -space-x-3">
            {reviewAvatars.map((avatar, index) => (
              <div
                key={`${avatar.initial}-${index}`}
                className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white bg-brand-primary text-white text-xs sm:text-sm font-bold"
                aria-label={avatar.alt}
              >
                {avatar.initial}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5" aria-label="Rating 4.95 out of 5">
              {Array.from({ length: 5 }).map((_, i) => {
                const fillPercent = Math.min(Math.max(4.95 - i, 0), 1) * 100;
                return (
                  <span key={i} className="relative inline-flex w-4 h-4">
                    <Star className="w-4 h-4 text-amber-400/35" strokeWidth={1.5} />
                    <span
                      className="absolute inset-0 overflow-hidden"
                      style={{ width: `${fillPercent}%` }}
                    >
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" strokeWidth={1.5} />
                    </span>
                  </span>
                );
              })}
            </div>
            <span className="text-white text-xs sm:text-sm font-semibold tracking-wide uppercase">
              4.95 / 5 (150+ Reviews)
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
