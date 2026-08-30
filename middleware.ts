import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const CANONICAL_HOST = "bokkiecleaning.co.za";
const LEGACY_WWW_HOST = "www.bokkiecleaning.co.za";

const LEGACY_BOOKING_SERVICE_MAP: Record<string, string> = {
  standard: "regular-cleaning",
  deep: "deep-cleaning",
  "move-in-out": "moving-cleaning",
  office: "office-cleaning",
  airbnb: "airbnb-cleaning",
  "carpet-cleaning": "carpet-cleaning",
};

function getCanonicalBookPath(pathname: string): string | null {
  const match = pathname.match(
    /^\/booking\/service\/([^/]+)(?:\/(details|schedule|review))?\/?$/
  );

  if (!match) return null;

  const bookSlug = LEGACY_BOOKING_SERVICE_MAP[match[1]];
  return bookSlug ? `/book/${bookSlug}` : "/book";
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase();

  if (host === LEGACY_WWW_HOST) {
    const canonicalUrl = request.nextUrl.clone();
    canonicalUrl.protocol = "https";
    canonicalUrl.host = CANONICAL_HOST;
    canonicalUrl.port = "";

    return NextResponse.redirect(canonicalUrl, 308);
  }

  // Book v2 is the only active booking-entry flow. Keep legacy confirmation,
  // retry-payment and quote URLs available only for existing-booking compatibility.
  const canonicalBookPath = getCanonicalBookPath(request.nextUrl.pathname);
  if (canonicalBookPath) {
    const canonicalUrl = request.nextUrl.clone();
    canonicalUrl.pathname = canonicalBookPath;
    canonicalUrl.search = "";
    return NextResponse.redirect(canonicalUrl, 308);
  }

  try {
    return await updateSession(request);
  } catch (error) {
    console.error("Middleware invocation error:", error);
    return NextResponse.next({
      request,
    });
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
