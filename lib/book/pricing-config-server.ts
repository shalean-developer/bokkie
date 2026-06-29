import { fetchPricingConfig } from "@/lib/pricing-server";
import { getSystemSettings } from "@/lib/supabase/booking-data";
import { EXTRA_CLEANER_PRICE } from "./constants";
import {
  type BookPricingConfig,
  FALLBACK_BOOK_PRICING_CONFIG,
} from "./pricing-config";

function num(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** Build book-flow pricing config from the same DB tables the admin dashboard manages. */
export async function fetchBookPricingConfig(): Promise<BookPricingConfig> {
  try {
    const [pricingConfig, bookSettings] = await Promise.all([
      fetchPricingConfig(),
      getSystemSettings([
        "extra_cleaner_price",
        "team_booking_fee",
        "book_carpet_price_per_room",
        "book_carpet_area_small",
        "book_carpet_area_medium",
        "book_carpet_area_large",
        "book_office_size_small",
        "book_office_size_medium",
        "book_office_size_large",
        "book_workstation_price",
      ]),
    ]);

    const mergedExtras = {
      ...FALLBACK_BOOK_PRICING_CONFIG.extrasPricing,
      ...pricingConfig.extrasPricing,
    };

    const frequencyDiscounts: Record<string, number> = {
      ...FALLBACK_BOOK_PRICING_CONFIG.frequencyDiscounts,
    };
    for (const [key, rate] of Object.entries(pricingConfig.frequencyDiscounts)) {
      if (key !== "one-time") {
        frequencyDiscounts[key] = rate;
      }
    }

    const carpetPerRoom =
      pricingConfig.carpetCleaningPricing?.pricePerFittedRoom ??
      FALLBACK_BOOK_PRICING_CONFIG.carpetPricePerRoom;

    return {
      basePrices: { ...FALLBACK_BOOK_PRICING_CONFIG.basePrices, ...pricingConfig.basePrices },
      roomPricing: { ...FALLBACK_BOOK_PRICING_CONFIG.roomPricing, ...pricingConfig.roomPricing },
      extrasPricing: mergedExtras,
      frequencyDiscounts,
      extraCleanerPrice: num(bookSettings.extra_cleaner_price, EXTRA_CLEANER_PRICE),
      teamBookingFee: num(bookSettings.team_booking_fee, FALLBACK_BOOK_PRICING_CONFIG.teamBookingFee),
      carpetPricePerRoom: num(bookSettings.book_carpet_price_per_room, carpetPerRoom),
      carpetAreaAdjustments: {
        small: num(bookSettings.book_carpet_area_small, 0),
        medium: num(bookSettings.book_carpet_area_medium, 100),
        large: num(bookSettings.book_carpet_area_large, 200),
      },
      officeSizeAdjustments: {
        small: num(bookSettings.book_office_size_small, 0),
        medium: num(bookSettings.book_office_size_medium, 100),
        large: num(bookSettings.book_office_size_large, 200),
      },
      workstationPrice: num(
        bookSettings.book_workstation_price,
        FALLBACK_BOOK_PRICING_CONFIG.workstationPrice
      ),
    };
  } catch (error) {
    console.error("Error fetching book pricing config, using fallback:", error);
    return FALLBACK_BOOK_PRICING_CONFIG;
  }
}
