"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { CleanerApplication, CleanerApplicationStatus, CleanerApplicationStats } from "@/lib/types/cleaner-application";
import { requireAdmin } from "@/lib/auth/require-admin";

function mapDatabaseToApplication(data: any): CleanerApplication {
  return {
    id: data.id,
    firstName: data.first_name,
    lastName: data.last_name,
    email: data.email,
    phone: data.phone,
    experienceYears: data.experience_years || 0,
    previousExperience: data.previous_experience || undefined,
    availability: data.availability || undefined,
    preferredAreas: data.preferred_areas || [],
    languages: data.languages || [],
    referencesInfo: data.references_info || undefined,
    additionalInfo: data.additional_info || undefined,
    status: data.status,
    adminNotes: data.admin_notes || undefined,
    reviewedBy: data.reviewed_by || undefined,
    reviewedAt: data.reviewed_at || undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function getAllApplications(): Promise<CleanerApplication[]> {
  await requireAdmin();
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("cleaner_applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching applications:", error);
    throw new Error(`Failed to fetch applications: ${error.message}`);
  }

  return (data || []).map(mapDatabaseToApplication);
}

export async function getApplicationById(id: string): Promise<CleanerApplication | null> {
  await requireAdmin();
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("cleaner_applications")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("Error fetching application:", error);
    throw new Error(`Failed to fetch application: ${error.message}`);
  }

  return data ? mapDatabaseToApplication(data) : null;
}

export async function getApplicationStats(): Promise<CleanerApplicationStats> {
  await requireAdmin();
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("cleaner_applications")
    .select("status");

  if (error) {
    console.error("Error fetching application stats:", error);
    throw new Error(`Failed to fetch stats: ${error.message}`);
  }

  const stats: CleanerApplicationStats = {
    total: data?.length || 0,
    pending: 0,
    reviewed: 0,
    approved: 0,
    rejected: 0,
    hired: 0,
  };

  (data || []).forEach((app) => {
    const status = app.status as CleanerApplicationStatus;
    if (stats.hasOwnProperty(status)) stats[status]++;
  });

  return stats;
}

export async function updateApplicationStatus(
  id: string,
  status: CleanerApplicationStatus,
  adminNotes?: string
): Promise<{ success: boolean; error?: string }> {
  const adminUser = await requireAdmin();
  const supabase = createServiceRoleClient();
  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (adminNotes !== undefined) updateData.admin_notes = adminNotes;

  const { data: currentApp, error: currentError } = await supabase
    .from("cleaner_applications")
    .select("status")
    .eq("id", id)
    .maybeSingle();

  if (currentError) return { success: false, error: currentError.message };

  if (currentApp?.status === "pending" && status !== "pending") {
    updateData.reviewed_by = adminUser.id;
    updateData.reviewed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("cleaner_applications")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Error updating application status:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteApplication(id: string): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("cleaner_applications")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting application:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/** Public cleaner application submission. This action intentionally remains public. */
export async function createApplication(
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    experienceYears: number;
    previousExperience?: string;
    availability?: string;
    preferredAreas?: string[];
    languages?: string[];
    referencesInfo?: string;
    additionalInfo?: string;
  }
): Promise<{ success: boolean; error?: string; id?: string }> {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("cleaner_applications")
    .insert({
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      experience_years: formData.experienceYears,
      previous_experience: formData.previousExperience || null,
      availability: formData.availability || null,
      preferred_areas: formData.preferredAreas || [],
      languages: formData.languages || [],
      references_info: formData.referencesInfo || null,
      additional_info: formData.additionalInfo || null,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    console.error("Error creating application:", error);
    return { success: false, error: error.message };
  }

  return { success: true, id: data.id };
}
