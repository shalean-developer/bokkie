/**
 * Trust a payment completion timestamp only when provided by the verified
 * Paystack transaction. Never infer it from booking created_at or updated_at.
 */
export function verifiedPaidAt(tx: { paid_at?: unknown } | null | undefined): string | null {
  if (typeof tx?.paid_at !== "string") return null;
  const raw = tx.paid_at.trim();
  // Require an explicit timezone; local date strings are ambiguous.
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(raw)) return null;
  const millis = Date.parse(raw);
  if (!Number.isFinite(millis)) return null;
  return new Date(millis).toISOString();
}
