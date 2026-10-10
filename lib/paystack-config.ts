function validKey(value: string | undefined, prefix: "pk" | "sk"): string | null {
  const key = value?.trim();
  if (!key || /your_public_key|your_secret|placeholder|xxx/i.test(key)) return null;
  if (!new RegExp(`^${prefix}_(test|live)_[a-zA-Z0-9]+$`).test(key)) return null;
  if (process.env.BOKKIE_APP_ENV === "staging" && !key.startsWith(`${prefix}_test_`)) return null;
  return key;
}

export function getPaystackPublicKey(): string | null {
  return validKey(process.env.PAYSTACK_PUBLIC_KEY, "pk");
}

export function getPaystackSecretKey(): string | null {
  return validKey(process.env.PAYSTACK_SECRET_KEY, "sk");
}

export function getPaystackConfigError(): string {
  return "Payment is not configured with valid credentials for this environment.";
}
