import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import { createClient } from '@/lib/supabase-server';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const JOB_TYPES = [
  'Software Engineer','Frontend Developer','Backend Developer','Full Stack Developer',
  'Data Scientist','Data Analyst','Machine Learning Engineer','DevOps / Cloud Engineer',
  'Product Manager','UX / UI Designer','Project Manager','Business Analyst',
  'Marketing Manager','Sales Representative','Financial Analyst','Cybersecurity Analyst',
  'Solutions Architect','Mobile Developer','QA Engineer','Human Resources Manager',
  'Operations Manager','Content Writer','Graphic Designer','Recruiter',
  'Investment Banker','Accountant','Customer Success Manager','Management Consultant',
];

function buildPrompt(resumeText: string, jobType: string, notes: string): string {
  const noteSection = notes.trim() ? `\n\nAdditional instructions:\n${notes.trim()}` : '';
  return `You are an expert professional resume writer specializing in tailoring resumes for specific roles.

Remaster the resume below to be highly optimized for a **${jobType}** position.

Guidelines:
- Keep ALL factual details accurate (dates, company names, titles, education, GPAs, etc.)
- Rewrite bullet points with strong action verbs and quantifiable achievements where possible
- Emphasize skills, tools, and experiences most relevant to ${jobType} roles
- Optimize section ordering to lead with the most relevant content
- Add or refine a professional Summary/Objective targeting ${jobType} roles
- Use ATS-friendly language and relevant keywords for ${jobType}
- Keep formatting clean with consistent structure${noteSection}

Original Resume:
---
${resumeText}
---

Return only the fully remastered resume text, properly formatted and ready to use:`;
}

function createPreview(fullText: string): string {
  const lines = fullText.split('\n').filter(l => l.trim());
  const previewLines = Math.max(3, Math.floor(lines.length * 0.35));
  return lines.slice(0, previewLines).join('\n');
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const jobType = formData.get('jobType') as string;
    const notes = (formData.get('notes') as string) || '';

    if (!file || !jobType) return NextResponse.json({ error: 'Missing file or jobType' }, { status: 400 });
    if (!JOB_TYPES.includes(jobType)) return NextResponse.json({ error: 'Invalid job type' }, { status: 400 });

    // Parse file
    const buffer = Buffer.from(await file.arrayBuffer());
    let resumeText = '';
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'pdf') {
      const data = await pdfParse(buffer);
      resumeText = data.text;
    } else if (ext === 'docx') {
      const result = await mammoth.extractRawText({ buffer });
      resumeText = result.value;
    } else {
      return NextResponse.json({ error: 'Only PDF and DOCX are supported' }, { status: 400 });
    }

    resumeText = resumeText.trim();
    if (resumeText.length < 50) {
      return NextResponse.json({ error: 'Could not extract text from file. Make sure it has selectable text (not a scanned image).' }, { status: 400 });
    }

    // Check subscription status — subscribers skip payment
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_period_end')
      .eq('id', user.id)
      .single();

    const isSubscribed = profile?.subscription_status === 'active' &&
      profile?.subscription_period_end &&
      new Date(profile.subscription_period_end) > new Date();

    // Call Claude Haiku
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [{ role: 'user', content: buildPrompt(resumeText, jobType, notes) }],
    });

    const fullText = (message.content[0] as { type: string; text: string }).text;
    const previewText = createPreview(fullText);

    // Store in DB
    const { data: resume, error: dbError } = await supabase
      .from('resumes')
      .insert({
        user_id: user.id,
        job_type: jobType,
        preview_text: previewText,
        full_text: fullText,
        is_unlocked: isSubscribed, // subscribers get it free
      })
      .select('id, is_unlocked')
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({
      resumeId: resume.id,
      previewText: resume.preview_text,
      isUnlocked: resume.is_unlocked,
      fullText: resume.is_unlocked ? fullText : null,
    });
  } catch (err: unknown) {
    console.error('Remaster error:', err);
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
