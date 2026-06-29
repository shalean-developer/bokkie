import type { BookFormState } from "./types";
import type {
  Booking,
  CleanerPreference,
  FrequencyType,
  ServiceType,
} from "@/lib/types/booking";
import { BOOK_SERVICES } from "./services";
import { calculateBookPricing } from "./pricing";
import { generateBookingId, generateBookingReference } from "@/lib/storage/bookings-supabase";

function mapFrequency(recurring: BookFormState["recurring"]): FrequencyType {
  if (!recurring.isRecurring) return "one-time";
  switch (recurring.frequency) {
    case "weekly":
    case "custom":
      return "weekly";
    case "bi-weekly":
      return "bi-weekly";
    case "monthly":
      return "monthly";
    default:
      return "one-time";
  }
}

export function mapBookFormStateToBooking(
  state: BookFormState,
  bookingReference?: string,
  existing?: { id: string; createdAt: string }
): Booking {
  const config = BOOK_SERVICES[state.service];
  const pricing = state.pricingSummary ?? calculateBookPricing(state);
  const ref = bookingReference ?? state.bookingReference ?? generateBookingReference();

  const nameParts = state.customer.fullName.trim().split(/\s+/);
  const firstName = nameParts[0] ?? "Customer";
  const lastName = nameParts.slice(1).join(" ") || firstName;

  const cleanerPreference: CleanerPreference = state.schedule.assignedTeamId
    ? (state.schedule.assignedTeamId as CleanerPreference)
    : "no-preference";

  const specialInstructions = [
    state.address.accessInstructions,
    state.address.parkingInstructions,
    state.address.securityCode ? `Gate code: ${state.address.securityCode}` : null,
    state.address.postalCode ? `Postal code: ${state.address.postalCode}` : null,
    state.recurring.recurringNotes,
  ]
    .filter(Boolean)
    .join("\n");

  const officeSizeRaw = String(state.serviceDetails.officeSize ?? "");
  const officeSize =
    officeSizeRaw === "small" || officeSizeRaw === "medium" || officeSizeRaw === "large"
      ? officeSizeRaw
      : undefined;

  return {
    id: existing?.id ?? generateBookingId(),
    bookingReference: ref,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    service: config.legacyServiceType as ServiceType,
    frequency: mapFrequency(state.recurring),
    scheduledDate: state.schedule.serviceDate,
    scheduledTime: state.schedule.serviceTime,
    bedrooms: Number(state.serviceDetails.bedrooms ?? state.serviceDetails.numberOfRooms ?? 0),
    bathrooms: Number(state.serviceDetails.bathrooms ?? 1),
    extras: state.selectedExtras,
    streetAddress: state.address.addressLine,
    suburb: state.address.suburb,
    city: state.address.city,
    cleanerPreference,
    firstName,
    lastName,
    email: state.customer.email,
    phone: state.customer.cellNumber,
    specialInstructions: specialInstructions || undefined,
    fittedRoomsCount:
      state.service === "carpet-cleaning"
        ? Number(state.serviceDetails.numberOfRooms ?? 0)
        : undefined,
    officeSize,
    totalAmount: pricing.estimatedTotal,
    subtotal: pricing.estimatedTotal,
    status: "pending",
    paymentStatus: "pending",
    isRecurring: state.recurring.isRecurring,
    teamId: state.schedule.assignedTeamId,
    assignedCleanerIds: state.schedule.assignedCleanerIds,
  };
}

export function getBookV2ExtensionPayload(state: BookFormState) {
  const pricing = state.pricingSummary ?? calculateBookPricing(state);
  return {
    service_details: state.serviceDetails,
    selected_extras: state.selectedExtras,
    pricing_summary: pricing,
    estimated_duration: pricing.estimatedDuration,
    estimated_total: pricing.estimatedTotal,
    booking_type: state.schedule.bookingType,
    cleaner_mode: state.schedule.cleanerMode,
    cleaner_count: state.schedule.cleanerCount,
    assigned_cleaner_ids: state.schedule.assignedCleanerIds ?? [],
    alternative_date: state.schedule.alternativeDate ?? null,
    alternative_time: state.schedule.alternativeTime ?? null,
    recurring_frequency: state.recurring.frequency ?? null,
    recurring_days: state.recurring.recurringDays ?? [],
    recurring_start_date: state.recurring.isRecurring ? state.schedule.serviceDate : null,
    recurring_end_date: null,
    recurring_visit_count: state.recurring.recurringVisitCount ?? null,
    recurring_notes: state.recurring.recurringNotes ?? null,
    customer_whatsapp: state.customer.whatsappNumber ?? null,
    preferred_contact_method: state.customer.preferredContactMethod ?? null,
    postal_code: state.address.postalCode,
    access_instructions: state.address.accessInstructions ?? null,
    parking_instructions: state.address.parkingInstructions ?? null,
    source_page: state.tracking.sourcePage ?? null,
    utm_source: state.tracking.utmSource ?? null,
    utm_medium: state.tracking.utmMedium ?? null,
    utm_campaign: state.tracking.utmCampaign ?? null,
    payment_provider: "paystack",
    form_version: "v2",
  };
}
