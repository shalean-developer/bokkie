import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { generateCanonicalUrl, generateMetaDescription, noIndexRobots } from "@/lib/seo";

const BookingLayoutHeader = dynamic(
  () => import("@/components/booking/BookingLayoutHeader").then((mod) => mod.default || mod),
  { ssr: true }
);

export const metadata: Metadata = {
  title: { default: "Book Cleaning Service" },
  description: generateMetaDescription(
    "Book professional cleaning services in Cape Town. Select your service, schedule, and complete your booking with Bokkie Cleaning Services."
  ),
  alternates: {
    canonical: generateCanonicalUrl("/booking/service"),
  },
  robots: noIndexRobots,
};

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <BookingLayoutHeader />

      {/* Main Content */}
      {children}
    </div>
  );
}
