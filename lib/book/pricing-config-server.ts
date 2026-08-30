import {
  getAdditionalServices,
  getFrequencyOptions,
  getRoomPricing,
  getServiceTypePricing,
  getSystemSettings,
} from "@/lib/supabase/booking-data";
import { BOOK_SERVICES } from "./services";
import type { BookPricingConfig } from "./pricing-config";

const BOOK_SETTING_KEYS = [
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
] as const;

const REQUIRED_SERVICE_TYPES = Array.from(
  new Set(Object.values(BOOK_SERVICES).map((service) => service.legacyServiceType))
);

function requireNumber(value: unknown, label: string): number {
  if (value === null || value === undefined || value === "") {
    throw new Error(`Missing required pricing value: ${label}`);
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`Invalid required pricing value: ${label}`);
  }
  return parsed;
}

/**
 * Build the booking-flow pricing configuration exclusively from database-backed
 * pricing sources. Missing or invalid required values are fatal by design.
 */
export async function fetchBookPricingConfig(): Promise<BookPricingConfig> {
  const [serviceTypePricing, roomPricingRows, additionalServices, frequencyOptions, bookSettings] =
    await Promise.all([
      getServiceTypePricing(),
      getRoomPricing(),
      getAdditionalServices(),
      getFrequencyOptions(),
      getSystemSettings([...BOOK_SETTING_KEYS]),
    ]);

  const basePrices: Record<string, number> = {};
  for (const serviceType of REQUIRED_SERVICE_TYPES) {
    const row = serviceTypePricing.find((item) => item.service_type === serviceType);
    basePrices[serviceType] = requireNumber(
      row?.base_price,
      `service_type_pricing.${serviceType}.base_price`
    );
  }

  const roomPricing: Record<string, { bedroom: number; bathroom: number }> = {};
  for (const serviceType of REQUIRED_SERVICE_TYPES) {
    const bedroom = roomPricingRows.find(
      (item) => item.service_type === serviceType && item.room_type === "bedroom"
    );
    const bathroom = roomPricingRows.find(
      (item) => item.service_type === serviceType && item.room_type === "bathroom"
    );
    roomPricing[serviceType] = {
      bedroom: requireNumber(
        bedroom?.price_per_room,
        `room_pricing.${serviceType}.bedroom`
      ),
      bathroom: requireNumber(
        bathroom?.price_per_room,
        `room_pricing.${serviceType}.bathroom`
      ),
    };
  }

  const extrasPricing: Record<string, number> = {};
  for (const service of additionalServices) {
    extrasPricing[service.service_id] = requireNumber(
      service.price_modifier,
      `additional_services.${service.service_id}.price_modifier`
    );
  }

  const frequencyDiscounts: Record<string, number> = {};
  for (const option of frequencyOptions) {
    frequencyDiscounts[option.frequency_id] =
      requireNumber(
        option.discount_percentage,
        `frequency_options.${option.frequency_id}.discount_percentage`
      ) / 100;
  }

  return {
    basePrices,
    roomPricing,
    extrasPricing,
    frequencyDiscounts,
    extraCleanerPrice: requireNumber(
      bookSettings.extra_cleaner_price,
      "system_settings.extra_cleaner_price"
    ),
    teamBookingFee: requireNumber(
      bookSettings.team_booking_fee,
      "system_settings.team_booking_fee"
    ),
    carpetPricePerRoom: requireNumber(
      bookSettings.book_carpet_price_per_room,
      "system_settings.book_carpet_price_per_room"
    ),
    carpetAreaAdjustments: {
      small: requireNumber(
        bookSettings.book_carpet_area_small,
        "system_settings.book_carpet_area_small"
      ),
      medium: requireNumber(
        bookSettings.book_carpet_area_medium,
        "system_settings.book_carpet_area_medium"
      ),
      large: requireNumber(
        bookSettings.book_carpet_area_large,
        "system_settings.book_carpet_area_large"
      ),
    },
    officeSizeAdjustments: {
      small: requireNumber(
        bookSettings.book_office_size_small,
        "system_settings.book_office_size_small"
      ),
      medium: requireNumber(
        bookSettings.book_office_size_medium,
        "system_settings.book_office_size_medium"
      ),
      large: requireNumber(
        bookSettings.book_office_size_large,
        "system_settings.book_office_size_large"
      ),
    },
    workstationPrice: requireNumber(
      bookSettings.book_workstation_price,
      "system_settings.book_workstation_price"
    ),
  };
}
