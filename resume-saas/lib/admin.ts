import type { User } from '@supabase/supabase-js';

// The email must be confirmed: otherwise anyone could sign up with the
// admin address before the owner does and pass this check.
export function isAdmin(user: User | null): boolean {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!user || !adminEmail || !user.email || !user.email_confirmed_at) return false;
  return user.email.toLowerCase() === adminEmail;
}
