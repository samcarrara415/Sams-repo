import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import mammoth from 'mammoth';
import { extractText as extractPdfText, getDocumentProxy } from 'unpdf';
import { createClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-admin';
import { ALL_JOBS } from '@/lib/jobs';
import { hasActiveSubscription } from '@/lib/subscription';

export const runtime = 'nodejs';
export const maxDuration = 120;

const MODEL = 'claude-opus-5-5';
const MAX_FILE_BYTES = 4 * 1024 * 1024; // Vercel rejects request bodies over 4.5 MB
const MAX_NOTES_LENGTH = 1000;
const MAX_RESUME_CHARS = 30000;
// Each preview costs an API call, so cap how many unpaid previews one account can make.
const FREE_PREVIEWS_PER_DAY = 5;

function buildPrompt(resumeText: string, jobType: string, notes: string): string {
  const extra = notes ? `\n\nExtra instructions from the candidate:\n${notes}` : '';
  return `You are an experienced resume writer. Rewrite the resume below for a ${jobType} role.

Rules:
- Keep every fact accurate: names, employers, titles, dates, education, and grades.
- Do not invent experience, skills, employers, or numbers that are not in the original. Quantify results only where the original gives the figures.
- Rewrite bullet points to start with strong verbs and show impact.
- Put the experience and skills most relevant to ${jobType} roles first.
- Write or tighten a short summary aimed at ${jobType} roles.
- Use keywords an applicant tracking system would look for in ${jobType} postings, where they truthfully apply.
- Output plain text with no Markdown. Use consistent section headings and "-" for bullets.${extra}

Original resume:
---
${resumeText}
---

Return only the rewritten resume.`;
}

function createPreview(fullText: string): string {
  const lines = fullText.split('\n').filter(l => l.trim());
  const previewLines = Math.max(3, Math.floor(lines.length * 0.35));
  return lines.slice(0, previewLines).join('\n');
}

async function extractText(file: File): Promise<string | null> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  const bytes = await file.arrayBuffer();
  if (ext === 'pdf') {
    const pdf = await getDocumentProxy(new Uint8Array(bytes));
    return (await extractPdfText(pdf, { mergePages: true })).text;
  }
  if (ext === 'docx') return (await mammoth.extractRawText({ buffer: Buffer.from(bytes) })).value;
  return null;
}

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError('Sign in first.', 401);

  const formData = await request.formData();
  const file = formData.get('file');
  const jobType = formData.get('jobType');
  const notes = String(formData.get('notes') ?? '').trim().slice(0, MAX_NOTES_LENGTH);

  if (!(file instanceof File) || typeof jobType !== 'string') return jsonError('Missing file or job type.', 400);
  if (!ALL_JOBS.includes(jobType)) return jsonError('Unknown job type.', 400);
  if (file.size > MAX_FILE_BYTES) return jsonError('File is larger than 4 MB.', 413);

  let resumeText: string | null;
  try {
    resumeText = await extractText(file);
  } catch (err) {
    console.warn('Resume parsing failed:', err instanceof Error ? err.message : err);
    return jsonError('Could not read this file. Try saving it again as PDF or DOCX.', 400);
  }
  if (resumeText === null) return jsonError('Only PDF and DOCX files are supported.', 400);

  resumeText = resumeText.trim();
  if (resumeText.length < 50) {
    return jsonError('No readable text found. If the PDF is a scanned image, export a text PDF or DOCX instead.', 400);
  }
  if (resumeText.length > MAX_RESUME_CHARS) {
    return jsonError('This file has more text than a resume normally does. Upload just the resume.', 400);
  }

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from('profiles')
    .select('subscription_status, subscription_period_end')
    .eq('id', user.id)
    .single();
  const isSubscribed = hasActiveSubscription(profile);

  if (!isSubscribed) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await admin
      .from('resumes')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', since);
    if ((count ?? 0) >= FREE_PREVIEWS_PER_DAY) {
      return jsonError(`You can make ${FREE_PREVIEWS_PER_DAY} previews a day on the free tier. Try again tomorrow or subscribe.`, 429);
    }
  }

  let fullText: string;
  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await anthropic.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      output_config: { effort: 'medium' },
      // On a safety-classifier refusal the API retries on a fallback model in the same call.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      messages: [{ role: 'user', content: buildPrompt(resumeText, jobType, notes) }],
    });

    if (message.stop_reason === 'refusal') {
      return jsonError('The model declined to rewrite this file.', 422);
    }
    fullText = message.content
      .map(block => (block.type === 'text' ? block.text : ''))
      .join('')
      .trim();
    if (!fullText) throw new Error('Empty response');
  } catch (err) {
    console.error('Anthropic request failed:', err);
    if (err instanceof Anthropic.RateLimitError) return jsonError('The service is busy. Try again in a minute.', 503);
    return jsonError('The rewrite failed. Try again.', 502);
  }

  const now = new Date().toISOString();
  const previewText = createPreview(fullText);
  const { data: resume, error: dbError } = await admin
    .from('resumes')
    .insert({
      user_id: user.id,
      job_type: jobType,
      preview_text: previewText,
      full_text: fullText,
      is_unlocked: isSubscribed,
      unlock_method: isSubscribed ? 'monthly' : null,
      unlocked_at: isSubscribed ? now : null,
    })
    .select('id')
    .single();

  if (dbError || !resume) {
    console.error('Saving resume failed:', dbError);
    return jsonError('Could not save the result. Try again.', 500);
  }

  return NextResponse.json({
    resumeId: resume.id,
    previewText,
    isUnlocked: isSubscribed,
    fullText: isSubscribed ? fullText : null,
  });
}
