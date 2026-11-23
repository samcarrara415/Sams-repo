import { createClient } from '@supabase/supabase-js';

// Service-role client: bypasses RLS. Only import this from server code
// (route handlers, server components). The key has no NEXT_PUBLIC_ prefix,
// so Next.js never inlines it into client bundles.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
