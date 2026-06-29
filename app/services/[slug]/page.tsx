import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  Shield,
} from "lucide-react";
import {
  truncateTitle,
  generateMetaDescription,
  generateCanonicalUrl,
  capeTownGeoMeta,
  getOgImageMetadata,
  getOgImageUrl,
  indexableRobots,
  siteConfig,
} from "@/lib/seo";
import { generateFaqPageSchema } from "@/lib/seo/faq-schema";
import { generateBreadcrumbSchema } from "@/lib/seo/schema-generator";
import {
  getServiceCategory,
  isServiceCategorySlug,
  SERVICE_REDIRECTS,
  type ServiceCategory,
  type ServiceCategorySlug,
} from "@/lib/data/service-categories";
import { getServiceCategoryPricingByCategoryId } from "@/lib/supabase/booking-data";
import { getServiceTypePricing } from "@/lib/supabase/booking-data";
import { formatPrice } from "@/lib/pricing";
import Footer from "@/components/Footer";
import PageHero from "@/components/marketing/PageHero";
import MarketingCta from "@/components/marketing/MarketingCta";
import FaqAccordion from "@/components/marketing/FaqAccordion";
import JsonLd from "@/components/marketing/JsonLd";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const resolved = SERVICE_REDIRECTS[slug];

    if (resolved && resolved !== slug) {
      return {};
    }

    if (!isServiceCategorySlug(slug)) {
      return {};
    }

    const category = getServiceCategory(slug);
    if (!category) {
      return {};
    }

    const title = truncateTitle(`${category.shortName} in Cape Town`);
    const description = `${category.description}. Professional ${category.shortName.toLowerCase()} throughout Cape Town. Book online with vetted, insured cleaners.`;

    return {
      title: { default: title },
      description: generateMetaDescription(description),
      keywords: [
        `${category.shortName.toLowerCase()} Cape Town`,
        `professional ${category.shortName.toLowerCase()} Cape Town`,
        "cleaning services Cape Town",
        "book cleaning online Cape Town",
        "vetted cleaners Cape Town",
      ],
      alternates: {
        canonical: generateCanonicalUrl(`/services/${slug}`),
      },
      openGraph: {
        title: `${category.shortName} in Cape Town | Bokkie Cleaning Services`,
        description,
        url: generateCanonicalUrl(`/services/${slug}`),
        siteName: siteConfig.name,
        images: [getOgImageMetadata(`${category.shortName} in Cape Town`)],
        locale: "en_ZA",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `${category.shortName} in Cape Town | Bokkie Cleaning Services`,
        description,
        images: [getOgImageUrl()],
      },
      robots: indexableRobots,
      other: capeTownGeoMeta,
    };
  } catch (error) {
    console.error("Error generating metadata for service page:", error);
    return {
      title: { default: "Cleaning Services Cape Town" },
      description: "Professional cleaning services in Cape Town",
    };
  }
}

function generateServiceStructuredData(
  slug: ServiceCategorySlug,
  category: ServiceCategory,
  displayPrice: number
) {
  const pageUrl = generateCanonicalUrl(`/services/${slug}`);

  return {
    "@context": "https://schema.org",
    "@graph": [
      generateBreadcrumbSchema([
        { name: "Home", url: siteConfig.url },
        { name: "Services", url: generateCanonicalUrl("/services") },
        { name: category.shortName, url: pageUrl },
      ]),
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: `${category.shortName} in Cape Town`,
        description: category.longDescription,
        inLanguage: "en-ZA",
        isPartOf: { "@id": `${siteConfig.url}#website` },
      },
      {
        "@type": "Service",
        name: category.name,
        description: category.longDescription,
        provider: {
          "@type": "Organization",
          name: siteConfig.name,
          url: siteConfig.url,
        },
        areaServed: {
          "@type": "City",
          name: "Cape Town",
        },
        offers: {
          "@type": "Offer",
          price: displayPrice.toString(),
          priceCurrency: "ZAR",
          description: `Starting from ${formatPrice(displayPrice)}`,
        },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: category.shortName,
          itemListElement: category.subServices.map((sub) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: sub.name,
              description: sub.description,
            },
          })),
        },
      },
      generateFaqPageSchema(category.faqs),
    ],
  };
}

