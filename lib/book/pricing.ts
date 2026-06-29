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

function pushBreakdownLine(
  items: { label: string; amount: number }[],
  label: string,
  amount: number
) {
  if (amount > 0) items.push({ label, amount });
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
  const sizeBreakdown: { label: string; amount: number }[] = [];

  if (service === "airbnb-cleaning") {
    const bedrooms = getBedrooms(details);
    const bathrooms = getBathrooms(details);
    const bedroomAmount = bedrooms * roomRates.bedroom;
    const bathroomAmount = bathrooms * roomRates.bathroom;
    sizeAdjustment = bedroomAmount + bathroomAmount;
    pushBreakdownLine(sizeBreakdown, `Bedrooms (${bedrooms})`, bedroomAmount);
    pushBreakdownLine(sizeBreakdown, `Bathrooms (${bathrooms})`, bathroomAmount);
  } else if (service === "carpet-cleaning") {
    const rooms = Number(details.numberOfRooms ?? 1);
    const roomAmount = rooms * bookConfig.carpetPricePerRoom;
    const areaSize = String(details.carpetedAreaSize ?? "small") as "small" | "medium" | "large";
    const areaAmount = bookConfig.carpetAreaAdjustments[areaSize] ?? 0;
    sizeAdjustment = roomAmount + areaAmount;
    pushBreakdownLine(sizeBreakdown, `Rooms (${rooms})`, roomAmount);
    pushBreakdownLine(
      sizeBreakdown,
      `Carpet area (${formatAreaSizeLabel(areaSize)})`,
      areaAmount
    );
  } else if (service === "office-cleaning") {
    const size = String(details.officeSize ?? "small") as "small" | "medium" | "large";
    const workstations = Number(details.workstations ?? 1);
    const bathrooms = getBathrooms(details);
    const officeSizeAmount = bookConfig.officeSizeAdjustments[size] ?? 0;
    const workstationAmount = workstations * bookConfig.workstationPrice;
    const bathroomAmount = bathrooms * roomRates.bathroom;
    sizeAdjustment = officeSizeAmount + workstationAmount + bathroomAmount;
    pushBreakdownLine(
      sizeBreakdown,
      `Office size (${formatAreaSizeLabel(size)})`,
      officeSizeAmount
    );
    pushBreakdownLine(sizeBreakdown, `Workstations (${workstations})`, workstationAmount);
    pushBreakdownLine(sizeBreakdown, `Bathrooms (${bathrooms})`, bathroomAmount);
  } else {
    const bedrooms = getBedrooms(details);
    const bathrooms = getBathrooms(details);
    const bedroomAmount = bedrooms * roomRates.bedroom;
    const bathroomAmount = bathrooms * roomRates.bathroom;
    sizeAdjustment = bedroomAmount + bathroomAmount;
    pushBreakdownLine(sizeBreakdown, `Bedrooms (${bedrooms})`, bedroomAmount);
    pushBreakdownLine(sizeBreakdown, `Bathrooms (${bathrooms})`, bathroomAmount);
  }

  const extrasTotal = extras.reduce(
    (sum, id) =>
      sum + (state.extrasPricing?.[id] ?? bookConfig.extrasPricing[id] ?? 50),
    0
  );
  const extraCleanersTotal = isTeam
    ? 0
    : Math.max(0, cleanerCount - 1) * bookConfig.extraCleanerPrice;

  let recurringDiscount = 0;
  if (state.recurring?.isRecurring && state.recurring.frequency) {
    const rate = bookConfig.frequencyDiscounts[state.recurring.frequency] ?? 0;
    recurringDiscount = Math.round((basePrice + sizeAdjustment) * rate);
  }

  const subtotal = basePrice + sizeAdjustment + extrasTotal + extraCleanersTotal;
  const estimatedTotal = Math.max(0, subtotal - recurringDiscount);

  const lineItems: { label: string; amount: number; breakdown?: { label: string; amount: number }[] }[] = [
    { label: `${serviceConfig.title} base`, amount: basePrice },
  ];
  if (sizeAdjustment > 0) {
    lineItems.push({
      label: "Price breakdown",
      amount: sizeAdjustment,
      breakdown: sizeBreakdown.length > 0 ? sizeBreakdown : undefined,
    });
  }
  if (extrasTotal > 0) lineItems.push({ label: "Extras", amount: extrasTotal });
  if (extraCleanersTotal > 0) {
    lineItems.push({
      label: `Extra cleaners (${cleanerCount - 1})`,
      amount: extraCleanersTotal,
    });
  }
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
    teamBookingFee: 0,
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

