"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  ChevronDown,
  Building2,
  Waves,
  Mountain,
  Home,
  Navigation,
} from "lucide-react";
import type { ServiceLocation } from "@/lib/supabase/booking-data";

interface ServiceAreasClientProps {
  locationsBySuburb: Record<string, ServiceLocation[]>;
  allSuburbs: string[];
  totalLocations: number;
  totalSuburbs: number;
}

const suburbIcons: Record<string, typeof MapPin> = {
  "Atlantic Seaboard": Waves,
  "City Bowl": Building2,
  "Southern Suburbs": Home,
  "Northern Suburbs": Navigation,
  "West Coast": Waves,
  "South Peninsula": Mountain,
  "Cape Flats": Building2,
  "Eastern Suburbs": Navigation,
};

export default function ServiceAreasClient({
  locationsBySuburb,
  allSuburbs,
  totalLocations,
  totalSuburbs,
}: ServiceAreasClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSuburb, setExpandedSuburb] = useState<string | null>(
    allSuburbs[0] ?? null
  );

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return { suburbs: allSuburbs, locationsBySuburb };
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered: Record<string, ServiceLocation[]> = {};
    const matchingSuburbs: string[] = [];

    allSuburbs.forEach((suburb) => {
      const locations = locationsBySuburb[suburb] || [];
      const matchingLocations = locations.filter(
        (location) =>
          location.name.toLowerCase().includes(query) ||
          suburb.toLowerCase().includes(query)
      );

      if (matchingLocations.length > 0 || suburb.toLowerCase().includes(query)) {
        filtered[suburb] = matchingLocations.length > 0 ? matchingLocations : locations;
        matchingSuburbs.push(suburb);
      }
    });

    return { suburbs: matchingSuburbs, locationsBySuburb: filtered };
  }, [searchQuery, allSuburbs, locationsBySuburb]);

  const allLocationsAlphabetical = useMemo(
    () =>
      Object.values(locationsBySuburb)
        .flat()
        .sort((a, b) => a.name.localeCompare(b.name)),
    [locationsBySuburb]
  );

  const filteredAllLocations = useMemo(() => {
    if (!searchQuery.trim()) return allLocationsAlphabetical;
    const query = searchQuery.toLowerCase().trim();
    return allLocationsAlphabetical.filter((location) =>
      location.name.toLowerCase().includes(query)
    );
  }, [searchQuery, allLocationsAlphabetical]);

  return (
    <div className="py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8 text-center">
          <div className="px-5 py-3 bg-brand-surface border border-gray-200 rounded-xl">
            <p className="text-2xl font-bold text-brand-primary">{totalSuburbs}</p>
            <p className="text-xs text-gray-500">Regions</p>
          </div>
          <div className="px-5 py-3 bg-brand-surface border border-gray-200 rounded-xl">
            <p className="text-2xl font-bold text-brand-primary">{totalLocations}</p>
            <p className="text-xs text-gray-500">Locations</p>
          </div>
        </div>

        <div className="relative mb-10">
          <label htmlFor="area-search" className="sr-only">
            Search service areas
          </label>
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="area-search"
            type="search"
            placeholder="Search by suburb or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent"
          />
        </div>

        {searchQuery.trim() && filteredAllLocations.length > 0 && (
          <section className="mb-10" aria-labelledby="search-results-heading">
            <h2 id="search-results-heading" className="text-lg font-bold text-gray-900 mb-4">
              Search results ({filteredAllLocations.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {filteredAllLocations.map((location) => (
                <Link
                  key={location.id}
                  href={`/areas/${location.slug}`}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-700 bg-brand-surface border border-gray-200 rounded-lg hover:border-brand-primary/30 hover:text-brand-primary transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400" aria-hidden="true" />
                  <span className="truncate">{location.name}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section aria-labelledby="browse-suburbs-heading">
          <h2 id="browse-suburbs-heading" className="text-xl sm:text-2xl font-bold text-gray-900 mb-5">
            Browse by region
          </h2>

          {filteredData.suburbs.length === 0 ? (
            <p className="text-center text-gray-600 py-8">
              No locations found. Try a different search term.
            </p>
          ) : (
            <div className="space-y-3">
              {filteredData.suburbs.map((suburb) => {
                const locations = filteredData.locationsBySuburb[suburb] || [];
                const isExpanded = expandedSuburb === suburb;
                const Icon = suburbIcons[suburb] || MapPin;
                const panelId = `suburb-panel-${suburb.replace(/\s+/g, "-").toLowerCase()}`;

                return (
                  <article
                    key={suburb}
                    className="border border-gray-200 rounded-xl overflow-hidden bg-white"
                  >
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      aria-controls={panelId}
                      onClick={() => setExpandedSuburb(isExpanded ? null : suburb)}
                      className="w-full flex items-center justify-between gap-4 px-4 sm:px-5 py-4 text-left hover:bg-brand-surface/60 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-brand-surface shrink-0">
                          <Icon className="w-4 h-4 text-brand-primary" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-gray-900 truncate">{suburb}</h3>
                          <p className="text-xs text-gray-500">
                            {locations.length} {locations.length === 1 ? "location" : "locations"}
                          </p>
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                        aria-hidden="true"
                      />
                    </button>

                    {isExpanded && (
                      <div
                        id={panelId}
                        className="px-4 sm:px-5 pb-4 border-t border-gray-100"
                      >
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-4">
                          {locations.map((location) => (
                            <Link
                              key={location.id}
                              href={`/areas/${location.slug}`}
                              className="flex items-center gap-1.5 px-2.5 py-2 text-sm text-gray-700 rounded-lg hover:bg-brand-surface hover:text-brand-primary transition-colors"
                            >
                              <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400" aria-hidden="true" />
                              <span className="truncate">{location.name}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {!searchQuery.trim() && (
          <section className="mt-12" aria-labelledby="all-locations-heading">
            <h2 id="all-locations-heading" className="text-xl sm:text-2xl font-bold text-gray-900 mb-5">
              All locations A-Z
            </h2>
            <div className="columns-2 sm:columns-3 md:columns-4 gap-x-4">
              {allLocationsAlphabetical.map((location) => (
                <Link
                  key={location.id}
                  href={`/areas/${location.slug}`}
                  className="block text-sm text-gray-600 hover:text-brand-primary py-1.5 break-inside-avoid"
                >
                  {location.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        <p className="mt-10 text-xs text-gray-500 text-center">
          {totalLocations} active locations across {totalSuburbs} regions in Cape Town.
        </p>
      </div>
    </div>
  );
}
