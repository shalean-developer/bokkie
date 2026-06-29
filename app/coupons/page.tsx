import type { Metadata } from "next";

import Link from "next/link";

import { ArrowRight, Gift, Percent, Tag } from "lucide-react";

import Footer from "@/components/Footer";

import PageHero from "@/components/marketing/PageHero";

import MarketingCta from "@/components/marketing/MarketingCta";

import JsonLd from "@/components/marketing/JsonLd";

import { marketingHeroImages } from "@/lib/marketing-hero-images";

import {

  capeTownGeoMeta,

  generateCanonicalUrl,

  generateMetaDescription,

  getOgImageMetadata,

  getOgImageUrl,

  indexableRobots,

  siteConfig,

} from "@/lib/seo";

import { generateBreadcrumbSchema } from "@/lib/seo/schema-generator";

import { getPurchasableVouchers } from "@/app/actions/vouchers";

import { getPublicDiscountCodes } from "@/app/actions/discount";

import PublicPurchasableVouchers from "@/components/coupons/PublicPurchasableVouchers";

import CopyCodeButton from "@/components/coupons/CopyCodeButton";



export const metadata: Metadata = {

  title: { default: "Coupons and Vouchers for Cleaning Services" },

  description: generateMetaDescription(

    "Save on professional cleaning in Cape Town with Bokkie coupons and vouchers. Browse active promo codes and purchase credit vouchers for your next booking."

  ),

  keywords: [

    "cleaning service coupons Cape Town",

    "cleaning vouchers Cape Town",

    "Bokkie promo codes",

    "cleaning discount codes Cape Town",

  ],

  alternates: {

    canonical: generateCanonicalUrl("/coupons"),

  },

  openGraph: {

    title: "Coupons and Vouchers | Bokkie Cleaning Services",

    description:

      "Save on professional cleaning in Cape Town. Browse promo codes and purchase vouchers for your next booking.",

    url: generateCanonicalUrl("/coupons"),

    siteName: siteConfig.name,

    images: [getOgImageMetadata("Bokkie Cleaning Services - Coupons and Vouchers")],

    locale: "en_ZA",

    type: "website",

  },

  twitter: {

    card: "summary_large_image",

    title: "Coupons and Vouchers | Bokkie Cleaning Services",

    description:

      "Save on professional cleaning in Cape Town. Browse promo codes and purchase vouchers.",

    images: [getOgImageUrl()],

  },

  robots: indexableRobots,

  other: capeTownGeoMeta,

};



function formatDiscount(code: {

  discountType: "percentage" | "fixed";

  discountValue: number;

}) {

  if (code.discountType === "percentage") {

    return `${code.discountValue}% off`;

  }

  return `R${code.discountValue.toFixed(2)} off`;

}



const howToUseSteps = [

  {

    title: "Book a service",

    description: "Choose your cleaning type, schedule, and cleaner on our booking page.",

  },

  {

    title: "Apply your code",

    description: "Enter a promo code or select a voucher on the review and pay step.",

  },

  {

    title: "Enjoy the savings",

    description: "Your discount is applied before you complete payment.",

  },

];



