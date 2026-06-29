import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";

type MarketingCtaProps = {
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  phone?: boolean;
};

export default function MarketingCta({
  title,
  description,
  primaryHref = "/booking/quote",
  primaryLabel = "Get a free quote",
  secondaryHref,
  secondaryLabel,
  phone = true,
}: MarketingCtaProps) {
  return (
    <section className="bg-brand-primary text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-balance">{title}</h2>
          <p className="text-base sm:text-lg text-white/80 mb-8 text-pretty">{description}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={primaryHref}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-brand-primary font-semibold rounded-button hover:bg-gray-100 transition-colors"
            >
              {primaryLabel}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            {secondaryHref && secondaryLabel && (
              <Link
                href={secondaryHref}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-white/30 text-white font-semibold rounded-button hover:bg-white/10 transition-colors"
              >
                {secondaryLabel}
              </Link>
            )}
            {phone && (
              <a
                href="tel:+27724162547"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-white/30 text-white font-semibold rounded-button hover:bg-white/10 transition-colors"
              >
                <Phone className="w-4 h-4" aria-hidden="true" />
                Call us
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
