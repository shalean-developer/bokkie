import { getPaystackSecretKey } from "@/lib/paystack-config";
import { NextRequest, NextResponse } from "next/server";
import { submitBooking } from "@/app/actions/submit-booking";
import { updateRebookedBookingPayment } from "@/lib/payments/rebook-settlement";
import { settleVoucherPayment } from "@/lib/payments/voucher-settlement";
import { settleCreditPayment } from "@/lib/payments/credit-settlement";
import { BookingFormData } from "@/lib/types/booking";
import { verifyWebhookSignature, verifyPayment } from "@/lib/paystack";

/**
 * Paystack webhook handler for payment verification
 * This endpoint handles Paystack webhook events and creates bookings when payment is successful
 * 
 * Webhook URL: https://yourdomain.com/api/payment/callback
 * Configure this URL in your Paystack dashboard under Settings > Webhooks
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    
    // Verify webhook signature for security
    const signature = request.headers.get("x-paystack-signature");
    const secretKey = getPaystackSecretKey();

    if (!secretKey) {
      console.error("PAYSTACK_SECRET_KEY is not configured");
      return NextResponse.json(
        { success: false, message: "Webhook secret key not configured" },
        { status: 500 }
      );
    }

    // Paystack signs every webhook. Reject missing or invalid signatures.
    if (!signature || !verifyWebhookSignature(rawBody, signature, secretKey)) {
      console.error("Paystack webhook signature missing or invalid");
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 401 }
      );
    }

    // Parse the webhook event
    const event = JSON.parse(rawBody);
    
    // Paystack sends events like: charge.success, charge.failed, etc.
    // We're interested in charge.success events
    if (event.event === "charge.success" && event.data) {
      const transaction = event.data;
      const reference = transaction.reference;
      const metadata = transaction.metadata || {};

      // Verify payment status
      if (transaction.status === "success" && reference) {
        // Double verify payment with Paystack API
        const verified = await verifyPayment(reference, secretKey);
        
        if (!verified) {
          console.error("Payment verification failed for reference:", reference);
          return NextResponse.json(
            { success: false, message: "Payment verification failed" },
            { status: 400 }
          );
        }

        // Check if this is a voucher purchase (reference starts with "voucher-")
        const isVoucherPurchase = reference.startsWith("voucher-");

        if (isVoucherPurchase) {
          try {
            await settleVoucherPayment(reference);
            return NextResponse.json({success:true,message:"Voucher purchase confirmed"});
          } catch {
            return NextResponse.json({success:false,message:"Voucher settlement unavailable"},{status:503});
          }
        }

        // Check if this is a credit purchase
        const isCreditPurchase = reference.startsWith("credit-");
        if (isCreditPurchase) {
          try {
            await settleCreditPayment(reference);
            return NextResponse.json({ success: true, message: "Credit purchase confirmed" });
          } catch {
            return NextResponse.json({ success: false, message: "Credit settlement unavailable" }, { status: 503 });
          }
        }

        // Check if this is a rebook payment (has booking_reference in metadata)
        const bookingReference = metadata.booking_reference as string | undefined;

        if (bookingReference) {
          // This is a rebook payment - update existing booking
          const result = await updateRebookedBookingPayment(bookingReference, reference);

          if (result.success) {
            console.log("Rebook payment updated successfully via webhook:", bookingReference);
            return NextResponse.json({
              success: true,
              message: "Rebook payment confirmed",
              bookingReference: result.bookingReference,
            });
          } else {
            console.error("Failed to update rebook payment:", result.message);
            return NextResponse.json(
              { success: false, message: result.message || "Failed to update rebook payment" },
              { status: 400 }
            );
          }
        }

        // Extract booking data from metadata (for new bookings)
        const bookingData = metadata.booking_data as BookingFormData | undefined;

        if (bookingData) {
          // Submit booking with payment reference
          // Note: Referral rewards will be processed automatically in submitBooking
          const result = await submitBooking(bookingData, reference);

          if (result.success) {
            console.log("Booking created successfully via webhook:", result.bookingReference);
            return NextResponse.json({
              success: true,
              message: "Booking confirmed",
              bookingReference: result.bookingReference,
            });
          } else {
            console.error("Failed to create booking:", result.message);
            return NextResponse.json(
              { success: false, message: result.message || "Failed to create booking" },
              { status: 400 }
            );
          }
        } else {
          console.error("Payment type not identified for reference:", reference);
          return NextResponse.json(
            { success: false, message: "Payment type not identified" },
            { status: 400 }
          );
        }
      }
    }

    // For other events or if payment wasn't successful, return success to acknowledge receipt
    // Paystack expects a 200 response for all webhook events
    return NextResponse.json({
      success: true,
      message: "Webhook received",
    });
  } catch (error) {
    console.error("Payment webhook error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
