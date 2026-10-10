import assert from "node:assert/strict";
import test from "node:test";
import { assertEmailSendingAllowed } from "./staging-guards";

test("staging blocks outbound email regardless of API key", () => {
  assert.throws(
    () => assertEmailSendingAllowed({ BOKKIE_APP_ENV: "staging", RESEND_API_KEY: "configured" }),
    /Staging email sending is disabled/,
  );
});

test("production does not block normal email flow", () => {
  assert.doesNotThrow(() => assertEmailSendingAllowed({ BOKKIE_APP_ENV: "production" }));
});
