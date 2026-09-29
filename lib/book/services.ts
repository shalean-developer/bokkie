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

export function isBookServiceSlug(value: string): value is BookServiceSlug {
  return value in BOOK_SERVICES;
}

export function getServiceConfig(slug: BookServiceSlug) {
  return BOOK_SERVICES[slug];
}

export function usesTeamSelection(slug: BookServiceSlug): boolean {
  return BOOK_SERVICES[slug].cleanerMode === "team";
}