export default async function ServiceCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const redirectTarget = SERVICE_REDIRECTS[slug];
  if (redirectTarget && redirectTarget !== slug) {
    redirect(`/services/${redirectTarget}`);
  }

  if (!isServiceCategorySlug(slug)) {
    redirect("/services");
  }

  const category = getServiceCategory(slug);
  if (!category) {
    redirect("/services");
  }

  let displayPrice = 500;
  const subServicePrices = new Map<string, number>();

  try {
    const [categoryPricing, typePricing] = await Promise.all([
      getServiceCategoryPricingByCategoryId(slug),
      getServiceTypePricing(),
    ]);

    displayPrice = categoryPricing?.display_price || 500;

    for (const pricing of typePricing) {
      subServicePrices.set(pricing.service_type, Number(pricing.base_price));
    }
  } catch (error) {
    console.error(`Error fetching pricing for ${slug}:`, error);
  }

  const structuredData = generateServiceStructuredData(slug, category, displayPrice);
  const CategoryIcon = category.icon;

  return (
    <>
      <JsonLd data={structuredData} />

      <main className="min-h-screen bg-white">
        <PageHero
          eyebrow={category.shortName}
          title={`${category.shortName} in Cape Town`}
          description={category.longDescription}
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Services", href: "/services" },
            { label: category.shortName },
          ]}
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 mb-5">
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-brand-accent" aria-hidden="true" />
              Vetted and insured cleaners
            </span>
            <span>
              From <strong className="text-gray-800">{formatPrice(displayPrice)}</strong>
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/book/${category.subServices[0]?.id ?? "regular-cleaning"}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold rounded-button transition-colors"
            >
              Book online
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-gray-300 text-gray-900 font-semibold rounded-button hover:bg-gray-50 transition-colors"
            >
              How it works
            </Link>
          </div>
        </PageHero>

        <section className="py-10 sm:py-14" aria-labelledby="bookable-services-heading">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto mb-8 sm:mb-10 text-center">
              <h2
                id="bookable-services-heading"
                className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3"
              >
                Book {category.shortName.toLowerCase()} online
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Choose the service type that matches your needs. Each option links directly to
                booking.
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {category.subServices.map((sub) => {
                const SubIcon = sub.icon;
                const price = subServicePrices.get(sub.pricingKey);

                return (
                  <article
                    key={sub.id}
                    className="border border-gray-200 rounded-xl overflow-hidden bg-white"
                  >
                    <div className="p-5 sm:p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-2.5 rounded-lg ${category.iconBg} shrink-0`}>
                          <SubIcon className={`w-5 h-5 ${category.accent}`} aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{sub.name}</h3>
                            {price !== undefined && (
                              <p className="text-sm font-semibold text-brand-primary whitespace-nowrap">
                                From {formatPrice(price)}
                              </p>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                            {sub.description}
                          </p>
                          <ul className="space-y-1.5 mb-4">
                            {sub.features.map((feature) => (
                              <li
                                key={feature}
                                className="flex items-start gap-2 text-sm text-gray-700"
                              >
                                <CheckCircle2
                                  className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5"
                                  aria-hidden="true"
                                />
                                {feature}
                              </li>
                            ))}
                          </ul>
                          {sub.suppliesIncluded && (
                            <p className="text-xs font-medium text-emerald-700 bg-emerald-50 inline-block px-2.5 py-1 rounded-md mb-4">
                              Supplies and equipment included
                            </p>
                          )}
                          <Link
                            href={sub.bookHref}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-dark text-white text-sm font-semibold rounded-button transition-colors"
                          >
                            Book {sub.name.toLowerCase()}
                            <ArrowRight className="w-4 h-4" aria-hidden="true" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <p className="max-w-3xl mx-auto mt-6 text-center text-sm text-gray-500">
              Looking for a different type of clean?{" "}
              {category.otherCategoryLinks.map((link, i) => (
                <span key={link.slug}>
                  {i > 0 && " or "}
                  <Link
                    href={`/services/${link.slug}`}
                    className="text-brand-primary font-semibold hover:underline"
                  >
                    {link.label}
                  </Link>
                </span>
              ))}
              .
            </p>
          </div>
        </section>

        <section className="py-10 sm:py-14 bg-brand-surface" aria-labelledby="included-heading">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto mb-8 text-center">
              <h2 id="included-heading" className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                What is included
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Every {category.shortName.toLowerCase()} booking is tailored to your property, with
                these tasks as standard.
              </p>
            </div>
            <ul className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
              {category.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2.5 bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700"
                >
                  <CheckCircle2
                    className="w-4 h-4 text-brand-accent shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="py-10 sm:py-14" aria-labelledby="benefits-heading">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto mb-8 text-center">
              <h2 id="benefits-heading" className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                Why choose Bokkie
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {category.benefits.map((benefit) => (
                <article
                  key={benefit.title}
                  className="p-5 border border-gray-200 rounded-xl bg-white"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${category.iconBg}`}>
                      <CategoryIcon className={`w-4 h-4 ${category.accent}`} aria-hidden="true" />
                    </div>
                    <h3 className="font-bold text-gray-900">{benefit.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{benefit.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-14 bg-brand-surface" aria-labelledby="areas-heading">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto mb-6 text-center">
              <h2 id="areas-heading" className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                Service areas
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                {category.shortName} available across Cape Town and surrounding suburbs.
              </p>
            </div>
            <div className="max-w-2xl mx-auto flex flex-wrap justify-center gap-2 mb-6">
              {category.popularAreas.map((area) => (
                <span
                  key={area}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700"
                >
                  <MapPin className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
                  {area}
                </span>
              ))}
            </div>
            <p className="text-center">
              <Link
                href="/service-areas"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary hover:text-brand-primary-dark transition-colors"
              >
                View all service areas
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </p>
          </div>
        </section>

        <section className="py-10 sm:py-14" aria-labelledby="category-faq-heading">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto mb-8 text-center">
              <h2
                id="category-faq-heading"
                className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3"
              >
                Frequently asked questions
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Common questions about {category.shortName.toLowerCase()} in Cape Town.
              </p>
            </div>
            <div className="max-w-2xl mx-auto">
              <FaqAccordion items={category.faqs} />
            </div>
          </div>
        </section>

        <MarketingCta
          title={`Ready to book ${category.shortName.toLowerCase()}?`}
          description="Get an instant quote and book a vetted cleaner in Cape Town. Same-day booking may be available."
          secondaryHref="/services"
          secondaryLabel="All services"
        />
      </main>
      <Footer />
    </>
  );
}
