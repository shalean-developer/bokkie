"use server";

import { BookingFormData } from "@/lib/types/booking";
import { calculatePrice } from "@/lib/pricing";
import { fetchPricingConfig } from "@/lib/pricing-server";
import { validateDiscountCode } from "@/app/actions/discount";
import { calculateRecurringDates } from "@/lib/utils/recurring-bookings";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getPaystackConfigError, getPaystackPublicKey } from "@/lib/paystack-config";

export interface PaymentInitResult {
  success: boolean;
  publicKey?: string;
  amount?: number;
  email?: string;
  reference?: string;
  message?: string;
}

/**
 * Initialize a failed/rebook payment from the persisted booking only.
 * Browser-supplied amount and email are not trusted.
 */
export async function initializeRebookPayment(
  bookingReference: string
): Promise<PaymentInitResult> {
  const publicKey = getPaystackPublicKey();
  if (!publicKey) {
    return { success: false, message: getPaystackConfigError() };
  }

  try {
    const supabase = createServiceRoleClient();
    const { data: booking, error } = await supabase
      .from("bookings")
      .select("total_amount, contact_email, payment_status")
      .eq("booking_reference", bookingReference)
      .maybeSingle();

    if (error || !booking) {
      return { success: false, message: "Booking not found" };
    }

    if (booking.payment_status === "completed") {
      return { success: false, message: "This booking has already been paid." };
    }

    if (booking.payment_status !== "failed") {
      return {
        success: false,
        message: `Payment can only be retried for failed bookings. Current status: ${booking.payment_status ?? "unknown"}.`,
      };
    }

    const total = Number(booking.total_amount);
    if (!Number.isFinite(total) || total <= 0) {
      return { success: false, message: "Booking total is invalid. Please contact support." };
    }

    const email = String(booking.contact_email ?? "").trim();
    if (!email) {
      return { success: false, message: "Booking email is missing. Please contact support." };
    }

    const reference = `bokkie-rebook-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    return {
      success: true,
      publicKey,
      amount: Math.round(total * 100),
      email,
      reference,
    };
  } catch (error) {
    console.error("Error initializing rebook payment:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to initialize payment",
    };
  }
}

/**
 * Initialize payment and return Paystack configuration
 */
export async function initializePayment(
  bookingData: BookingFormData,
  email: string
): Promise<PaymentInitResult> {
  if (!process.env.PAYSTACK_PUBLIC_KEY) {
    return {
      success: false,
      message: "Payment gateway is not configured",
    };
  }

  try {
    // Fetch pricing configuration from database
    const pricingConfig = await fetchPricingConfig();
    
    // Calculate initial price breakdown (without discount code)
    const initialPriceBreakdown = calculatePrice(bookingData, pricingConfig, 0);
    
    // Validate and apply discount code if provided
    let discountCodeAmount = 0;
    if (bookingData.discountCode && bookingData.discountCode.trim()) {
      const discountResult = await validateDiscountCode(
        bookingData.discountCode.trim(),
        initialPriceBreakdown.subtotal - initialPriceBreakdown.frequencyDiscount
      );
      
      if (discountResult.success) {
        discountCodeAmount = discountResult.discountAmount;
      }
      // If discount code is invalid, we still proceed but without discount
      // The booking submission will handle the error
    }
    
    // Calculate final price breakdown with discount code
    const priceBreakdown = calculatePrice(bookingData, pricingConfig, discountCodeAmount);
    
    // For recurring bookings, calculate total for all bookings in the current month
    let totalAmount = priceBreakdown.total;
    const isRecurring = bookingData.frequency !== "one-time";
    
    if (isRecurring && bookingData.scheduledDate) {
      // Calculate all booking dates in the current month
      const recurringDates = calculateRecurringDates(
        bookingData.frequency,
        bookingData.scheduledDate,
        1 // Only current month
      );
      
      // Multiply single booking price by number of bookings in the month
      const numberOfBookings = recurringDates.length;
      totalAmount = priceBreakdown.total * numberOfBookings;
    }
    
    // Generate payment reference
    const reference = `bokkie-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Convert amount to cents (Paystack uses smallest currency unit)
    // ZAR amounts are multiplied by 100 to convert to cents
    // Round to ensure we have a valid integer (Paystack requirement)
    const amountInCents = Math.round(totalAmount * 100);

    return {
      success: true,
      publicKey: process.env.PAYSTACK_PUBLIC_KEY,
      amount: amountInCents,
      email,
      reference,
    };
  } catch (error) {
    console.error("Error initializing payment:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to initialize payment",
    };
  }
}
