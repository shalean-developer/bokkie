import type { BookServiceSlug } from "./types";
import { BOOK_SERVICES } from "./services";
import { EXTRA_CLEANER_PRICE } from "./constants";

export interface BookPricingConfig {
  /** Base price keyed by legacy service type (standard, deep, etc.) */
  basePrices: Record<string, number>;
  roomPricing: Record<string, { bedroom: number; bathroom: number }>;
  extrasPricing: Record<string, number>;
  frequencyDiscounts: Record<string, number>;
  extraCleanerPrice: number;
  teamBookingFee: number;
  carpetPricePerRoom: number;
  carpetAreaAdjustments: { small: number; medium: number; large: number };
  officeSizeAdjustments: { small: number; medium: number; large: number };
  workstationPrice: number;
}

const FALLBACK_BASE: Record<BookServiceSlug, number> = {
  "regular-cleaning": 320,
  "deep-cleaning": 850,
  "moving-cleaning": 950,
  "airbnb-cleaning": 450,
  "office-cleaning": 420,
  "carpet-cleaning": 380,
};

const FALLBACK_EXTRAS: Record<string, number> = {
  "inside-fridge": 80,
  "inside-oven": 90,
  "inside-cabinets": 75,
  "interior-windows": 120,
  "interior-walls": 100,
  "balcony-patio": 100,
  "laundry-assistance": 150,
  dishwashing: 80,
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

export const FALLBACK_BOOK_PRICING_CONFIG: BookPricingConfig = {
  basePrices: Object.fromEntries(
    Object.entries(BOOK_SERVICES).map(([slug, cfg]) => [
      cfg.legacyServiceType,
      FALLBACK_BASE[slug as BookServiceSlug],
    ])
  ),
  roomPricing: {
    standard: { bedroom: 45, bathroom: 35 },
    deep: { bedroom: 45, bathroom: 35 },
    "move-in-out": { bedroom: 45, bathroom: 35 },
    airbnb: { bedroom: 40, bathroom: 35 },
    office: { bedroom: 0, bathroom: 35 },
    "carpet-cleaning": { bedroom: 90, bathroom: 0 },
  },
  extrasPricing: { ...FALLBACK_EXTRAS },
  frequencyDiscounts: {
    weekly: 0.15,
    "bi-weekly": 0.1,
    monthly: 0.05,
    custom: 0.12,
  },
  extraCleanerPrice: EXTRA_CLEANER_PRICE,
  teamBookingFee: 150,
  carpetPricePerRoom: 90,
  carpetAreaAdjustments: { small: 0, medium: 100, large: 200 },
  officeSizeAdjustments: { small: 0, medium: 100, large: 200 },
  workstationPrice: 15,
};

export function getBasePriceForService(
  service: BookServiceSlug,
  config: BookPricingConfig
): number {
  const legacyType = BOOK_SERVICES[service].legacyServiceType;
  return config.basePrices[legacyType] ?? FALLBACK_BASE[service];
}

export function getRoomPricingForService(
  service: BookServiceSlug,
  config: BookPricingConfig
): { bedroom: number; bathroom: number } {
  const legacyType = BOOK_SERVICES[service].legacyServiceType;
  return (
    config.roomPricing[legacyType] ?? {
      bedroom: 45,
      bathroom: 35,
    }
  );
}
