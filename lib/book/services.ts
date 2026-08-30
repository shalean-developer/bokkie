import type { BookServiceSlug, CleanerMode } from "./types";
import {
  Building2,
  Home,
  Layers,
  Sparkles,
  Truck,
  Briefcase,
  type LucideIcon,
} from "lucide-react";

export interface BookServiceConfig {
  slug: BookServiceSlug;
  title: string;
  shortTitle: string;
  description: string;
  icon: LucideIcon;
  legacyServiceType: string;
  cleanerMode: CleanerMode;
  defaultCity: string;
  /**
   * Allow-list of additional_services.service_id values for this Book v2 service.
   * Labels/prices remain database authoritative.
   */
  extras: { id: string; label: string }[];
}

export const BOOK_SERVICES: Record<BookServiceSlug, BookServiceConfig> = {
  "airbnb-cleaning": {
    slug: "airbnb-cleaning",
    title: "Airbnb Cleaning",
    shortTitle: "Airbnb",
    description: "Fast turnover cleaning between guest stays.",
    icon: Home,
    legacyServiceType: "airbnb",
    cleanerMode: "individual_cleaners",
    defaultCity: "Cape Town",
    extras: [
      { id: "inside-fridge", label: "Inside fridge cleaning" },
      { id: "laundry", label: "Laundry and Ironing" },
    ],
  },
  "carpet-cleaning": {
    slug: "carpet-cleaning",
    title: "Carpet Cleaning",
    shortTitle: "Carpet",
    description: "Professional carpet and rug deep cleaning.",
    icon: Layers,
    legacyServiceType: "carpet-cleaning",
    cleanerMode: "individual_cleaners",
    defaultCity: "Cape Town",
    extras: [],
  },
  "deep-cleaning": {
    slug: "deep-cleaning",
    title: "Deep Cleaning",
    shortTitle: "Deep",
    description: "Thorough top-to-bottom home deep clean.",
    icon: Sparkles,
    legacyServiceType: "deep",
    cleanerMode: "team",
    defaultCity: "Cape Town",
    extras: [
      { id: "balcony-cleaning", label: "Balcony cleaning" },
      { id: "carpet-cleaning", label: "Carpet cleaning" },
      { id: "ceiling-cleaning", label: "Ceiling cleaning" },
      { id: "garage-cleaning", label: "Garage cleaning" },
      { id: "mattress-cleaning", label: "Mattress cleaning" },
      { id: "exterior-windows", label: "Exterior windows" },
    ],
  },
  "moving-cleaning": {
    slug: "moving-cleaning",
    title: "Moving Cleaning",
    shortTitle: "Moving",
    description: "Move-in or move-out comprehensive cleaning.",
    icon: Truck,
    legacyServiceType: "move-in-out",
    cleanerMode: "team",
    defaultCity: "Cape Town",
    extras: [
      { id: "balcony-cleaning", label: "Balcony cleaning" },
      { id: "carpet-cleaning", label: "Carpet cleaning" },
      { id: "ceiling-cleaning", label: "Ceiling cleaning" },
      { id: "garage-cleaning", label: "Garage cleaning" },
      { id: "mattress-cleaning", label: "Mattress cleaning" },
      { id: "exterior-windows", label: "Exterior windows" },
    ],
  },
  "office-cleaning": {
    slug: "office-cleaning",
    title: "Office Cleaning",
    shortTitle: "Office",
    description: "Professional workspace and office cleaning.",
    icon: Briefcase,
    legacyServiceType: "office",
    cleanerMode: "individual_cleaners",
    defaultCity: "Cape Town",
    extras: [],
  },
  "regular-cleaning": {
    slug: "regular-cleaning",
    title: "Regular Cleaning",
    shortTitle: "Regular",
    description: "Reliable home maintenance cleaning.",
    icon: Building2,
    legacyServiceType: "standard",
    cleanerMode: "individual_cleaners",
    defaultCity: "Cape Town",
    extras: [
      { id: "inside-fridge", label: "Inside fridge cleaning" },
      { id: "inside-oven", label: "Inside oven cleaning" },
      { id: "interior-windows", label: "Interior window cleaning" },
      { id: "inside-cabinets", label: "Inside Cabinets" },
      { id: "interior-walls", label: "Interior Walls" },
      { id: "laundry", label: "Laundry and Ironing" },
    ],
  },
};

/** Display order on /book landing: Regular → Deep → Move → Office → Airbnb → Carpets */
export const BOOK_SERVICE_SLUGS: BookServiceSlug[] = [
  "regular-cleaning",
  "deep-cleaning",
  "moving-cleaning",
  "office-cleaning",
  "airbnb-cleaning",
  "carpet-cleaning",
];

/**
 * Compatibility helper for the authoritative save path.
 * Book v2 no longer routes any service to a separate pricing_extras table;
 * all extras pricing comes from additional_services through BookPricingConfig.
 */
export function usesDbExtras(_slug: BookServiceSlug): boolean {
  return false;
}

export function isBookServiceSlug(value: string): value is BookServiceSlug {
  return value in BOOK_SERVICES;
}

export function getServiceConfig(slug: BookServiceSlug) {
  return BOOK_SERVICES[slug];
}

export function usesTeamSelection(slug: BookServiceSlug): boolean {
  return BOOK_SERVICES[slug].cleanerMode === "team";
}
