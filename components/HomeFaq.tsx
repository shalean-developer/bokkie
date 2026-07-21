import Link from "next/link";
import { HelpCircle } from "lucide-react";
import FaqAccordion from "@/components/marketing/FaqAccordion";
import { bookingFaqs } from "@/lib/data/booking-faqs";

const homepageFaqIndices = [0, 1, 5, 3, 8, 6];

const homepageFaqs = homepageFaqIndices.map((index) => bookingFaqs[index]);

export default function HomeFaq() {
  return (
    <section id="faq" className="bg-brand-surface" aria-labelledby="faq-heading">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-16 sm:py-20 lg:py-24">
        <div className="text-center max-w-3xl mx-auto mb-10 lg:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-200 bg-white text-sm text-gray-600 mb-6">
            <HelpCircle className="w-3.5 h-3.5 text-brand-primary" />
            FAQs
          </div>

          <h2
            id="faq-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-5"
          >
            Frequently Asked{" "}
            <span className="font-serif italic font-normal">Questions</span>
          </h2>

          <p className="text-gray-500 text-base sm:text-lg leading-relaxed">
            Straight answers about booking, pricing, and what to expect — so you can book with
            confidence.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <FaqAccordion items={homepageFaqs} />
        </div>

        <p className="text-center mt-8 text-sm sm:text-base text-gray-600">
          Still need help?{" "}
          <Link href="/faq" className="text-brand-primary font-semibold hover:underline">
            View all FAQs
          </Link>{" "}
          or{" "}
          <Link href="/contact" className="text-brand-primary font-semibold hover:underline">
            contact us
          </Link>
          .
        </p>
      </div>

      <div className="bg-brand-primary">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="py-2.5 text-center text-sm text-white/90 leading-snug">
            Ready to experience the same professional cleaning service? We&apos;d love to help.
          </p>
        </div>
      </div>
    </section>
  );
}
