import { Metadata } from "next";
import Link from "next/link";
import { BOOK_SERVICES, BOOK_SERVICE_SLUGS } from "@/lib/book/services";
import { getBasePriceForService } from "@/lib/book/pricing-config";
import { fetchBookPricingConfig } from "@/lib/book/pricing-config-server";
import { formatCurrency } from "@/lib/book/pricing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Book a Cleaning Service | Bokkie Cleaning",
  description: "Choose your cleaning service and book in 4 easy steps.",
};

export const dynamic = "force-dynamic";

export default async function BookLandingPage() {
  const pricingConfig = await fetchBookPricingConfig();

  return (
    <div className="min-h-screen bg-brand-surface">
      <header className="border-b border-gray-100 bg-white">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <Link href="/" className="text-sm text-gray-500 hover:text-brand-primary">
            ← Back to home
          </Link>
          <h1 className="text-3xl font-bold text-brand-primary mt-4">Book a cleaning service</h1>
          <p className="text-gray-600 mt-2">
            Select your service to start — Details, Schedule, Review, and Payment in four simple steps.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="grid gap-4 sm:grid-cols-2">
          {BOOK_SERVICE_SLUGS.map((slug) => {
            const config = BOOK_SERVICES[slug];
            const Icon = config.icon;
            const fromPrice = getBasePriceForService(slug, pricingConfig);

            return (
              <Card key={slug} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="w-10 h-10 rounded-xl bg-brand-surface flex items-center justify-center mb-2">
                    <Icon className="w-5 h-5 text-brand-accent" />
                  </div>
                  <CardTitle className="text-lg">{config.title}</CardTitle>
                  <CardDescription>{config.description}</CardDescription>
                  <p className="text-sm font-semibold text-brand-primary pt-1">
                    From {formatCurrency(fromPrice)}
                  </p>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href={`/book/${slug}`}>
                      Book {config.shortTitle}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
