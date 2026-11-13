"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { CreditTransaction, mapDatabaseToCreditTransaction } from "@/lib/storage/credits-supabase";
import { randomUUID } from "node:crypto";
import { creditAmountInCents } from "@/lib/payments/credit-payment-match";
import { getPaystackSecretKey, getPaystackPublicKey } from "@/lib/paystack-config";
import { EFTPaymentSubmission } from "@/lib/storage/eft-supabase";
import { submitEFTPayment, getUserEFTSubmissions } from "@/lib/storage/eft-supabase";

export interface CreditActionResult {
  success: boolean;
  error?: string;
  balance?: number;
  transactionId?: string;
}

export interface GetCreditTransactionsResult {
  success: boolean;
  error?: string;
  transactions?: CreditTransaction[];
}

export interface CreditPurchaseInitResult {
  success: boolean;
  message?: string;
  publicKey?: string;
  amount?: number;
  email?: string;
  reference?: string;
}

export interface GetCreditBalanceResult {
  success: boolean;
  error?: string;
  balance?: number;
}

export interface EFTPaymentResult {
  success: boolean;
  error?: string;
  submissionId?: string;
}

export interface GetEFTSubmissionsResult {
  success: boolean;
  error?: string;
  submissions?: EFTPaymentSubmission[];
}

export interface VerifyEFTPaymentResult {
  success: boolean;
  error?: string;
  message?: string;
}

/**
 * Get credit transactions for the current user
 */
export async function getCreditTransactionsAction(
  limit: number = 50
): Promise<GetCreditTransactionsResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "User must be logged in to view transactions",
      };
    }

    const { data, error } = await supabase
      .from("credit_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Failed to fetch credit transactions:", error);
      return {
        success: false,
        error: `Failed to fetch transactions: ${error.message}`,
      };
    }

    const transactions = (data || []).map(mapDatabaseToCreditTransaction);

    return {
      success: true,
      transactions,
    };
  } catch (error) {
    console.error("Error fetching credit transactions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch transactions",
    };
  }
}

/**
 * Initialize credit purchase payment
 */
export async function initializeCreditPurchase(
  amount: number
): Promise<CreditPurchaseInitResult> {
  try {
    if (!getPaystackPublicKey() || !getPaystackSecretKey()) {
      return {
        success: false,
        message: "Payment gateway is not configured",
      };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return {
        success: false,
        message: "User must be logged in to purchase credits",
      };
    }

    // Validate amount
    if (!Number.isFinite(amount) || amount < 20 || amount > 5000 || Math.abs(amount * 100 - Math.round(amount * 100)) > 0.000001) {
      return {
        success: false,
        message: "Amount must be between R20 and R5000",
      };
    }

    // Generate payment reference
    const reference = `credit-${randomUUID()}`;

    // Convert amount to cents (Paystack uses smallest currency unit)
    // Round to ensure we have a valid integer (Paystack requirement)
    const amountInCents = creditAmountInCents(amount);
    const secret = getPaystackSecretKey()!;
    const { error: intentError } = await createServiceRoleClient().from("credit_payment_intents").insert({
      reference, user_id: user.id, email: user.email.toLowerCase(), amount_cents: amountInCents,
      environment: secret.startsWith("sk_test_") ? "test" : "live",
    });
    if (intentError) throw new Error("Unable to save credit purchase intent");

    return {
      success: true,
      publicKey: getPaystackPublicKey()!,
      amount: amountInCents,
      email: user.email,
      reference,
    };
  } catch (error) {
    console.error("Error initializing credit purchase:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to initialize payment",
    };
  }
}

/**
 * Get user credit balance
 */
export async function getUserCreditBalanceAction(): Promise<GetCreditBalanceResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "User must be logged in to view balance",
      };
    }

    const { data, error } = await supabase
      .from("user_credits")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    if (error) {
      // If no record exists, return 0 balance
      if (error.code === "PGRST116") {
        return {
          success: true,
          balance: 0,
        };
      }
      console.error("Failed to fetch credit balance:", error);
      return {
        success: false,
        error: `Failed to fetch balance: ${error.message}`,
      };
    }

    return {
      success: true,
      balance: parseFloat(data.balance || "0"),
    };
  } catch (error) {
    console.error("Error fetching credit balance:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch balance",
    };
  }
}

/**
 * Submit EFT payment for credit purchase
 * Creates a pending credit transaction that requires admin approval
 */
export async function submitEFTPaymentAction(
  amount: number,
  referenceNumber: string,
  proofUrl?: string
): Promise<EFTPaymentResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "User must be logged in to submit EFT payment",
      };
    }

    // Validate amount
    if (!Number.isFinite(amount) || amount < 20 || amount > 5000 || Math.abs(amount * 100 - Math.round(amount * 100)) > 0.000001) {
      return {
        success: false,
        error: "Amount must be between R20 and R5000",
      };
    }

    // Submit EFT payment
    const result = await submitEFTPayment(
      user.id,
      amount,
      referenceNumber,
      proofUrl
    );

    if (!result.success) {
      return {
        success: false,
        error: result.error || "Failed to submit EFT payment",
      };
    }

    return {
      success: true,
      submissionId: result.submissionId,
    };
  } catch (error) {
    console.error("Error submitting EFT payment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to submit EFT payment",
    };
  }
}

/**
 * Get EFT payment submissions for current user
 */
export async function getEFTSubmissionsAction(): Promise<GetEFTSubmissionsResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "User must be logged in to view EFT submissions",
      };
    }

    const submissions = await getUserEFTSubmissions();

    return {
      success: true,
      submissions,
    };
  } catch (error) {
    console.error("Error fetching EFT submissions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch EFT submissions",
    };
  }
}

/**
 * Verify EFT payment (admin action)
 */
export async function verifyEFTPaymentAction(
  submissionId: string,
  approved: boolean,
  rejectionReason?: string
): Promise<VerifyEFTPaymentResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "User must be logged in",
      };
    }

    // SQL checks the administrator against trusted Auth app metadata and locks the
    // submission. Approval, balance and ledger commit together; retries replay.
    const { error } = await createServiceRoleClient().rpc("settle_eft_credit_private", {
      p_submission_id: submissionId, p_admin_id: user.id, p_approved: approved,
      p_rejection_reason: rejectionReason ?? null,
    });
    if (error) return { success: false, error: "EFT decision could not be settled" };

    return {
      success: true,
      message: approved
        ? "EFT payment verified and credits added"
        : "EFT payment rejected",
    };
  } catch (error) {
    console.error("Error verifying EFT payment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to verify EFT payment",
    };
  }
}
