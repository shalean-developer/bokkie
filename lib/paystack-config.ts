/**
 * Validates Paystack public key from environment.
 * Rejects empty values and common placeholder strings.
 */
export function getPaystackPublicKey(): string | null {
  const key = process.env.PAYSTACK_PUBLIC_KEY?.trim();
  if (!key) return null;
  if (/your_public_key|your_secret|placeholder|xxx/i.test(key)) return null;
  if (!/^pk_(test|live)_[a-zA-Z0-9]+/.test(key)) return null;
  return key;
}

export function getPaystackSecretKey(): string | null {
  const key = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!key) return null;
  if (/your_public_key|your_secret|placeholder|xxx/i.test(key)) return null;
  if (!/^sk_(test|live)_[a-zA-Z0-9]+/.test(key)) return null;
  return key;
}

export function getPaystackConfigError(): string {
  return "Payment is not configured. Add valid PAYSTACK_PUBLIC_KEY and PAYSTACK_SECRET_KEY to .env.local and restart the dev server.";
}
