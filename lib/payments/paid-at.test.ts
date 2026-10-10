import assert from "node:assert/strict";
import { test } from "node:test";
import { verifiedPaidAt } from "./paid-at";

test("accepts verified Paystack paid_at with timezone", () => {
  assert.equal(verifiedPaidAt({ paid_at: "2026-10-10T14:22:10.000Z" }), "2026-10-10T14:22:10.000Z");
  assert.equal(verifiedPaidAt({ paid_at: "2026-10-10T16:22:10+02:00" }), "2026-10-10T14:22:10.000Z");
});
test("rejects unknown, unzoned, and invalid payment dates", () => {
  for (const paid_at of [null, undefined, "", "2026-10-10", "2026-10-10T14:22:10", "not-a-date", "2026-15-99T14:22:10Z"]) {
    assert.equal(verifiedPaidAt({ paid_at }), null);
  }
  assert.equal(verifiedPaidAt(null), null);
});
