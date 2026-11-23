'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';

export default function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const isSignup = mode === 'signup';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { data, error } = isSignup
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    // With email confirmation on, sign-up returns no session until the link is clicked.
    if (isSignup && !data.session) {
      setNotice(`Check ${email} for a confirmation link, then log in.`);
      return;
    }
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card w-full max-w-sm p-6">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-800">Resume Remaster</Link>
        <h1 className="text-xl font-semibold mt-2 mb-6">{isSignup ? 'Create an account' : 'Log in'}</h1>

        {error && <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">{error}</p>}
        {notice ? (
          <p className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-3 py-2">{notice}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5">Email</label>
              <input id="email" className="input" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5">Password</label>
              <input
                id="password"
                className="input"
                type="password"
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                minLength={isSignup ? 8 : undefined}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              {isSignup && <p className="text-xs text-slate-500 mt-1">At least 8 characters.</p>}
            </div>
            <button className="btn-primary w-full" disabled={loading}>
              {loading ? 'Please wait...' : isSignup ? 'Create account' : 'Log in'}
            </button>
          </form>
        )}

        <p className="text-sm text-slate-600 mt-6">
          {isSignup ? 'Already have an account? ' : 'No account yet? '}
          <Link href={isSignup ? '/login' : '/signup'} className="text-brand-700 font-medium hover:underline">
            {isSignup ? 'Log in' : 'Sign up'}
          </Link>
        </p>
      </div>
    </div>
  );
}
