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
      { id: "linen-change", label: "Linen change" },
      { id: "towel-setup", label: "Towel setup" },
      { id: "restocking-essentials", label: "Restocking essentials" },
      { id: "guest-ready-photo", label: "Guest-ready photo report" },
      { id: "inside-fridge", label: "Inside fridge cleaning" },
      { id: "laundry-assistance", label: "Laundry assistance" },
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
    extras: [
      { id: "stain-treatment", label: "Stain treatment" },
      { id: "pet-odor-treatment", label: "Pet odor treatment" },
      { id: "rug-cleaning", label: "Rug cleaning" },
      { id: "upholstery-cleaning", label: "Upholstery cleaning" },
    ],
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
      { id: "inside-fridge", label: "Inside fridge cleaning" },
      { id: "inside-oven", label: "Inside oven cleaning" },
      { id: "interior-windows", label: "Interior window cleaning" },
      { id: "balcony-patio", label: "Balcony/patio cleaning" },
      { id: "extra-bathroom", label: "Extra bathroom" },
      { id: "extra-bedroom", label: "Extra bedroom" },
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
      { id: "inside-oven", label: "Inside oven cleaning" },
      { id: "inside-fridge", label: "Inside fridge cleaning" },
      { id: "interior-windows", label: "Interior window cleaning" },
      { id: "wall-spot-clean", label: "Wall spot-cleaning" },
      { id: "appliance-cleaning", label: "Appliance cleaning" },
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
    extras: [
      { id: "after-hours", label: "After-hours cleaning" },
      { id: "waste-removal", label: "Waste removal" },
      { id: "consumable-restocking", label: "Consumable restocking" },
      { id: "meeting-room-reset", label: "Meeting room reset" },
    ],
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
      { id: "balcony-patio", label: "Balcony/patio cleaning" },
      { id: "laundry-assistance", label: "Laundry assistance" },
      { id: "dishwashing", label: "Dishwashing" },
      { id: "extra-bathroom", label: "Extra bathroom" },
      { id: "extra-bedroom", label: "Extra bedroom" },
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

/** Services whose optional extras are loaded from additional_services (by legacy service type). */
export const DB_EXTRAS_SERVICES: BookServiceSlug[] = ["deep-cleaning", "moving-cleaning"];

export function usesDbExtras(slug: BookServiceSlug): boolean {
  return DB_EXTRAS_SERVICES.includes(slug);
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
