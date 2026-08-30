"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";

export interface DiscountCode {
  id: string;
  code: string;
  description: string | null;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minimumOrderAmount: number;
  maximumDiscountAmount: number | null;
  validFrom: string;
  validUntil: string | null;
  usageLimit: number | null;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

function mapDatabaseToDiscountCode(data: any): DiscountCode {
  return {
    id: data.id,
    code: data.code,
    description: data.description,
    discountType: data.discount_type,
    discountValue: parseFloat(data.discount_value || 0),
    minimumOrderAmount: parseFloat(data.minimum_order_amount || 0),
    maximumDiscountAmount: data.maximum_discount_amount ? parseFloat(data.maximum_discount_amount) : null,
    validFrom: data.valid_from,
    validUntil: data.valid_until,
    usageLimit: data.usage_limit,
    usageCount: data.usage_count || 0,
    isActive: data.is_active ?? true,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function getAllDiscountCodes(): Promise<DiscountCode[]> {
  await requireAdmin();
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("discount_codes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching discount codes:", error);
    throw new Error(`Failed to fetch discount codes: ${error.message}`);
  }

  return (data || []).map(mapDatabaseToDiscountCode);
}

export async function getDiscountCodeStats() {
  await requireAdmin();
  const supabase = createServiceRoleClient();
  const [totalResult, activeResult, expiredResult] = await Promise.all([
    supabase.from("discount_codes").select("*", { count: "exact", head: true }),
    supabase.from("discount_codes").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("discount_codes").select("*", { count: "exact", head: true }).not("valid_until", "is", null).lt("valid_until", new Date().toISOString()),
  ]);

  const { data: usageData } = await supabase
    .from("discount_code_usage")
    .select("discount_amount", { count: "exact", head: true });

  return {
    total: totalResult.count || 0,
    active: activeResult.count || 0,
    expired: expiredResult.count || 0,
    totalUsage: usageData?.length || 0,
  };
}

export interface CreateDiscountCodeInput {
  code: string;
  description?: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number | null;
  validFrom?: string;
  validUntil?: string | null;
  usageLimit?: number | null;
  isActive?: boolean;
}

export interface CreateDiscountCodeResult {
  success: boolean;
  message: string;
  data?: DiscountCode;
}

export async function createDiscountCode(
  input: CreateDiscountCodeInput
): Promise<CreateDiscountCodeResult> {
  await requireAdmin();
  const supabase = createServiceRoleClient();

  if (!input.code || !input.code.trim()) {
    return { success: false, message: "Discount code is required" };
  }

  if (!input.discountType || !input.discountValue) {
    return { success: false, message: "Discount type and value are required" };
  }

  if (input.discountType === "percentage" && (input.discountValue < 0 || input.discountValue > 100)) {
    return { success: false, message: "Percentage discount must be between 0 and 100" };
  }

  if (input.discountType === "fixed" && input.discountValue < 0) {
    return { success: false, message: "Fixed discount amount must be positive" };
  }

  try {
    let validFrom = new Date().toISOString();
    if (input.validFrom && input.validFrom.trim()) {
      const date = new Date(input.validFrom);
      if (!isNaN(date.getTime())) validFrom = date.toISOString();
    }

    let validUntil: string | null = null;
    if (input.validUntil && input.validUntil.trim()) {
      const date = new Date(input.validUntil);
      if (!isNaN(date.getTime())) validUntil = date.toISOString();
    }

    const { data, error } = await supabase
      .from("discount_codes")
      .insert({
        code: input.code.trim().toUpperCase(),
        description: input.description || null,
        discount_type: input.discountType,
        discount_value: input.discountValue,
        minimum_order_amount: input.minimumOrderAmount || 0,
        maximum_discount_amount: input.maximumDiscountAmount || null,
        valid_from: validFrom,
        valid_until: validUntil,
        usage_limit: input.usageLimit || null,
        is_active: input.isActive !== undefined ? input.isActive : true,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, message: "A discount code with this name already exists" };
      }
      console.error("Error creating discount code:", error);
      return { success: false, message: `Failed to create discount code: ${error.message}` };
    }

    return {
      success: true,
      message: "Discount code created successfully",
      data: mapDatabaseToDiscountCode(data),
    };
  } catch (error: any) {
    console.error("Error creating discount code:", error);
    return { success: false, message: `Failed to create discount code: ${error.message || "Unknown error"}` };
  }
}
