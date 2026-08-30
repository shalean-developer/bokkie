"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";

export interface Payment {
  id: string;
  bookingReference: string;
  paymentReference: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  amount: number;
  tip: number;
  totalAmount: number;
  paymentStatus: "pending" | "completed" | "failed";
  createdAt: string;
  bookingId: string;
}

export async function getAllPayments(): Promise<Payment[]> {
  await requireAdmin();
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching payments:", error);
    throw new Error(`Failed to fetch payments: ${error.message}`);
  }

  return (data || []).map((booking: any) => ({
    id: booking.id,
    bookingReference: booking.booking_reference,
    paymentReference: booking.payment_reference || null,
    customerName: `${booking.contact_first_name} ${booking.contact_last_name}`,
    customerEmail: booking.contact_email,
    customerPhone: booking.contact_phone,
    amount: parseFloat(booking.total_amount || 0) - parseFloat(booking.tip_amount || 0),
    tip: parseFloat(booking.tip_amount || 0),
    totalAmount: parseFloat(booking.total_amount || 0),
    paymentStatus: booking.payment_status || "pending",
    createdAt: booking.created_at,
    bookingId: booking.id,
  }));
}

export async function getPaymentStats() {
  await requireAdmin();
  const supabase = createServiceRoleClient();
  const [totalResult, statusResult] = await Promise.all([
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("payment_status, total_amount, tip_amount"),
  ]);

  const byStatus: Record<string, number> = {};
  let totalRevenue = 0;
  let totalTips = 0;

  (statusResult.data || []).forEach((booking) => {
    const status = booking.payment_status || "pending";
    byStatus[status] = (byStatus[status] || 0) + 1;
    if (status === "completed") {
      totalRevenue += parseFloat(booking.total_amount || 0);
      totalTips += parseFloat(booking.tip_amount || 0);
    }
  });

  return {
    total: totalResult.count || 0,
    byStatus,
    totalRevenue,
    totalTips,
    completedCount: byStatus.completed || 0,
    pendingCount: byStatus.pending || 0,
    failedCount: byStatus.failed || 0,
  };
}
