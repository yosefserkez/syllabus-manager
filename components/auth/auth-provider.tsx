"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";

// Only /auth requires special handling
const authRoutes = ["/auth"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  useEffect(() => {
    // Only redirect from auth page when logged in
    if (user && authRoutes.includes(pathname)) {
      router.push("/dashboard");
    }
  }, [user, pathname, router]);

  return children;
}