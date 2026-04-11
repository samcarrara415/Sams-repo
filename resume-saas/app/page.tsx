import Link from 'next/link';

const steps = [
  { icon: '📄', title: 'Upload your resume', desc: 'PDF or DOCX — takes 10 seconds.' },
  { icon: '🎯', title: 'Pick the role you want', desc: 'We rewrite every line for that specific job.' },
  { icon: '🚀', title: 'Apply with confidence', desc: 'ATS-optimized. Interview-ready. Yours in under a minute.' },
];

const painPoints = [
  { emoji: '😩', text: 'Applying for weeks with no callbacks' },
  { emoji: '🤖', text: 'Getting filtered out by ATS before a human sees you' },
  { emoji: '📝', text: 'Copy-pasting the same resume for every job' },
  { emoji: '😓', text: 'Not knowing how to phrase what you actually do' },
];

type Review = {
  rating: number;
  comment: string;
  display_name: string | null;
  job_type: string;
  unlock_method: 'single' | 'monthly' | 'promo' | null;
  purchased_at: string | null;
};

const PACKAGE_LABELS: Record<string, string> = {
  single:  'Single Resume · $2',
  monthly: 'Monthly Plan · $8/mo',
  promo:   'Free Access',
};

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

async function getReviews(): Promise<Review[]> {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase
      .from('reviews')
      .select('rating, comment, display_name, job_type, unlock_method, purchased_at')
      .gte('rating', 4)
      .not('comment', 'is', null)
      .order('purchased_at', { ascending: false })
      .limit(6);
    return (data as Review[]) || [];
  } catch {
    return [];
  }
}

