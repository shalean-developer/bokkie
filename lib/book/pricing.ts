import type { BookFormState, BookPricingSummary, BookServiceSlug } from "./types";
import { BOOK_SERVICES } from "./services";
import { EXTRA_CLEANER_PRICE } from "./constants";

/** Placeholder base prices — easy to update later */
const BASE_PRICES: Record<BookServiceSlug, number> = {
  "airbnb-cleaning": 450,
  "carpet-cleaning": 380,
  "deep-cleaning": 850,
  "moving-cleaning": 950,
  "office-cleaning": 420,
  "regular-cleaning": 320,
};

const EXTRAS_PRICES: Record<string, number> = {
  "inside-fridge": 80,
  "inside-oven": 90,
  "interior-windows": 120,
  "balcony-patio": 100,
  "laundry-assistance": 150,
  dishwashing: 80,
  "extra-bathroom": 60,
  "extra-bedroom": 50,
  "linen-change": 100,
  "towel-setup": 60,
  "restocking-essentials": 80,
  "guest-ready-photo": 50,
  "stain-treatment": 120,
  "pet-odor-treatment": 150,
  "rug-cleaning": 180,
  "upholstery-cleaning": 200,
  "after-hours": 200,
  "waste-removal": 100,
  "consumable-restocking": 80,
  "meeting-room-reset": 120,
  "wall-spot-clean": 150,
  "appliance-cleaning": 100,
};

const RECURRING_DISCOUNTS: Record<string, number> = {
  weekly: 0.15,
  "bi-weekly": 0.1,
  monthly: 0.05,
  custom: 0.12,
};

function getBedrooms(details: Record<string, unknown>): number {
  return Number(details.bedrooms ?? details.numberOfRooms ?? 0);
}

function getBathrooms(details: Record<string, unknown>): number {
  return Number(details.bathrooms ?? 1);
}

export function calculateBookPricing(state: Partial<BookFormState>): BookPricingSummary {
  const service = state.service ?? "regular-cleaning";
  const config = BOOK_SERVICES[service];
  const details = (state.serviceDetails ?? {}) as Record<string, unknown>;
  const extras = state.selectedExtras ?? [];
  const cleanerCount = state.schedule?.cleanerCount ?? 1;
  const isTeam = config.cleanerMode === "team";

  const basePrice = BASE_PRICES[service];
  let sizeAdjustment = 0;

  if (service === "airbnb-cleaning") {
    const units = Number(details.airbnbUnits ?? 1);
    sizeAdjustment = (units - 1) * 120;
    sizeAdjustment += getBedrooms(details) * 40 + getBathrooms(details) * 35;
  } else if (service === "carpet-cleaning") {
    sizeAdjustment = Number(details.numberOfRooms ?? 1) * 90;
  } else if (service === "office-cleaning") {
    const size = String(details.officeSize ?? "small");
    sizeAdjustment = size === "large" ? 200 : size === "medium" ? 100 : 0;
    sizeAdjustment += Number(details.workstations ?? 1) * 15;
  } else {
    sizeAdjustment = getBedrooms(details) * 45 + getBathrooms(details) * 35;
  }

  const extrasTotal = extras.reduce((sum, id) => sum + (EXTRAS_PRICES[id] ?? 50), 0);
  const extraCleanersTotal = isTeam ? 0 : Math.max(0, cleanerCount - 1) * EXTRA_CLEANER_PRICE;
  const teamBookingFee = isTeam ? 150 : 0;

  let recurringDiscount = 0;
  if (state.recurring?.isRecurring && state.recurring.frequency) {
    const rate = RECURRING_DISCOUNTS[state.recurring.frequency] ?? 0;
    recurringDiscount = Math.round((basePrice + sizeAdjustment) * rate);
  }

  const subtotal = basePrice + sizeAdjustment + extrasTotal + extraCleanersTotal + teamBookingFee;
  const estimatedTotal = Math.max(0, subtotal - recurringDiscount);

  const lineItems: { label: string; amount: number }[] = [
    { label: `${config.title} base`, amount: basePrice },
  ];
  if (sizeAdjustment > 0) lineItems.push({ label: "Size adjustment", amount: sizeAdjustment });
  if (extrasTotal > 0) lineItems.push({ label: "Extras", amount: extrasTotal });
  if (extraCleanersTotal > 0) {
    lineItems.push({ label: `Extra cleaners (${cleanerCount - 1})`, amount: extraCleanersTotal });
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
