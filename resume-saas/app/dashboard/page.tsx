'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';

const JOB_TYPES = [
  { icon: '💻', label: 'Software Engineer' },
  { icon: '📊', label: 'Data Scientist' },
  { icon: '🗂️', label: 'Product Manager' },
  { icon: '☁️', label: 'DevOps / Cloud Engineer' },
  { icon: '🎨', label: 'UX / UI Designer' },
  { icon: '📣', label: 'Marketing Manager' },
  { icon: '💰', label: 'Financial Analyst' },
  { icon: '🤝', label: 'Sales Representative' },
];

const MORE_JOBS = [
  'Frontend Developer','Backend Developer','Full Stack Developer','Mobile Developer',
  'Machine Learning Engineer','Data Analyst','Cybersecurity Analyst','Solutions Architect',
  'QA Engineer','Business Analyst','Project Manager','Operations Manager',
  'Management Consultant','Graphic Designer','Content Writer','Investment Banker',
  'Accountant','Human Resources Manager','Recruiter','Customer Success Manager',
];

export default function Dashboard() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [jobType, setJobType] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Result state
  const [previewText, setPreviewText] = useState('');
  const [fullText, setFullText] = useState('');
  const [resumeId, setResumeId] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [copied, setCopied] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login'); return; }
      setUserEmail(user.email || '');

      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_period_end')
        .eq('id', user.id)
        .single();

      const active = profile?.subscription_status === 'active' &&
        profile?.subscription_period_end &&
        new Date(profile.subscription_period_end) > new Date();
      setIsSubscribed(!!active);
    })();
  }, [router]);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  }

  async function handleRemaster() {
    setError('');
    if (!file) { setError('Please upload a resume.'); return; }
    if (!jobType) { setError('Please select a target job type.'); return; }

    setLoading(true);
    setPreviewText(''); setFullText(''); setResumeId(''); setIsUnlocked(false);

    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('jobType', jobType);
      fd.append('notes', notes);

      const res = await fetch('/api/remaster', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server error');

      setPreviewText(data.previewText);
      setResumeId(data.resumeId);
      setIsUnlocked(data.isUnlocked);
      if (data.isUnlocked) setFullText(data.fullText);

    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function redeemPromo() {
    if (!promoCode.trim() || !resumeId) return;
    setPromoLoading(true);
    setPromoError('');
    try {
      const res = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.trim(), resumeId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid code');
      setFullText(data.fullText);
      setIsUnlocked(true);
      setPromoCode('');
    } catch (e: unknown) {
      setPromoError(e instanceof Error ? e.message : 'Invalid code');
    } finally {
      setPromoLoading(false);
    }
  }

  async function checkout(plan: 'single' | 'monthly') {
    setCheckingOut(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId, plan }),
      });
      const { url, error: err } = await res.json();
      if (err) throw new Error(err);
      window.location.href = url;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Checkout failed');
      setCheckingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white border-b sticky top-0 z-10">
        <span className="font-extrabold text-brand-700">Resume Remaster</span>
        <div className="flex items-center gap-4">
          {isSubscribed && (
            <span className="text-xs font-semibold bg-green-100 text-green-700 px-3 py-1 rounded-full">Pro ✓</span>
          )}
          <span className="text-sm text-slate-500 hidden sm:block">{userEmail}</span>
          <button onClick={signOut} className="text-sm text-slate-500 hover:text-slate-800 transition-colors">Sign out</button>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto py-10 px-4 space-y-5">

        {/* Step 1: Upload */}
        <div className="card">
          <div className="flex items-center gap-3 px-5 py-4 border-b bg-slate-50">
            <span className="w-7 h-7 bg-brand-600 text-white text-sm font-bold rounded-full flex items-center justify-center">1</span>
            <h2 className="font-semibold">Upload your resume</h2>
          </div>
          <div className="p-5">
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${file ? 'border-green-400 bg-green-50' : 'border-slate-200 hover:border-brand-400 hover:bg-brand-50'}`}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept=".pdf,.docx" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl">📎</span>
                  <div className="text-left">
                    <p className="font-semibold text-green-800 text-sm">{file.name}</p>
                    <p className="text-xs text-green-600">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); setFile(null); }} className="ml-2 text-red-400 hover:text-red-600 text-lg">✕</button>
                </div>
              ) : (
                <>
                  <p className="text-3xl mb-2">📄</p>
                  <p className="font-semibold text-slate-700">Drop or click to upload</p>
                  <p className="text-xs text-slate-400 mt-1">PDF · DOCX</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Step 2: Job type */}
        <div className="card">
          <div className="flex items-center gap-3 px-5 py-4 border-b bg-slate-50">
            <span className="w-7 h-7 bg-brand-600 text-white text-sm font-bold rounded-full flex items-center justify-center">2</span>
            <h2 className="font-semibold">Target job type</h2>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 gap-2 mb-3">
              {JOB_TYPES.map(j => (
                <button
                  key={j.label}
                  onClick={() => setJobType(j.label)}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all text-left ${
                    jobType === j.label ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50'
                  }`}
                >
                  <span>{j.icon}</span>{j.label}
                </button>
              ))}
            </div>
            <select
              className="input"
              value={MORE_JOBS.includes(jobType) ? jobType : ''}
              onChange={e => { if (e.target.value) setJobType(e.target.value); }}
            >
              <option value="">— More roles —</option>
              {MORE_JOBS.map(j => <option key={j} value={j}>{j}</option>)}
            </select>
          </div>
        </div>

        {/* Step 3: Notes */}
        <div className="card">
          <div className="flex items-center gap-3 px-5 py-4 border-b bg-slate-50">
            <span className="w-7 h-7 bg-slate-300 text-white text-sm font-bold rounded-full flex items-center justify-center">3</span>
            <h2 className="font-semibold text-slate-700">Additional instructions <span className="text-xs text-slate-400 font-normal">optional</span></h2>
          </div>
          <div className="p-5">
            <textarea className="input" rows={3} placeholder="e.g. 'Highlight leadership', 'Target FAANG', 'Keep to one page'…" value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

        <button className="btn-primary w-full text-base py-4" onClick={handleRemaster} disabled={loading}>
          {loading ? (
            <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Remastering…</>
          ) : '✨ Remaster My Resume'}
        </button>

        {/* Preview / Result */}
        {previewText && (
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b bg-slate-50 flex items-center justify-between">
              <span className="font-semibold">{isUnlocked ? '✨ Full Resume' : '👁 Preview'}</span>
              {isUnlocked && (
                <div className="flex gap-2">
                  <button onClick={() => { navigator.clipboard.writeText(fullText); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="btn-secondary py-1 px-3 text-xs">{copied ? '✓ Copied' : '📋 Copy'}</button>
                  <button onClick={() => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([fullText], { type: 'text/plain' })); a.download = 'remastered-resume.txt'; a.click(); }} className="btn-secondary py-1 px-3 text-xs">⬇ Download</button>
                </div>
              )}
            </div>

            {/* Text */}
            <pre className="p-5 text-sm font-mono whitespace-pre-wrap leading-relaxed max-h-72 overflow-hidden">
              {isUnlocked ? fullText : previewText}
            </pre>

            {/* Blur overlay + CTA */}
            {!isUnlocked && (
              <div className="relative">
                <div className="h-24 bg-gradient-to-b from-transparent to-white -mt-24 relative z-10 pointer-events-none" />
                <div className="px-5 pb-6 pt-2 bg-white text-center">
                  <p className="text-slate-600 text-sm mb-4 font-medium">Unlock the full remastered resume to copy &amp; download it.</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center mb-5">
                    <button onClick={() => checkout('single')} disabled={checkingOut} className="btn-primary">
                      {checkingOut ? 'Redirecting…' : '🔓 Unlock for $2'}
                    </button>
                    <button onClick={() => checkout('monthly')} disabled={checkingOut} className="btn-secondary">
                      ♾ $8/mo — Unlimited
                    </button>
                  </div>

                  {/* Promo code */}
                  <div className="border-t pt-4">
                    <p className="text-xs text-slate-400 mb-2 text-center">Have a promo code?</p>
                    <div className="flex gap-2 max-w-xs mx-auto">
                      <input
                        className="input text-sm uppercase tracking-widest"
                        placeholder="FREE-XXXXXX"
                        value={promoCode}
                        onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); }}
                        onKeyDown={e => e.key === 'Enter' && redeemPromo()}
                      />
                      <button
                        onClick={redeemPromo}
                        disabled={promoLoading || !promoCode.trim()}
                        className="btn-primary py-2 px-4 text-sm whitespace-nowrap"
                      >
                        {promoLoading ? '…' : 'Apply'}
                      </button>
                    </div>
                    {promoError && <p className="text-red-500 text-xs text-center mt-2">{promoError}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
