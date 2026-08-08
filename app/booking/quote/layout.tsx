import type { Metadata } from "next";
import {
  generateCanonicalUrl,
  generateMetaDescription,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: { default: "Get Your Free Cleaning Quote" },
  description: generateMetaDescription(
    "Request a free personalized quote for professional cleaning services in Cape Town. Select your service, home details, and additional services."
  ),
  alternates: {
    canonical: generateCanonicalUrl("/booking/quote"),
  },
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
};

export default function QuoteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
