"use client";

import { formatCurrency } from "@/lib/book/pricing";
import type { BookPricingSummary } from "@/lib/book/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Shield, Clock, Sparkles } from "lucide-react";

interface PriceSummaryCardProps {
  pricing: BookPricingSummary | null;
  serviceTitle: string;
  showTrustBadges?: boolean;
}

export function PriceSummaryCard({ pricing, serviceTitle, showTrustBadges = true }: PriceSummaryCardProps) {
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
        {pricing ? (
          <>
            {pricing.lineItems.map((item) => (
              <div key={item.label} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.label}</span>
                <span className={item.amount < 0 ? "text-green-600" : "text-brand-primary font-medium"}>
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
              Questions? Call or WhatsApp Shalean anytime.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
