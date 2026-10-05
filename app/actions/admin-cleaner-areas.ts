"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { revalidatePath } from "next/cache";

export async function getCleanerAreas(
  cleanerId: string
): Promise<{
  success: boolean;
  data?: string[];
  error?: string;
}> {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("cleaners")
      .select("areas")
      .eq("cleaner_id", cleanerId)
      .single();

    if (error) {
      console.error("Error fetching cleaner areas:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data.areas || [] };
  } catch (error) {
    console.error("Error in getCleanerAreas:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateCleanerAreas(
  cleanerId: string,
  areas: string[]
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const { data: cleaner, error: fetchError } = await supabase
      .from("cleaners")
      .select("cleaner_id")
      .eq("cleaner_id", cleanerId)
      .single();

    if (fetchError || !cleaner) {
      return {
        success: false,
        message: "Cleaner not found",
        error: "The specified cleaner does not exist",
      };
    }

    const { error } = await supabase
      .from("cleaners")
      .update({
        areas: areas.length > 0 ? areas : null,
        updated_at: new Date().toISOString(),
      })
      .eq("cleaner_id", cleanerId);

    if (error) {
      console.error("Error updating cleaner areas:", error);
      return {
        success: false,
        message: "Failed to update areas",
        error: error.message,
      };
    }

    revalidatePath("/admin/cleaners");
    revalidatePath("/cleaner/areas");

    return { success: true, message: "Areas updated successfully" };
  } catch (error) {
    console.error("Error in updateCleanerAreas:", error);
    return {
      success: false,
      message: "An error occurred while updating areas",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