export default async function CouponsPage() {

  const pageUrl = generateCanonicalUrl("/coupons");

  const [purchasableVouchers, discountCodes] = await Promise.all([

    getPurchasableVouchers(),

    getPublicDiscountCodes(),

  ]);



  const structuredData = {

    "@context": "https://schema.org",

    "@graph": [

      generateBreadcrumbSchema([

        { name: "Home", url: siteConfig.url },

        { name: "Coupons and Vouchers", url: pageUrl },

      ]),

      {

        "@type": "WebPage",

        "@id": `${pageUrl}#webpage`,

        url: pageUrl,

        name: "Coupons and Vouchers for Cleaning Services",

        description:

          "Save on professional cleaning in Cape Town with Bokkie promo codes and purchasable vouchers.",

        inLanguage: "en-ZA",

        isPartOf: { "@id": `${siteConfig.url}#website` },

      },

    ],

  };



  return (

    <>

      <JsonLd data={structuredData} />



      <main className="min-h-screen bg-white">

        <PageHero

          eyebrow="Save on cleaning"

          title="Coupons and vouchers"

          description="Grab a promo code for your next booking or purchase a voucher to use on future cleans. All offers are applied at checkout."

          imageSrc={marketingHeroImages.coupons.src}

          imageAlt={marketingHeroImages.coupons.alt}

          breadcrumbs={[

            { label: "Home", href: "/" },

            { label: "Coupons" },

          ]}

        />



        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12 sm:space-y-16 max-w-4xl">

          <section aria-labelledby="promo-heading">

            <div className="mb-6">

              <h2 id="promo-heading" className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">

                Promo codes

              </h2>

              <p className="text-sm sm:text-base text-gray-600">

                Copy a code below and enter it during checkout when booking any cleaning service.

              </p>

            </div>



            {discountCodes.length === 0 ? (

              <div className="bg-brand-surface border border-gray-200 rounded-xl p-8 text-center">

                <Tag className="w-8 h-8 text-gray-400 mx-auto mb-3" aria-hidden="true" />

                <p className="text-gray-600">No active promo codes right now. Check back soon.</p>

              </div>

            ) : (

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {discountCodes.map((code) => (

                  <article

                    key={code.code}

                    className="bg-white border border-gray-200 rounded-xl p-5 hover:border-brand-primary/30 transition-colors"

                  >

                    <div className="flex items-start justify-between gap-3 mb-3">

                      <div className="flex items-center gap-3 min-w-0">

                        <div className="p-2 rounded-lg bg-brand-surface shrink-0">

                          <Percent className="w-4 h-4 text-brand-primary" aria-hidden="true" />

                        </div>

                        <div className="min-w-0">

                          <p className="text-lg sm:text-xl font-bold text-gray-900 tracking-wide truncate">

                            {code.code}

                          </p>

                          <p className="text-brand-primary font-semibold text-sm">

                            {formatDiscount(code)}

                          </p>

                        </div>

                      </div>

                      <CopyCodeButton code={code.code} />

                    </div>



                    {code.description && (

                      <p className="text-gray-600 text-sm mb-3">{code.description}</p>

                    )}



                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">

                      {code.minimumOrderAmount > 0 && (

                        <span>Min. order: R{code.minimumOrderAmount.toFixed(2)}</span>

                      )}

                      {code.maximumDiscountAmount && (

                        <span>Max. discount: R{code.maximumDiscountAmount.toFixed(2)}</span>

                      )}

                      {code.validUntil && (

                        <span>Expires: {new Date(code.validUntil).toLocaleDateString()}</span>

                      )}

                    </div>

                  </article>

                ))}

              </div>

            )}

          </section>



          <section aria-labelledby="vouchers-heading">

            <div className="mb-6">

              <h2 id="vouchers-heading" className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">

                Purchase vouchers

              </h2>

              <p className="text-sm sm:text-base text-gray-600">

                Buy credit or discount vouchers at a reduced price. Sign in to purchase. Vouchers

                are saved to your account and can be used on future bookings.

              </p>

            </div>

            <PublicPurchasableVouchers vouchers={purchasableVouchers} />

          </section>



          <section

            className="bg-brand-surface border border-gray-200 rounded-xl p-6 sm:p-8"

            aria-labelledby="how-to-heading"

          >

            <div className="flex items-center gap-3 mb-5">

              <Gift className="w-5 h-5 text-brand-primary" aria-hidden="true" />

              <h2 id="how-to-heading" className="text-lg sm:text-xl font-bold text-gray-900">

                How to use your coupon

              </h2>

            </div>

            <ol className="space-y-4">

              {howToUseSteps.map((step, index) => (

                <li key={step.title} className="flex gap-3">

                  <span

                    className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-primary text-white text-sm font-bold shrink-0"

                    aria-hidden="true"

                  >

                    {index + 1}

                  </span>

                  <span className="text-sm sm:text-base text-gray-600">

                    <strong className="text-gray-900">{step.title}.</strong> {step.description}

                  </span>

                </li>

              ))}

            </ol>

            <Link

              href="/booking/service/standard/details"

              className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold rounded-button transition-colors"

            >

              Book a service

              <ArrowRight className="w-4 h-4" aria-hidden="true" />

            </Link>

          </section>

        </div>



        <MarketingCta

          title="Book your next clean and save"

          description="Apply a promo code or voucher at checkout for professional cleaning in Cape Town."

          primaryLabel="Book now"

          primaryHref="/booking/service/standard/details"

          phone={false}

        />

      </main>

      <Footer />

    </>

  );

}

