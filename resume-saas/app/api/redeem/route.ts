import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

// Admin client needed to bypass RLS for the atomic redeem update
const adminSupabase = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { code, resumeId } = await request.json() as { code: string; resumeId: string };
  if (!code || !resumeId) return NextResponse.json({ error: 'Missing code or resumeId' }, { status: 400 });

  // Find the code — must exist and be unused
  const { data: promo } = await adminSupabase
    .from('promo_codes')
    .select('id, used_by')
    .eq('code', code.trim().toUpperCase())
    .single();

  if (!promo) {
    return NextResponse.json({ error: 'Invalid code. Double-check and try again.' }, { status: 400 });
  }

  if (promo.used_by) {
    return NextResponse.json({ error: 'This code has already been used.' }, { status: 400 });
  }

  // Mark the code as used
  const { error: updateError } = await adminSupabase
    .from('promo_codes')
    .update({ used_by: user.id, used_at: new Date().toISOString() })
    .eq('id', promo.id)
    .is('used_by', null); // extra safety: only update if still unused

  if (updateError) {
    return NextResponse.json({ error: 'Code already redeemed. Please try another.' }, { status: 400 });
  }

  // Unlock the resume and record method + timestamp
  await adminSupabase
    .from('resumes')
    .update({ is_unlocked: true, unlock_method: 'promo', unlocked_at: new Date().toISOString() })
    .eq('id', resumeId)
    .eq('user_id', user.id);

  // Fetch and return the full text
  const { data: resume } = await adminSupabase
    .from('resumes')
    .select('full_text')
    .eq('id', resumeId)
    .single();

  return NextResponse.json({ success: true, fullText: resume?.full_text });
}
