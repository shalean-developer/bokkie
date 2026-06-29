export type BookServiceSlug =
  | "airbnb-cleaning"
  | "carpet-cleaning"
  | "deep-cleaning"
  | "moving-cleaning"
  | "office-cleaning"
  | "regular-cleaning";

export type BookStep = "details" | "schedule" | "review" | "payment";

export type CleanerMode = "team" | "individual_cleaners";

export type BookingType = "once-off" | "recurring";

export type RecurringFrequency = "weekly" | "bi-weekly" | "monthly" | "custom";

export type WeekDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type BookBookingStatus =
  | "draft"
  | "pending_payment"
  | "confirmed"
  | "payment_failed"
  | "cancelled";

export type BookPaymentStatus =
  | "pending"
  | "completed"
  | "failed";

export interface BookTrackingMeta {
  sourcePage?: string;
  servicePageRoute?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  deviceType?: string;
}

export interface BookAddress {
  addressLine: string;
  suburb: string;
  city: string;
  postalCode: string;
  accessInstructions?: string;
  parkingInstructions?: string;
  securityCode?: string;
}

export interface BookRecurring {
  isRecurring: boolean;
  frequency?: RecurringFrequency;
  recurringDays?: WeekDay[];
  recurringStartDate?: string;
  recurringEndDate?: string;
  recurringVisitCount?: number;
  recurringNotes?: string;
}

export interface BookSchedule {
  bookingType: BookingType;
  serviceDate: string;
  serviceTime: string;
  alternativeDate?: string;
  alternativeTime?: string;
  cleanerMode: CleanerMode;
  cleanerCount: number;
  assignedTeamId?: string;
  assignedCleanerIds?: string[];
}

export interface BookPricingLineItem {
  label: string;
  amount: number;
  breakdown?: { label: string; amount: number }[];
}

export interface BookPricingSummary {
  basePrice: number;
  sizeAdjustment: number;
  extrasTotal: number;
  extraCleanersTotal: number;
  teamBookingFee: number;
  recurringDiscount: number;
  estimatedTotal: number;
  estimatedDuration: string;
  lineItems: BookPricingLineItem[];
}

export interface BookCustomer {
  fullName: string;
  email: string;
  cellNumber: string;
  whatsappNumber?: string;
  preferredContactMethod?: "email" | "phone" | "whatsapp";
}

/** Service-specific answers stored in service_details JSONB */
export type BookServiceDetails = Record<string, string | number | boolean | string[] | null | undefined>;

import type { BookPricingConfig } from "./pricing-config";

export interface BookFormState {
  service: BookServiceSlug;
  step: BookStep;
  serviceDetails: BookServiceDetails;
  address: BookAddress;
  schedule: BookSchedule;
  recurring: BookRecurring;
  selectedExtras: string[];
  extrasPricing?: Record<string, number>;
  pricingConfig?: BookPricingConfig;
  pricingSummary: BookPricingSummary | null;
  customer: BookCustomer;
  tracking: BookTrackingMeta;
  bookingReference?: string;
  status?: BookBookingStatus;
  paymentStatus?: BookPaymentStatus;
  paymentReference?: string;
  userId?: string;
}

export interface TeamAvailabilityResult {
  available: boolean;
  availableTeams: { id: string; teamName: string }[];
  bookedCount: number;
  maxTeams: number;
  message?: string;
}

export interface BookSubmitResult {
  success: boolean;
  message?: string;
  bookingReference?: string;
  errors?: Record<string, string>;
}
