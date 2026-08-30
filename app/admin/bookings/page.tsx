"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  Calendar,
  Eye,
  Filter,
  Mail,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
} from "lucide-react";
import type { Booking } from "@/lib/types/booking";
import { getBookingStats } from "@/app/actions/admin-bookings";
import {
  getAdminBookingsPage,
  type AdminBookingSort,
  type AdminBookingStatusFilter,
  type AdminBookingViewMode,
  type AdminCleanerResponseFilter,
  type AdminPaymentStatusFilter,
} from "@/app/actions/admin-bookings-paged";
import StatusBadge from "@/components/dashboard/StatusBadge";
import PaymentStatusBadge from "@/components/dashboard/PaymentStatusBadge";

const PAGE_SIZE = 25;

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminBookingStatusFilter>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<AdminPaymentStatusFilter>("all");
  const [cleanerResponseFilter, setCleanerResponseFilter] = useState<AdminCleanerResponseFilter>("all");
  const [viewMode, setViewMode] = useState<AdminBookingViewMode>("all");
  const [sortBy, setSortBy] = useState<AdminBookingSort>("date-desc");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchQuery(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;

    const loadBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getAdminBookingsPage({
          page,
          pageSize: PAGE_SIZE,
          search: searchQuery,
          status: statusFilter,
          paymentStatus: paymentStatusFilter,
          cleanerResponse: cleanerResponseFilter,
          viewMode,
          sort: sortBy,
        });

        if (cancelled) return;
        setBookings(result.bookings);
        setTotal(result.total);
        setTotalPages(result.totalPages);
        if (page > result.totalPages) setPage(result.totalPages);
      } catch (loadError) {
        if (cancelled) return;
        console.error("Error fetching bookings:", loadError);
        setError(loadError instanceof Error ? loadError.message : "Failed to load bookings");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadBookings();
    return () => {
      cancelled = true;
    };
  }, [page, searchQuery, statusFilter, paymentStatusFilter, cleanerResponseFilter, viewMode, sortBy, refreshToken]);

  useEffect(() => {
    let cancelled = false;
    getBookingStats()
      .then((result) => {
        if (!cancelled) setStats(result);
      })
      .catch((statsError) => console.error("Error fetching booking stats:", statsError));
    return () => {
      cancelled = true;
    };
  }, [refreshToken]);

  const resetToFirstPage = () => setPage(1);

  const clearFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setStatusFilter("all");
    setPaymentStatusFilter("all");
    setCleanerResponseFilter("all");
    setViewMode("all");
    setSortBy("date-desc");
    setPage(1);
  };

  const hasFilters =
    Boolean(searchQuery) ||
    statusFilter !== "all" ||
    paymentStatusFilter !== "all" ||
    cleanerResponseFilter !== "all" ||
    viewMode !== "all";

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not scheduled";
    return new Date(dateString).toLocaleDateString("en-ZA", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = Number.parseInt(hours, 10);
    return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? "PM" : "AM"}`;
  };

  const formatServiceType = (service: string) =>
    service
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const firstResult = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastResult = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Bookings</h1>
          <div className="flex items-center gap-3">
            <Link
              href="/booking/service/standard/details"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-2xl hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create New Booking
            </Link>
            <button
              onClick={() => setRefreshToken((value) => value + 1)}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-2xl hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>
        <p className="text-sm md:text-base text-gray-600">Manage and view all customer bookings</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Pending" value={stats.byStatus.pending || 0} />
          <StatCard label="Completed" value={stats.byStatus.completed || 0} />
          <StatCard label="Paid" value={stats.byPaymentStatus.completed || 0} />
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 mb-4 md:mb-6">
        <div className="space-y-3 md:space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search reference, customer, service, email, phone or address..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="flex flex-col md:flex-row md:flex-wrap md:items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as AdminBookingStatusFilter);
                resetToFirstPage();
              }}
              className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={paymentStatusFilter}
              onChange={(event) => {
                setPaymentStatusFilter(event.target.value as AdminPaymentStatusFilter);
                resetToFirstPage();
              }}
              className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white"
            >
              <option value="all">All Payments</option>
              <option value="pending">Payment Pending</option>
              <option value="completed">Paid</option>
              <option value="failed">Payment Failed</option>
            </select>

            <select
              value={cleanerResponseFilter ?? "all"}
              onChange={(event) => {
                setCleanerResponseFilter(event.target.value as AdminCleanerResponseFilter);
                resetToFirstPage();
              }}
              className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white"
            >
              <option value="all">All Responses</option>
              <option value="no-response">No Response</option>
              <option value="accepted">Accepted</option>
              <option value="declined">Declined</option>
            </select>

            <select
              value={viewMode}
              onChange={(event) => {
                setViewMode(event.target.value as AdminBookingViewMode);
                resetToFirstPage();
              }}
              className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white"
            >
              <option value="all">All Bookings</option>
              <option value="recurring">Recurring Only</option>
              <option value="one-time">One-Time Only</option>
            </select>

            <div className="flex items-center gap-2 md:ml-auto">
              <ArrowUpDown className="w-4 h-4 text-gray-600" />
              <select
                value={sortBy}
                onChange={(event) => {
                  setSortBy(event.target.value as AdminBookingSort);
                  resetToFirstPage();
                }}
                className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="amount-desc">Amount High-Low</option>
                <option value="amount-asc">Amount Low-High</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs md:text-sm text-gray-600">
            <span>
              Showing {firstResult}-{lastResult} of {total} matching booking{total === 1 ? "" : "s"}
            </span>
            {hasFilters && (
              <button onClick={clearFilters} className="text-blue-600 hover:text-blue-700 font-medium underline">
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="block md:hidden space-y-3">
        {loading ? (
          <LoadingState />
        ) : bookings.length === 0 ? (
          <EmptyState hasFilters={hasFilters} />
        ) : (
          bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-mono text-gray-900">
                    {booking.bookingReference}
                    {booking.isRecurring && <RotateCcw className="w-3.5 h-3.5 text-blue-600" />}
                  </div>
                  <div className="font-semibold text-gray-900 mt-1">
                    {booking.firstName} {booking.lastName}
                  </div>
                  <div className="text-sm text-gray-600">{formatServiceType(booking.service)}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={booking.status} />
                  <PaymentStatusBadge paymentStatus={booking.paymentStatus} />
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {formatDate(booking.scheduledDate)} {formatTime(booking.scheduledTime)}
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span>{booking.streetAddress}, {booking.suburb}, {booking.city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="break-all">{booking.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {booking.phone}
                </div>
              </div>

              <div className="flex items-end justify-between mt-4 pt-3 border-t border-gray-200">
                <div>
                  <div className="text-xs text-gray-500">Amount</div>
                  <div className="font-bold text-gray-900">R{booking.totalAmount.toFixed(2)}</div>
                </div>
                <Link
                  href={`/admin/bookings/${booking.bookingReference}`}
                  className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                >
                  <Eye className="w-4 h-4" />
                  View
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <LoadingState />
        ) : bookings.length === 0 ? (
          <EmptyState hasFilters={hasFilters} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <TableHeader>Reference</TableHeader>
                  <TableHeader>Customer</TableHeader>
                  <TableHeader>Service</TableHeader>
                  <TableHeader>Date / Time</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Payment</TableHeader>
                  <TableHeader>Amount</TableHeader>
                  <TableHeader>Action</TableHeader>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm font-mono text-gray-900">
                        {booking.bookingReference}
                        {booking.isRecurring && <RotateCcw className="w-3.5 h-3.5 text-blue-600" />}
                      </div>
                      <div className="text-xs text-gray-500">{formatDate(booking.createdAt)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{booking.firstName} {booking.lastName}</div>
                      <div className="text-xs text-gray-500">{booking.email}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatServiceType(booking.service)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(booking.scheduledDate)}</div>
                      <div className="text-xs text-gray-500">{formatTime(booking.scheduledTime)}</div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={booking.status} /></td>
                    <td className="px-4 py-3"><PaymentStatusBadge paymentStatus={booking.paymentStatus} /></td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">R{booking.totalAmount.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/bookings/${booking.bookingReference}`}
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={loading || page <= 1}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-40"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>
          <button
            type="button"
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            disabled={loading || page >= totalPages}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-40"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
      <div className="text-xs md:text-sm text-gray-600 mb-1">{label}</div>
      <div className="text-xl md:text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{children}</th>;
}

function LoadingState() {
  return (
    <div className="p-10 text-center text-gray-600">
      <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-3 text-blue-600" />
      Loading bookings...
    </div>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="p-10 text-center">
      <Filter className="w-10 h-10 text-gray-400 mx-auto mb-3" />
      <p className="font-semibold text-gray-900">No bookings found</p>
      <p className="text-sm text-gray-600 mt-1">
        {hasFilters ? "Try adjusting your search or filters." : "No bookings have been created yet."}
      </p>
    </div>
  );
}
