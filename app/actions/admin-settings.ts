"use server";

import { createClient } from "@/lib/supabase/server";
import type { SystemSetting } from "@/lib/supabase/booking-data";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function getAllSystemSettingsAdmin(): Promise<SystemSetting[]> {
  await requireAdmin();

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("system_settings")
      .select("*")
      .order("setting_key", { ascending: true });

    if (error) {
      console.error("Error fetching system settings:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching system settings:", error);
    throw error;
  }
}

export async function updateSystemSetting(
  id: string,
  updates: { setting_value?: string; description?: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    const supabase = await createClient();
    const { error } = await supabase
      .from("system_settings")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating system setting:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating system setting:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update system setting",
    };
  }
}
