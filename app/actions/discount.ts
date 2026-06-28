"use server";

import { createClient } from "@/lib/supabase/server";

export interface DiscountCodeValidationResult {
  success: boolean;
  discountAmount: number;
  discountType: string | null;
  discountValue: number | null;
  message: string;
}

export interface PublicDiscountCode {
  code: string;
  description: string | null;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minimumOrderAmount: number;
  maximumDiscountAmount: number | null;
  validUntil: string | null;
}

/**
 * Fetch active discount codes for public display
 */
export async function getPublicDiscountCodes(): Promise<PublicDiscountCode[]> {
  try {
    const supabase = await createClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("discount_codes")
      .select(
        "code, description, discount_type, discount_value, minimum_order_amount, maximum_discount_amount, valid_until, valid_from, usage_limit, usage_count"
      )
      .eq("is_active", true)
      .lte("valid_from", now)
      .or(`valid_until.is.null,valid_until.gte.${now}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching public discount codes:", error);
      return [];
    }

    return (data || [])
      .filter(
        (code) =>
          !code.usage_limit || (code.usage_count ?? 0) < code.usage_limit
      )
      .map((code) => ({
        code: code.code,
        description: code.description,
        discountType: code.discount_type as "percentage" | "fixed",
        discountValue: Number(code.discount_value),
        minimumOrderAmount: Number(code.minimum_order_amount ?? 0),
        maximumDiscountAmount: code.maximum_discount_amount
          ? Number(code.maximum_discount_amount)
          : null,
        validUntil: code.valid_until,
      }));
  } catch (error) {
    console.error("Error fetching public discount codes:", error);
    return [];
  }
}

/**
 * Validate a discount code
 */
export async function validateDiscountCode(
  code: string,
  orderTotal: number
): Promise<DiscountCodeValidationResult> {
  if (!code || !code.trim()) {
    return {
      success: false,
      discountAmount: 0,
      discountType: null,
      discountValue: null,
      message: "Please enter a discount code",
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("validate_discount_code", {
      p_code: code.trim().toUpperCase(),
      p_order_total: orderTotal,
    });

    if (error) {
      console.error("Error validating discount code:", error);
      return {
        success: false,
        discountAmount: 0,
        discountType: null,
        discountValue: null,
        message: "Error validating discount code. Please try again.",
      };
    }

    if (!data || data.length === 0) {
      return {
        success: false,
        discountAmount: 0,
        discountType: null,
        discountValue: null,
        message: "Invalid or expired discount code",
      };
    }

    const result = data[0];
    return {
      success: result.is_valid,
      discountAmount: Number(result.discount_amount) || 0,
      discountType: result.discount_type,
      discountValue: result.discount_value ? Number(result.discount_value) : null,
      message: result.message || "",
    };
  } catch (error) {
    console.error("Error validating discount code:", error);
    return {
      success: false,
      discountAmount: 0,
      discountType: null,
      discountValue: null,
      message: "Error validating discount code. Please try again.",
    };
  }
}

/**
 * Record discount code usage after successful booking
 */
export async function recordDiscountCodeUsage(
  code: string,
  bookingReference: string,
  userEmail: string,
  discountAmount: number,
  orderTotal: number
): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("record_discount_code_usage", {
      p_code: code.trim().toUpperCase(),
      p_booking_reference: bookingReference,
      p_user_email: userEmail,
      p_discount_amount: discountAmount,
      p_order_total: orderTotal,
    });

    if (error) {
      console.error("Error recording discount code usage:", error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error("Error recording discount code usage:", error);
    return false;
  }
}



























