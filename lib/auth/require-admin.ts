import { createClient } from "@/lib/supabase/server";

/**
 * Require an authenticated admin before a privileged server action continues.
 * Server actions must enforce authorization at the action boundary even when
 * their calling page is already protected by the admin layout.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile?.is_admin) {
    throw new Error("Forbidden");
  }

  return user;
}
