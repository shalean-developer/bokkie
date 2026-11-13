import "server-only";
import { createHash } from "node:crypto";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { bookingInsertRow } from "@/lib/storage/bookings-supabase";
import type { Booking, BookingFormData } from "@/lib/types/booking";
import { calculateRecurringDates } from "@/lib/utils/recurring-bookings";
import { sendBookingConfirmationEmail, sendBookingNotificationEmail } from "@/lib/email";
import { calculateCleanerEarnings, type calculatePrice } from "@/lib/pricing";
import { getSystemSettings } from "@/lib/supabase/booking-data";
import { recordDiscountCodeUsage } from "@/app/actions/discount";

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.entries(value)
    .filter(([, v]) => v !== undefined).sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${JSON.stringify(k)}:${stable(v)}`).join(",")}}`;
  return JSON.stringify(value);
}

function requestDigest(userId: string, data: BookingFormData) {
  return createHash("sha256").update(stable({ user: userId, data })).digest("hex");
}

/** Resolve a completed retry before changed pricing or availability can reject it. */
export async function findSettledCreditBooking(data: BookingFormData) {
  const { data: { user } } = await (await createClient()).auth.getUser();
  if (!user?.email || user.email.toLowerCase() !== data.email.trim().toLowerCase()) return null;
  const digest = requestDigest(user.id, data);
  const { data: existing, error } = await createServiceRoleClient().from("credit_booking_requests")
    .select("booking_reference").eq("operation_key", `booking-credit:${user.id}:${digest}`)
    .eq("user_id", user.id).maybeSingle();
  if (error) throw new Error("Credit booking history unavailable");
  return existing ? { success: true, message: "Booking already confirmed",
    bookingId: `booking-credit-${digest}-0`, bookingReference: existing.booking_reference as string } : null;
}

export async function saveCreditBookings(data: BookingFormData,
  price: ReturnType<typeof calculatePrice>, cleanerPreference: BookingFormData["cleanerPreference"]) {
  const { data: { user } } = await (await createClient()).auth.getUser();
  if (!user?.email || user.email.toLowerCase() !== data.email.trim().toLowerCase()) {
    return { success: false, message: "Please log in with the booking customer's account to use credits" };
  }
  if (!data.scheduledDate) return { success: false, message: "Booking date required" };
  const db = createServiceRoleClient();
  let earnings: ReturnType<typeof calculateCleanerEarnings> | undefined;
  if (cleanerPreference !== "no-preference" && !cleanerPreference.startsWith("team-")) {
    const { data: cleaner, error } = await db.from("cleaners").select("total_jobs")
      .eq("cleaner_id", cleanerPreference).maybeSingle();
    if (error) return { success: false, message: "Cleaner details could not be verified" };
    const settings = await getSystemSettings(["old_cleaner_job_threshold"]);
    earnings = calculateCleanerEarnings(price, cleaner?.total_jobs ?? 0,
      Number(settings.old_cleaner_job_threshold ?? 50));
  }
  const digest = requestDigest(user.id, data);
  const reference = `BOK-C-${digest.slice(0, 28).toUpperCase()}`;
  const recurring = data.frequency !== "one-time";
  const dates = recurring ? [...new Set([data.scheduledDate!,
    ...calculateRecurringDates(data.frequency, data.scheduledDate!, 1)])].sort() : [data.scheduledDate];
  const group = recurring ? `${digest.slice(0,8)}-${digest.slice(8,12)}-4${digest.slice(13,16)}-a${digest.slice(17,20)}-${digest.slice(20,32)}` : undefined;
  const bookings: Booking[] = dates.map((date, index) => ({
    ...data, cleanerPreference, id: `booking-credit-${digest}-${index}`,
    bookingReference: index === 0 ? reference : `${reference}-${index}`,
    scheduledDate: date, createdAt: new Date().toISOString(), totalAmount: price.total,
    // Only the first visit is charged in this checkout. Future visits remain unpaid.
    paymentStatus: index === 0 ? "completed" : "pending",
    status: index === 0 ? "confirmed" : "pending",
    paymentReference: index === 0 ? `credits-${reference}` : undefined,
    subtotal: price.subtotal, frequencyDiscount: price.frequencyDiscount,
    discountCodeDiscount: price.discountCodeDiscount, serviceFee: price.serviceFee,
    cleanerEarnings: index === 0 ? earnings?.totalEarnings : undefined,
    cleanerEarningsPercentage: index === 0 ? earnings?.earningsPercentage : undefined,
    recurringGroupId: group, recurringSequence: recurring ? index : undefined,
    parentBookingId: index ? `booking-credit-${digest}-0` : undefined, isRecurring: recurring,
  }));
  const { data: settled, error } = await db.rpc("create_credit_bookings_private", {
    p_operation_key: `booking-credit:${user.id}:${digest}`, p_user_id: user.id,
    p_bookings: bookings.map(b => bookingInsertRow(b, user.id)),
  });
  if (error || !settled?.[0]) return { success: false, message: "This attempt did not charge credits. Check your bookings before retrying." };
  if (!settled[0].replayed) {
    // Sending is outside the financial transaction; a delivery failure never
    // retries the charge. Staging's existing outbound guard still applies.
    await db.rpc("process_referral_rewards", { p_referee_id: user.id,
      p_booking_reference: reference }).then(({ error }) => {
        if (error) console.error("Referral reward settlement deferred");
      });
    if (data.discountCode && price.discountCodeDiscount > 0) {
      await recordDiscountCodeUsage(data.discountCode.trim(), reference, data.email,
        price.discountCodeDiscount, price.total).catch(() => undefined);
    }
    await Promise.allSettled([
      sendBookingConfirmationEmail(bookings[0]),
      sendBookingNotificationEmail(bookings[0]),
    ]);
  }
  return { success: true, message: "Booking confirmed", bookingId: bookings[0].id, bookingReference: reference };
}
