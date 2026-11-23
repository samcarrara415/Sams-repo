'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { StarIcon } from '@/components/icons';
import ResultActions from '@/components/result-actions';

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 15;

function ReviewForm({ resumeId }: { resumeId: string }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [comment, setComment] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) return;
    setState('sending');
    setError('');
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeId, rating, comment, displayName }),
    });
    if (res.ok) { setState('sent'); return; }
    const data = await res.json().catch(() => ({}));
    setError(data.error || 'Could not save the review.');
    setState('idle');
  }

  if (state === 'sent') {
    return <p className="text-sm text-slate-700">Thanks. Your review will appear on the home page.</p>;
  }

  return (
    <form onSubmit={submit}>
      <h2 className="font-medium mb-1">Leave a review</h2>
      <p className="text-sm text-slate-500 mb-4">Optional. Reviews are shown on the home page with the name you enter.</p>

      <div className="flex gap-1 mb-4 text-amber-500" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={rating === star}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(star)}
            className="p-0.5"
          >
            <StarIcon className="w-7 h-7" filled={star <= (hover || rating)} />
          </button>
        ))}
      </div>

      <label htmlFor="display-name" className="block text-sm font-medium mb-1.5">Name to show</label>
      <input
        id="display-name"
        className="input mb-3"
        placeholder="First name and initial, or leave blank"
        value={displayName}
        onChange={e => setDisplayName(e.target.value)}
        maxLength={40}
      />

      <label htmlFor="comment" className="block text-sm font-medium mb-1.5">Comment</label>
      <textarea
        id="comment"
        className="input mb-4"
        rows={3}
        maxLength={1000}
        value={comment}
        onChange={e => setComment(e.target.value)}
      />

      {error && <p className="text-sm text-red-700 mb-3">{error}</p>}
      <button className="btn-primary" disabled={rating === 0 || state === 'sending'}>
        {state === 'sending' ? 'Sending...' : 'Submit review'}
      </button>
    </form>
  );
}

function SuccessContent() {
  const resumeId = useSearchParams().get('resume');
  const [status, setStatus] = useState<'loading' | 'ready' | 'pending' | 'error'>('loading');
  const [fullText, setFullText] = useState('');

  useEffect(() => {
    if (!resumeId) { setStatus('error'); return; }
    let cancelled = false;
    let polls = 0;

    // The Stripe webhook unlocks the resume; it can land a few seconds after the redirect.
    async function poll() {
      const res = await fetch(`/api/resumes/${encodeURIComponent(resumeId!)}`);
      if (cancelled) return;
      if (!res.ok) { setStatus('error'); return; }
      const data = await res.json();
      if (data.isUnlocked) {
        setFullText(data.fullText);
        setStatus('ready');
      } else if (++polls < MAX_POLLS) {
        setTimeout(poll, POLL_INTERVAL_MS);
      } else {
        setStatus('pending');
      }
    }
    poll().catch(() => !cancelled && setStatus('error'));
    return () => { cancelled = true; };
  }, [resumeId]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <span className="w-8 h-8 border-2 border-slate-300 border-t-brand-700 rounded-full animate-spin" />
        <p className="text-slate-600">Confirming your payment...</p>
      </div>
    );
  }

  if (status !== 'ready') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card p-6 max-w-sm text-center">
          <p className="text-slate-700 mb-4">
            {status === 'pending'
              ? 'Your payment is still being confirmed. Refresh this page in a minute.'
              : 'We could not find this resume.'}
          </p>
          <Link href="/dashboard" className="btn-secondary">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Payment received</h1>
          <p className="text-slate-600 mt-1">Your full resume is below.</p>
        </div>

        <section className="card">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-slate-200">
            <h2 className="font-medium">Rewritten resume</h2>
            <ResultActions text={fullText} />
          </div>
          <pre className="p-5 text-sm font-mono whitespace-pre-wrap break-words leading-relaxed max-h-[32rem] overflow-y-auto">{fullText}</pre>
        </section>

        <section className="card p-5">
          <ReviewForm resumeId={resumeId!} />
        </section>

        <Link href="/dashboard" className="inline-block text-sm text-brand-700 hover:underline">Rewrite another resume</Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
