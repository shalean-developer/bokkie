"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBookForm } from "../BookFormProvider";
import { PriceSummaryCard } from "../PriceSummaryCard";
import { getServiceConfig, usesTeamSelection } from "@/lib/book/services";
import { formatCurrency } from "@/lib/book/pricing";
import { DEFAULT_TEAMS } from "@/lib/book/constants";
import { getBookExtrasForService } from "@/app/actions/booking-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, MapPin, Calendar, Sparkles, Loader2, Minus, Plus } from "lucide-react";

interface ExtraOption {
  id: string;
  label: string;
  price: number;
}

const MAX_EXTRA_QUANTITY = 99;

export function ReviewStep() {
  const { state, setExtras, setExtraQuantity, updateState, isHydrated } = useBookForm();
  const router = useRouter();
  const config = getServiceConfig(state.service);
  const isTeam = usesTeamSelection(state.service);
  const teamName = DEFAULT_TEAMS.find((t) => t.id === state.schedule.assignedTeamId)?.teamName;
  const [extrasOptions, setExtrasOptions] = useState<ExtraOption[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(true);

  useEffect(() => {
    setLoadingExtras(true);
    getBookExtrasForService(state.service)
      .then((services) => {
        if (services.length > 0) {
          setExtrasOptions(services);
          const pricing = Object.fromEntries(services.map((o) => [o.id, o.price]));
          updateState({ extrasPricing: pricing });
          const validIds = new Set(services.map((o) => o.id));
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
  }, [state.service, state.pricingConfig]);

  const changeQuantity = (id: string, nextQuantity: number) => {
    setExtraQuantity(id, Math.max(0, Math.min(MAX_EXTRA_QUANTITY, nextQuantity)));
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
              extrasOptions.map((extra) => {
                const quantity = state.extraQuantities[extra.id] ?? 0;
                const lineTotal = quantity * extra.price;
                return (
                  <div
                    key={extra.id}
                    className="rounded-lg border p-3 sm:flex sm:items-center sm:justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <Label className="font-medium">{extra.label}</Label>
                      <p className="text-sm text-gray-500">{formatCurrency(extra.price)} each</p>
                      {quantity > 0 && (
                        <p className="text-sm font-medium text-brand-primary mt-1">
                          {quantity} × {formatCurrency(extra.price)} = {formatCurrency(lineTotal)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-3 sm:mt-0" aria-label={`${extra.label} quantity`}>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label={`Remove one ${extra.label}`}
                        disabled={quantity === 0}
                        onClick={() => changeQuantity(extra.id, quantity - 1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <input
                        type="number"
                        min={0}
                        max={MAX_EXTRA_QUANTITY}
                        inputMode="numeric"
                        aria-label={`${extra.label} quantity`}
                        className="w-16 rounded-md border px-2 py-2 text-center"
                        value={quantity}
                        onChange={(event) => changeQuantity(extra.id, Number(event.target.value))}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label={`Add one ${extra.label}`}
                        disabled={quantity >= MAX_EXTRA_QUANTITY}
                        onClick={() => changeQuantity(extra.id, quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
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
