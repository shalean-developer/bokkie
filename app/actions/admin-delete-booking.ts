"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { getBookingByReference } from "@/app/actions/admin-bookings";
import { requireAdmin } from "@/lib/auth/require-admin";

export interface AdminDeleteBookingResult {
  success: boolean;
  message: string;
}

export async function adminDeleteBooking(bookingReference: string): Promise<AdminDeleteBookingResult> {
  try {
    await requireAdmin();
    const supabase = createServiceRoleClient();
    const booking = await getBookingByReference(bookingReference);

    if (!booking) {
      return { success: false, message: "Booking not found" };
    }

    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("booking_reference", bookingReference);

    if (error) throw new Error(`Failed to delete booking: ${error.message}`);

    return { success: true, message: "Booking deleted successfully" };
  } catch (error) {
    console.error("Error deleting booking:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, message: `Failed to delete booking: ${errorMessage}` };
  }
}
