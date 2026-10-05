"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { getPaystackConfigError, getPaystackSecretKey } from "@/lib/paystack-config";

export interface RebookPaymentResult {
  success: boolean;
  message: string;
  bookingReference?: string;
}

type VerifiedPaystackTransaction = {
  status: string;
  amount: number;
  currency: string;
  reference: string;
  metadata: Record<string, unknown>;
};

async function verifyPaystackTransaction(
  reference: string,
  secretKey: string
): Promise<VerifiedPaystackTransaction | null> {
  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${secretKey}` },
        cache: "no-store",
      }
    );

    if (!response.ok) return null;
    const payload = await response.json();
    if (!payload?.status || !payload?.data) return null;

    return {
      status: String(payload.data.status ?? ""),
      amount: Number(payload.data.amount),
      currency: String(payload.data.currency ?? ""),
      reference: String(payload.data.reference ?? ""),
      metadata:
        payload.data.metadata && typeof payload.data.metadata === "object"
          ? payload.data.metadata
          : {},
    };
  } catch (error) {
    console.error("Paystack rebook verification request failed:", error);
    return null;
  }
}

/**
 * Verify a failed/rebook payment against the persisted booking before completing it.
 */
export async function updateRebookedBookingPayment(
  bookingReference: string,
  paymentReference: string
): Promise<RebookPaymentResult> {
  const secretKey = getPaystackSecretKey();
  if (!secretKey) {
    return { success: false, message: getPaystackConfigError() };
  }

  try {
    const supabase = createServiceRoleClient();
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("booking_reference, total_amount, payment_status")
      .eq("booking_reference", bookingReference)
      .maybeSingle();

    if (fetchError || !booking) {
      return { success: false, message: "Booking not found" };
    }

    if (booking.payment_status === "completed") {
      return {
        success: true,
        message: "Payment already confirmed",
        bookingReference,
      };
    }

    const expectedAmount = Math.round(Number(booking.total_amount) * 100);
    if (!Number.isFinite(expectedAmount) || expectedAmount <= 0) {
      return { success: false, message: "Booking total is invalid. Please contact support." };
    }

    const transaction = await verifyPaystackTransaction(paymentReference, secretKey);
    const metadataBookingReference = String(
      transaction?.metadata?.booking_reference ?? ""
    );

    const verified =
      transaction?.status === "success" &&
      transaction.reference === paymentReference &&
      transaction.amount === expectedAmount &&
      transaction.currency.toUpperCase() === "ZAR" &&
      metadataBookingReference === bookingReference;

    if (!verified) {
      await supabase
        .from("bookings")
        .update({
          payment_status: "failed",
          payment_reference: paymentReference,
          status: "pending",
        })
        .eq("booking_reference", bookingReference);

      return {
        success: false,
        message:
          "Payment verification failed because the transaction did not match this booking's amount, currency, or reference.",
      };
    }

    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        payment_status: "completed",
        payment_reference: paymentReference,
        status: "confirmed",
      })
      .eq("booking_reference", bookingReference);

    if (updateError) {
      return { success: false, message: updateError.message };
    }

    return {
      success: true,
      message: "Payment verified and booking confirmed",
      bookingReference,
    };
  } catch (error) {
    console.error("Error updating rebooked booking payment:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return {
      success: false,
      message: `Failed to update payment: ${errorMessage}`,
    };
  }
}
