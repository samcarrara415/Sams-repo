import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-admin';

const MAX_COMMENT = 1000;
const MAX_NAME = 40;

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const resumeId = typeof body.resumeId === 'string' ? body.resumeId : '';
  const rating = Number(body.rating);
  const comment = typeof body.comment === 'string' ? body.comment.trim().slice(0, MAX_COMMENT) : '';
  const displayName = typeof body.displayName === 'string' ? body.displayName.trim().slice(0, MAX_NAME) : '';

  if (!resumeId || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Choose a rating from 1 to 5.' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Only someone who unlocked this resume can review it. Job type and unlock
  // method come from the resume row, not from the request.
  const { data: resume } = await admin
    .from('resumes')
    .select('id, job_type, unlock_method')
    .eq('id', resumeId)
    .eq('user_id', user.id)
    .eq('is_unlocked', true)
    .maybeSingle();

  if (!resume) return NextResponse.json({ error: 'You can only review a resume you unlocked.' }, { status: 403 });

  const { error } = await admin.from('reviews').insert({
    user_id: user.id,
    resume_id: resume.id,
    rating,
    comment: comment || null,
    display_name: displayName || null,
    job_type: resume.job_type,
    unlock_method: resume.unlock_method,
  });

  if (error?.code === '23505') return NextResponse.json({ error: 'You already reviewed this resume.' }, { status: 409 });
  if (error) {
    console.error('Saving review failed:', error);
    return NextResponse.json({ error: 'Could not save the review.' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
