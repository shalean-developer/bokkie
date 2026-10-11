"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { updateRebookedBookingPayment as settleVerifiedPayment } from "@/lib/payments/rebook-settlement";

/** Customer return-page action; settlement requires authenticated booking ownership. */
export async function updateRebookedBookingPayment(bookingReference: string, paymentReference: string) {
  const auth = await createClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return { success: false, message: "Please sign in to verify your payment" };
  const db = createServiceRoleClient();
  const { data: booking, error } = await db.from("bookings")
    .select("user_id").eq("booking_reference", bookingReference).maybeSingle();
  if (error || !booking || booking.user_id !== user.id) {
    return { success: false, message: "Booking access denied" };
  }
  return settleVerifiedPayment(bookingReference, paymentReference);
}
