"use server";

import {
  getAdminDashboardMetrics,
  getDateRange,
  getRevenueTrends,
  getBookingsTrends,
  getServiceBreakdown,
  getBookingPipeline,
  getRecentBookings,
  getPendingCounts,
  type DateRange,
  type AdminDashboardMetrics,
  type RevenueTrend,
  type BookingsTrend,
  type ServiceBreakdown,
  type BookingPipeline,
  type PendingCounts,
} from "@/lib/storage/admin-supabase";
import { Booking } from "@/lib/types/booking";
import { getPaymentDateReport } from "@/lib/payments/payment-date-report-server";

/**
 * Get admin dashboard data
 */
export async function getAdminDashboardData(
  dateRange: DateRange = "today",
  customStart?: Date,
  customEnd?: Date
) {
  try {
    const [
      metrics,
      revenueTrends,
      bookingsTrends,
      serviceBreakdown,
      bookingPipeline,
      recentBookings,
      pendingCounts,
      paymentDateReport,
    ] = await Promise.all([
      getAdminDashboardMetrics(dateRange, customStart, customEnd),
      getRevenueTrends(dateRange, customStart, customEnd),
      getBookingsTrends(dateRange, customStart, customEnd),
      getServiceBreakdown(),
      getBookingPipeline(),
      getRecentBookings(10),
      getPendingCounts(),
      (() => { const { start, end } = getDateRange(dateRange, customStart, customEnd); return getPaymentDateReport(start.toISOString(), end.toISOString()).catch((error) => { console.error("Payment-date report unavailable:", error); return null; }); })(),
    ]);

    return {
      metrics,
      revenueTrends,
      bookingsTrends,
      serviceBreakdown,
      bookingPipeline,
      recentBookings,
      pendingCounts,
      paymentDateReport,
    };
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    throw error;
  }
}
