'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import Link from 'next/link';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [fullText, setFullText] = useState('');
  const [resumeId, setResumeId] = useState('');
  const [copied, setCopied] = useState(false);

  // Review state
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [comment, setComment] = useState('');
  const [reviewed, setReviewed] = useState(false);
  const [reviewSending, setReviewSending] = useState(false);

  useEffect(() => {
    if (!sessionId) { router.replace('/dashboard'); return; }
    let attempts = 0;
    async function poll() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login'); return; }

      const { data: resumes } = await supabase
        .from('resumes')
        .select('id, full_text, is_unlocked')
        .eq('user_id', user.id)
        .eq('is_unlocked', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (resumes && resumes.length > 0) {
        setFullText(resumes[0].full_text);
        setResumeId(resumes[0].id);
        setStatus('ready');
      } else if (attempts < 10) {
        attempts++;
        setTimeout(poll, 1500);
      } else {
        setStatus('error');
      }
    }
    poll();
  }, [sessionId, router]);

  async function submitReview() {
    if (rating === 0 || !resumeId) return;
    setReviewSending(true);
    await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeId, rating, comment, displayName: displayName.trim() }),
    });
    setReviewed(true);
    setReviewSending(false);
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-600">Unlocking your resume…</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card p-8 max-w-sm text-center">
          <p className="text-red-600 font-semibold mb-4">Could not load your resume. Please check your dashboard.</p>
          <Link href="/dashboard" className="btn-primary">Go to dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        <div className="text-center">
          <p className="text-4xl mb-2">🎉</p>
          <h1 className="text-2xl font-black text-slate-900">Your remastered resume is ready!</h1>
          <p className="text-slate-500 mt-1">Copy it below and paste into your application.</p>
        </div>

        {/* Full resume */}
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4 border-b bg-slate-50">
            <span className="font-semibold text-slate-700">✨ Full Resume</span>
            <div className="flex gap-2">
              <button onClick={() => { navigator.clipboard.writeText(fullText); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="btn-secondary py-1.5 px-3 text-sm">
                {copied ? '✓ Copied' : '📋 Copy'}
              </button>
              <button onClick={() => {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(new Blob([fullText], { type: 'text/plain' }));
                a.download = 'remastered-resume.txt';
                a.click();
              }} className="btn-secondary py-1.5 px-3 text-sm">⬇ Download</button>
            </div>
          </div>
          <pre className="p-5 text-sm font-mono whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">{fullText}</pre>
        </div>

        {/* Review prompt */}
        <div className="card p-6">
          {reviewed ? (
            <div className="text-center">
              <p className="text-2xl mb-2">⭐</p>
              <p className="text-green-700 font-semibold">Thanks for your review!</p>
              <p className="text-slate-500 text-sm mt-1">It&apos;ll show up on our homepage to help others.</p>
            </div>
          ) : (
            <>
              <h2 className="font-bold text-slate-800 mb-1">How did we do?</h2>
              <p className="text-sm text-slate-500 mb-5">Your review shows on our homepage as a verified user — helps others decide.</p>

              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(star)}
                    className={`text-3xl transition-transform hover:scale-110 ${star <= (hover || rating) ? 'text-yellow-400' : 'text-slate-200'}`}
                  >★</button>
                ))}
              </div>

              {/* Name */}
              <input
                className="input mb-3"
                placeholder="Your first name (shown publicly, e.g. Sarah M.)"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                maxLength={40}
              />

              {/* Comment */}
              <textarea
                className="input mb-4"
                rows={3}
                placeholder="What did you think? Did it help with your job search? (optional)"
                value={comment}
                onChange={e => setComment(e.target.value)}
              />

              <button
                className="btn-primary"
                onClick={submitReview}
                disabled={rating === 0 || reviewSending}
              >
                {reviewSending ? 'Sending…' : 'Submit review'}
              </button>
              {rating === 0 && <p className="text-xs text-slate-400 mt-2">Select a star rating to submit.</p>}
            </>
          )}
        </div>

        <div className="text-center">
          <Link href="/dashboard" className="text-brand-600 text-sm hover:underline">← Remaster another resume</Link>
        </div>
      </div>
    </div>
  );
}
