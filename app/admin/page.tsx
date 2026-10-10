import { getAdminDashboardData } from "@/app/actions/admin-dashboard";
import type { DateRange } from "@/lib/storage/admin-supabase";
import MetricCard from "@/components/admin/MetricCard";
import RevenueChart from "@/components/admin/RevenueChart";
import BookingsChart from "@/components/admin/BookingsChart";
import ServiceBreakdownChart from "@/components/admin/ServiceBreakdownChart";
import BookingPipeline from "@/components/admin/BookingPipeline";
import RecentActivity from "@/components/admin/RecentActivity";
import PendingItems from "@/components/admin/PendingItems";
import QuickActions from "@/components/admin/QuickActions";
import { DollarSign, Calendar, Users, TrendingUp, RefreshCw } from "lucide-react";
import dynamicImport from "next/dynamic";

const AdminDashboardClient = dynamicImport(
  () => import("@/components/admin/AdminDashboardClient")
);

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ dateRange?: string }>;
}) {
  const params = await searchParams;
  const dateRange = (params.dateRange || "today") as DateRange;
  
  try {
    const dashboardData = await getAdminDashboardData(dateRange);
    
    const {
      metrics,
      revenueTrends,
      bookingsTrends,
      serviceBreakdown,
      bookingPipeline,
      recentBookings,
      pendingCounts,
      paymentDateReport,
    } = dashboardData;

    // Format currency values
    const formatCurrency = (value: number) => {
      return `R${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    };

    return (
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
        <AdminDashboardClient initialDateRange={dateRange}>
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Dashboard
                </h1>
                <p className="text-sm md:text-base text-gray-600">
                  Overview of your business metrics and recent activity
                </p>
              </div>
            </div>
          </div>

          {/* Completed payments are reported by verified payment date only.
              Undated historical payments remain visible separately. */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <MetricCard title="Verified Payment-date Revenue" value={formatCurrency(paymentDateReport.verifiedPeriodRevenue)} icon={DollarSign} />
            <MetricCard title="Historical Paid — Date Unknown" value={formatCurrency(paymentDateReport.undatedHistoricalRevenue)} icon={DollarSign} />
            <MetricCard title="Lifetime Recorded Payments" value={formatCurrency(paymentDateReport.lifetimeRecordedPayments)} icon={DollarSign} />
            <MetricCard title="Non-cancelled Bookings" value={metrics.totalBookings.toString()} change={metrics.bookingsChange} icon={Calendar} />
            <MetricCard title="Booking Customers" value={metrics.activeCustomers.toString()} change={metrics.customersChange} icon={Users} />
            <MetricCard title="Avg Verified Paid Booking Value" value={formatCurrency(paymentDateReport.verifiedPeriodCount ? paymentDateReport.verifiedPeriodRevenue / paymentDateReport.verifiedPeriodCount : 0)} icon={TrendingUp} />
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Verified revenue follows payment completion dates. {paymentDateReport.undatedHistoricalCount} historical completed payments lack verified dates and are excluded from the dated chart, not from lifetime recorded payments. Refund reconciliation remains pending.
          </p>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <RevenueChart data={paymentDateReport.verifiedTrends} />
            <BookingsChart data={bookingsTrends} />
          </div>

          {/* Service Breakdown and Booking Pipeline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ServiceBreakdownChart data={serviceBreakdown} />
            <BookingPipeline data={bookingPipeline} />
          </div>

          {/* Recent Activity and Pending Items */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <RecentActivity bookings={recentBookings} />
            <PendingItems
              pendingQuotes={pendingCounts.pendingQuotes}
              pendingApplications={pendingCounts.pendingApplications}
              pendingBookings={pendingCounts.pendingBookings}
            />
          </div>

          {/* Quick Actions */}
          <div className="mb-6">
            <QuickActions />
          </div>
        </AdminDashboardClient>
      </div>
    );
  } catch (error) {
    console.error("Error loading admin dashboard:", error);
    return (
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600">
            There was an error loading the dashboard data. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }
}
