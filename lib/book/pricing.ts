import type { BookFormState, BookPricingSummary } from "./types";
import { BOOK_SERVICES } from "./services";
import {
  type BookPricingConfig,
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

function getExtraQuantity(state: Partial<BookFormState>, id: string): number {
  const raw = Number(state.extraQuantities?.[id] ?? 1);
  if (!Number.isFinite(raw) || raw <= 0) return 1;
  return Math.max(1, Math.floor(raw));
}

function requireConfiguredNumber(value: unknown, label: string): number {
  const parsed = Number(value);
  if (value === null || value === undefined || value === "" || !Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`Missing database pricing value: ${label}`);
  }
  return parsed;
}

export function calculateBookPricing(
  state: Partial<BookFormState>,
  config?: BookPricingConfig
): BookPricingSummary {
  const bookConfig = config ?? state.pricingConfig;
  if (!bookConfig) {
    throw new Error("Live database pricing is unavailable");
  }

  const service = state.service ?? "regular-cleaning";
  const serviceConfig = BOOK_SERVICES[service];
  const details = (state.serviceDetails ?? {}) as Record<string, unknown>;
  const extras = state.selectedExtras ?? [];
  const cleanerCount = state.schedule?.cleanerCount ?? 1;
  const isTeam = serviceConfig.cleanerMode === "team";

  const basePrice = getBasePriceForService(service, bookConfig);
  let sizeAdjustment = 0;
  const sizeBreakdown: { label: string; amount: number }[] = [];

  if (service === "airbnb-cleaning") {
    const roomRates = getRoomPricingForService(service, bookConfig);
    const bedrooms = getBedrooms(details);
    const bathrooms = getBathrooms(details);
    const bedroomAmount = bedrooms * roomRates.bedroom;
    const bathroomAmount = bathrooms * roomRates.bathroom;
    sizeAdjustment = bedroomAmount + bathroomAmount;
    pushBreakdownLine(sizeBreakdown, `Bedrooms (${bedrooms})`, bedroomAmount);
    pushBreakdownLine(sizeBreakdown, `Bathrooms (${bathrooms})`, bathroomAmount);
  } else if (service === "carpet-cleaning") {
    const rooms = Number(details.numberOfRooms ?? 1);
    const roomPrice = requireConfiguredNumber(bookConfig.carpetPricePerRoom, "carpetPricePerRoom");
    const roomAmount = rooms * roomPrice;
    const areaSize = String(details.carpetedAreaSize ?? "small") as "small" | "medium" | "large";
    const areaAmount = requireConfiguredNumber(
      bookConfig.carpetAreaAdjustments[areaSize],
      `carpetAreaAdjustments.${areaSize}`
    );
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
    const officeSizeAmount = requireConfiguredNumber(
      bookConfig.officeSizeAdjustments[size],
      `officeSizeAdjustments.${size}`
    );
    const workstationPrice = requireConfiguredNumber(bookConfig.workstationPrice, "workstationPrice");
    const workstationAmount = workstations * workstationPrice;
    const bathroomRate = requireConfiguredNumber(
      bookConfig.roomPricing[serviceConfig.legacyServiceType]?.bathroom,
      `roomPricing.${serviceConfig.legacyServiceType}.bathroom`
    );
    const bathroomAmount = bathrooms * bathroomRate;
    sizeAdjustment = officeSizeAmount + workstationAmount + bathroomAmount;
    pushBreakdownLine(
      sizeBreakdown,
      `Office size (${formatAreaSizeLabel(size)})`,
      officeSizeAmount
    );
    pushBreakdownLine(sizeBreakdown, `Workstations (${workstations})`, workstationAmount);
    pushBreakdownLine(sizeBreakdown, `Bathrooms (${bathrooms})`, bathroomAmount);
  } else {
    const roomRates = getRoomPricingForService(service, bookConfig);
    const bedrooms = getBedrooms(details);
    const bathrooms = getBathrooms(details);
    const bedroomAmount = bedrooms * roomRates.bedroom;
    const bathroomAmount = bathrooms * roomRates.bathroom;
    sizeAdjustment = bedroomAmount + bathroomAmount;
    pushBreakdownLine(sizeBreakdown, `Bedrooms (${bedrooms})`, bedroomAmount);
    pushBreakdownLine(sizeBreakdown, `Bathrooms (${bathrooms})`, bathroomAmount);
  }

  const extrasBreakdown = extras.map((id) => {
    const configuredPrice = state.extrasPricing?.[id] ?? bookConfig.extrasPricing[id];
    const unitPrice = requireConfiguredNumber(configuredPrice, `extras.${id}`);
    const quantity = getExtraQuantity(state, id);
    return {
      label: quantity > 1 ? `${id} (${quantity} × ${formatCurrency(unitPrice)})` : id,
      amount: unitPrice * quantity,
    };
  });
  const extrasTotal = extrasBreakdown.reduce((sum, item) => sum + item.amount, 0);
  const extraCleanersTotal = isTeam
    ? 0
    : Math.max(0, cleanerCount - 1) *
      requireConfiguredNumber(bookConfig.extraCleanerPrice, "extraCleanerPrice");

  let recurringDiscount = 0;
  if (state.recurring?.isRecurring && state.recurring.frequency) {
    const rate = requireConfiguredNumber(
      bookConfig.frequencyDiscounts[state.recurring.frequency],
      `frequencyDiscounts.${state.recurring.frequency}`
    );
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
  if (extrasTotal > 0) {
    lineItems.push({
      label: "Extras",
      amount: extrasTotal,
      breakdown: extrasBreakdown,
    });
  }
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
