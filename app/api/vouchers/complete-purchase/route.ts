import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { settleVoucherPayment } from "@/lib/payments/voucher-settlement";
export async function POST(request: NextRequest) {
 try {
  const { data: { user } } = await (await createClient()).auth.getUser();
  if (!user) return NextResponse.json({success:false,message:"Please log in"},{status:401});
  const { reference, voucher_id } = await request.json();
  await settleVoucherPayment(reference,user.id,voucher_id);
  return NextResponse.json({success:true,message:"Voucher purchase confirmed"});
 } catch {
  return NextResponse.json({success:false,message:"Voucher payment could not be verified or settled"},{status:400});
 }
}
