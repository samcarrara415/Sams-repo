import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// POST — submit a review (must own an unlocked resume)
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { resumeId, rating, comment } = await request.json() as {
    resumeId: string; rating: number; comment?: string;
  };

  if (!resumeId || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  // Verify user owns an unlocked resume
  const { data: resume } = await supabase
    .from('resumes')
    .select('id, job_type, is_unlocked')
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
    job_type: resume.job_type,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// GET — fetch public reviews for the landing page
export async function GET() {
  // Use anon key — reviews are public read
  const supabase = createClient();
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating, comment, job_type, created_at')
    .order('created_at', { ascending: false })
    .limit(20);

  return NextResponse.json({ reviews: reviews || [] });
}
