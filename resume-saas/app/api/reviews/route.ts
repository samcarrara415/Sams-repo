import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { resumeId, rating, comment, displayName } = await request.json() as {
    resumeId: string; rating: number; comment?: string; displayName?: string;
  };

  if (!resumeId || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  // Verify user owns an unlocked resume
  const { data: resume } = await supabase
    .from('resumes')
    .select('id, job_type, is_unlocked, unlock_method, unlocked_at')
    .eq('id', resumeId)
    .eq('user_id', user.id)
    .eq('is_unlocked', true)
    .single();

  if (!resume) return NextResponse.json({ error: 'Resume not found or not unlocked' }, { status: 403 });

  const { error } = await supabase.from('reviews').insert({
    user_id: user.id,
    resume_id: resumeId,
    rating,
    comment: comment?.trim() || null,
    display_name: displayName?.trim() || null,
    job_type: resume.job_type,
    unlock_method: resume.unlock_method,
    purchased_at: resume.unlocked_at,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function GET() {
  const supabase = createClient();
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating, comment, display_name, job_type, unlock_method, purchased_at, created_at')
    .order('created_at', { ascending: false })
    .limit(20);

  return NextResponse.json({ reviews: reviews || [] });
}
