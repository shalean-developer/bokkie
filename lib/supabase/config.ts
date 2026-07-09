/**
 * Shared Supabase configuration helpers.
 * Safe to import from both server and client code.
 */

function readSupabaseUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

function readSupabaseAnonKey(): string | null {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!key) {
    return null;
  }

  // Reject obvious placeholders that sometimes end up in deployment env.
  if (/^(undefined|null|your[-_ ]?supabase|placeholder)$/i.test(key)) {
    return null;
  }

  return key;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(readSupabaseUrl() && readSupabaseAnonKey());
}

export function getSupabasePublicConfig(): {
  url: string;
  anonKey: string;
} | null {
  const url = readSupabaseUrl();
  const anonKey = readSupabaseAnonKey();

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}
