"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sumaya",
    role: "Homeowner",
    image: null as string | null,
    rating: 5,
    text: "The professionalism of the Company is exceptional, and they ensure a suitable lady is available for your clean day/s. The ladies allocated to me thus far have good cleaning skills. I highly recommend Bokkie Cleaning Services.",
  },
  {
    name: "Sarah M.",
    role: "Apartment Resident",
    image: null,
    rating: 5,
    text: "Outstanding service! The team was punctual, thorough, and left my home spotless. Highly professional and reliable cleaning service.",
  },
  {
    name: "John D.",
    role: "Business Owner",
    image: null,
    rating: 5,
    text: "Best cleaning service in Cape Town. They pay attention to every detail and use eco-friendly products. My apartment has never looked better!",
  },
];

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const testimonial = testimonials[activeIndex];

  function goPrev() {
    setActiveIndex((i) => (i === 0 ? testimonials.length - 1 : i - 1));
  }

  function goNext() {
    setActiveIndex((i) => (i === testimonials.length - 1 ? 0 : i + 1));
  }

  return (
    <section id="testimonials" className="bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-16 sm:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left */}
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-gray-900 leading-tight mb-5">
              Feedback About Their Experience With Us
            </h2>
            <p className="text-gray-500 text-base leading-relaxed mb-8 max-w-md">
              Read testimonials from our satisfied clients. See how our cleaning services have
              made a difference in their lives and homes.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous testimonial"
                className="w-12 h-12 rounded-xl border-2 border-brand-primary text-brand-primary flex items-center justify-center hover:bg-brand-primary/5 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next testimonial"
                className="w-12 h-12 rounded-xl bg-brand-primary text-white flex items-center justify-center hover:bg-brand-primary-dark transition-colors"
              >
                <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Right: testimonial card */}
          <div
            className="relative bg-white rounded-2xl p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border-t-[3px] border-r-[3px] border-brand-primary"
            itemScope
            itemType="https://schema.org/Review"
          >
            <Quote
              className="absolute top-5 right-5 sm:top-6 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 text-brand-primary fill-brand-primary/15"
              strokeWidth={1.5}
            />

            <div className="flex items-center gap-4 mb-5 pr-12">
              <div className="relative w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem] rounded-2xl overflow-hidden bg-brand-primary/10 shrink-0 flex items-center justify-center">
                {testimonial.image ? (
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                    sizes="72px"
                  />
                ) : (
                  <span className="text-xl font-bold text-brand-primary">
                    {testimonial.name.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <p
                  className="font-bold text-gray-900 text-base sm:text-lg"
                  itemProp="author"
                  itemScope
                  itemType="https://schema.org/Person"
                >
                  <span itemProp="name">{testimonial.name}</span>
                </p>
                <p className="text-gray-500 text-sm">{testimonial.role}</p>
                <div className="flex gap-0.5 mt-1.5">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed text-sm sm:text-base" itemProp="reviewBody">
              {testimonial.text}
            </p>

            <div
              itemProp="reviewRating"
              itemScope
              itemType="https://schema.org/Rating"
              className="hidden"
            >
              <meta itemProp="ratingValue" content={testimonial.rating.toString()} />
              <meta itemProp="bestRating" content="5" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-brand-primary">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="py-2.5 text-center text-sm text-white/90 leading-snug">
            Still have a few questions? We&apos;ve answered some of the most common questions to
            help you book with confidence.
          </p>
        </div>
      </div>
    </section>
  );
}
