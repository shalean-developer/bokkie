"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import type { Booking } from "@/lib/types/booking";

export type AdminBookingStatusFilter = Booking["status"] | "all";
export type AdminPaymentStatusFilter = Booking["paymentStatus"] | "all";
export type AdminCleanerResponseFilter = Booking["cleanerResponse"] | "all" | "no-response";
export type AdminBookingViewMode = "all" | "recurring" | "one-time";
export type AdminBookingSort =
  | "date-desc"
  | "date-asc"
  | "amount-desc"
  | "amount-asc"
  | "name-asc"
  | "name-desc";

export interface AdminBookingQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: AdminBookingStatusFilter;
  paymentStatus?: AdminPaymentStatusFilter;
  cleanerResponse?: AdminCleanerResponseFilter;
  viewMode?: AdminBookingViewMode;
  sort?: AdminBookingSort;
}

export interface AdminBookingPageResult {
  bookings: Booking[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AdminBookingStats {
  total: number;
  pending: number;
  completed: number;
  paid: number;
}

function mapDatabaseToBooking(data: any): Booking {
  return {
    id: data.id,
    bookingReference: data.booking_reference,
    service: data.service_type,
    frequency: data.frequency,
    scheduledDate: data.scheduled_date,
    scheduledTime: data.scheduled_time,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    extras: data.extras || [],
    fittedRoomsCount: data.fitted_rooms_count ?? undefined,
    looseCarpetsCount: data.loose_carpets_count ?? undefined,
    roomsFurnitureStatus: data.rooms_furniture_status || undefined,
    officeSize: data.office_size ?? undefined,
    streetAddress: data.street_address,
    aptUnit: data.apt_unit,
    suburb: data.suburb,
    city: data.city,
    cleanerPreference: data.cleaner_preference,
    specialInstructions: data.special_instructions,
    firstName: data.contact_first_name,
    lastName: data.contact_last_name,
    email: data.contact_email,
    phone: data.contact_phone,
    discountCode: data.discount_code,
    tip: data.tip_amount || 0,
    totalAmount: Number(data.total_amount || 0),
    subtotal: data.subtotal ?? undefined,
    frequencyDiscount: data.frequency_discount ?? undefined,
    discountCodeDiscount: data.discount_code_discount ?? undefined,
    serviceFee: data.service_fee ?? undefined,
    cleanerEarnings: data.cleaner_earnings ?? undefined,
    cleanerEarningsPercentage: data.cleaner_earnings_percentage ?? undefined,
    recurringGroupId: data.recurring_group_id ?? undefined,
    recurringSequence: data.recurring_sequence ?? undefined,
    parentBookingId: data.parent_booking_id ?? undefined,
    isRecurring: data.is_recurring ?? false,
    status: data.status,
    paymentStatus: data.payment_status,
    paymentReference: data.payment_reference,
    cleanerResponse: data.cleaner_response || null,
    jobProgress: data.job_progress || null,
    createdAt: data.created_at,
    teamId: data.team_id || undefined,
  };
}

function normalizeSearch(value: string): string {
  return value
    .trim()
    .replace(/[,%()]/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 120);
}

export async function getAdminBookingsPage(
  input: AdminBookingQuery = {}
): Promise<AdminBookingPageResult> {
  const pageSize = Math.min(Math.max(Math.trunc(input.pageSize ?? 25), 10), 100);
  const page = Math.max(Math.trunc(input.page ?? 1), 1);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = createServiceRoleClient();
  let query = supabase.from("bookings").select("*", { count: "exact" });

  if (input.status && input.status !== "all") {
    query = query.eq("status", input.status);
  }

  if (input.paymentStatus && input.paymentStatus !== "all") {
    query = query.eq("payment_status", input.paymentStatus);
  }

  if (input.cleanerResponse && input.cleanerResponse !== "all") {
    query =
      input.cleanerResponse === "no-response"
        ? query.is("cleaner_response", null)
        : query.eq("cleaner_response", input.cleanerResponse);
  }

  if (input.viewMode === "recurring") {
    query = query.eq("is_recurring", true);
  } else if (input.viewMode === "one-time") {
    query = query.eq("is_recurring", false);
  }

  const search = normalizeSearch(input.search ?? "");
  if (search) {
    const pattern = `%${search}%`;
    query = query.or(
      [
        `booking_reference.ilike.${pattern}`,
        `service_type.ilike.${pattern}`,
        `contact_first_name.ilike.${pattern}`,
        `contact_last_name.ilike.${pattern}`,
        `contact_email.ilike.${pattern}`,
        `contact_phone.ilike.${pattern}`,
        `street_address.ilike.${pattern}`,
        `suburb.ilike.${pattern}`,
        `city.ilike.${pattern}`,
      ].join(",")
    );
  }

  switch (input.sort ?? "date-desc") {
    case "date-asc":
      query = query.order("created_at", { ascending: true });
      break;
    case "amount-desc":
      query = query.order("total_amount", { ascending: false });
      break;
    case "amount-asc":
      query = query.order("total_amount", { ascending: true });
      break;
    case "name-asc":
      query = query
        .order("contact_first_name", { ascending: true })
        .order("contact_last_name", { ascending: true });
      break;
    case "name-desc":
      query = query
        .order("contact_first_name", { ascending: false })
        .order("contact_last_name", { ascending: false });
      break;
    case "date-desc":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("Error fetching paginated admin bookings:", error);
    throw new Error(`Failed to fetch bookings: ${error.message}`);
  }

  const total = count ?? 0;
  return {
    bookings: (data ?? []).map(mapDatabaseToBooking),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

async function countBookingsBy(
  column?: "status" | "payment_status",
  value?: string
): Promise<number> {
  const supabase = createServiceRoleClient();
  let query = supabase.from("bookings").select("id", { count: "exact", head: true });
  if (column && value) query = query.eq(column, value);

  const { count, error } = await query;
  if (error) throw new Error(`Failed to count bookings: ${error.message}`);
  return count ?? 0;
}

export async function getAdminBookingStats(): Promise<AdminBookingStats> {
  const [total, pending, completed, paid] = await Promise.all([
    countBookingsBy(),
    countBookingsBy("status", "pending"),
    countBookingsBy("status", "completed"),
    countBookingsBy("payment_status", "completed"),
  ]);

  return { total, pending, completed, paid };
}
