"use client";

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

/**
 * Hook to get the current user in client components
 */
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    let subscription: { unsubscribe: () => void } | null = null;

    try {
      const supabase = createClient();

      supabase.auth
        .getUser()
        .then(({ data: { user } }) => {
          setUser(user);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });

      const {
        data: { subscription: authSubscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });
      subscription = authSubscription;
    } catch {
      setLoading(false);
    }

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return { user, loading };
}

/**
 * Hook to check if user is authenticated
 */
export function useAuth() {
  const { user, loading } = useUser();
  return { isAuthenticated: !!user, user, loading };
}




























