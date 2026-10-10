import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { summarizeCreditMovements } from "./credit-movement-reporting";

/** Internal read-only report; not a public endpoint or a balance mutator. */
export async function getUserCreditMovementReport(userId: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(userId)) throw new Error("Invalid user ID");
  const db = createServiceRoleClient();
  const fetchAll = async (table: "credit_transactions" | "voucher_usage_history", fields: string) => {
    const rows: Record<string, unknown>[] = [];
    for (let offset = 0; ; offset += 500) {
      const q = db.from(table).select(fields).eq("user_id", userId)
        .order("created_at", { ascending: true }).range(offset, offset + 499);
      const { data, error } = await q;
      if (error) throw new Error("Credit movement history unavailable");
      rows.push(...(data ?? []));
      if (!data || data.length < 500) break;
    }
    return rows;
  };
  const [transactions, vouchers, balance] = await Promise.all([
    fetchAll("credit_transactions", "id,transaction_type,status,amount,balance_before,balance_after,created_at"),
    fetchAll("voucher_usage_history", "id,voucher_type,value,created_at"),
    db.from("user_credits").select("balance").eq("user_id", userId).maybeSingle(),
  ]);
  if (balance.error || !balance.data) throw new Error("Credit balance unavailable");
  return summarizeCreditMovements(
    transactions as Parameters<typeof summarizeCreditMovements>[0],
    vouchers as Parameters<typeof summarizeCreditMovements>[1],
    0, balance.data.balance,
  );
}
