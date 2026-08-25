import { createClient } from "@supabase/supabase-js";

// Service-role client — NEVER import this in client components or expose to the browser
// Use only in Server Actions and Route Handlers that need to bypass RLS
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
