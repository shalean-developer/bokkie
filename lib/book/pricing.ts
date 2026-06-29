import type { BookFormState, BookPricingSummary, BookServiceSlug } from "./types";
import { BOOK_SERVICES } from "./services";
import {
  type BookPricingConfig,
  FALLBACK_BOOK_PRICING_CONFIG,
  getBasePriceForService,
  getRoomPricingForService,
} from "./pricing-config";

function getBedrooms(details: Record<string, unknown>): number {
  return Number(details.bedrooms ?? details.numberOfRooms ?? 0);
}

function getBathrooms(details: Record<string, unknown>): number {
  return Number(details.bathrooms ?? 1);
}

function formatAreaSizeLabel(size: string): string {
  return size.charAt(0).toUpperCase() + size.slice(1);
}

export function calculateBookPricing(
  state: Partial<BookFormState>,
  config: BookPricingConfig = state.pricingConfig ?? FALLBACK_BOOK_PRICING_CONFIG
): BookPricingSummary {
  const service = state.service ?? "regular-cleaning";
  const bookConfig = state.pricingConfig ?? config;
  const serviceConfig = BOOK_SERVICES[service];
  const details = (state.serviceDetails ?? {}) as Record<string, unknown>;
  const extras = state.selectedExtras ?? [];
  const cleanerCount = state.schedule?.cleanerCount ?? 1;
  const isTeam = serviceConfig.cleanerMode === "team";

  const basePrice = getBasePriceForService(service, bookConfig);
  const roomRates = getRoomPricingForService(service, bookConfig);
  let sizeAdjustment = 0;
  const sizeLineItems: { label: string; amount: number }[] = [];

  if (service === "airbnb-cleaning") {
    sizeAdjustment =
      getBedrooms(details) * roomRates.bedroom + getBathrooms(details) * roomRates.bathroom;
  } else if (service === "carpet-cleaning") {
    const rooms = Number(details.numberOfRooms ?? 1);
    const roomAmount = rooms * bookConfig.carpetPricePerRoom;
    const areaSize = String(details.carpetedAreaSize ?? "small") as "small" | "medium" | "large";
    const areaAmount = bookConfig.carpetAreaAdjustments[areaSize] ?? 0;
    sizeAdjustment = roomAmount + areaAmount;
    if (roomAmount > 0) sizeLineItems.push({ label: `Rooms (${rooms})`, amount: roomAmount });
    if (areaAmount > 0) {
      sizeLineItems.push({
        label: `Carpet area (${formatAreaSizeLabel(areaSize)})`,
        amount: areaAmount,
      });
    }
  } else if (service === "office-cleaning") {
    const size = String(details.officeSize ?? "small") as "small" | "medium" | "large";
    sizeAdjustment = bookConfig.officeSizeAdjustments[size] ?? 0;
    sizeAdjustment += Number(details.workstations ?? 1) * bookConfig.workstationPrice;
    sizeAdjustment += getBathrooms(details) * roomRates.bathroom;
  } else {
    sizeAdjustment =
      getBedrooms(details) * roomRates.bedroom + getBathrooms(details) * roomRates.bathroom;
  }

  const extrasTotal = extras.reduce(
    (sum, id) =>
      sum + (state.extrasPricing?.[id] ?? bookConfig.extrasPricing[id] ?? 50),
    0
  );
  const extraCleanersTotal = isTeam
    ? 0
    : Math.max(0, cleanerCount - 1) * bookConfig.extraCleanerPrice;
  const teamBookingFee = isTeam ? bookConfig.teamBookingFee : 0;

  let recurringDiscount = 0;
  if (state.recurring?.isRecurring && state.recurring.frequency) {
    const rate = bookConfig.frequencyDiscounts[state.recurring.frequency] ?? 0;
    recurringDiscount = Math.round((basePrice + sizeAdjustment) * rate);
  }

  const subtotal = basePrice + sizeAdjustment + extrasTotal + extraCleanersTotal + teamBookingFee;
  const estimatedTotal = Math.max(0, subtotal - recurringDiscount);

  const lineItems: { label: string; amount: number }[] = [
    { label: `${serviceConfig.title} base`, amount: basePrice },
  ];
  if (service === "carpet-cleaning" && sizeLineItems.length > 0) {
    lineItems.push(...sizeLineItems);
  } else if (sizeAdjustment > 0) {
    lineItems.push({ label: "Size adjustment", amount: sizeAdjustment });
  }
  if (extrasTotal > 0) lineItems.push({ label: "Extras", amount: extrasTotal });
  if (extraCleanersTotal > 0) {
    lineItems.push({
      label: `Extra cleaners (${cleanerCount - 1})`,
      amount: extraCleanersTotal,
    });
  }
  if (teamBookingFee > 0) lineItems.push({ label: "Team booking", amount: teamBookingFee });
  if (recurringDiscount > 0) {
    lineItems.push({ label: "Recurring discount", amount: -recurringDiscount });
  }

  const hours = isTeam ? 4 + getBedrooms(details) * 0.5 : 2 + getBedrooms(details) * 0.25;
  const estimatedDuration = `${Math.ceil(hours)}–${Math.ceil(hours + 1)} hours`;

  return {
    basePrice,
    sizeAdjustment,
    extrasTotal,
    extraCleanersTotal,
    teamBookingFee,
    recurringDiscount,
    estimatedTotal,
    estimatedDuration,
    lineItems,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
