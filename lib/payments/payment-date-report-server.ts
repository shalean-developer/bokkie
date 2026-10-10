import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { summarizeCompletedPayments, type CompletedPaymentRow } from "./payment-date-reporting";

/** Read-only source-of-truth report. Not yet wired into legacy dashboard. */
export async function getPaymentDateReport(periodStart: string, periodEnd: string) {
  const db = createServiceRoleClient();
  const rows: CompletedPaymentRow[] = [];
  const pageSize = 500;
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await db.from("bookings")
      .select("total_amount, paid_at")
      .eq("payment_status", "completed")
      .order("id", { ascending: true })
      .range(offset, offset + pageSize - 1);
    if (error) throw new Error(`Payment date report unavailable: ${error.message}`);
    rows.push(...(data ?? []));
    if (!data || data.length < pageSize) break;
  }
  return summarizeCompletedPayments(rows, periodStart, periodEnd);
}
