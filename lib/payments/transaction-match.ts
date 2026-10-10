export type PaymentCandidate = {
  status?: unknown;
  reference?: unknown;
  amount?: unknown;
  currency?: unknown;
  metadata?: { booking_reference?: unknown } | null;
};

export function matchesBookingPayment(
  tx: PaymentCandidate | null | undefined,
  bookingReference: string,
  paymentReference: string,
  bookingTotal: number
): boolean {
  const cents = Math.round(bookingTotal * 100);
  return !!tx &&
    Number.isFinite(bookingTotal) && bookingTotal > 0 &&
    Number.isSafeInteger(cents) &&
    tx.status === "success" &&
    tx.reference === paymentReference &&
    tx.currency === "ZAR" &&
    tx.amount === cents &&
    tx.metadata?.booking_reference === bookingReference;
}

export function resolveCompletedPayment(
  storedReference: string | null | undefined,
  incomingReference: string
): "same" | "different" {
  return storedReference && storedReference === incomingReference ? "same" : "different";
}
