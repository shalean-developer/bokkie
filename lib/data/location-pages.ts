import type { ServiceLocation } from "@/lib/supabase/booking-data";

/** Map known DB suburb typos to canonical region names */
const SUBURB_ALIASES: Record<string, string> = {
  "Southern Surburb": "Southern Suburbs",
  "Northen Surburbs": "Northern Suburbs",
  "Eastern Surburbs": "Eastern Suburbs",
};

export const SUBURB_DISPLAY_ORDER = [
  "Atlantic Seaboard",
  "City Bowl",
  "Southern Suburbs",
  "Northern Suburbs",
  "West Coast",
  "South Peninsula",
  "Cape Flats",
  "Eastern Suburbs",
] as const;

export function normalizeSuburb(suburb: string | undefined | null): string {
  if (!suburb?.trim()) return "Other";
  return SUBURB_ALIASES[suburb.trim()] ?? suburb.trim();
}

export function groupLocationsBySuburb(
  locations: ServiceLocation[]
): Record<string, ServiceLocation[]> {
  const grouped = locations.reduce<Record<string, ServiceLocation[]>>((acc, location) => {
    const suburb = normalizeSuburb(location.suburb);
    if (!acc[suburb]) {
      acc[suburb] = [];
    }
    acc[suburb].push(location);
    return acc;
  }, {});

  for (const suburb of Object.keys(grouped)) {
    grouped[suburb].sort((a, b) => a.display_order - b.display_order || a.name.localeCompare(b.name));
  }

  return grouped;
}

export function sortSuburbs(suburbs: string[]): string[] {
  const ordered = SUBURB_DISPLAY_ORDER.filter((suburb) => suburbs.includes(suburb));
  const rest = suburbs
    .filter((suburb) => !SUBURB_DISPLAY_ORDER.includes(suburb as (typeof SUBURB_DISPLAY_ORDER)[number]))
    .sort((a, b) => a.localeCompare(b));
  return [...ordered, ...rest];
}

export function getNearbyLocations(
  locations: ServiceLocation[],
  currentSlug: string,
  limit = 8
): ServiceLocation[] {
  const current = locations.find((loc) => loc.slug === currentSlug);
  if (!current) return [];

  const currentSuburb = normalizeSuburb(current.suburb);

  return locations
    .filter(
      (loc) =>
        loc.slug !== currentSlug &&
        normalizeSuburb(loc.suburb) === currentSuburb &&
        loc.is_active
    )
    .sort((a, b) => a.display_order - b.display_order || a.name.localeCompare(b.name))
    .slice(0, limit);
}
