import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

export interface EFTPaymentSubmission {
  id: string;
  userId: string;
  amount: number;
  referenceNumber: string;
  proofUrl?: string;
  status: "pending" | "verified" | "rejected";
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Submit EFT payment request
 */
export async function submitEFTPayment(
  userId: string,
  amount: number,
  referenceNumber: string,
  proofUrl?: string
): Promise<{ success: boolean; submissionId?: string; error?: string }> {
  const { data: { user } } = await (await createClient()).auth.getUser();
  if (!user || user.id !== userId) return { success: false, error: "Authentication required" };
  const supabase = createServiceRoleClient();

  try {
    const { data, error } = await supabase
      .from("eft_payment_submissions")
      .insert({
        user_id: userId,
        amount: amount,
        reference_number: referenceNumber,
        proof_url: proofUrl,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error submitting EFT payment:", error);
      return {
        success: false,
        error: error.message || "Failed to submit EFT payment",
      };
    }

    return {
      success: true,
      submissionId: data.id,
    };
  } catch (error) {
    console.error("Error submitting EFT payment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get EFT payment submissions for current user
 */
export async function getUserEFTSubmissions(): Promise<EFTPaymentSubmission[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("eft_payment_submissions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching EFT submissions:", error);
    return [];
  }

  return (data || []).map(mapDatabaseToSubmission);
}

/**
 * Get pending EFT submissions (for admin)
 */
export async function getPendingEFTSubmissions(): Promise<EFTPaymentSubmission[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("eft_payment_submissions")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching pending EFT submissions:", error);
    return [];
  }

  return (data || []).map(mapDatabaseToSubmission);
}

/**
 * Get EFT submission by ID
 */
export async function getEFTSubmissionById(
  submissionId: string
): Promise<EFTPaymentSubmission | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("eft_payment_submissions")
    .select("*")
    .eq("id", submissionId)
    .single();

  if (error) {
    console.error("Error fetching EFT submission:", error);
    return null;
  }

  return mapDatabaseToSubmission(data);
}

/**
 * Map database record to EFTPaymentSubmission
 */
function mapDatabaseToSubmission(data: any): EFTPaymentSubmission {
  return {
    id: data.id,
    userId: data.user_id,
    amount: parseFloat(data.amount),
    referenceNumber: data.reference_number,
    proofUrl: data.proof_url,
    status: data.status,
    verifiedBy: data.verified_by,
    verifiedAt: data.verified_at,
    rejectionReason: data.rejection_reason,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

























