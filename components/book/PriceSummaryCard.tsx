"use client";

import * as Popover from "@radix-ui/react-popover";
import { formatCurrency } from "@/lib/book/pricing";
import type { BookPricingLineItem, BookPricingSummary } from "@/lib/book/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Shield, Clock, Sparkles, Info } from "lucide-react";

interface PriceSummaryCardProps {
  pricing: BookPricingSummary | null;
  serviceTitle: string;
  showTrustBadges?: boolean;
  isHydrated?: boolean;
}

function PriceBreakdownInfo({ breakdown }: { breakdown: BookPricingLineItem["breakdown"] }) {
  if (!breakdown?.length) return null;

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="inline-flex shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent rounded-full"
          aria-label="View price breakdown details"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="z-50 w-60 rounded-lg border border-gray-200 bg-white p-3 shadow-md animate-in fade-in-0 zoom-in-95"
          sideOffset={6}
          align="start"
        >
          <p className="text-xs font-medium text-gray-700 mb-2">Based on your property</p>
          <ul className="space-y-1.5">
            {breakdown.map((row) => (
              <li key={row.label} className="flex justify-between gap-3 text-xs text-gray-600">
                <span>{row.label}</span>
                <span className="font-medium text-brand-primary shrink-0">
                  {formatCurrency(row.amount)}
                </span>
              </li>
            ))}
          </ul>
          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export function PriceSummaryCard({
  pricing,
  serviceTitle,
  showTrustBadges = true,
  isHydrated = true,
}: PriceSummaryCardProps) {
  const showPricing = isHydrated && pricing;
  return (
    <Card className="sticky top-24">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-accent" />
          Price Summary
        </CardTitle>
        <Badge variant="secondary">{serviceTitle}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {showPricing && pricing ? (
          <>
            {pricing.lineItems.map((item) => (
              <div key={item.label} className="flex justify-between text-sm gap-2">
                <span className="text-gray-600 flex items-center gap-1 min-w-0">
                  <span className="truncate">{item.label}</span>
                  <PriceBreakdownInfo breakdown={item.breakdown} />
                </span>
                <span className={item.amount < 0 ? "text-green-600 shrink-0" : "text-brand-primary font-medium shrink-0"}>
                  {item.amount < 0 ? "−" : ""}
                  {formatCurrency(Math.abs(item.amount))}
                </span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between items-center">
              <span className="font-semibold text-brand-primary">Estimated total</span>
              <span className="text-xl font-bold text-brand-primary">
                {formatCurrency(pricing.estimatedTotal)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              Est. duration: {pricing.estimatedDuration}
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Final price may depend on property condition or confirmed scope on arrival.
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-500">Complete the form to see your estimate.</p>
        )}
        {showTrustBadges && (
          <div className="pt-2 space-y-2 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Shield className="w-3.5 h-3.5 text-brand-accent" />
              Secure booking · Trusted cleaners
            </div>
            <p className="text-xs text-gray-500">
              Questions? Call or WhatsApp Bokkie anytime.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
