import "server-only";
import { verifiedPaidAt } from "@/lib/payments/paid-at";
import { getPaystackSecretKey } from "@/lib/paystack-config";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { matchesBookingPayment, resolveCompletedPayment } from "@/lib/payments/transaction-match";

export interface RebookPaymentResult {
  success: boolean;
  message: string;
  bookingReference?: string;
}

/**
 * Update an existing rebooked booking with payment information
 * This is called after payment is successful
 */
export async function updateRebookedBookingPayment(
  bookingReference: string,
  paymentReference: string
): Promise<RebookPaymentResult> {
  try {
    const key = getPaystackSecretKey();
    if (!key) return { success: false, message: "Payment verification unavailable" };
    const db = createServiceRoleClient();
    const { data: booking, error: lookupError } = await db.from("bookings")
      .select("total_amount, payment_status, payment_reference")
      .eq("booking_reference", bookingReference).maybeSingle();
    if (lookupError || !booking) return { success: false, message: "Booking not found" };
    if (booking.payment_status === "completed") {
      return resolveCompletedPayment(booking.payment_reference, paymentReference) === "same"
        ? { success: true, message: "Payment already confirmed", bookingReference }
        : { success: false, message: "Booking already paid with another reference" };
    }
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(paymentReference)}`,
      { headers: { Authorization: `Bearer ${key}` }, cache: "no-store" }
    );
    if (!response.ok) return { success: false, message: "Payment verification unavailable" };
    const result = await response.json();
    const tx = result?.data;
    if (!result?.status || !matchesBookingPayment(tx, bookingReference, paymentReference, Number(booking.total_amount))) {
      return { success: false, message: "Payment does not match booking" };
    }
    const paidAt = verifiedPaidAt(tx);
    if (!paidAt) return { success: false, message: "Paystack did not provide a valid payment completion time" };
    const { data: updated, error: updateError } = await db.from("bookings")
      .update({ payment_status: "completed", payment_reference: paymentReference, paid_at: paidAt, status: "confirmed" })
      .eq("booking_reference", bookingReference)
      .neq("payment_status", "completed")
      .select("booking_reference");
    if (updateError) return { success: false, message: "Payment settlement failed" };
    if (updated?.length === 1) return { success: true, message: "Payment confirmed", bookingReference };
    const { data: latest } = await db.from("bookings")
      .select("payment_status, payment_reference")
      .eq("booking_reference", bookingReference).maybeSingle();
    return latest?.payment_status === "completed" && latest.payment_reference === paymentReference
      ? { success: true, message: "Payment already confirmed", bookingReference }
      : { success: false, message: "Booking payment state changed" };
  } catch (error) {
    console.error("Error updating rebooked booking payment:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return {
      success: false,
      message: `Failed to update payment: ${errorMessage}`,
    };
  }
}
