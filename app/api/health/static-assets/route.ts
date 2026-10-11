import { NextRequest, NextResponse } from "next/server";
import { stat } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

/** Staging-only read-only probe. Never exposes file contents or filesystem paths. */
export async function GET(request: NextRequest) {
  if (process.env.BOKKIE_APP_ENV !== "staging") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const file = new URL(request.url).searchParams.get("file") ?? "";
  if (!/^[a-f0-9]{16}\.js$/.test(file)) {
    return NextResponse.json({ error: "Invalid chunk name" }, { status: 400 });
  }
  try {
    const info = await stat(path.join(process.cwd(), ".next", "static", "chunks", file));
    return NextResponse.json(
      { exists: info.isFile(), size: info.size, appEnv: "staging" },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { exists: false, appEnv: "staging" },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
}
