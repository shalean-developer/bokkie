import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { matchesBookingPayment, resolveCompletedPayment } from "./transaction-match";

const booking = "BOK-FIXTURE-001";
const reference = "test-transaction-fixture";
const valid = {
  status: "success", reference, amount: 47000, currency: "ZAR",
  metadata: { booking_reference: booking }
};
describe("Bokkie Paystack payment invariants (no network or database)", () => {
  it("accepts exact amount, currency, identity and metadata", () => {
    assert.equal(matchesBookingPayment(valid, booking, reference, 470), true);
  });
  it("rejects mismatched transaction reference", () => {
    assert.equal(matchesBookingPayment({ ...valid, reference: "other" }, booking, reference, 470), false);
  });
  it("rejects wrong amount and currency", () => {
    assert.equal(matchesBookingPayment({ ...valid, amount: 1 }, booking, reference, 470), false);
    assert.equal(matchesBookingPayment({ ...valid, currency: "USD" }, booking, reference, 470), false);
  });
  it("rejects failed or pending transactions", () => {
    for (const status of ["failed", "pending", "abandoned"]) {
      assert.equal(matchesBookingPayment({ ...valid, status }, booking, reference, 470), false);
    }
  });
  it("rejects absent or different booking metadata", () => {
    assert.equal(matchesBookingPayment({ ...valid, metadata: null }, booking, reference, 470), false);
    assert.equal(matchesBookingPayment({ ...valid, metadata: { booking_reference: "other" } }, booking, reference, 470), false);
  });
  it("rejects invalid totals", () => {
    for (const total of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      assert.equal(matchesBookingPayment(valid, booking, reference, total), false);
    }
  });
  it("repeated completed reference is idempotently classified, other reference is rejected", () => {
    assert.equal(resolveCompletedPayment(reference, reference), "same");
    assert.equal(resolveCompletedPayment(reference, "different"), "different");
    assert.equal(resolveCompletedPayment(null, reference), "different");
  });
});
