import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Gift, Percent, Tag } from "lucide-react";
import Footer from "@/components/Footer";
import { generateCanonicalUrl, generateMetaDescription, getOgImageMetadata, getOgImageUrl, indexableRobots } from "@/lib/seo";
import { getPurchasableVouchers } from "@/app/actions/vouchers";
import { getPublicDiscountCodes } from "@/app/actions/discount";
import PublicPurchasableVouchers from "@/components/coupons/PublicPurchasableVouchers";
import CopyCodeButton from "@/components/coupons/CopyCodeButton";

export const metadata: Metadata = {
  title: { default: "Coupons & Vouchers" },
  description: generateMetaDescription(
    "Save on professional cleaning in Cape Town with Bokkie coupons and vouchers. Browse active promo codes and purchase credit vouchers for your next booking."
  ),
  alternates: {
    canonical: generateCanonicalUrl("/coupons"),
  },
  openGraph: {
    title: "Coupons & Vouchers | Bokkie Cleaning Services",
    description:
      "Save on professional cleaning in Cape Town. Browse promo codes and purchase vouchers for your next booking.",
    url: generateCanonicalUrl("/coupons"),
    siteName: "Bokkie Cleaning Services",
    images: [getOgImageMetadata("Bokkie Cleaning Services - Coupons and Vouchers")],
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Coupons & Vouchers | Bokkie Cleaning Services",
    description:
      "Save on professional cleaning in Cape Town. Browse promo codes and purchase vouchers for your next booking.",
    images: [getOgImageUrl()],
  },
  robots: indexableRobots,
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

export default async function CouponsPage() {
  const [purchasableVouchers, discountCodes] = await Promise.all([
    getPurchasableVouchers(),
    getPublicDiscountCodes(),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-[#0a1628] text-white py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <p className="flex items-center gap-2 text-brand-primary text-sm font-semibold tracking-wide uppercase mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
            Save on cleaning
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
            Coupons &amp; Vouchers
          </h1>
          <p className="text-lg text-white/75 max-w-2xl">
            Grab a promo code for your next booking or purchase a voucher to use on future cleans.
            All offers are applied at checkout when you book a service.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-12 sm:py-16 space-y-16">
        {/* Promo codes */}
        <section>
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Promo codes</h2>
            <p className="text-gray-600 max-w-2xl">
              Copy a code below and enter it during checkout when booking any cleaning service.
            </p>
          </div>

          {discountCodes.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
              <Tag className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No active promo codes right now. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {discountCodes.map((code) => (
                <div
                  key={code.code}
                  className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-brand-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-brand-primary/10">
                        <Percent className="w-5 h-5 text-brand-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 tracking-wide">
                          {code.code}
                        </p>
                        <p className="text-brand-primary font-semibold">
                          {formatDiscount(code)}
                        </p>
                      </div>
                    </div>
                    <CopyCodeButton code={code.code} />
                  </div>

                  {code.description && (
                    <p className="text-gray-600 text-sm mb-3">{code.description}</p>
                  )}

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                    {code.minimumOrderAmount > 0 && (
                      <span>Min. order: R{code.minimumOrderAmount.toFixed(2)}</span>
                    )}
                    {code.maximumDiscountAmount && (
                      <span>Max. discount: R{code.maximumDiscountAmount.toFixed(2)}</span>
                    )}
                    {code.validUntil && (
                      <span>
                        Expires: {new Date(code.validUntil).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Purchasable vouchers */}
        <section>
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Purchase vouchers
            </h2>
            <p className="text-gray-600 max-w-2xl">
              Buy credit or discount vouchers at a reduced price. Sign in to purchase — vouchers
              are saved to your account and can be used on future bookings.
            </p>
          </div>
          <PublicPurchasableVouchers vouchers={purchasableVouchers} />
        </section>

        {/* How to use */}
        <section className="bg-gray-50 border border-gray-200 rounded-3xl p-8 sm:p-10">
          <div className="flex items-center gap-3 mb-6">
            <Gift className="w-6 h-6 text-brand-primary" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">How to use your coupon</h2>
          </div>
          <ol className="space-y-4 text-gray-600">
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-primary text-white text-sm font-bold shrink-0">
                1
              </span>
              <span>
                <strong className="text-gray-900">Book a service</strong> — choose your cleaning
                type, schedule, and cleaner.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-primary text-white text-sm font-bold shrink-0">
                2
              </span>
              <span>
                <strong className="text-gray-900">Apply your code</strong> — enter a promo code or
                select a voucher on the review &amp; pay step.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-primary text-white text-sm font-bold shrink-0">
                3
              </span>
              <span>
                <strong className="text-gray-900">Enjoy the savings</strong> — your discount is
                applied before you complete payment.
              </span>
            </li>
          </ol>
          <Link
            href="/booking/service/standard/details"
            className="inline-flex items-center gap-3 mt-8 bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold rounded-2xl pl-6 pr-1.5 py-1.5 transition-colors"
          >
            Book a service
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-white shrink-0">
              <ArrowRight className="w-5 h-5 text-brand-primary" strokeWidth={2.5} />
            </span>
          </Link>
        </section>
      </div>

      <Footer />
    </div>
  );
}
