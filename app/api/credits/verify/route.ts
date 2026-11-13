import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { settleCreditPayment } from "@/lib/payments/credit-settlement";

export async function POST(request: NextRequest) {
  try {
    const { data: { user } } = await (await createClient()).auth.getUser();
    if (!user) return NextResponse.json({ success: false, message: "Please log in" }, { status: 401 });
    const { reference } = await request.json();
    const result = await settleCreditPayment(reference, user.id);
    return NextResponse.json({ success: true, message: "Credits allocated", ...result });
  } catch {
    return NextResponse.json({ success: false, message: "Credit payment could not be verified or settled" }, { status: 400 });
  }
}
