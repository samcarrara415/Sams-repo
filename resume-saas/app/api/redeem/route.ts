import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-admin';

const ERRORS: Record<string, { message: string; status: number }> = {
  invalid_code: { message: 'That code is not valid or has already been used.', status: 400 },
  resume_not_found: { message: 'Resume not found.', status: 404 },
  already_unlocked: { message: 'This resume is already unlocked.', status: 409 },
};

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : '';
  const resumeId = typeof body.resumeId === 'string' ? body.resumeId : '';
  if (!code || !resumeId) return NextResponse.json({ error: 'Missing code or resume.' }, { status: 400 });

  // Claiming the code and unlocking the resume happen in one database
  // transaction (see redeem_promo_code in supabase-schema.sql), so a code
  // can't be used twice by concurrent requests or burned on a bad resume id.
  const { data: fullText, error } = await createAdminClient().rpc('redeem_promo_code', {
    p_code: code,
    p_resume_id: resumeId,
    p_user_id: user.id,
  });

  if (error) {
    const known = ERRORS[error.message];
    if (known) return NextResponse.json({ error: known.message }, { status: known.status });
    console.error('Promo redemption failed:', error);
    return NextResponse.json({ error: 'Could not redeem the code. Try again.' }, { status: 500 });
  }

  return NextResponse.json({ fullText });
}
