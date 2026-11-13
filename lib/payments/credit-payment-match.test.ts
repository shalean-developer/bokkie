import { test } from "node:test";
import assert from "node:assert/strict";
import { matchesCreditPayment, creditAmountInCents } from "./credit-payment-match";

const intent = { reference: "credit-fixture", user_id: "fixture", email: "Owner@example.com", amount_cents: 10000, environment: "test" };
const tx = { reference: intent.reference, status: "success", domain: "test", currency: "ZAR", amount: 10000, customer: {email:"owner@example.com"} };
test("verified payment matches the saved intent", () => assert.equal(matchesCreditPayment(tx,intent),true));
for (const [name, change] of Object.entries({
  "failed charge": {status:"failed"}, "different reference":{reference:"credit-other"},
  "underpayment":{amount:9999}, "overpayment":{amount:10001}, "different currency":{currency:"USD"},
  "live charge in test":{domain:"live"}, "missing environment":{domain:undefined},
  "missing customer":{customer:{}}, "different customer":{customer:{email:"other@example.com"}},
  "string amount":{amount:"10000"},
})) test(`rejects ${name}`, () => assert.equal(matchesCreditPayment({...tx,...change},intent),false));
test("amount validation rejects invalid, fractional-cent and out-of-range amounts", () => {
  for (const value of [NaN,Infinity,-1,0,19.99,5000.01,20.001]) assert.throws(()=>creditAmountInCents(value));
  assert.equal(creditAmountInCents(20.01),2001);
});
