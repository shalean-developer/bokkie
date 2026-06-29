"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBookForm } from "../BookFormProvider";
import { PriceSummaryCard } from "../PriceSummaryCard";
import { getServiceConfig, usesTeamSelection } from "@/lib/book/services";
import { formatCurrency } from "@/lib/book/pricing";
import { DEFAULT_TEAMS } from "@/lib/book/constants";
import { getAdditionalServicesForServiceType } from "@/app/actions/booking-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, MapPin, Calendar, Sparkles, Loader2 } from "lucide-react";

interface ExtraOption {
  id: string;
  label: string;
  price: number;
}

export function ReviewStep() {
  const { state, setExtras, updateState, isHydrated } = useBookForm();
  const router = useRouter();
  const config = getServiceConfig(state.service);
  const isTeam = usesTeamSelection(state.service);
  const teamName = DEFAULT_TEAMS.find((t) => t.id === state.schedule.assignedTeamId)?.teamName;
  const [extrasOptions, setExtrasOptions] = useState<ExtraOption[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(true);

  useEffect(() => {
    setLoadingExtras(true);
    getAdditionalServicesForServiceType(config.legacyServiceType)
      .then((services) => {
        if (services.length > 0) {
          const options = services.map((s) => ({
            id: s.service_id,
            label: s.name,
            price: Number(s.price_modifier),
          }));
          setExtrasOptions(options);
          const pricing = Object.fromEntries(options.map((o) => [o.id, o.price]));
          updateState({ extrasPricing: pricing });
          const validIds = new Set(options.map((o) => o.id));
          const filtered = state.selectedExtras.filter((id) => validIds.has(id));
          if (filtered.length !== state.selectedExtras.length) {
            setExtras(filtered);
          }
        } else {
          const options = config.extras.map((e) => ({
            id: e.id,
            label: e.label,
            price: state.pricingConfig?.extrasPricing[e.id] ?? state.extrasPricing?.[e.id] ?? 0,
          }));
          setExtrasOptions(options);
          const pricing = Object.fromEntries(
            options.map((o) => [o.id, o.price]).filter(([, price]) => price > 0)
          );
          if (Object.keys(pricing).length > 0) {
            updateState({ extrasPricing: { ...state.extrasPricing, ...pricing } });
          }
        }
      })
      .finally(() => setLoadingExtras(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.service, config.legacyServiceType, state.pricingConfig]);

  const toggleExtra = (id: string) => {
    const current = state.selectedExtras;
    setExtras(current.includes(id) ? current.filter((e) => e !== id) : [...current, id]);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Booking review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="font-medium text-brand-primary">{config.title}</p>
              <p className="text-gray-500 capitalize">{state.schedule.bookingType.replace("-", " ")} booking</p>
            </div>
            <Separator />
            <div className="flex gap-2">
              <MapPin className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
              <div>
                <p>{state.address.addressLine}</p>
                <p className="text-gray-500">{state.address.suburb}, {state.address.city} {state.address.postalCode}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Calendar className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
              <div>
                <p>{state.schedule.serviceDate} at {state.schedule.serviceTime}</p>
                {state.recurring.isRecurring && state.recurring.frequency && (
                  <p className="text-gray-500 capitalize">
                    Recurring: {state.recurring.frequency}
                    {state.recurring.recurringDays?.length
                      ? ` · ${state.recurring.recurringDays.join(", ")}`
                      : ""}
                  </p>
                )}
              </div>
            </div>
            <p className="text-gray-600">
              {isTeam
                ? `Team: ${teamName ?? "Not selected"}`
                : `Cleaners: ${state.schedule.cleanerCount}`}
            </p>
            {state.pricingSummary && (
              <p className="text-lg font-bold text-brand-primary">
                Estimated total: {formatCurrency(state.pricingSummary.estimatedTotal)}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Final price may depend on property condition or confirmed scope.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-accent" />
              Optional extras
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingExtras ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading extras...
              </div>
            ) : extrasOptions.length === 0 ? (
              <p className="text-sm text-gray-500">No optional extras for this service.</p>
            ) : (
              extrasOptions.map((extra) => (
                <div key={extra.id} className="flex items-center gap-3">
                  <Checkbox
                    id={extra.id}
                    checked={state.selectedExtras.includes(extra.id)}
                    onCheckedChange={() => toggleExtra(extra.id)}
                  />
                  <Label htmlFor={extra.id} className="font-normal cursor-pointer flex-1">
                    {extra.label}
                    {extra.price > 0 && (
                      <span className="text-gray-500 ml-1">(+{formatCurrency(extra.price)})</span>
                    )}
                  </Label>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between gap-4">
          <Button variant="outline" onClick={() => router.push(`/book/${state.service}/schedule`)}>
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <Button size="lg" onClick={() => router.push(`/book/${state.service}/payment`)}>
            Continue to Payment <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="hidden lg:block">
        <PriceSummaryCard pricing={state.pricingSummary} serviceTitle={config.title} isHydrated={isHydrated} />
      </div>
    </div>
  );
}
