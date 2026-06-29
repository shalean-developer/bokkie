import type { BookFormState, BookServiceSlug } from "./types";
import { BOOK_STORAGE_KEY } from "./constants";
import { getServiceConfig } from "./services";

export function createInitialBookState(service: BookServiceSlug): BookFormState {
  const config = getServiceConfig(service);
  return {
    service,
    step: "details",
    serviceDetails: getDefaultServiceDetails(service),
    address: {
      addressLine: "",
      suburb: "",
      city: config.defaultCity,
      postalCode: "",
    },
    schedule: {
      bookingType: "once-off",
      serviceDate: "",
      serviceTime: "",
      cleanerMode: config.cleanerMode,
      cleanerCount: 1,
    },
    recurring: { isRecurring: false },
    selectedExtras: [],
    pricingSummary: null,
    customer: {
      fullName: "",
      email: "",
      cellNumber: "",
    },
    tracking: {},
    status: "draft",
    paymentStatus: "pending",
  };
}

function getDefaultServiceDetails(service: BookServiceSlug): Record<string, unknown> {
  switch (service) {
    case "airbnb-cleaning":
      return {
        propertyType: "",
        bedrooms: 1,
        bathrooms: 1,
        checkInTime: "14:00",
        checkOutTime: "10:00",
      };
    case "carpet-cleaning":
      return {
        numberOfRooms: 1,
        carpetedAreaSize: "",
        stainTreatmentNeeded: false,
        petOdorTreatmentNeeded: false,
        furnitureMovingRequired: false,
        carpetCondition: "",
        propertyType: "",
      };
    case "deep-cleaning":
      return {
        propertyType: "",
        bedrooms: 2,
        bathrooms: 1,
        propertyCondition: "",
      };
    case "moving-cleaning":
      return {
        moveType: "move-out",
        propertyType: "",
        bedrooms: 2,
        bathrooms: 1,
        propertyEmpty: false,
        keysAccessInstructions: "",
      };
    case "office-cleaning":
      return {
        officeSize: "",
        workstations: 5,
        bathrooms: 1,
        cleaningFrequency: "",
        afterHoursRequired: false,
      };
    case "regular-cleaning":
      return {
        propertyType: "",
        bedrooms: 2,
        bathrooms: 1,
        cleaningFrequency: "",
        petsInHome: false,
        preferredCleanerNotes: "",
      };
  }
}

export function loadBookState(service: BookServiceSlug): BookFormState {
  if (typeof window === "undefined") return createInitialBookState(service);
  try {
    const raw = localStorage.getItem(BOOK_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as BookFormState;
      if (parsed.service === service) return { ...createInitialBookState(service), ...parsed };
    }
  } catch {
    /* ignore */
  }
  return createInitialBookState(service);
}

export function saveBookState(state: BookFormState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(BOOK_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function clearBookState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(BOOK_STORAGE_KEY);
}

export function detectDeviceType(): string {
  if (typeof window === "undefined") return "unknown";
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

export function captureUtmParams(): Pick<
  BookFormState["tracking"],
  "utmSource" | "utmMedium" | "utmCampaign"
> {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get("utm_source") ?? undefined,
    utmMedium: params.get("utm_medium") ?? undefined,
    utmCampaign: params.get("utm_campaign") ?? undefined,
  };
}
