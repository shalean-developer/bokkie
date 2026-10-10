import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getSupabaseRef() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;

  try {
    const host = new URL(url).hostname;
    return host.endsWith(".supabase.co")
      ? host.slice(0, -".supabase.co".length)
      : host;
  } catch {
    return null;
  }
}

function getPaystackMode() {
  const key = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
  if (!key) return "unconfigured";
  if (key.startsWith("pk_live_")) return "live";
  if (key.startsWith("pk_test_")) return "test";
  return "unknown";
}

export async function GET() {
  const configuredRef = getSupabaseRef();
  const expectedRef = process.env.EXPECTED_SUPABASE_REF ?? null;
  const issues: string[] = [];

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    issues.push("NEXT_PUBLIC_SUPABASE_URL missing");
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    issues.push("NEXT_PUBLIC_SUPABASE_ANON_KEY missing");
  }

  if (expectedRef && configuredRef && expectedRef !== configuredRef) {
    issues.push("Supabase project mismatch");
  }

  return NextResponse.json(
    {
      status: issues.length === 0 ? "ok" : "degraded",
      service: "bokkie-environment",
      timestamp: new Date().toISOString(),
      deployment: process.env.BOKKIE_APP_ENV ?? process.env.NODE_ENV ?? "unknown",
      releaseSha: process.env.RELEASE_SHA ?? null,
      supabase: {
        configuredRef,
        expectedRef,
        configured: Boolean(
          process.env.NEXT_PUBLIC_SUPABASE_URL &&
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ),
      },
      paystack: {
        publicMode: getPaystackMode(),
      },
      messaging: {
        resendConfigured: Boolean(process.env.RESEND_API_KEY),
      },
      issues,
    },
    { status: issues.length === 0 ? 200 : 503 }
  );
}
