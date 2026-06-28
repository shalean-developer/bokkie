import type { Metadata } from "next";
import {
  generateCanonicalUrl,
  generateMetaDescription,
  indexableRobots,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: { default: "Get Your Free Cleaning Quote" },
  description: generateMetaDescription(
    "Request a free personalized quote for professional cleaning services in Cape Town. Select your service, home details, and additional services."
  ),
  keywords: [
    "cleaning quote Cape Town",
    "free cleaning quote",
    "cleaning services quote",
    "professional cleaning quote",
  ],
  alternates: {
    canonical: generateCanonicalUrl("/booking/quote"),
  },
  robots: indexableRobots,
};

export default function QuoteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
























