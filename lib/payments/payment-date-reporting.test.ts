import { test } from "node:test";
import assert from "node:assert/strict";
import { summarizeCompletedPayments } from "./payment-date-reporting";

test("separates verified date revenue from undated historical payments", () => {
  const result = summarizeCompletedPayments([
    {total_amount: "590", paid_at: null},
    {total_amount: "470", paid_at: null},
    {total_amount: "2350", paid_at: "2026-10-10T17:01:30Z"},
    {total_amount: "100", paid_at: "2026-10-09T23:00:00Z"}
  ], "2026-10-10T00:00:00Z", "2026-10-10T23:59:59Z");
  assert.equal(result.verifiedPeriodRevenue, 2350);
  assert.equal(result.verifiedPeriodCount, 1);
  assert.equal(result.undatedHistoricalRevenue, 1060);
  assert.equal(result.undatedHistoricalCount, 2);
  assert.equal(result.lifetimeRecordedPayments, 3510);
  assert.equal(result.lifetimeCompletedCount, 4);
  assert.deepEqual(result.verifiedTrends, [{date:"2026-10-10",revenue:2350}]);
});
test("rejects invalid paid_at instead of inventing a date", () => {
  assert.throws(() => summarizeCompletedPayments([{total_amount:10,paid_at:"bad"}],"2026-10-10","2026-10-11"));
});
