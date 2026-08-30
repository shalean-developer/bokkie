"use server";

import {
  getTimeSlots as getTimeSlotsServer,
  getAdditionalServices as getAdditionalServicesServer,
  getAdditionalServicesForServiceType as getAdditionalServicesForServiceTypeServer,
  getServiceLocations as getServiceLocationsServer,
  getCleaners as getCleanersServer,
  getFrequencyOptions as getFrequencyOptionsServer,
  getTeams as getTeamsServer,
  getTeamMembers as getTeamMembersServer,
  checkTeamAvailability as checkTeamAvailabilityServer,
  getSystemSetting as getSystemSettingServer,
  getServiceTypePricing as getServiceTypePricingServer,
  TimeSlot,
  AdditionalService,
  ServiceLocation,
  Cleaner,
  FrequencyOption,
  Team,
  TeamMember,
  ServiceTypePricing,
} from "@/lib/supabase/booking-data";
import { getServiceConfig } from "@/lib/book/services";
import type { BookServiceSlug } from "@/lib/book/types";

/**
 * Server actions for booking data
 * Use these in Client Components instead of importing directly from booking-data.ts
 */

export async function getTimeSlots(): Promise<TimeSlot[]> {
  return await getTimeSlotsServer();
}

export async function getAdditionalServices(): Promise<AdditionalService[]> {
  return await getAdditionalServicesServer();
}

export async function getAdditionalServicesForServiceType(
  serviceType: string
): Promise<AdditionalService[]> {
  return await getAdditionalServicesForServiceTypeServer(serviceType);
}

export interface BookExtraOption {
  id: string;
  label: string;
  price: number;
}

/**
 * Load Book v2 extras exclusively from additional_services.
 * Static service definitions only constrain which IDs belong to each booking service;
 * the database supplies the live label, applicability and price.
 */
export async function getBookExtrasForService(
  service: BookServiceSlug
): Promise<BookExtraOption[]> {
  const config = getServiceConfig(service);
  const allowedIds = new Set(config.extras.map((extra) => extra.id));
  const additionalServices = await getAdditionalServicesServer();

  return additionalServices
    .filter((extra) => {
      if (!allowedIds.has(extra.service_id)) return false;
      const applicable = extra.applicable_service_types;
      return (
        applicable == null ||
        (Array.isArray(applicable) && applicable.includes(config.legacyServiceType))
      );
    })
    .map((extra) => ({
      id: extra.service_id,
      label: extra.name,
      price: Number(extra.price_modifier),
    }))
    .filter((extra) => Number.isFinite(extra.price) && extra.price >= 0);
}

export async function getServiceLocations(): Promise<ServiceLocation[]> {
  return await getServiceLocationsServer();
}

export async function getCleaners(
  selectedDate?: string,
  selectedSuburb?: string,
  serviceType?: string
): Promise<Cleaner[]> {
  return await getCleanersServer(selectedDate, selectedSuburb, serviceType);
}

export async function getFrequencyOptions(): Promise<FrequencyOption[]> {
  return await getFrequencyOptionsServer();
}

export async function getTeams(): Promise<Team[]> {
  return await getTeamsServer();
}

export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  return await getTeamMembersServer(teamId);
}

export async function checkTeamAvailability(teamId: string, date: string): Promise<boolean> {
  return await checkTeamAvailabilityServer(teamId, date);
}

export async function getSystemSetting(key: string): Promise<string | null> {
  return await getSystemSettingServer(key);
}

export async function getServiceTypePricing(): Promise<ServiceTypePricing[]> {
  return await getServiceTypePricingServer();
}

export async function getBookPricingConfig() {
  const { fetchBookPricingConfig } = await import("@/lib/book/pricing-config-server");
  return fetchBookPricingConfig();
}
