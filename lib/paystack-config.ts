/** Server-side Paystack configuration. Production is always live-only. */
export function getPaystackMode(): "live" | "test" {
  return process.env.NODE_ENV === "production" ? "live" : "test";
}

function getKeyPair() {
  const publicKey = process.env.PAYSTACK_PUBLIC_KEY?.trim();
  const secretKey = process.env.PAYSTACK_SECRET_KEY?.trim();
  const mode = getPaystackMode();
  if (!publicKey || !secretKey) return null;
  if (/your_public_key|your_secret|placeholder|xxx/i.test(publicKey + secretKey)) return null;
  if (!new RegExp("^pk_" + mode + "_[a-zA-Z0-9]+$").test(publicKey)) return null;
  if (!new RegExp("^sk_" + mode + "_[a-zA-Z0-9]+$").test(secretKey)) return null;
  return { publicKey, secretKey };
}

export function getPaystackPublicKey(): string | null {
  return getKeyPair()?.publicKey ?? null;
}

export function getPaystackSecretKey(): string | null {
  return getKeyPair()?.secretKey ?? null;
}

export function getPaystackConfigError(): string {
  return "Online payment is temporarily unavailable. Please contact support.";
}
