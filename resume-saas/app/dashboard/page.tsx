'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { FEATURED_JOBS, MORE_JOBS } from '@/lib/jobs';
import { hasActiveSubscription } from '@/lib/subscription';
import { FileIcon, UploadIcon, XIcon } from '@/components/icons';
import ResultActions from '@/components/result-actions';

type Result = { resumeId: string; previewText: string; fullText: string | null };

async function postJson(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed. Try again.');
  return data;
}

function Step({ n, title, children }: { n: number; title: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="card p-5">
      <h2 className="flex items-center gap-3 font-medium mb-4">
        <span className="inline-grid place-items-center w-6 h-6 rounded-full border border-slate-300 text-xs text-slate-600">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [jobType, setJobType] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [result, setResult] = useState<Result | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login'); return; }
      setUserEmail(user.email ?? '');
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_period_end')
        .eq('id', user.id)
        .single();
      setIsSubscribed(hasActiveSubscription(profile));
    })();
  }, [router]);

  async function signOut() {
    await createClient().auth.signOut();
    router.push('/');
    router.refresh();
  }

  async function manageBilling() {
    try {
      const { url } = await postJson('/api/billing-portal');
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not open billing.');
    }
  }

  async function handleRemaster() {
    setError('');
    if (!file) { setError('Choose a PDF or DOCX resume first.'); return; }
    if (!jobType) { setError('Pick a target role.'); return; }

    setLoading(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('jobType', jobType);
      fd.append('notes', notes);
      const res = await fetch('/api/remaster', { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'The rewrite failed. Try again.');
      setResult({ resumeId: data.resumeId, previewText: data.previewText, fullText: data.fullText });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The rewrite failed. Try again.');
    } finally {
      setLoading(false);
    }
  }

  async function redeemPromo(e: React.FormEvent) {
    e.preventDefault();
    if (!promoCode.trim() || !result) return;
    setPromoLoading(true);
    setPromoError('');
    try {
      const { fullText } = await postJson('/api/redeem', { code: promoCode.trim(), resumeId: result.resumeId });
      setResult({ ...result, fullText });
      setPromoCode('');
    } catch (err) {
      setPromoError(err instanceof Error ? err.message : 'Could not redeem the code.');
    } finally {
      setPromoLoading(false);
    }
  }

  async function checkout(plan: 'single' | 'monthly') {
    if (!result) return;
    setCheckingOut(true);
    setError('');
    try {
      const { url } = await postJson('/api/checkout', { resumeId: result.resumeId, plan });
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start checkout.');
      setCheckingOut(false);
    }
  }

  const unlocked = result?.fullText != null;

  return (
    <div className="min-h-screen">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <span className="font-semibold">Resume Remaster</span>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-500 hidden sm:inline truncate max-w-[14rem]">{userEmail}</span>
            {isSubscribed && (
              <button onClick={manageBilling} className="text-slate-600 hover:text-slate-900">Billing</button>
            )}
            <button onClick={signOut} className="text-slate-600 hover:text-slate-900">Sign out</button>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto py-8 px-4 space-y-4">
        {isSubscribed && (
          <p className="text-sm text-slate-600">Monthly plan active: every resume you make is unlocked.</p>
        )}

        <Step n={1} title="Resume">
          {file ? (
            <div className="flex items-center gap-3 rounded-md border border-slate-300 px-3 py-2.5">
              <FileIcon className="w-5 h-5 text-slate-500" />
              <span className="flex-1 min-w-0 truncate font-medium">{file.name}</span>
              <span className="text-sm text-slate-500">{(file.size / 1024).toFixed(1)} KB</span>
              <button onClick={() => setFile(null)} aria-label="Remove file" className="p-1.5 rounded text-slate-500 hover:bg-slate-100">
                <XIcon />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center gap-1 rounded-md border border-dashed border-slate-300 px-4 py-8 text-center cursor-pointer hover:border-brand-700 hover:bg-brand-50 focus-within:outline focus-within:outline-2 focus-within:outline-brand-700">
              <input
                type="file"
                accept=".pdf,.docx"
                className="sr-only"
                onChange={e => { setFile(e.target.files?.[0] ?? null); setError(''); }}
              />
              <UploadIcon className="w-7 h-7 text-slate-500" />
              <span className="font-medium mt-1">Choose a file</span>
              <span className="text-sm text-slate-500">PDF or DOCX, up to 4 MB</span>
            </label>
          )}
        </Step>

        <Step n={2} title="Target role">
          <div className="grid grid-cols-2 gap-2 mb-4">
            {FEATURED_JOBS.map(job => (
              <button
                key={job}
                onClick={() => setJobType(job)}
                aria-pressed={jobType === job}
                className={`px-3 py-2.5 rounded-md border text-sm text-left ${
                  jobType === job ? 'border-brand-700 bg-brand-50 ring-1 ring-brand-700' : 'border-slate-300 hover:border-brand-700'
                }`}
              >
                {job}
              </button>
            ))}
          </div>
          <label htmlFor="more-jobs" className="block text-sm font-medium mb-1.5">Other roles</label>
          <select
            id="more-jobs"
            className="input"
            value={MORE_JOBS.includes(jobType) ? jobType : ''}
            onChange={e => { if (e.target.value) setJobType(e.target.value); }}
          >
            <option value="">Choose a role</option>
            {MORE_JOBS.map(job => <option key={job} value={job}>{job}</option>)}
          </select>
        </Step>

        <Step n={3} title={<>Notes <span className="text-sm font-normal text-slate-500">optional</span></>}>
          <textarea
            className="input"
            rows={3}
            maxLength={1000}
            placeholder="For example: keep it to one page, lead with my Python work"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </Step>

        {error && <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-4 py-3">{error}</p>}

        <button className="btn-primary w-full py-3" onClick={handleRemaster} disabled={loading}>
          {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
          {loading ? 'Rewriting, this can take a minute' : 'Rewrite resume'}
        </button>

        {result && (
          <section className="card">
            <div className="px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-medium">{unlocked ? 'Rewritten resume' : 'Preview'}</h2>
              {unlocked && <ResultActions text={result.fullText!} />}
            </div>

            {unlocked ? (
              <pre className="p-5 text-sm font-mono whitespace-pre-wrap break-words leading-relaxed max-h-[32rem] overflow-y-auto">
                {result.fullText}
              </pre>
            ) : (
              <>
                <div className="relative">
                  <pre className="p-5 text-sm font-mono whitespace-pre-wrap break-words leading-relaxed max-h-72 overflow-hidden">
                    {result.previewText}
                  </pre>
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-white pointer-events-none" />
                </div>
                <div className="px-5 pb-5 pt-2 border-t border-slate-100">
                  <p className="text-sm text-slate-600 mb-4">This is the first part. Unlock the full resume to copy or download it.</p>
                  <div className="flex flex-col sm:flex-row gap-3 mb-5">
                    <button onClick={() => checkout('single')} disabled={checkingOut} className="btn-primary">
                      Unlock this resume for $2
                    </button>
                    <button onClick={() => checkout('monthly')} disabled={checkingOut} className="btn-secondary">
                      Subscribe for $8/month
                    </button>
                  </div>

                  <form onSubmit={redeemPromo} className="pt-4 border-t border-slate-100">
                    <label htmlFor="promo" className="block text-sm text-slate-600 mb-1.5">Promo code</label>
                    <div className="flex gap-2 max-w-sm">
                      <input
                        id="promo"
                        className="input uppercase"
                        placeholder="FREE-XXXXXXXX"
                        autoComplete="off"
                        value={promoCode}
                        onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); }}
                      />
                      <button type="submit" disabled={promoLoading || !promoCode.trim()} className="btn-secondary whitespace-nowrap">
                        {promoLoading ? 'Checking...' : 'Apply'}
                      </button>
                    </div>
                    {promoError && <p className="text-sm text-red-700 mt-2">{promoError}</p>}
                  </form>
                </div>
              </>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
