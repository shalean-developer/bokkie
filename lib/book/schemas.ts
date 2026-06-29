import { z } from "zod";
import type { BookServiceSlug } from "./types";
import { MAX_CLEANERS, MIN_CLEANERS } from "./constants";

export const weekDaySchema = z.enum([
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
]);

export const addressSchema = z.object({
  addressLine: z.string().min(3, "Street address is required"),
  suburb: z.string().min(2, "Suburb is required"),
  city: z.string().min(2, "City is required"),
  postalCode: z.string().min(4, "Postal code is required"),
  accessInstructions: z.string().optional(),
  parkingInstructions: z.string().optional(),
  securityCode: z.string().optional(),
});

export const recurringSchema = z
  .object({
    isRecurring: z.boolean(),
    frequency: z.enum(["weekly", "bi-weekly", "monthly", "custom"]).optional(),
    recurringDays: z.array(weekDaySchema).optional(),
    recurringStartDate: z.string().optional(),
    recurringEndDate: z.string().optional(),
    recurringVisitCount: z.coerce.number().int().positive().optional(),
    recurringNotes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.isRecurring) return;
    if (!data.frequency) {
      ctx.addIssue({ code: "custom", message: "Select a recurring frequency", path: ["frequency"] });
    }
    if (data.frequency === "custom" && (!data.recurringDays || data.recurringDays.length === 0)) {
      ctx.addIssue({
        code: "custom",
        message: "Select at least one day for custom recurring bookings",
        path: ["recurringDays"],
      });
    }
  });

export const scheduleSchema = z
  .object({
    bookingType: z.enum(["once-off", "recurring"]),
    serviceDate: z.string().min(1, "Preferred date is required"),
    serviceTime: z.string().min(1, "Preferred time is required"),
    alternativeDate: z.string().optional(),
    alternativeTime: z.string().optional(),
    cleanerMode: z.enum(["team", "individual_cleaners"]),
    cleanerCount: z.coerce.number().int().min(MIN_CLEANERS).max(MAX_CLEANERS),
    assignedTeamId: z.string().optional(),
    assignedCleanerIds: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.cleanerMode === "team" && !data.assignedTeamId) {
      ctx.addIssue({
        code: "custom",
        message: "Please select an available team",
        path: ["assignedTeamId"],
      });
    }
  });

export const customerSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  cellNumber: z.string().min(10, "Cell number is required"),
  whatsappNumber: z.string().optional(),
  preferredContactMethod: z.enum(["email", "phone", "whatsapp"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    cellNumber: z.string().min(10, "Cell number is required"),
    email: z.string().email("Valid email is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const paymentInitSchema = z.object({
  bookingReference: z.string().optional(),
  estimatedTotal: z.number().positive(),
  email: z.string().email(),
});

/** Service-specific detail schemas */
const sharedPropertyFields = {
  propertyType: z.string().min(1, "Property type is required"),
};

export const airbnbDetailsSchema = z.object({
  ...sharedPropertyFields,
  bedrooms: z.coerce.number().int().min(0),
  bathrooms: z.coerce.number().int().min(1),
  checkInTime: z.string().min(1, "Check-in time is required"),
  checkOutTime: z.string().min(1, "Check-out time is required"),
});

export const carpetDetailsSchema = z.object({
  numberOfRooms: z.coerce.number().int().min(1),
  carpetedAreaSize: z.enum(["small", "medium", "large"], {
    message: "Carpeted area size is required",
  }),
  carpetCondition: z.string().min(1, "Carpet condition is required"),
  propertyType: z.string().min(1, "Property type is required"),
});

export const deepDetailsSchema = z.object({
  ...sharedPropertyFields,
  bedrooms: z.coerce.number().int().min(0),
  bathrooms: z.coerce.number().int().min(1),
  propertyCondition: z.string().min(1, "Property condition is required"),
});

export const movingDetailsSchema = z.object({
  moveType: z.enum(["move-in", "move-out"]),
  propertyType: z.string().min(1, "Property type is required"),
  bedrooms: z.coerce.number().int().min(0),
  bathrooms: z.coerce.number().int().min(1),
  propertyEmpty: z.boolean(),
  keysAccessInstructions: z.string().optional(),
});

export const officeDetailsSchema = z.object({
  officeSize: z.string().min(1, "Office size is required"),
  workstations: z.coerce.number().int().min(1),
  bathrooms: z.coerce.number().int().min(0),
  cleaningFrequency: z.string().min(1, "Cleaning frequency is required"),
  afterHoursRequired: z.boolean(),
});

export const regularDetailsSchema = z
  .object({
    propertyType: z.string().min(1, "Property type is required"),
    bedrooms: z.coerce.number().int().min(0),
    bathrooms: z.coerce.number().int().min(1),
    cleaningFrequency: z.string().min(1, "Cleaning frequency is required"),
    petsInHome: z.boolean(),
    petType: z.string().optional(),
    preferredCleanerNotes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.petsInHome && !data.petType?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Please tell us what type of pet you have",
        path: ["petType"],
      });
    }
  });

export const SERVICE_DETAIL_SCHEMAS: Record<BookServiceSlug, z.ZodTypeAny> = {
  "airbnb-cleaning": airbnbDetailsSchema,
  "carpet-cleaning": carpetDetailsSchema,
  "deep-cleaning": deepDetailsSchema,
  "moving-cleaning": movingDetailsSchema,
  "office-cleaning": officeDetailsSchema,
  "regular-cleaning": regularDetailsSchema,
};

export function getDetailsSchema(service: BookServiceSlug) {
  return z.object({
    serviceDetails: SERVICE_DETAIL_SCHEMAS[service],
    address: addressSchema,
  });
}

export function getReviewSchema() {
  return z.object({
    selectedExtras: z.array(z.string()),
  });
}
