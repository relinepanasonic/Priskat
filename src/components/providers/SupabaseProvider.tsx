"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type SupabaseContextType = {
  session: Session | null;
  user: User | null;
};

const SupabaseContext = createContext<SupabaseContextType>({
  session: null,
  user: null,
});

export function useSession() {
  return useContext(SupabaseContext);
}

export default function SupabaseProvider({
  children,
  session: initialSession,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  const [session, setSession] = useState<Session | null>(initialSession);
  const supabase = createClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <SupabaseContext.Provider value={{ session, user: session?.user ?? null }}>
      {children}
    </SupabaseContext.Provider>
  );
}
