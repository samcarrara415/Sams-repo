import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

// The full text is only returned once the resume is unlocked. Clients have no
// direct table access to resumes, so this route is the only way to read it.
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });

  const { data: resume } = await createAdminClient()
    .from('resumes')
    .select('id, job_type, preview_text, full_text, is_unlocked')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!resume) return NextResponse.json({ error: 'Resume not found.' }, { status: 404 });

  return NextResponse.json({
    id: resume.id,
    jobType: resume.job_type,
    previewText: resume.preview_text,
    isUnlocked: resume.is_unlocked,
    fullText: resume.is_unlocked ? resume.full_text : null,
  });
}