export default async function LandingPage() {
  const reviews = await getReviews();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b bg-white/90 backdrop-blur sticky top-0 z-20">
        <span className="font-extrabold text-xl text-brand-700">Resume Remaster</span>
        <div className="flex gap-3">
          <Link href="/login" className="btn-secondary py-2 px-4 text-sm">Log in</Link>
          <Link href="/signup" className="btn-primary py-2 px-4 text-sm">Try free →</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center py-20 px-6 bg-gradient-to-br from-brand-900 via-brand-700 to-indigo-500 text-white">
        <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm font-medium mb-6 border border-white/20">
          ✨ Powered by Claude AI — the same AI used by Fortune 500 recruiters
        </div>
        <h1 className="text-4xl md:text-6xl font-black mb-5 leading-tight max-w-3xl mx-auto">
          Your resume is costing you<br />
          <span className="text-yellow-300">the interviews you deserve.</span>
        </h1>
        <p className="text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto mb-3">
          Most resumes are ignored in 7 seconds. Not because you're underqualified —
          because your resume isn't speaking the right language for the job.
        </p>
        <p className="text-indigo-200 max-w-xl mx-auto mb-10 text-base">
          Resume Remaster rewrites your resume, word-for-word, for any specific role — so the right people actually notice you.
        </p>
        <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-yellow-400 text-slate-900 font-black rounded-2xl text-lg hover:bg-yellow-300 transition-all shadow-2xl hover:-translate-y-1">
          Remaster my resume — it's $2 →
        </Link>
        <p className="text-indigo-300 text-sm mt-4">No subscription required · Unlock one resume · Takes under a minute</p>
      </section>

      {/* Pain points */}
      <section className="py-14 px-6 bg-slate-900 text-white">
        <h2 className="text-center text-2xl font-black mb-8">Sound familiar?</h2>
        <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {painPoints.map((p, i) => (
            <div key={i} className="flex items-center gap-3 bg-slate-800 rounded-xl p-4 border border-slate-700">
              <span className="text-2xl">{p.emoji}</span>
              <span className="text-slate-200 text-sm font-medium">{p.text}</span>
            </div>
          ))}
        </div>
        <p className="text-center text-slate-400 mt-8 text-sm max-w-lg mx-auto">
          These aren't skill problems. They're <span className="text-white font-semibold">presentation problems</span>.
          One remastered resume changes everything.
        </p>
      </section>

      {/* How it works */}
      <section className="py-16 px-6 max-w-4xl mx-auto w-full">
        <h2 className="text-2xl font-black text-center mb-2 text-slate-800">From upload to job-ready in 60 seconds</h2>
        <p className="text-slate-500 text-center mb-10 text-sm">No editing. No guessing. Just paste and apply.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <div key={i} className="card p-6 text-center">
              <div className="text-4xl mb-3">{s.icon}</div>
              <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-1">Step {i + 1}</p>
              <h3 className="font-bold mb-2 text-slate-800">{s.title}</h3>
              <p className="text-sm text-slate-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social proof / reviews */}
      {reviews.length > 0 && (
        <section className="py-16 px-6 bg-slate-50">
          <h2 className="text-2xl font-black text-center mb-2 text-slate-800">Real people. Real results.</h2>
          <p className="text-slate-500 text-center mb-10 text-sm">Every review is from a verified user who unlocked a remastered resume.</p>
          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {reviews.map((r: Review, i: number) => (
              <div key={i} className="card p-5 flex flex-col">
                {/* Stars */}
                <div className="flex items-center gap-0.5 mb-3">
                  {[1,2,3,4,5].map(s => (
                    <span key={s} className={s <= r.rating ? 'text-yellow-400' : 'text-slate-200'}>★</span>
                  ))}
                </div>

                {/* Comment */}
                <p className="text-slate-700 text-sm leading-relaxed mb-4 italic flex-1">&ldquo;{r.comment}&rdquo;</p>

                {/* Name + verified */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-sm text-slate-800">
                    {r.display_name || 'Anonymous'}
                  </span>
                  <span className="text-xs text-green-600 flex items-center gap-1 font-medium">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                    Verified user
                  </span>
                </div>

                {/* Meta row */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                    {r.job_type}
                  </span>
                  <div className="text-right">
                    {r.unlock_method && (
                      <p className="text-xs text-slate-500 font-medium">
                        {PACKAGE_LABELS[r.unlock_method] ?? r.unlock_method}
                      </p>
                    )}
                    {r.purchased_at && (
                      <p className="text-xs text-slate-400">{formatDate(r.purchased_at)}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pricing */}
      <section className="py-16 px-6 bg-white">
        <h2 className="text-2xl font-black text-center mb-2 text-slate-800">One job offer is worth thousands.</h2>
        <p className="text-slate-500 text-center mb-10 text-sm">Two dollars is less than your morning coffee. Your next interview could be worth six figures.</p>
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="card p-8">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">One resume</p>
            <p className="text-5xl font-black text-slate-900 mb-1">$2</p>
            <p className="text-slate-500 text-sm mb-6">one-time · no account required</p>
            <ul className="space-y-2 mb-8 text-sm text-slate-600">
              <li>✅ Full AI rewrite for one role</li>
              <li>✅ ATS keyword optimization</li>
              <li>✅ Download & paste anywhere</li>
            </ul>
            <Link href="/signup" className="btn-secondary w-full text-sm text-center">Get started</Link>
          </div>
          <div className="card p-8 border-brand-500 border-2 relative">
            <span className="absolute -top-3 right-5 bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">Most popular</span>
            <p className="text-sm font-bold text-brand-600 uppercase tracking-wide mb-2">Unlimited monthly</p>
            <p className="text-5xl font-black text-slate-900 mb-1">$8</p>
            <p className="text-slate-500 text-sm mb-6">per month · cancel any time</p>
            <ul className="space-y-2 mb-8 text-sm text-slate-600">
              <li>✅ Unlimited resumes, any role</li>
              <li>✅ Perfect for active job seekers</li>
              <li>✅ Cancel the moment you land the job</li>
            </ul>
            <Link href="/signup" className="btn-primary w-full text-sm text-center">Start for $8/mo</Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-6 bg-gradient-to-br from-brand-900 to-indigo-600 text-white text-center">
        <h2 className="text-3xl font-black mb-3">You've already done the hard part.</h2>
        <p className="text-indigo-200 max-w-md mx-auto mb-8">
          You have the skills. You have the experience. Let us make sure the resume actually shows it.
        </p>
        <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-yellow-400 text-slate-900 font-black rounded-2xl text-lg hover:bg-yellow-300 transition-all shadow-xl hover:-translate-y-0.5">
          Remaster my resume →
        </Link>
      </section>

      <footer className="text-center py-6 text-xs text-slate-400 border-t bg-white">
        Resume Remaster — your resume is processed securely and never stored longer than needed.
      </footer>
    </div>
  );
}
