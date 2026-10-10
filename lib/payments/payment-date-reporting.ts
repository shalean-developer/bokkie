export type CompletedPaymentRow = { total_amount: number | string | null; paid_at: string | null };
export type PaymentDateSummary = {
  verifiedPeriodRevenue: number;
  verifiedPeriodCount: number;
  undatedHistoricalRevenue: number;
  undatedHistoricalCount: number;
  lifetimeRecordedPayments: number;
  lifetimeCompletedCount: number;
  verifiedTrends: { date: string; revenue: number }[];
};

/** Preserve undated completed payments separately; never assign booking created_at to payment date. */
export function summarizeCompletedPayments(
  rows: CompletedPaymentRow[],
  periodStart: string,
  periodEnd: string
): PaymentDateSummary {
  const start = Date.parse(periodStart);
  const end = Date.parse(periodEnd);
  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end) throw new Error("Invalid payment reporting period");
  let verifiedPeriodRevenue = 0, verifiedPeriodCount = 0;
  let undatedHistoricalRevenue = 0, undatedHistoricalCount = 0;
  let lifetimeRecordedPayments = 0;
  const trends = new Map<string, number>();
  for (const row of rows) {
    const amount = Number(row.total_amount);
    if (!Number.isFinite(amount)) throw new Error("Invalid completed payment amount");
    lifetimeRecordedPayments += amount;
    if (!row.paid_at) {
      undatedHistoricalRevenue += amount;
      undatedHistoricalCount++;
      continue;
    }
    const date = Date.parse(row.paid_at);
    if (!Number.isFinite(date)) throw new Error("Invalid verified paid_at");
    if (date < start || date > end) continue;
    verifiedPeriodRevenue += amount;
    verifiedPeriodCount++;
    const day = new Date(date).toISOString().slice(0, 10);
    trends.set(day, (trends.get(day) ?? 0) + amount);
  }
  return {
    verifiedPeriodRevenue, verifiedPeriodCount,
    undatedHistoricalRevenue, undatedHistoricalCount,
    lifetimeRecordedPayments, lifetimeCompletedCount: rows.length,
    verifiedTrends: [...trends].map(([date, revenue]) => ({ date, revenue })).sort((a,b) => a.date.localeCompare(b.date)),
  };
}
