"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";

export interface Quote {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  customLocation?: string | null;
  service: string | null;
  bedrooms: number;
  bathrooms: number;
  additionalServices: string[];
  note?: string | null;
  status: "pending" | "contacted" | "converted" | "declined";
  createdAt: string;
  updatedAt: string;
}

function mapDatabaseToQuote(data: any): Quote {
  return {
    id: data.id,
    firstName: data.first_name,
    lastName: data.last_name,
    email: data.email,
    phone: data.phone,
    location: data.location,
    customLocation: data.custom_location,
    service: data.service_type || data.service,
    bedrooms: data.bedrooms || 0,
    bathrooms: data.bathrooms || 1,
    additionalServices: data.extras || data.additional_services || [],
    note: data.notes || data.note,
    status: data.status || "pending",
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function getAllQuotes(): Promise<Quote[]> {
  await requireAdmin();
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all quotes:", error);
    throw new Error(`Failed to fetch quotes: ${error.message}`);
  }

  return (data || []).map(mapDatabaseToQuote);
}

export async function getQuoteStats() {
  await requireAdmin();
  const supabase = createServiceRoleClient();
  const [totalResult, statusResult] = await Promise.all([
    supabase.from("quotes").select("*", { count: "exact", head: true }),
    supabase.from("quotes").select("status"),
  ]);

  const byStatus: Record<string, number> = {};
  (statusResult.data || []).forEach((quote) => {
    const status = quote.status || "unknown";
    byStatus[status] = (byStatus[status] || 0) + 1;
  });

  return { total: totalResult.count || 0, byStatus };
}

export async function getQuoteById(id: string): Promise<Quote | null> {
  await requireAdmin();
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Failed to fetch quote: ${error.message}`);
  }

  return data ? mapDatabaseToQuote(data) : null;
}

export async function updateQuoteStatus(
  id: string,
  status: Quote["status"]
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("quotes")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Error updating quote status:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
