import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

const DEFAULT_HERO_IMAGE = "/image/hero-professional-cleaning.png";
const DEFAULT_HERO_IMAGE_ALT = "Professional cleaning service in action";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type PageHeroProps = {
  title: string;
  description: string;
  eyebrow?: string;
  breadcrumbs?: BreadcrumbItem[];
  imageSrc?: string;
  imageAlt?: string;
  children?: React.ReactNode;
};

export default function PageHero({
  title,
  description,
  eyebrow,
  breadcrumbs,
  imageSrc = DEFAULT_HERO_IMAGE,
  imageAlt = DEFAULT_HERO_IMAGE_ALT,
  children,
}: PageHeroProps) {
  return (
    <section className="relative border-b border-gray-200 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover object-[65%_center] sm:object-[60%_center] lg:object-center"
          priority
          quality={85}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/25" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-14">
        <div className="max-w-3xl">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="mb-4">
              <ol className="flex flex-wrap items-center gap-1 text-sm text-white/70">
                {breadcrumbs.map((item, index) => (
                  <li key={item.label} className="flex items-center gap-1">
                    {index > 0 && (
                      <ChevronRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    )}
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="hover:text-white transition-colors"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span className="text-white font-medium" aria-current="page">
                        {item.label}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {eyebrow && (
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-brand-accent mb-3">
              {eyebrow}
            </p>
          )}

          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-white leading-tight text-balance mb-4">
            {title}
          </h1>

          <p className="text-base sm:text-lg text-white/90 leading-relaxed text-pretty mb-6">
            {description}
          </p>

          {children && (
            <div className="[&_.text-gray-500]:text-white/70 [&_.text-gray-600]:text-white/80 [&_.text-gray-700]:text-white/90 [&_.text-gray-800]:text-white [&_.text-gray-900]:text-white [&_.text-brand-primary]:text-brand-accent [&_.text-brand-primary:hover]:text-white [&_a.border]:border-white/60 [&_a.border]:text-white [&_a.border]:hover:bg-white/10 [&_a.border]:hover:border-white">
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
